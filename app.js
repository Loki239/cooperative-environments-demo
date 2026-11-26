/* Static workbench: player observations and researcher replays stay separate. */
(() => {
  'use strict';
  const {World, ChatWorld, WAIT} = window.FiniteWorld;
  const scenes = window.EnvironmentScenes;
  const $ = selector => document.querySelector(selector);
  const esc = text => String(text ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const human = text => String(text).replaceAll('_', ' ');
  const roleName = actor => window.CatalogueScenes?.roleName(data?.id,actor) || (data?.id==='E113'?window.E113Scene.ROLE[actor]:null) || scenes.ROLE[actor] || human(actor);
  const fieldName = key => window.CatalogueScenes?.fieldLabel(data?.id,key) || (data?.id==='E113'?window.E113Scene.SENSOR[key]:null) || scenes.SENSOR[key] || human(key);
  const commonValues = {unread:'ещё не прочитано', unknown:'неизвестно', none:'нет', locked:'заблокировано', ready:'готово', done:'завершено', pending:'ожидается'};
  const valueName = value => typeof value === 'boolean' ? (value ? 'да' : 'нет') : value === null ? 'нет показания' : window.CatalogueScenes?.valueLabel(data?.id,value) || (data?.id==='E113'?window.E113Scene.VALUE[value]:null) || scenes.VALUE[value] || commonValues[value] || human(value);
  const actionName = call => call.id === 'wait' ? 'Подождать' : call.id === 'send_message' ? 'Отправить сообщение' : window.CatalogueScenes?.actionLabel(data?.id,call) || (data?.id==='E113'?window.E113Scene.LABEL[call.id]:null) || scenes.LABEL[call.args?.operation] || scenes.LABEL[call.id] || human(call.id);
  const cache = new Map();
  async function readJSON(path) {
    if (window.ENVIRONMENT_LAB_EMBEDDED && Object.hasOwn(window.ENVIRONMENT_LAB_EMBEDDED,path)) return structuredClone(window.ENVIRONMENT_LAB_EMBEDDED[path]);
    const response = await fetch(path+(path.startsWith('demos/')?'?v=fullchat1':''));
    if (!response.ok) throw new Error('Не удалось загрузить ' + path);
    return response.json();
  }
  let catalogue = [], data, mode = 'about', instance = 0, role, game, drafts, playTrace = [], lastResult = null, previousPlayState = null, lastSceneKey = null;
  let recorded=null,demos=null,replaySource='cpu';
  const defaultSource=()=>recorded?'recorded':demos?'demo':'cpu';
  const selectedRecord=()=>replaySource==='recorded'?recorded:replaySource==='demo'?demos?.examples.find(e=>e.instance_index===instance):null;
  const recordIDs=new Set(['E113','NG007','E082-core','IN013']);
  let replayFrames = [], replayStep = 0, timer = null, observer = false, filter = 'all', collection = 'core', loadNumber = 0;
  const colors = ['#3266c9','#087f8c','#a96620','#8556a8'];
  const roleColor = actor => window.CatalogueScenes?.has(data?.id)?colors[data.world.actors.indexOf(actor)%colors.length]:(data?.id==='E113'?window.E113Scene.ROLE_COLOR[actor]:null) || scenes.ROLE_COLOR[actor] || colors[data.world.actors.indexOf(actor) % colors.length];
  const isPublic = key => data.world.state[key].visible_to.includes('public') || data.world.actors.every(a => data.world.state[key].visible_to.includes(a));
  const plural=(n,one,few,many)=>n%100>=11&&n%100<=14?many:n%10===1?one:n%10>=2&&n%10<=4?few:many;
  const title = item => `${item.source_id || item.id} (${item.name})`;

  function expression(expr) {
    if (!expr || typeof expr !== 'object') return valueName(expr);
    const [op, v] = Object.entries(expr)[0];
    if (op === 'var') return fieldName(v);
    if (op === 'arg') return `параметр «${human(v)}»`;
    if (op === 'not') return `не (${expression(v[0])})`;
    if (op === 'if') return `если ${expression(v[0])}, то ${expression(v[1])}, иначе ${expression(v[2])}`;
    const symbols = {eq:'=', ne:'≠', ge:'≥', gt:'>', le:'≤', lt:'<', add:'+', sub:'−', and:'И', or:'ИЛИ'};
    return '(' + v.map(expression).join(' ' + (symbols[op] || op) + ' ') + ')';
  }
  function facts(entries) {
    return entries.length ? `<dl class="facts">${entries.map(([k,v]) => `<div class="fact"><dt title="${esc(k)}">${esc(fieldName(k))}</dt><dd>${esc(valueName(v))}</dd></div>`).join('')}</dl>` : '<p class="empty">Показаний пока нет.</p>';
  }
  function snapshot(world, selected = null, full = false) {
    const publicState = Object.fromEntries(Object.entries(world.state).filter(([k]) => isPublic(k)));
    const privateState = {};
    for (const a of data.world.actors) {
      if (full || a === selected) privateState[a] = Object.fromEntries(Object.entries(world.observe(a).state).filter(([k]) => !isPublic(k)));
    }
    return {public:publicState, private:privateState};
  }
  function scene(world, actions = {}, selected = null, full = false, caption = '', previousState = null) {
    const snap = snapshot(world, selected, full);
    const active = Object.fromEntries(Object.entries(actions).filter(([actor,a]) => a.id !== 'wait'&&(full||actor===selected)));
    let content;
    if (window.E113Scene?.has(data.id) || window.CoreEnvironmentScenes?.has(data.id)) {
      let before=snap;
      if(previousState){const w=new World(data.world,data.instances[instance]);w.state=previousState;w.round=Math.max(0,world.round-1);before=snapshot(w,selected,full);}
      const key=`${data.id}/${instance}/${mode}/${world.round}`;
      content=(window.E113Scene?.has(data.id)?window.E113Scene:window.CoreEnvironmentScenes).render(data.id,snap,active,before,{animate:key!==lastSceneKey,compact:data.collection==='core'});lastSceneKey=key;
    } else if (window.CatalogueScenes?.has(data.id)) {
      let before=snap;if(previousState){const w=new World(data.world,data.instances[instance]);w.state=previousState;before=snapshot(w,selected,full);}
      const key=`${data.id}/${instance}/${mode}/${world.round}`;
      content=window.CatalogueScenes.render(data.id,snap,active,before,{animate:key!==lastSceneKey});lastSceneKey=key;
    } else if (scenes.has(data.id)) {
      let before=snap;if(previousState){const w=new World(data.world,data.instances[instance]);w.state=previousState;before=snapshot(w,selected,full);}
      const key=`${data.id}/${instance}/${mode}/${world.round}`;
      content = `<svg class="legacy-object-scene" viewBox="40 120 640 440" role="img" aria-label="${esc(title(data))}: состояние среды">${scenes.render(data.id,snap,active,before,{animate:key!==lastSceneKey})}</svg>`;lastSceneKey=key;
    } else {
      content = `<div class="public-scene"><h3>Общее состояние среды</h3><p class="muted">Параметры, доступные всем участникам.</p><div class="facts-scroll">${facts(Object.entries(snap.public))}</div><div class="roles">${data.world.actors.map(a=>`<span class="role-tag" style="--role:${roleColor(a)}">${esc(roleName(a))}</span>`).join('')}</div></div>`;
    }
    return `<div class="scene-wrap"><div class="scene-ribbon"><span class="round">Такт ${world.round} / ${world.spec.horizon}</span><span>${world.success() ? 'Цель достигнута' : 'Общий мир · разные наблюдения'}</span></div>${content}<div class="scene-caption">${esc(caption)}</div></div>`;
  }
  function stopPlayback() { window.EstablishedUI?.stop(); if (timer) clearTimeout(timer); timer = null; }
  function resetGame() {
    game = new ChatWorld(data.world, data.contract, data.instances[instance]);
    role = data.world.actors[0]; drafts = Object.fromEntries(data.world.actors.map(a=>[a,WAIT()]));
    playTrace = []; lastResult = null; previousPlayState = null; lastSceneKey = null; observer = false;
  }
  function buildReplay() {
    const record=selectedRecord(),useRecord=Boolean(record&&record.instance_index===instance);
    const engine=useRecord?new ChatWorld(data.world,data.contract,data.instances[instance]):new World(data.world,data.instances[instance]);
    const w=()=>useRecord?engine.world:engine;
    const save=actions=>({world:structuredClone(w().state),round:w().round,actions,chats:useRecord?structuredClone(engine.chats):{}});
    replayFrames=[save({})];
    for(const actions of (useRecord?record.actions:data.examples[instance].actions)){
      if(!engine.stepJoint(actions).ok)throw new Error('Сохранённое прохождение не соответствует правилам.');
      replayFrames.push(save(actions));
    }
    replayStep=0;
  }
  function communication(chats,round,selected=null,full=false,empty='',actions={},world=null){
    const roleNumbers=Object.fromEntries(data.world.actors.map((a,i)=>[a,i+1]));
    const actionRows=data.world.actors.filter(a=>(full||a===selected)&&actions[a]).map(a=>({...window.ActionTargets.describe(data.id,a,actions[a],{actors:data.world.actors,public:world?snapshot(world,null,false).public:{}}),actor:a,number:roleNumbers[a],color:roleColor(a),roleName:roleName(a)}));
    return window.CommunicationScene.render(window.CommunicationScene.fromChats(chats,data.contract.channels,selected,full),{
      actors:data.world.actors,name:roleName,color:roleColor,roleNumbers,actionRows,round,key:`${data.id}/${instance}/${mode}/${round}/${replaySource}`,empty
    });
  }
  function sourceControls(){
    if(!recorded&&!demos)return '';
    const extra=recorded?`<option value="recorded" ${replaySource==='recorded'?'selected':''}>Qwen · старт ${recorded.instance_index+1} · с перепиской</option>`:`<option value="demo" ${replaySource==='demo'?'selected':''}>CPU · с сообщениями</option>`;
    return `<div class="replay-source"><label for="replay-source">Запись прохождения</label><select class="select" id="replay-source"><option value="cpu" ${replaySource==='cpu'?'selected':''}>CPU · текущий старт · без переписки</option>${extra}</select><a href="${recorded?'replays':'demos'}/${data.id}.json${recorded?'':'?v=fullchat1'}" download>${recorded?'Запись Qwen':'Записи сценариев'}</a></div>`;
  }
  function recordedNotice(){return `${recorded.model} · старт ${instance+1} · ${recorded.source_mode==='none'?'без подсказок':'оконные подсказки отправителю'}. Архивная игра, обзор исследователя.`;}
  function replayNotice(){return replaySource==='recorded'?recordedNotice():replaySource==='demo'?[selectedRecord()?.note||demos.note,'Обзор исследователя.'].join(' '):data.collection==='core'?data.verification.replay_notice:'CPU-пример: команда объединяет доступные наблюдения всех ролей. Отправки сообщений здесь не исполнялись.';}
  function replayContext(){return replaySource==='recorded'?'Qwen · архив · '+(recorded.source_mode==='none'?'без подсказок':'оконные подсказки'):replaySource==='demo'?'CPU · с сообщениями':'CPU · без переписки';}
  function renderCatalogue() {
    const query = $('#search').value.trim().toLocaleLowerCase('ru');
    const items = catalogue.filter(x=>(x.collection||'generated')===collection && (filter !== 'scenes' || x.scene) && `${x.id} ${x.name} ${x.summary} ${x.actors.join(' ')}`.toLocaleLowerCase('ru').includes(query));
    $('#environment-count').textContent = items.length;
    document.querySelectorAll('[data-collection]').forEach(b=>{b.classList.toggle('active',b.dataset.collection===collection);b.setAttribute('aria-pressed',String(b.dataset.collection===collection));});
    const includesCurrent=items.some(x=>x.id===data?.id);
    $('#environment-select').innerHTML=(includesCurrent?'':`<option value="">${items.length?'Выберите среду':'Ничего не найдено'}</option>`)+items.map(x=>`<option value="${x.id}" ${x.id===data?.id?'selected':''}>${esc(title(x))}</option>`).join('');
    $('#environment-select').disabled=!items.length;
    $('#random-environment').disabled=!items.length;
  }
  function currentInstance(){return data.kind?window.EstablishedUI.getInstance():instance;}
  function validInstance(value){const n=Number(value);return Number.isInteger(n)&&n>=0&&n<data.instances.length?n:0;}
  function syncControls(){
    const n=currentInstance();
    $('#start-select').innerHTML=data.instances.map((_,i)=>`<option value="${i}" ${i===n?'selected':''}>${i+1} из ${data.instances.length}</option>`).join('');
    $('#start-select').disabled=false;$('#random-start').disabled=data.instances.length<2;
    history.replaceState(null,'',`#env=${data.id}&mode=${mode}&start=${n+1}${mode==='about'&&!data.kind?'&replay='+replaySource:''}`);
  }
  function selectInstance(value){
    stopPlayback();const n=validInstance(value);
    if(data.kind)window.EstablishedUI.selectInstance(n);
    else{instance=n;if(mode==='about'&&replaySource==='recorded'&&recorded?.instance_index!==instance)replaySource='cpu';resetGame();buildReplay();render();}
  }
  function taskSummary() {
    const preview = data.id==='E138'&&location.protocol!=='file:' ? '<a class="task-preview" href="e138-styles/">Посадка самолёта: два оформления</a>' : '';
    return `<section class="task-summary" aria-label="Общая задача"><div><h2>Одна задача на всю команду</h2><p>${esc(data.summary)}</p>${preview}</div><div class="roles" aria-label="Роли среды">${data.world.actors.map(a=>`<span class="role-tag" style="--role:${roleColor(a)}">${esc(roleName(a))}</span>`).join('')}</div></section>`;
  }
  function taskDetails() {
    return `<details class="details"><summary>Роли и передача информации</summary><div class="details-body">${data.description.slice(1,3).map(p=>`<p>${esc(p)}</p>`).join('')}</div></details><details class="details"><summary>Проверки и границы этой реализации</summary><div class="details-body"><p><strong>${data.instances.length} вариантов проверены CPU.</strong> ${data.collection==='core'?'Для каждого старта независимо найден и исполнен физический план, без переписки. Проверки общения и прежние исследования описаны в паспорте ниже.':'Исходные физические планы проверены CPU; отдельно доступны постановочные сценарии с сообщениями. Необходимость явного чата пока не установлена; модельных игр в этой серии нет.'}</p>${data.description.slice(3).map(p=>`<p>${esc(p)}</p>`).join('')}<p>Полные исследовательские данные, включая скрытые параметры и примеры решения, доступны ниже.</p></div></details>`;
  }
  function passport() {
    const v=data.verification;
    return `<details class="details core-passport"><summary>Что здесь проверено</summary><div class="details-body"><p>${esc(v.study)}</p><dl class="facts"><div class="fact"><dt>Свежая перепроверка</dt><dd>${esc(v.physical_cpu)}</dd></div><div class="fact"><dt>Перенос в браузер</dt><dd>Сравнен с исходным Python</dd></div></dl><p>${esc(v.scope)}</p><p class="mode-note">${esc(v.replay_notice)}</p><div class="downloads"><a href="verification/core-engine.json" download>Проверка движков</a><a href="downloads/${data.id}.evidence.json" download>Источники и границы</a></div></div></details>${data.kind?`<details class="details"><summary>Правила и роли</summary><div class="details-body">${data.description.map(p=>`<p>${esc(p)}</p>`).join('')}</div></details>${downloads()}`:''}`;
  }
  function downloads() { return `<div class="downloads"><a href="downloads/${data.id}.world.json" download>Правила мира</a><a href="downloads/${data.id}.communication.json" download>Правила чата</a><a href="downloads/${data.id}.evidence.json" download>Свидетельства CPU</a></div>`; }
  function toolbar() {
    return `<div class="work-toolbar"><span class="mode-note">${mode==='play'?'Ручная игра за все роли':'Сохранённое прохождение'}</span><div class="button-row" style="margin:0"><button class="button secondary" id="restart">Начать заново</button>${mode==='play'?'<button class="button secondary" id="export-play">Скачать мои ходы</button>':''}</div></div>`;
  }
  function roleButtons() { return `<div class="role-switcher" aria-label="Выберите роль">${data.world.actors.map(a=>`<button class="role-button ${a===role?'active':''}" style="--role:${roleColor(a)}" data-role="${esc(a)}" aria-pressed="${a===role}">${esc(roleName(a))}</button>`).join('')}</div>`; }
  function chatView(view) {
    const entries = view.chats.flatMap(c=>c.history.flatMap(h=>h.messages.map(m=>({...m,tick:h.tick,channel:c.id}))));
    return `<section class="panel chat-panel"><h3>Переписка ${esc(roleName(role))}</h3><div class="chat-list">${entries.reverse().map(m=>`<article class="chat-message"><header><span>${esc(m.sender?roleName(m.sender):'Анонимный участник')}</span><span>доставлено к такту ${m.tick}</span></header><p>${esc(m.content)}</p></article>`).join('') || '<p class="empty">Доставленных сообщений пока нет.</p>'}</div></section>`;
  }
  function playView() {
    const view = game.observe(role), publicEntries = Object.entries(view.state).filter(([k])=>isPublic(k)), privateEntries = Object.entries(view.state).filter(([k])=>!isPublic(k));
    let result = '';
    if (lastResult) result = `<div class="turn-result ${game.success()?'success':game.done?'failure':''}" role="status">${game.success()?'Цель достигнута. Команда справилась.':!lastResult.ok?'Совместный ход недопустим. По правилам этого режима эпизод завершён; начните заново.':game.done?'Лимит тактов исчерпан. Цель не достигнута.':`Такт ${game.round} выполнен. Новые показания и доставленные сообщения уже доступны ролям.`}</div>`;
    const chosen = drafts[role];
    const tools = [{id:'wait',parameters:{}}, ...view.tools];
    return toolbar()+`<p class="replay-notice">Вы управляете всеми ролями. Выберите по одному действию для участников, затем выполните общий такт. Сообщение занимает действие; получатель видит его перед следующим ходом.</p>${result}<div class="play-grid team-layout"><div><div class="team-stage"><div class="team-context">${observer?'Обзор исследователя':'Ручная игра · '+esc(roleName(role))} · старт ${instance+1}</div>${communication(game.chats,game.round,role,observer,'',lastResult?.ok===false?{}:(playTrace.at(-1)?.actions||{}),game.world)}${scene(game.world,lastResult?.ok===false?{}:(playTrace.at(-1)?.actions||{}),role,observer,observer?'Обзор исследователя: законные наблюдения всех ролей.':'Сцена учитывает частные показания только выбранной роли.',previousPlayState)}</div><label class="observer"><input id="observer" type="checkbox" ${observer?'checked':''}>Показать полное состояние исследователю</label>${observer?`<div class="observer-warning">В этом виде видны скрытые параметры. Он не соответствует информации отдельного игрока.</div><details class="details"><summary>Все параметры мира</summary><div class="details-body">${facts(Object.entries(game.world.state))}</div></details>`:''}${chatView(view)}</div><section class="panel">${roleButtons()}<div class="section-head"><h3>Что видит ${esc(roleName(role))}</h3><small>такт ${game.round}</small></div><div class="private-facts facts-scroll" style="--role:${roleColor(role)}">${facts(privateEntries)}</div><details class="details"><summary>Общие параметры · ${publicEntries.length}</summary><div class="details-body facts-scroll">${facts(publicEntries)}</div></details><form id="action-form" class="action-form"><label for="action">Действие роли</label><select id="action" class="select" ${game.done?'disabled':''}>${tools.map(a=>`<option value="${esc(a.id)}" ${a.id===chosen.id?'selected':''}>${esc(actionName(a))}</option>`).join('')}</select><div id="action-fields"></div><div class="button-row"><button class="button quiet" type="submit" ${game.done?'disabled':''}>Записать действие роли</button></div></form><div class="draft-summary"><strong>Подготовлены к общему такту</strong>${data.world.actors.map(a=>`<div><span style="color:${roleColor(a)}">${esc(roleName(a))}</span>: ${esc(actionName(drafts[a]))}</div>`).join('')}</div><div class="commit-area"><small>Незаполненные роли ждут. Правила проверяются для всех действий одновременно.</small><button class="button primary" id="commit" ${game.done?'disabled':''}>Выполнить такт →</button></div><details class="details"><summary>Как устроен чат</summary><div class="details-body"><p>Общий канал для ${view.chats[0]?.members.length||0} ролей. Доставка гарантирована, задержка ${data.contract.delay} такт. Сообщение заменяет физическое действие отправителя.</p><p>Для этой роли осталось ${view.communication_budget.messages_left} сообщений. В каждом — не более ${data.contract.max_chars} символов.</p><p>Меню содержит все инструменты роли. Недопустимые сейчас действия не отфильтрованы по скрытому состоянию.</p></div></details></section></div>`;
  }
  function renderActionFields() {
    if (mode!=='play') return;
    const id = $('#action').value, stored = drafts[role].id===id?drafts[role].args:{};
    let html = '';
    if (id==='send_message') {
      html = `<label for="chat-id">Канал</label><select id="chat-id" class="select">${game.observe(role).chats.map(c=>`<option value="${esc(c.id)}">Общий чат: ${esc(c.members.map(roleName).join(', '))}</option>`).join('')}</select><label for="content">Сообщение</label><textarea class="message-input" id="content" placeholder="Передайте показание или договоритесь о следующем ходе">${esc(stored.content||'')}</textarea><p class="mode-note">До ${data.contract.max_chars} символов. Отправится при выполнении общего такта.</p>`;
    } else if (id!=='wait') {
      const action = data.world.actions.find(a=>a.id===id);
      html = `<p class="action-id">${esc(id)}</p><div class="parameters">${Object.entries(action.parameters||{}).map(([k,values],n)=>`<div><label for="param-${n}">${esc(fieldName(k))}</label><select class="select" id="param-${n}" data-param="${esc(k)}">${values.map((v,i)=>`<option value="${i}" ${v===stored[k]?'selected':''}>${esc(valueName(v))}</option>`).join('')}</select></div>`).join('')}</div><details class="details"><summary>Условие и эффект действия</summary><div class="details-body"><p>Правило без подстановки скрытых значений.</p><div class="rule-code">Можно выполнить, если ${esc(expression(action.guard))}.</div><div class="rule-code">${Object.entries(action.effects).map(([k,v])=>esc(fieldName(k)+' ← '+expression(v))).join('<br>')}</div></div></details>`;
    } else html = '<p class="mode-note" style="margin-top:12px">Роль пропускает физическое действие в этом такте.</p>';
    $('#action-fields').innerHTML = html;
  }
  function readCall() {
    const id = $('#action').value;
    if (id==='wait') return WAIT();
    if (id==='send_message') return {id,args:{chat_id:$('#chat-id').value,content:$('#content').value}};
    const parameters = data.world.actions.find(a=>a.id===id).parameters||{};
    return {id,args:Object.fromEntries([...document.querySelectorAll('[data-param]')].map(el=>[el.dataset.param,parameters[el.dataset.param][Number(el.value)]]))};
  }
  function nextMessageStep(){return replayFrames.findIndex((f,i)=>i>replayStep&&Object.values(f.chats||{}).some(h=>h.some(b=>b.tick===f.round)));}
  function focusStage(){requestAnimationFrame(()=>document.querySelector('.replay-controls')?.scrollIntoView({block:'start',behavior:'instant'}));}
  function queueFrame(){
    const f=replayFrames[replayStep],talk=Object.values(f.chats||{}).some(h=>h.some(b=>b.tick===f.round));
    timer=setTimeout(()=>{replayStep++;if(replayStep<replayFrames.length-1)queueFrame();else timer=null;render();},talk?3400:1800);
  }
  function replayView() {
    const frame = replayFrames[replayStep], world = new World(data.world,data.instances[instance]);
    world.state = frame.world; world.round = frame.round;
    const previous = replayFrames[Math.max(0,replayStep-1)].world;
    const changes = Object.entries(world.state).filter(([k,v])=>!isPublic(k)&&v!==previous[k]&&data.world.state[k].visible_to.length);
    return toolbar()+sourceControls()+`<div class="play-grid team-layout replay-layout"><div class="replay-main"><div class="replay-controls"><button class="icon-button" id="previous" aria-label="Предыдущий такт" ${replayStep===0?'disabled':''}>←</button><button class="button primary" id="autoplay">${timer?'Пауза':'Смотреть'}</button><button class="icon-button" id="next" aria-label="Следующий такт" ${replayStep===replayFrames.length-1?'disabled':''}>→</button><input type="range" id="seek" min="0" max="${replayFrames.length-1}" value="${replayStep}" aria-label="Такт прохождения"><span class="step-count">${replayStep} / ${replayFrames.length-1}</span><button class="button secondary next-message" id="next-message" ${nextMessageStep()<0?'disabled':''}>К сообщению →</button></div><div class="team-stage"><div class="team-context">${replayContext()} · старт ${instance+1}</div>${communication(frame.chats,world.round,null,true,replaySource==='cpu'?'CPU-план без переписки. Люди показаны без передач.':'До этого такта никто не отправлял сообщений.',frame.actions,world)}${scene(world,frame.actions,null,true,replayStep===0?'Стартовый мир до первого действия.':'Состояние после совместного действия выбранного такта.',previous)}</div>${world.success()?`<div class="turn-result success">Цель достигнута. ${replaySource==='recorded'?'Архивная игра Qwen.':replaySource==='demo'?'Постановочная CPU-демонстрация.':'Сохранённый CPU-пример.'}</div>`:replaySource==='demo'&&replayStep===replayFrames.length-1?`<div class="turn-result">Показанная часть сценария завершена; полная цель ещё не достигнута. ${esc(selectedRecord()?.ending_note||'Полное физическое прохождение доступно в варианте «CPU · без переписки».')}</div>`:''}</div><aside class="replay-panel">${taskSummary()}<section class="panel replay-state"><p class="replay-notice">${esc(replayNotice())}</p><h3>${replayStep?'Действия в этом такте':'Перед первым ходом'}</h3><div class="action-list">${data.world.actors.map(a=>`<div class="recorded-action" style="--role:${roleColor(a)}"><span class="role-dot"></span><div><strong>${esc(roleName(a))}</strong>${replayStep?esc(actionName(frame.actions[a])):'Исходные наблюдения'}${Object.keys(frame.actions[a]?.args||{}).length&&frame.actions[a]?.id!=='send_message'?`<div class="action-id">${esc(Object.entries(frame.actions[a].args).map(([k,v])=>human(k)+': '+valueName(v)).join(' · '))}</div>`:''}</div></div>`).join('')}</div><div class="section-head"><h3>Новые частные показания</h3></div>${changes.length?changes.map(([k,v])=>`<div class="recorded-action" style="--role:${roleColor(data.world.state[k].visible_to[0])}"><span class="role-dot"></span><div><strong>${esc(data.world.state[k].visible_to.map(roleName).join(', '))}</strong>${esc(fieldName(k))}: ${esc(valueName(v))}</div></div>`).join(''):'<p class="empty">В этом такте частные показания не изменились.</p>'}<details class="details"><summary>Наблюдения всех ролей</summary><div class="details-body">${data.world.actors.map(a=>`<h4 style="color:${roleColor(a)};margin:14px 0 6px">${esc(roleName(a))}</h4>${facts(Object.entries(world.observe(a).state).filter(([k])=>!isPublic(k)))}`).join('')}</div></details><details class="details"><summary>Общие параметры</summary><div class="details-body facts-scroll">${facts(Object.entries(world.state).filter(([k])=>isPublic(k)))}</div></details>${taskDetails()}${recorded?`<details class="details"><summary>Источник записи и границы</summary><div class="details-body">${esc(recorded.note)}<p>Состояния восстановлены исходным CPU-симулятором. Действия и сообщения сохранены буквально. Соседство сообщения и удачного действия не доказывает причинного влияния.</p></div></details>`:''}</section></aside></div>${downloads()}`;
  }
  function render() {
    $('#workspace').innerHTML = `<div class="env-heading"><div><div class="env-kicker"><span>${data.world.actors.length} ${plural(data.world.actors.length,'роль','роли','ролей')}</span><span>${data.world.horizon} ${plural(data.world.horizon,'такт','такта','тактов')}</span><span>${data.instances.length} ${plural(data.instances.length,'вариант','варианта','вариантов')}</span></div><h1>${esc(title(data))}</h1></div><div class="heading-buttons"><button class="icon-button" id="share" aria-label="Скопировать ссылку на среду" title="Скопировать ссылку"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/></svg></button></div></div><div class="tabs" aria-label="Режим просмотра">${[['about','Задача и прохождение'],['play','Играть']].map(([id,label])=>`<button class="tab ${id===mode?'active':''}" data-mode="${id}" aria-pressed="${id===mode}">${label}</button>`).join('')}</div>${data.kind?window.EstablishedUI.render(mode==='about'?'replay':mode):mode==='about'?replayView():playView()}${data.collection==='core'?passport():''}`;
    syncControls();window.CommunicationScene?.mountActions();
    const animatedScenes=[...document.querySelectorAll('.catalogue-scene,.legacy-object-scene')];
    requestAnimationFrame(()=>{for(const svg of animatedScenes)if(svg.isConnected&&svg.querySelector('animate,animateTransform')){svg.setCurrentTime(0);svg.querySelectorAll('animate,animateTransform').forEach(a=>a.beginElement());}});
    document.title = `${title(data)} — Среды для общения агентов`;
    if (mode==='play'&&!data.kind) renderActionFields();
  }
  function toast(message) { $('#toast').textContent=message; $('#toast').hidden=false; setTimeout(()=>{$('#toast').hidden=true;},3000); }
  function setMode(next) {
    if(next==='replay')next='about';
    if (!['about','play'].includes(next)) next='about';
    stopPlayback();
    if(next==='about'&&!data.kind&&replaySource==='recorded'&&recorded?.instance_index!==instance){replaySource='cpu';resetGame();buildReplay();}
    mode=next;render();
  }
  async function selectEnvironment(id, next='about', start=null, source='auto') {
    const entry=catalogue.find(x=>x.id===id)||catalogue[0], ticket=++loadNumber;
    stopPlayback();
    try {
      if(!cache.has(entry.id)) {
        cache.set(entry.id,await readJSON(entry.data));
      }
      if(ticket!==loadNumber) return;
      data=cache.get(entry.id); recorded=recordIDs.has(data.id)?await readJSON(`replays/${data.id}.json`):null;demos=entry.collection==='generated'?await readJSON(`demos/${data.id}.json`):null;if(ticket!==loadNumber)return;replaySource=source==='cpu'?'cpu':defaultSource();if(start===null&&replaySource==='recorded')start=recorded.instance_index; collection=entry.collection||'generated'; instance=validInstance(start==='random'?Math.floor(Math.random()*data.instances.length):start);if(!data.kind&&replaySource==='recorded'&&recorded?.instance_index!==instance)replaySource='cpu'; if(data.kind)window.EstablishedUI.load(data,render,instance);else {resetGame();buildReplay();} setMode(next); renderCatalogue();
    } catch(error) { $('#workspace').innerHTML=`<div class="error-view"><h2>Среда не загрузилась</h2><p>${esc(error.message)}</p><button class="button secondary" onclick="location.reload()">Обновить страницу</button></div>`; }
  }
  $('#search').addEventListener('input',renderCatalogue);
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[download]'),downloadPath=link?.getAttribute('href')?.split('?')[0];
    if(link && window.ENVIRONMENT_LAB_EMBEDDED?.[downloadPath]) {
      event.preventDefault();const path=downloadPath;
      const url=URL.createObjectURL(new Blob([JSON.stringify(window.ENVIRONMENT_LAB_EMBEDDED[path],null,2)],{type:'application/json'}));
      const download=document.createElement('a');download.href=url;download.download=path.split('/').at(-1);download.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
    }
    const button=event.target.closest('button'); if(!button) return;
    if(button.dataset.env) {selectEnvironment(button.dataset.env);return;}
    if(button.id==='recorded-replay'){replaySource='recorded';instance=recorded.instance_index;resetGame();buildReplay();setMode('about');return;}
    if(button.dataset.mode) {setMode(button.dataset.mode);if(mode==='about')focusStage();return;}
    if(button.dataset.collection){collection=button.dataset.collection;filter='all';$('#search').value='';$('#scene-filter').checked=false;renderCatalogue();const first=catalogue.find(x=>(x.collection||'generated')===collection);if(first)selectEnvironment(first.id);return;}
    if(button.id==='random-environment'){
      const ids=[...$('#environment-select').options].map(x=>x.value).filter(Boolean),other=ids.filter(id=>id!==data.id),pool=other.length?other:ids;
      if(pool.length)selectEnvironment(pool[Math.floor(Math.random()*pool.length)],mode,'random');return;
    }
    if(button.id==='random-start'){
      const n=data.instances.length;if(n>1)selectInstance((currentInstance()+1+Math.floor(Math.random()*(n-1)))%n);return;
    }
    if(button.dataset.role) {role=button.dataset.role;render();return;}
    if(button.id==='about-data') {$('#data-dialog').showModal();return;}
    if(button.classList.contains('dialog-close')) {$('#data-dialog').close();return;}
    if(button.id==='share') {if(location.protocol==='file:'){toast('Это локальная копия: передайте коллегам файл offline.html.');return;}navigator.clipboard?.writeText(location.href).then(()=>toast('Ссылка скопирована.'),()=>toast('Скопируйте адрес из строки браузера.'));return;}
    if(button.id==='restart') {stopPlayback();resetGame();buildReplay();render();return;}
    if(button.id==='commit') {
      const actions=structuredClone(drafts); previousPlayState=structuredClone(game.world.state); lastResult=game.stepJoint(actions);
      playTrace.push({actions,feedback:structuredClone(lastResult),round:game.round});
      drafts=Object.fromEntries(data.world.actors.map(a=>[a,WAIT()]));render();return;
    }
    if(button.id==='previous'||button.id==='next') {stopPlayback();replayStep+=button.id==='next'?1:-1;render();return;}
    if(button.id==='next-message'){stopPlayback();const n=nextMessageStep();if(n>=0)replayStep=n;render();focusStage();return;}
    if(button.id==='autoplay') {if(timer)stopPlayback();else{if(replayStep===replayFrames.length-1)replayStep=0;queueFrame();}render();focusStage();return;}
    if(button.id==='export-play') {
      const artifact={environment:data.id,world_hash:data.verification.world_hash,instance_index:instance,mode:'manual_hotseat_tool_chat',delivery:true,trace:playTrace,success:game.success(),done:game.done};
      const url=URL.createObjectURL(new Blob([JSON.stringify(artifact,null,2)],{type:'application/json'}));
      const a=document.createElement('a');a.href=url;a.download=`${data.id}-manual.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='replay-source'){stopPlayback();replaySource=event.target.value;if(replaySource==='recorded')instance=recorded.instance_index;resetGame();buildReplay();render();}
    if(event.target.id==='start-select') selectInstance(event.target.value);
    if(event.target.id==='environment-select'&&event.target.value) selectEnvironment(event.target.value,mode);
    if(event.target.id==='scene-filter'){filter=event.target.checked?'scenes':'all';renderCatalogue();}
    if(event.target.id==='action') renderActionFields();
    if(event.target.id==='observer') {observer=event.target.checked;render();}
  });
  document.addEventListener('input',event=>{if(event.target.id==='seek'){stopPlayback();replayStep=Number(event.target.value);render();}});
  document.addEventListener('submit',event=>{
    if(event.target.id!=='action-form')return; event.preventDefault(); const call=readCall();
    if(call.id==='send_message' && Array.from(call.args.content).length>data.contract.max_chars){toast(`Сообщение длиннее ${data.contract.max_chars} символов.`);return;}
    drafts[role]=call;render();toast(`Действие роли «${roleName(role)}» записано.`);
  });
  window.addEventListener('hashchange',()=>{
    const query=new URLSearchParams(location.hash.slice(1)), id=query.get('env'), next=query.get('mode')||'about', source=query.get('replay')||defaultSource(), requestedStart=query.has('start')?Number(query.get('start'))-1:null;
    const start=id===data?.id&&requestedStart===null&&source==='recorded'&&recorded?recorded.instance_index:requestedStart;
    if(id===data?.id){if(source!==replaySource){selectEnvironment(id,next,start,query.get('replay'));return;}if(validInstance(start)!==currentInstance())selectInstance(start);setMode(next);}else selectEnvironment(id,next,start,query.get('replay'));
  });
  async function start() {
    try {
      catalogue=(await readJSON('catalogue.json')).environments;renderCatalogue();
      const query=new URLSearchParams(location.hash.slice(1));await selectEnvironment(query.get('env')||'GRAPH',query.get('mode')||'about',query.has('start')?Number(query.get('start'))-1:null,query.get('replay'));
    } catch(error) {$('#workspace').innerHTML=`<div class="error-view"><h2>Не удалось открыть каталог</h2><p>${esc(error.message)} Откройте страницу через HTTP-сервер или GitHub Pages.</p></div>`;}
  }
  start();
})();
