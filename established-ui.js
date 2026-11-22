/* UI for established native schedules; no inferred messages or automatic plans. */
(()=>{
'use strict';
const E=window.EstablishedEngines,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data,game,index=0,role,drafts,active,trace=[],inbox,messages,observer=false,step=0,timer=null,redraw=()=>{},lastFeedback=null,previousFrame=null;
const colors=['#3266c9','#087f8c','#a96620','#8556a8','#ae4b6e','#52744a'];
const color=a=>colors[data.world.actors.indexOf(a)%colors.length];
const label={wait:'Подождать',send_message:'Отправить сообщение',submit_answer:'Назвать расстояние',start_test_flow:'Включить пробный поток',stop_pump:'Остановить насос',release_capsule:'Выпустить капсулу',set_route:'Выставить переключатель',open_receiver:'Открыть приёмник',read_target_flow:'Считать датчик',press:'Нажать рычаг',pass:'Пропустить запись'};
const fields={name:'Игрок',you:'Вы',actor:'Роль',round:'Раунд',turn:'Рабочий ход',phase:'Фаза',board_tick:'Такт досок',last_pay:'Ваша последняя выплата',base_rate:'Ваша базовая ставка',charge:'Ваш заряд',bonus_active:'Удвоение уже действует',reward_multiplier:'Множитель ставки',rate:'Ваша текущая ставка',planned_bonus:'Объявление удвоения',neighbours:'Ваши соседи',roster:'Все участники',assignment:'Задание',horizon:'Лимит тактов',stage:'Капсула',current_destination:'Текущий адресат',task_finished:'Игра завершена',last_tool_result:'Результат вашего действия',pressure:'Давление',capsules_remaining:'Капсул осталось',route:'Переключатель',open_receiver:'Открытый приёмник',received_capsules:'Полученные капсулы'};
function value(v){if(v===null)return 'ещё нет';if(typeof v==='boolean')return v?'да':'нет';if(Array.isArray(v))return v.length?v.join(', '):'нет';if(typeof v==='object'){if(v.task==='distance')return 'Расстояние до '+v.target;if(Object.hasOwn(v,'owner'))return `Раунд ${v.round}, ход ${v.turn}; ${v.owner||'владелец ещё не объявлен'}`;return JSON.stringify(v);}return ({play:'Нажатия',talk:'Доски',end:'Завершено'})[v]||String(v);}
function facts(view){return `<dl class="facts">${Object.entries(view).filter(([k])=>!['rules','tools','chats','boards','communication_budget','terminated'].includes(k)).map(([k,v])=>`<div class="fact"><dt>${esc(fields[k]||k)}</dt><dd>${esc(value(v))}</dd></div>`).join('')}</dl>`;}
function newGame(){const c=data.cases[index];game=data.kind==='graph'?new E.Graph(c):data.kind==='levers'?new E.Levers(c):new E.Capsule(c.seed);role=data.world.actors[0];active=new Set([c.root]);trace=[];lastFeedback=null;previousFrame=null;observer=false;inbox=Object.fromEntries(data.world.actors.map(a=>[a,[]]));messages=structuredClone(inbox);resetDrafts();step=0;}
function resetDrafts(){drafts=Object.fromEntries(data.world.actors.map(a=>[a,data.kind==='graph'?{id:'wait',args:{}}:data.kind==='levers'?(game.current[0]==='talk'?{pass:true}:{press:false}):{tool:'wait',arguments:{}}]));}
function stop(){if(timer)clearTimeout(timer);timer=null;}
function currentFrame(){return {state:game.dump(),observations:Object.fromEntries(data.world.actors.map(a=>[a,game.observe(a)])),active:[...active],inbox,messages};}
function roleButtons(){return `<div class="role-switcher">${data.world.actors.map(a=>`<button class="role-button ${a===role?'active':''}" data-native-role="${esc(a)}" style="--role:${color(a)}" aria-pressed="${a===role}">${esc(a)}</button>`).join('')}</div>`;}
function glyph(text,x,y,fill='#18314e',size=17){return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" text-anchor="middle" font-family="Arial,sans-serif">${esc(text)}</text>`;}
function diagram(frame,full,actions={}){
 const c=data.cases[index],s=frame.state,v=frame.observations[role];let svg='';
 if(data.kind==='graph'||data.kind==='levers'){
  const actors=data.world.actors,coords=Object.fromEntries(actors.map((a,i)=>{const t=-Math.PI/2+2*Math.PI*i/actors.length;return [a,[280+165*Math.cos(t),225+155*Math.sin(t)]];}));
  const edges=full?c.edges:data.kind==='graph'?c.edges.filter(e=>e.includes(role)):[];
  for(const [a,b] of edges){const [x,y]=coords[a],[u,w]=coords[b];svg+=`<line x1="${x}" y1="${y}" x2="${u}" y2="${w}" stroke="#c7d4e5" stroke-width="3"/>`;}
  if(data.kind==='graph')for(const [a,call] of Object.entries(actions||{}))if(call.id==='send_message'){
   const members=c.contract.channels.find(ch=>ch.id===call.args.chat_id)?.members||[];const b=members.find(x=>x!==a);if(!b||(!full&&a!==role&&b!==role))continue;
   const [x,y]=coords[a],[u,w]=coords[b],len=Math.hypot(u-x,w-y),scale=(len-38)/len;
   svg+=`<line x1="${x+(u-x)*.15}" y1="${y+(w-y)*.15}" x2="${x+(u-x)*scale}" y2="${y+(w-y)*scale}" stroke="${color(a)}" stroke-width="4" stroke-dasharray="8 6" marker-end="url(#native-arrow)"/>`;
  }
  for(const a of actors){const [x,y]=coords[a],chosen=a===role;svg+=`<circle cx="${x}" cy="${y}" r="${chosen?36:31}" fill="${chosen?color(a):'#f2f6fc'}" stroke="${color(a)}" stroke-width="${chosen?3:2}"/>`+glyph(a,x,y+6,chosen?'#fff':color(a),data.kind==='levers'?14:20);
   if(data.kind==='graph')svg+=glyph(!full&&a!==role?'статус скрыт':(frame.active||[]).includes(a)?'активен':'ожидает',x,y+55,'#60728a',12);
   else {const own=frame.observations[a];svg+=glyph(full||a===role?`заряд ${s.charge[a]} · ставка ${own.rate??'—'}`:'личные показания',x,y+53,'#60728a',12);}
  }
  if(data.kind==='levers')for(const a of actors){const [x,y]=coords[a],on=(full||a===role)&&actions[a]?.press===true;
   svg+=`<g data-lever-owner="${esc(a)}" transform="translate(${x+38} ${y})"><path d="M-9 15H9M0 15V0L${on?12:-9} -10" fill="none" stroke="${color(a)}" stroke-width="3" stroke-linecap="round"/><circle cx="${on?12:-9}" cy="-10" r="5" fill="#fff" stroke="${color(a)}" stroke-width="2"/></g>`;
  }
  if(data.kind==='graph')svg+=glyph(full?'Полная сеть':'Соседи выбранной вершины',280,462,'#60728a',14);
  else svg+=glyph(full?'Четыре приватные доски':'Связи досок скрыты за локальными номерами',280,462,'#60728a',14);
 }else{
  const pressure=full?s.pressure:v.pressure,route=full?s.route:v.route,opened=full?s.open_target:v.open_receiver;
  svg+=`<path d="M125 225H280M280 225L440 130M280 225L440 320" fill="none" stroke="#bdccdd" stroke-width="10" stroke-linecap="round"/><path d="M290 225L430 130M290 225L430 320" stroke="#fff" stroke-width="2" stroke-dasharray="8 9"/>`;
  svg+=`<rect x="55" y="170" width="120" height="110" rx="18" fill="#e6eefc" stroke="#3266c9" stroke-width="3"/><circle cx="115" cy="220" r="26" fill="${pressure?'#3266c9':'#b6c6df'}"/>`+glyph('A · насос',115,310,'#3266c9');
  svg+=`<rect x="247" y="195" width="66" height="62" rx="12" fill="#e4f3ef" stroke="#087f8c" stroke-width="3"/>`+glyph(route??'?',280,234,'#087f8c',22)+glyph('B · развилка',280,310,'#087f8c');
  for(const [t,y] of [[0,130],[1,320]]){const on=opened===t||opened==='T'+t;svg+=`<rect x="405" y="${y-35}" width="100" height="70" rx="12" fill="${on?'#f1dfbf':'#f7f3ed'}" stroke="#a96620" stroke-width="3"/>`+glyph('T'+t,455,y+7,'#a96620',21);}
  svg+=`<g data-capsule-sensor="C"><rect x="436" y="209" width="38" height="32" rx="5" fill="#fff" stroke="#a96620" stroke-width="2"/><path d="M442 230L451 217L458 228L467 216" fill="none" stroke="#a96620" stroke-width="2"/></g>`+glyph('Датчик',455,263,'#a96620',13);
  svg+=glyph('C · приёмник и датчик',410,410,'#a96620',16)+glyph('Скрытый картридж',280,160,'#60728a',13)+glyph(`Доставлено ${s.delivered.length} из 2`,160,410,'#60728a',16);
 }
 return `<svg viewBox="0 0 560 470" role="img" aria-label="${esc(data.name)}"><defs><marker id="native-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#3266c9"/></marker></defs>${svg}</svg>`;
}
function clock(frame){const s=frame.state;if(data.kind==='levers'){const [p,r,t]=s.current;return p==='end'?`Завершено · ${s.score} очков`:`Раунд ${r} · ${p==='talk'?'доски':'ход'} ${t}`;}return `Такт ${s.round??s.turns} / ${data.world.horizon}`;}
function scene(frame,full,actions){return `<div class="scene-wrap"><div class="scene-ribbon"><span class="round">${clock(frame)}</span><span>${full?'Обзор исследователя':'Наблюдения роли '+esc(role)}</span></div>${diagram(frame,full,actions)}<div class="scene-caption">${data.kind==='graph'?'Сплошные линии — доступные каналы. Пунктир — сообщения последнего такта.':data.kind==='levers'?'В игре видны только ваша ставка, заряд и записи ваших досок.':'Показание датчика принадлежит C. Новое измерение не отправляется автоматически.'}</div></div>`;}
function channels(frame){const v=frame.observations[role];let rows=[];
 if(data.kind==='graph')rows=v.chats.flatMap(ch=>ch.history.flatMap(h=>h.messages.map(m=>({head:`${m.sender} · ${ch.members.join(' ↔ ')} · такт ${h.tick}`,text:m.content}))));
 if(data.kind==='levers')rows=Object.entries(v.boards).flatMap(([p,msgs])=>msgs.map(text=>({head:'Ваша доска '+p,text})));
 if(data.kind==='capsule')rows=(frame.messages?.[role]||[]).map(m=>({head:`${m.sender} · отправлено на такте ${m.sent_tick}`,text:m.text}));
 return `<section class="panel chat-panel"><h3>${data.kind==='levers'?'Ваши доски':'Переписка '+esc(role)}</h3><div class="chat-list">${rows.reverse().map(m=>`<article class="chat-message"><header>${esc(m.head)}</header><p>${esc(m.text)}</p></article>`).join('')||'<p class="empty">Записей пока нет.</p>'}</div></section>`;
}
function communication(frame,full,actions,replay){
 const c=data.cases[index],actors=data.world.actors,events=[];
 const before=replay?data.examples[index].frames[Math.max(0,step-1)]:previousFrame;
 const round=data.kind==='levers'?(replay?step:trace.length):(frame.state.round??frame.state.turns);
 if(data.kind==='graph'){
  const chats=Object.fromEntries(frame.observations[role].chats.map(ch=>[ch.id,ch.history]));
  if(full)for(const v of Object.values(frame.observations))for(const ch of v.chats)chats[ch.id]=ch.history;
  events.push(...window.CommunicationScene.fromChats(chats,c.contract.channels,role,full));
 }else if(data.kind==='capsule'){
  const seen=new Set();
  for(const a of (full?actors:[role]))for(const m of frame.messages?.[a]||[]){
   const key=JSON.stringify([m.sender,m.sent_tick,m.text]);if(seen.has(key))continue;seen.add(key);
   const recipients=actors.filter(b=>b!==m.sender&&(frame.messages?.[b]||[]).some(n=>n.sender===m.sender&&n.sent_tick===m.sent_tick&&n.text===m.text));
   events.push({tick:m.sent_tick+1,sender:m.sender,recipients,channel:'Сообщение обоим партнёрам',text:m.text});
  }
  if(!full&&actions.actor===role&&actions.message?.text){
   const m=actions.message,recipients=actors.filter(b=>b!==role&&(frame.messages?.[b]||[]).some(n=>n.sender===role&&n.sent_tick===round-1&&n.text===m.text));
   if(recipients.length)events.push({tick:round,sender:role,recipients,channel:'Сообщение обоим партнёрам',text:m.text});
  }
 }else if(before){
  if(full){
   for(const [a,call] of Object.entries(actions)){
    if(call.text===undefined)continue;
    const edge=c.ports[a]?.[call.port-1];if(edge===undefined)continue;
    const added=(frame.state.boards[edge]||[]).slice((before.state.boards[edge]||[]).length);
    if(added.includes(call.text))events.push({tick:round,sender:a,recipients:c.edges[edge].filter(b=>b!==a),channel:'Приватная доска · обзор исследователя',text:call.text});
   }
  }else{
   for(const [port,entries] of Object.entries(frame.observations[role].boards||{})){
    const old=before.observations[role].boards?.[port]||[];
    const added=entries.slice(old.length),own=actions[role];let ownUsed=false;
    for(const text of added){const isOwn=!ownUsed&&own?.port===Number(port)&&own.text===text;ownUsed ||= isOwn;
     events.push({tick:round,sender:isOwn?role:'board:'+port,recipients:[isOwn?'board:'+port:role],channel:'Локальная доска '+port+' · авторы анонимны',text});
    }
   }
  }
 }
 const roleNumbers=Object.fromEntries(actors.map((a,i)=>[a,i+1]));
 const actionCalls=data.kind==='capsule'?(actions.actor?{[actions.actor]:actions}:{}):actions;
 const actionRows=Object.entries(actionCalls).filter(([a])=>full||a===role).map(([a,call])=>{
  const feedback=replay?(data.kind==='capsule'?frame.state.last_result?.[a]:null):lastFeedback;
  const described=feedback?.ok===false?{kind:'rejected',label:'Ход отклонён'}:window.ActionTargets.describe(data.id,a,call,{actors,public:{}});
  return {...described,actor:a,number:roleNumbers[a],color:color(a),roleName:a};
 });
 return window.CommunicationScene.render(events,{actors:data.kind==='levers'&&!full?[role,...Object.keys(frame.observations[role].boards||{}).map(p=>'board:'+p)]:actors,color,roleNumbers,actionRows,name:a=>a.startsWith('board:')?'Доска '+a.slice(6):a,round,key:`${data.id}/${index}/${replay?'replay':'play'}/${round}`,empty:data.kind==='levers'?'Новых записей на доступных досках в этом такте нет.':'В доступной истории сообщений пока нет.',timing:data.kind==='levers'?'Запись уже доступна участнику доски. Текст может содержать самопредставление; система не удостоверяет автора в локальном виде.':data.kind==='capsule'?'Сообщение выбрано до результата инструмента и доступно партнёрам перед их следующими ходами.':'Сообщение уже доставлено, доступно перед следующим выбором. Движение повторяет записанную передачу.'});
}
function toolbar(){return `<div class="work-toolbar"><span class="mode-note">${data.kind==='capsule'?'Участники ходят по очереди':data.kind==='levers'?'Нажатия и переписка отдельными фазами':'Одно действие на участника за такт'}</span><button class="button secondary" data-native="restart">Начать заново</button></div>`;}
function form(){const v=game.observe(role),disabled=game.done||(data.kind==='graph'&&!active.has(role))||(data.kind==='capsule'&&role!==game.actors[game.turns%3]);let html='';
 if(data.kind==='graph'){
  const d=drafts[role];html=`<label for="native-action">Действие</label><select id="native-action" class="select"><option value="wait">Подождать</option><option value="send_message" ${d.id==='send_message'?'selected':''}>Отправить сообщение</option>${role===data.cases[index].root?`<option value="submit_answer" ${d.id==='submit_answer'?'selected':''}>Назвать расстояние</option>`:''}</select><label for="native-channel">Канал для сообщения</label><select id="native-channel" class="select">${v.chats.map(c=>`<option value="${c.id}" ${d.args?.chat_id===c.id?'selected':''}>${c.members.join(' ↔ ')}</option>`).join('')}</select><label for="native-text">Текст сообщения</label><textarea id="native-text" class="message-input">${esc(d.args?.content||'')}</textarea>${role===data.cases[index].root?`<label for="native-answer">Ответ: число рёбер</label><select id="native-answer" class="select">${data.world.actors.map((_,i)=>`<option ${d.args?.answer===i?'selected':''}>${i}</option>`).join('')}</select>`:''}`;
  if(!active.has(role))html='<p class="empty">Эта вершина ждёт первого входящего сообщения.</p>'+html;
 }else if(data.kind==='levers'){
  if(game.current[0]==='talk')html=`<label for="native-action">Действие на доске</label><select id="native-action" class="select"><option value="pass">Пропустить запись</option><option value="post" ${drafts[role].text!==undefined?'selected':''}>Написать на доске</option></select><label for="native-channel">Локальная доска</label><select id="native-channel" class="select">${Object.keys(v.boards).map(p=>`<option value="${p}" ${drafts[role].port===Number(p)?'selected':''}>Доска ${p}</option>`).join('')}</select><label for="native-text">Запись, до 160 символов</label><textarea id="native-text" class="message-input">${esc(drafts[role].text||'')}</textarea>`;
  else html=`<label for="native-action">Действие</label><select id="native-action" class="select"><option value="wait">Подождать</option><option value="press" ${drafts[role].press?'selected':''}>Нажать рычаг</option></select>`;
 }else{
  const tools=data.tools[role];html=`<p class="mode-note">Сейчас ходит ${game.actors[game.turns%3]}. Сообщение выбирается до результата инструмента.</p><label for="native-action">Физическое действие</label><select id="native-action" class="select">${tools.map(t=>`<option value="${t.name}">${label[t.name]}</option>`).join('')}</select><div class="parameters"><div><label for="native-route">Для переключателя</label><select id="native-route" class="select"><option>L</option><option>R</option></select></div><div><label for="native-target">Для приёмника</label><select id="native-target" class="select"><option value="0">T0</option><option value="1">T1</option></select></div></div><label for="native-text">Необязательное сообщение обоим партнёрам</label><textarea id="native-text" class="message-input" placeholder="Можно сообщить только уже известное показание"></textarea>`;
 }
 return `<form id="native-form" class="action-form"><fieldset ${disabled?'disabled':''}>${html}<div class="button-row"><button class="button quiet" type="submit">${data.kind==='capsule'?'Отправить и выполнить ход':'Записать действие роли'}</button></div></fieldset></form>`;
}
function summaryCall(c){if(c.id)return label[c.id]||c.id;if(c.action)return (c.message?.text?'Сообщение обоим партнёрам + ':'')+label[c.action.tool];if(c.tool)return label[c.tool];if(c.press!==undefined)return c.press?'Нажать рычаг':'Подождать';return c.text!==undefined?'Запись на доске':'Пропустить запись';}
function hasMessages(c){return data.kind==='capsule'?Boolean(c?.message?.text):Object.values(c||{}).some(a=>a.id==='send_message'||a.text!==undefined);}
function nextMessageStep(){const n=data.examples[index].actions.findIndex((c,i)=>i>=step&&hasMessages(c));return n<0?-1:n+1;}
function focusStage(){requestAnimationFrame(()=>document.querySelector('.replay-controls')?.scrollIntoView({block:'start',behavior:'instant'}));}
function queueFrame(){timer=setTimeout(()=>{step++;if(step<data.examples[index].frames.length-1)queueFrame();else timer=null;redraw();},hasMessages(data.examples[index].actions[step-1])?3400:1800);}
function view(mode){
 const replay=mode==='replay',frame=replay?data.examples[index].frames[step]:currentFrame(),example=data.examples[index];
 if(mode==='about')return `<div class="overview"><div class="team-stage">${communication(frame,false,{},false)}${scene(frame,false,{})}</div><section class="overview-copy"><h2>Наша разобранная задача</h2><p>${esc(data.summary)}</p><div class="roles">${data.world.actors.map(a=>`<span class="role-tag" style="--role:${color(a)}">${esc(a)}</span>`).join('')}</div><div class="button-row"><button class="button primary" data-mode="play">Играть вручную</button><button class="button secondary" data-mode="replay">Смотреть общение</button></div></section></div>`;
 const actions=replay?(example.actions[step-1]||{}):(trace.at(-1)||{});const full=replay||observer;
 let end='';if(data.kind==='levers'&&frame.state.current[0]==='end')end=`<div class="turn-result success">Итог: ${frame.state.score} очков. У этой задачи нет фиксированного порога победы.</div>`;
 if(data.kind==='graph'&&frame.state.done)end=`<div class="turn-result ${frame.state.success?'success':'failure'}">${frame.state.success?'Расстояние названо верно.':'Игра завершена без правильного ответа.'}</div>`;
 if(data.kind==='capsule'&&frame.state.done)end=`<div class="turn-result ${frame.state.failure?'failure':'success'}">${frame.state.failure?'Игра завершена: '+esc(frame.state.failure):'Обе капсулы доставлены.'}</div>`;
 const controls=replay?`<div class="replay-controls"><button class="icon-button" data-native="previous" ${step===0?'disabled':''} aria-label="Предыдущий такт">←</button><button class="button primary" data-native="autoplay">${timer?'Пауза':'Смотреть'}</button><button class="icon-button" data-native="next" ${step===example.frames.length-1?'disabled':''} aria-label="Следующий такт">→</button><input id="native-seek" type="range" min="0" max="${example.frames.length-1}" value="${step}" aria-label="Такт прохождения"><span class="step-count">${step} / ${example.frames.length-1}</span><button class="button secondary next-message" data-native="message" ${nextMessageStep()<0?'disabled':''}>К сообщению →</button></div>`:`<label class="observer"><input type="checkbox" id="native-observer" ${observer?'checked':''}>Полный вид исследователя</label>`;
 let right=roleButtons()+`<h3>Что видит ${esc(role)}</h3><div class="facts-scroll">${facts(frame.observations[role])}</div>`;
 if(!replay){right+=form();if(data.kind!=='capsule')right+=`<div class="draft-summary"><strong>Подготовленные действия</strong>${data.world.actors.map(a=>`<div>${esc(a)}: ${esc(summaryCall(drafts[a]))}</div>`).join('')}</div><div class="commit-area"><small>Все решения исполняются одновременно.</small><button class="button primary" data-native="commit" ${game.done?'disabled':''}>Выполнить такт</button></div>`;}
 else right+=`<div class="section-head"><h3>${step?'Действия в этом такте':'Начальное состояние'}</h3></div><div class="action-list">${(data.kind==='capsule'&&actions.actor?[[actions.actor,actions]]:Object.entries(actions)).map(([a,c])=>`<div class="recorded-action" style="--role:${color(a)}"><span class="role-dot"></span><div><strong>${esc(a)}</strong>${esc(summaryCall(c))}</div></div>`).join('')}</div>`;
 return toolbar()+`<p class="replay-notice">${esc(replay?data.verification.replay_notice:data.kind==='levers'?'Четыре раунда, по шесть нажатий; между раундами — пять тактов досок.':data.kind==='graph'?'Спящая вершина вступает в игру только после входящего сообщения. Отправка занимает такт.':'Участники ходят по очереди. Сообщение доставляется перед ходом следующего участника.')}</p>${end}<div class="play-grid team-layout"><div>${replay?controls:''}<div class="team-stage"><div class="team-context">${replay?'CPU · '+(data.kind==='levers'?'общие наблюдения':'локальная политика'):full?'Обзор исследователя':'Ручная игра · '+esc(role)} · старт ${index+1}</div>${communication(frame,full,actions,replay)}${scene(frame,full,actions)}</div>${replay?'':controls}${full&&!replay?'<p class="observer-warning">Полный вид раскрывает сведения других участников.</p>':''}${channels(frame)}</div><section class="panel">${right}</section></div>`;
}
function refreshActive(){if(data.kind==='graph')for(const a of game.actors)if(game.observe(a).chats.some(c=>c.history.some(h=>h.messages.some(m=>m.sender!==a))))active.add(a);}
function commit(){if(game.done)return;try{previousFrame=structuredClone(currentFrame());lastFeedback=game.step(structuredClone(drafts));trace.push(structuredClone(drafts));refreshActive();resetDrafts();redraw();}catch(e){alert(e.message);}}
document.addEventListener('submit',event=>{
 if(event.target.id!=='native-form')return;event.preventDefault();const chosen=document.querySelector('#native-action').value,text=document.querySelector('#native-text')?.value||'';
 if(Array.from(text).length>(data.kind==='graph'?4096:data.kind==='levers'?160:1600)){alert('Сообщение длиннее разрешённого лимита.');return;}
 if(data.kind==='graph')drafts[role]={id:chosen,args:chosen==='send_message'?{chat_id:document.querySelector('#native-channel').value,content:text}:chosen==='submit_answer'?{answer:Number(document.querySelector('#native-answer').value)}:{}};
 else if(data.kind==='levers')drafts[role]=game.current[0]==='talk'?(chosen==='post'?{port:Number(document.querySelector('#native-channel').value),text}:{pass:true}):{press:chosen==='press'};
 else{
  if(game.done||role!==game.actors[game.turns%3])return;
  const action={tool:chosen,arguments:chosen==='set_route'?{route:document.querySelector('#native-route').value}:chosen==='open_receiver'?{target:Number(document.querySelector('#native-target').value)}:{}};
  previousFrame=structuredClone(currentFrame());const call={actor:role,message:text?{to:'all',text}:null,action};inbox[role]=[];
  if(text)for(const a of game.actors)if(a!==role){const message={sender:role,sent_tick:game.turns,to:'all',text};inbox[a].push(message);messages[a].push(message);}
  lastFeedback=game.step(role,action);trace.push(call);if(!game.done)role=game.actors[game.turns%3];
 }
 redraw();
});
document.addEventListener('click',event=>{
 const b=event.target.closest('button');if(!b)return;
 if(b.dataset.nativeRole){role=b.dataset.nativeRole;redraw();return;}
 const cmd=b.dataset.native;if(!cmd)return;
 if(cmd==='restart'){stop();newGame();}
 if(cmd==='commit'){commit();return;}
 if(cmd==='previous'||cmd==='next'){stop();step+=cmd==='next'?1:-1;}
 if(cmd==='message'){stop();const n=nextMessageStep();if(n>=0)step=n;redraw();focusStage();return;}
 if(cmd==='autoplay'){if(timer)stop();else{if(step===data.examples[index].frames.length-1)step=0;queueFrame();}redraw();focusStage();return;}
 redraw();
});
document.addEventListener('change',event=>{if(event.target.id==='native-instance'){stop();index=Number(event.target.value);newGame();redraw();}if(event.target.id==='native-observer'){observer=event.target.checked;redraw();}});
document.addEventListener('input',event=>{if(event.target.id==='native-seek'){stop();step=Number(event.target.value);redraw();}});
window.EstablishedUI={load(d,r,i=0){stop();data=d;index=i;redraw=r;newGame();},getInstance(){return index;},selectInstance(i){stop();index=i;newGame();redraw();},render:view,stop};
})();
