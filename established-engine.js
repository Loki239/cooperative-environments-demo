/* Native schedules are kept distinct: graph ticks, lever breaks, capsule turns. */
(function(root){
'use strict';
const copy=x=>structuredClone(x), keys=(x,w)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join('|')===[...w].sort().join('|');
const WAIT=()=>({id:'wait',args:{}});
const FW=typeof module!=='undefined'?require('./engine.js'):root.FiniteWorld;
const compare=(a,b)=>{const x=Array.from(a,c=>c.codePointAt(0)),y=Array.from(b,c=>c.codePointAt(0));for(let i=0;i<Math.min(x.length,y.length);i++)if(x[i]!==y[i])return x[i]-y[i];return x.length-y.length;};
class GraphPhysical{
 constructor(c){this.case=c;this.actors=c.actors;this.round=0;this.answer=null;this.answered=false;}
 get state(){return {won:this.success()};}
 terminal(){return this.answered;}
 success(){return this.answered&&Number.isInteger(this.answer)&&this.answer===this.case.answer;}
 observe(actor){const c=this.case,tools=[];if(actor===c.root)tools.push({id:'submit_answer',parameters:{answer:c.actors.map((_,i)=>i)}});return {you:actor,round:this.round,roster:copy(c.actors),neighbours:c.edges.filter(e=>e.includes(actor)).map(e=>e.find(a=>a!==actor)).sort(),horizon:c.horizon,rules:c.rules,assignment:actor===c.root?copy(c.assignment):null,tools};}
 stepJoint(calls){
  if(!keys(calls,this.actors))return {ok:false};let submitted=null;
  for(const [a,c] of Object.entries(calls)){
   if(keys(c,['id','args'])&&c.id==='wait'&&keys(c.args,[]))continue;
   if(a!==this.case.root||!keys(c,['id','args'])||c.id!=='submit_answer'||!keys(c.args,['answer']))return {ok:false};
   if(!Number.isInteger(c.args.answer)||c.args.answer<0||c.args.answer>=this.actors.length)return {ok:false};submitted=c.args.answer;
  }
  if(submitted!==null){this.answer=submitted;this.answered=true;}this.round++;return {ok:true,success:this.success()};
 }
}
class Graph extends FW.ChatWorld{
 constructor(c){super({language_version:'finite-world-expressions-v0',actors:c.actors,state:{won:{kind:'bool',initial:false,visible_to:[]}},actions:[],goal:{var:'won'},horizon:c.horizon},c.contract);this.world=new GraphPhysical(c);this.case=c;}
 dump(){return copy({round:this.round,answer:this.world.answer,answered:this.world.answered,failed:this.failed,chats:this.chats,pending:this.pending,sent:this.sent,copies:this.copies,done:this.done,success:this.success()});}
 step(calls){return this.stepJoint(calls);}
}
class Levers{
 constructor(w){this.world=copy(w);this.actors=w.players;this.schedule=[];for(let r=1;r<=w.rounds;r++){if(r>1)for(let t=1;t<=w.break_ticks;t++)this.schedule.push(['talk',r,t]);for(let t=1;t<=w.turns_per_round;t++)this.schedule.push(['play',r,t]);}this.index=0;this.charge=Object.fromEntries(this.actors.map(a=>[a,1]));this.pay=Object.fromEntries(this.actors.map(a=>[a,0]));this.score=0;this.boards=w.edges.map(()=>[]);}
 get current(){return this.schedule[this.index]||['end',this.world.rounds+1,0];}
 get active(){const [p,r,t]=this.current,w=this.world;return r>w.bonus_round||(r===w.bonus_round&&(p==='play'?t:0)>=w.bonus_turn);}
 get done(){return this.current[0]==='end';}
 observe(a){const [phase,r,t]=this.current,w=this.world;const v={name:a,phase,last_pay:this.pay[a],boards:Object.fromEntries(w.ports[a].map((b,i)=>[i+1,copy(this.boards[b])]))};if(phase==='end')return v;const owner=this.active?w.bonus_owner:null,m=owner===a?2:1;Object.assign(v,{round:r,planned_bonus:{round:w.bonus_round,turn:w.bonus_turn,owner},base_rate:w.base_rates[a],charge:this.charge[a],bonus_active:this.active,reward_multiplier:m,rate:w.base_rates[a]*m});v[phase==='play'?'turn':'board_tick']=t;return v;}
 step(actions){
  if(this.done||!keys(actions,this.actors))throw new Error('Expected one simultaneous decision from each active player');const deliveries=[];
  if(this.current[0]==='talk'){
   const pending=[];
   for(const [a,c] of Object.entries(actions)){if(keys(c,['pass'])&&c.pass===true)continue;const ports=this.world.ports[a];if(!keys(c,['port','text'])||!Number.isInteger(c.port)||c.port<1||c.port>ports.length)throw new Error('Unknown local board');if(typeof c.text!=='string'||Array.from(c.text).length>160)throw new Error('Invalid note');pending.push([ports[c.port-1],a,c.port,c.text]);}
   pending.sort((a,b)=>compare(a[3],b[3]));for(const [board,sender,port,text] of pending){this.boards[board].push(text);for(const reader of this.world.edges[board])deliveries.push({sender,reader,port,reader_port:this.world.ports[reader].indexOf(board)+1,board,text});}
  }else{
   if(Object.values(actions).some(c=>!keys(c,['press'])||typeof c.press!=='boolean'))throw new Error('Expected press or wait from every player');
   const pressed=this.actors.filter(a=>actions[a].press);this.pay=Object.fromEntries(this.actors.map(a=>[a,0]));if(pressed.length===1){const a=pressed[0];this.pay[a]=this.world.base_rates[a]*this.charge[a]*(this.active&&this.world.bonus_owner===a?2:1);}for(const a of this.actors)this.charge[a]=this.pay[a]?1:Math.min(4,this.charge[a]+1);this.score+=Object.values(this.pay).reduce((x,y)=>x+y,0);
  }
  this.index++;return deliveries;
 }
 dump(){return copy({current:this.current,charge:this.charge,pay:this.pay,score:this.score,boards:this.boards});}
}
class Capsule{
 constructor(seed){this.actors=['A','B','C'];this.bits=[Math.floor(seed/2)%2,seed%2];this.stage=0;this.route='L';this.pressure=false;this.open_target=null;this.delivered=[];this.turns=0;this.done=false;this.failure=null;this.sensor_readings=0;this.probes={};this.last_result={A:null,B:null,C:null};}
 get target(){return this.stage<2?this.stage:null;}
 observe(actor){const v={actor,stage:Math.min(this.stage+1,2),current_destination:this.target!==null?'T'+this.target:null,task_finished:this.done,last_tool_result:copy(this.last_result[actor])};if(actor==='A')Object.assign(v,{pressure:Number(this.pressure),capsules_remaining:2-this.delivered.length});else if(actor==='B')Object.assign(v,{route:this.route,pressure:Number(this.pressure)});else Object.assign(v,{open_receiver:this.open_target!==null?'T'+this.open_target:null,received_capsules:this.delivered.map(x=>'T'+x)});return v;}
 reply(a,ok,data={}){let v={ok,...data};this.last_result[a]=copy(v);if(!this.done&&this.turns>=60){this.done=true;this.failure='turn_limit';v={...v,terminal:true,failure:'turn_limit'};this.last_result[a]=copy(v);}return v;}
 fail(a,reason){this.done=true;this.failure=reason;return this.reply(a,false,{error:reason,terminal:true});}
 step(actor,action){
  if(!this.actors.includes(actor))throw new Error('Unknown actor');if(this.done)return this.reply(actor,false,{error:'episode_already_finished'});this.turns++;
  if(!action||typeof action!=='object'||Array.isArray(action)||Object.keys(action).some(k=>!['tool','arguments'].includes(k)))return this.reply(actor,false,{error:'expected_tool_and_arguments_object'});
  const name=action.tool,args=Object.hasOwn(action,'arguments')?action.arguments:{};if(typeof name!=='string'||args===null||typeof args!=='object'||Array.isArray(args))return this.reply(actor,false,{error:'expected_string_tool_and_object_arguments'});
  const permissions={A:['wait','start_test_flow','stop_pump','release_capsule'],B:['wait','set_route'],C:['wait','open_receiver','read_target_flow']};
  if(!permissions[actor].includes(name))return this.reply(actor,false,{error:'tool_not_available_to_this_actor'});
  const expected=name==='set_route'?['route']:name==='open_receiver'?['target']:[];
  if(!keys(args,expected))return this.reply(actor,false,{error:'wrong_arguments',expected_arguments:expected});
  if(name==='wait')return this.reply(actor,true,{event:'waited'});
  if(name==='start_test_flow'){if(this.open_target===null)return this.reply(actor,false,{error:'no_receiver_open'});if(this.pressure)return this.reply(actor,false,{error:'pump_already_running'});this.pressure=true;return this.reply(actor,true,{pressure:1,event:'test_air_flow_started'});}
  if(name==='stop_pump'){this.pressure=false;return this.reply(actor,true,{pressure:0,event:'pump_stopped'});}
  if(name==='set_route'){if(!['L','R'].includes(args.route))return this.reply(actor,false,{error:'route_must_be_L_or_R'});if(this.pressure)return this.fail(actor,'switch_operated_under_pressure');this.route=args.route;return this.reply(actor,true,{route:this.route,pressure:0});}
  if(name==='open_receiver'){if(!Number.isInteger(args.target)||![0,1].includes(args.target))return this.reply(actor,false,{error:'target_must_be_integer_0_or_1'});if(this.pressure)return this.reply(actor,false,{error:'stop_pump_before_changing_receiver'});this.open_target=args.target;return this.reply(actor,true,{open_receiver:'T'+args.target});}
  if(name==='read_target_flow'){if(!this.pressure||this.open_target!==this.target)return this.reply(actor,false,{error:'need_flow_and_required_receiver_open'});const target_flow=(Number(this.route==='R')^this.bits[this.stage])===this.target;this.sensor_readings++;this.probes[this.stage]={route:this.route,target:this.target,target_flow};return this.reply(actor,true,{target_flow});}
  if(name==='release_capsule'){if(!this.pressure||this.open_target===null)return this.reply(actor,false,{error:'need_running_pump_and_open_receiver'});const actual=Number(this.route==='R')^this.bits[this.stage];if(actual!==this.target||this.open_target!==actual)return this.fail(actor,'capsule_lost_wrong_delivery');const delivered=this.target;this.delivered.push(delivered);this.stage++;this.pressure=false;this.open_target=null;if(this.stage===2)this.done=true;return this.reply(actor,true,{event:'capsule_delivered',delivered_to:'T'+delivered,pressure:0,next_destination:this.target!==null?'T'+this.target:null,task_success:this.done});}
 }
 success(){return this.done&&this.failure===null&&this.delivered.length===2;}
 dump(){return copy({stage:this.stage,route:this.route,pressure:this.pressure,open_target:this.open_target,delivered:this.delivered,turns:this.turns,done:this.done,failure:this.failure,sensor_readings:this.sensor_readings,probes:this.probes,last_result:this.last_result});}
}
const api={Graph,Levers,Capsule};if(typeof module!=='undefined')module.exports=api;else root.EstablishedEngines=api;
})(globalThis);
