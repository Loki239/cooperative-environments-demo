/* Browser implementation of the finite-world kernel and tool-chat-v1.
 * Source and differential replay evidence are recorded by tools/build.py.
 * Menus depend on ownership, never on hidden-value-dependent preconditions. */
(function (root) {
  'use strict';
  const copy = value => structuredClone(value);
  const isObject = x => x !== null && typeof x === 'object' && !Array.isArray(x);
  const keysEqual = (a, b) => Object.keys(a).sort().join('\0') === [...b].sort().join('\0');
  const equal = (a, b) => typeof a === typeof b && a === b;
  const WAIT = () => ({id: 'wait', args: {}});
  function evaluate(expr, state, args = {}) {
    if (!isObject(expr)) return expr;
    const [op, values] = Object.entries(expr)[0];
    if (op === 'var') return state[values];
    if (op === 'arg') return args[values];
    if (op === 'if') return evaluate(values[evaluate(values[0], state, args) ? 1 : 2], state, args);
    if (op === 'and') return values.every(x => evaluate(x, state, args));
    if (op === 'or') return values.some(x => evaluate(x, state, args));
    const v = values.map(x => evaluate(x, state, args));
    switch (op) {
      case 'not': return !v[0];
      case 'eq': return equal(v[0], v[1]);
      case 'ne': return !equal(v[0], v[1]);
      case 'ge': return v[0] >= v[1];
      case 'gt': return v[0] > v[1];
      case 'le': return v[0] <= v[1];
      case 'lt': return v[0] < v[1];
      case 'add': return v[0] + v[1];
      case 'sub': return v[0] - v[1];
      default: throw new Error('Unsupported expression: ' + op);
    }
  }
  function valid(value, field) {
    if (field.kind === 'bool') return typeof value === 'boolean';
    if (field.kind === 'int') return typeof value === 'number' && Number.isInteger(value) && value >= field.min && value <= field.max;
    if (field.kind === 'enum') return field.values.some(v => equal(v, value));
    return false;
  }
  function unicodeCompare(a, b) {
    const left = Array.from(a, c => c.codePointAt(0)), right = Array.from(b, c => c.codePointAt(0));
    for (let i = 0; i < Math.min(left.length, right.length); i++) if (left[i] !== right[i]) return left[i] - right[i];
    return left.length - right.length;
  }
  function pythonJSON(x) {
    if (Array.isArray(x)) return '[' + x.map(pythonJSON).join(', ') + ']';
    if (isObject(x)) return '{' + Object.keys(x).sort(unicodeCompare).map(k => JSON.stringify(k) + ': ' + pythonJSON(x[k])).join(', ') + '}';
    return JSON.stringify(x);
  }
  class World {
    constructor(spec, overrides = {}) {
      if (spec.language_version !== 'finite-world-expressions-v0') throw new Error('Unsupported world version');
      this.spec = copy(spec); this.actors = [...spec.actors]; this.round = 0;
      this.actions = Object.fromEntries(spec.actions.map(a => [a.id, a]));
      this.state = Object.fromEntries(Object.entries(spec.state).map(([k, f]) => [k, copy(f.initial)]));
      for (const [k, v] of Object.entries(overrides)) {
        if (!spec.instance_parameters.includes(k) || !valid(v, spec.state[k])) throw new Error('Invalid instance override');
        this.state[k] = copy(v);
      }
      if ((spec.invariants || []).some(e => !evaluate(e, this.state)) || this.terminal()) throw new Error('Invalid initial world');
    }
    observe(actor) {
      if (!this.actors.includes(actor)) throw new Error('Unknown actor');
      const state = Object.fromEntries(Object.entries(this.state).filter(([k]) => {
        const visibility = this.spec.state[k].visible_to;
        return visibility.includes('public') || visibility.includes(actor);
      }));
      return copy({actor, state, tools: this.spec.actions.filter(a => a.owners.includes(actor)).map(a => ({id: a.id, parameters: a.parameters || {}})), round: this.round});
    }
    success() { return evaluate(this.spec.goal, this.state); }
    terminal() { return evaluate(this.spec.terminal || this.spec.goal, this.state); }
    proposal(actor, action) {
      if (isObject(action) && keysEqual(action, ['id','args']) && action.id === 'wait' && isObject(action.args) && !Object.keys(action.args).length) return [{}, null];
      if (!isObject(action) || !keysEqual(action, ['id','args']) || typeof action.id !== 'string') return [{}, 'invalid_action_shape'];
      const a = this.actions[action.id];
      if (!a || !a.owners.includes(actor)) return [{}, 'action_not_owned'];
      const args = action.args, params = a.parameters || {};
      if (!isObject(args) || !keysEqual(args, Object.keys(params)) || Object.entries(args).some(([k,v]) => !params[k].some(w => equal(v,w)))) return [{}, 'invalid_arguments'];
      if (!evaluate(a.guard, this.state, args)) return [{}, 'precondition_false'];
      const changes = Object.fromEntries(Object.entries(a.effects).map(([k,v]) => [k,evaluate(v,this.state,args)]));
      if (Object.entries(changes).some(([k,v]) => !valid(v,this.spec.state[k]))) return [{}, 'effect_outside_domain'];
      return [changes,null];
    }
    stepJoint(actions) {
      if (!keysEqual(actions, this.actors)) throw new Error('One action per actor required');
      if (this.round >= this.spec.horizon) return {ok:false,error:'horizon_exhausted'};
      const writes = {};
      for (const [actor, action] of Object.entries(actions)) {
        const [proposal,error] = this.proposal(actor, action);
        if (error) return {ok:false,error,actor};
        if (Object.keys(proposal).some(k => Object.hasOwn(writes,k))) return {ok:false,error:'joint_write_conflict'};
        Object.assign(writes,proposal);
      }
      const after = {...this.state,...writes};
      if ((this.spec.invariants || []).some(e => !evaluate(e,after))) return {ok:false,error:'invariant_violation'};
      this.state = after; this.round++;
      return {ok:true,success:this.success()};
    }
  }
  class ChatWorld {
    constructor(spec, contract, overrides = {}, delivery = true) {
      if (contract.version !== 'tool-chat-v1' || contract.scheduler !== 'joint_tool_tick') throw new Error('Unsupported chat version');
      this.spec = copy(spec); this.contract = copy(contract);
      this.world = new World({...spec,horizon:contract.horizon},overrides);
      this.actors = [...this.world.actors]; this.delivery = delivery; this.failed = false;
      this.channels = Object.fromEntries(contract.channels.map(c => [c.id,c]));
      this.chats = Object.fromEntries(contract.channels.map(c => [c.id,[]])); this.pending = [];
      this.sent = Object.fromEntries(this.actors.map(a => [a,0])); this.copies = {...this.sent};
    }
    get round() { return this.world.round; }
    get done() { return this.failed || this.world.terminal() || this.round >= this.contract.horizon; }
    success() { return !this.failed && this.world.success(); }
    observe(actor) {
      const view = this.world.observe(actor);
      view.chats = this.contract.channels.filter(c => c.members.includes(actor)).map(c => ({id:c.id,members:[...c.members],anonymous:c.anonymous,history:copy(this.chats[c.id])}));
      if (view.chats.length) view.tools.push({id:'send_message',parameters:{chat_id:view.chats.map(c => c.id),content:copy(this.contract.payloads)}});
      view.communication_budget = {messages_left:this.contract.max_messages-this.sent[actor],recipient_copies_left:this.contract.max_recipient_copies-this.copies[actor]};
      view.terminated = this.done;
      return view;
    }
    stepJoint(actions) {
      if (this.done) return {ok:false,success:this.success()};
      const fail = () => { this.failed = true; return {ok:false,success:false}; };
      if (!keysEqual(actions,this.actors)) return fail();
      const physical = {}, posts = [];
      for (const actor of this.actors) {
        const call = actions[actor];
        if (isObject(call) && call.id === 'send_message') {
          const args = call.args;
          if (!keysEqual(call,['id','args']) || !isObject(args) || !keysEqual(args,['chat_id','content']) || typeof args.chat_id !== 'string') return fail();
          const channel = this.channels[args.chat_id], content = args.content;
          if (!channel || !channel.members.includes(actor) || typeof content !== 'string' || Array.from(content).length > this.contract.max_chars || (this.contract.payloads !== null && !this.contract.payloads.includes(content)) || this.sent[actor] >= this.contract.max_messages || this.copies[actor] + channel.members.length - 1 > this.contract.max_recipient_copies) return fail();
          posts.push({actor,chat_id:channel.id,content,due:this.round+this.contract.delay}); physical[actor] = WAIT();
        } else physical[actor] = call;
      }
      if (!this.world.stepJoint(physical).ok) return fail();
      for (const post of posts) { this.sent[post.actor]++; this.copies[post.actor] += this.channels[post.chat_id].members.length - 1; }
      if (this.delivery) this.pending.push(...posts);
      for (const channel of this.contract.channels) {
        const due = this.pending.filter(p => p.chat_id === channel.id && p.due <= this.round);
        if (due.length) {
          const messages = due.map(p => ({content:p.content,...(channel.anonymous?{}:{sender:p.actor})}));
          messages.sort((a,b) => unicodeCompare(pythonJSON(a),pythonJSON(b)));
          this.chats[channel.id].push({tick:this.round,messages});
        }
      }
      this.pending = this.pending.filter(p => p.due > this.round);
      return {ok:true,success:this.success()};
    }
  }
  const api = {World,ChatWorld,evaluate,WAIT};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FiniteWorld = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
