/* E113: pure presentation of public state and the supplied local projection.
   No instance, World, hidden constant or future observation is consulted. */
(()=>{
'use strict';
const C={ink:'#294239',muted:'#6c8177',line:'#bdcec4',paper:'#f5f8f5',blue:'#3266c9',teal:'#087f8c',purple:'#8556a8',orange:'#a96620',bad:'#a74436'};
const ROLE={dispatcher:'Диспетчер',driverB:'Водитель B',driverC:'Водитель C',technician:'Техник'};
const ROLE_COLOR={dispatcher:C.purple,driverB:C.blue,driverC:C.teal,technician:C.orange};
const LABEL={drive_depot_hub:'Вывести B из депо к узлу',dock_at_hub:'Поставить B на узле и прочитать датчик колеса',reassign_and_reserve_lift:'Переназначить срочную доставку и выбрать сторону подъёмника',refuel_reserve_car:'Заправить машину C',release_urgent_cargo:'Открыть кузов B для обмена',exchange_and_inspect:'Поменять два груза и осмотреть вентиль',deliver_reserve_load:'Доставить груз машиной C',mount_spare:'Поставить запасное колесо',deliver_repaired_load:'Доставить груз отремонтированной машиной B',preload_lifting_beam:'Преднагрузить балку и прочитать нагрузку',lift_lug:'Поднять за выбранную проушину',expose_lock_window:'Открыть окно и осмотреть гнездо',drive_crosspin:'Установить поперечный штифт',press_wedge:'Установить клин',lower_onto_lock:'Опустить на фиксатор и проверить натяжение',ratchet_once:'Подтянуть ленту трещоткой',crimp_seal:'Обжать пломбу',send_message:'Отправить сообщение',wait:'Подождать'};
const SENSOR={punctured_side:'Скрытая сторона прокола',stem_profile:'Скрытый профиль вентиля',wheel_alarm:'Сторона прокола',stem_inspection:'Профиль вентиля',vehicle_b:'Машина B',vehicle_c:'Машина C',work_order:'Сторона подъёмника',bed:'Обмен грузами',fuel_b:'Топливо B, по ½ галлона',fuel_c:'Топливо C, по ½ галлона',fuel_cart:'Запас заправочной тележки',tyre:'Колесо B',heavy_end:'Скрытый тяжёлый конец',lock_seat:'Скрытое гнездо фиксатора',strap_slack:'Скрытое натяжение ленты',load_dial:'Тяжёлый конец',window_view:'Гнездо фиксатора',tension_dial:'Натяжение ленты',rig_state:'Крепление груза B',lift_side:'Сторона подъёмника',socket:'Головка для вентиля',destination:'Назначение',lug:'Проушина'};
const VALUE={left:'слева',right:'справа',hex:'шестигранник',spline:'шлицы',unread:'ещё не прочитано',covered:'ещё закрыто',depot:'депо',hub_bound:'в пути к узлу',hub:'узел обмена',clinic:'клиника',lab:'лаборатория',original:'не переназначено',inaccessible:'подъёмник недоступен',locked:'кузов закрыт',released:'кузов открыт',swapped:'грузы обменены',full:'полный',spent:'израсходован',roadworthy:'исправно',flat:'прокол',repaired:'отремонтировано',stripped:'крепление сорвано',nose:'передний конец',tail:'задний конец',bore:'отверстие',groove:'паз',taut:'натянута',loose:'провисла',idle:'ещё нет замера',unloaded:'ещё без нагрузки',parked:'балка опущена',preloaded:'балка преднагружена',level:'выровнено',window_open:'окно открыто',seated:'фиксатор установлен',loaded:'нагрузка на фиксаторе',tightened:'лента подтянута',sealed:'пломба обжата',overturned:'опрокинуто',fractured:'фиксатор сломан',torn:'лента порвана',sealed_slack:'пломба на провисшей ленте'};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(x,y,t,size=24,color=C.ink,anchor='middle',weight=400)=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-weight="${weight}">${esc(t)}</text>`;
const path=(d,color=C.ink,w=3,fill='none',extra='')=>`<path d="${d}" fill="${fill}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const rect=(x,y,w,h,fill=C.paper,stroke=C.line,r=7,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2" ${extra}/>`;
const circle=(x,y,r,fill=C.paper,stroke=C.ink,w=3,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" ${extra}/>`;
const clamp=x=>Math.min(1,Math.max(0,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,p)=>a+(b-a)*p;
function motion(from,to,options){
 const fixed=typeof options.progress==='number';
 const q=fixed?ease(options.progress):1;
 const value=to.map((v,i)=>mix(from[i],v,q));
 const animated=!fixed&&options.animate!==false&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches&&from.some((v,i)=>v!==to[i]);
 return {transform:`translate(${value[0]} ${value[1]})`,animation:animated?`<animateTransform attributeName="transform" type="translate" from="${from.join(' ')}" to="${to.join(' ')}" dur="0.75s" fill="freeze"/>`:''};
}
function pose(v,car){
 const positions=car==='B'?{depot:[100,172],hub_bound:[200,172],hub:[330,172],clinic:[584,163],lab:[584,295]}:{hub:[330,286],clinic:[584,139],lab:[584,271]};
 return positions[v[car==='B'?'vehicle_b':'vehicle_c']]||positions.hub;
}
function cargoCarrier(v,id){return (v.bed==='swapped')===(id===1)?'C':'B'}
function cargoPose(v,id){const [x,y]=pose(v,cargoCarrier(v,id));return [x-19,y-37]}
function truck(car,v,old,options){
 const next=pose(v,car),before=pose(old,car),m=motion(before,next,options),color=car==='B'?C.blue:C.teal;
 let out=`<g data-e113-vehicle="${car}" data-place="${esc(v[car==='B'?'vehicle_b':'vehicle_c'])}" transform="${m.transform}">${m.animation}`;
 out+=`<ellipse cx="0" cy="23" rx="58" ry="9" fill="#cad7ce" opacity=".6"/>`;
 out+=rect(-59,-24,85,39,'#e2eae5',color,4)+path('M27 -24H47L62 -7V15H27Z',color,2,car==='B'?'#d9e4f7':'#d8ece9')+path('M33 -19H45L53 -8H33Z',color,2,'#f9fcfa');
 out+=path('M-57 -17H24',color,3);
 const flat=car==='B'&&v.tyre==='flat',bad=car==='B'&&v.tyre==='stripped';
 out+=`<ellipse data-e113-tyre="${car==='B'?esc(v.tyre):'reserve'}" cx="-35" cy="17" rx="11" ry="${flat?6:11}" fill="${bad?'#f2c7be':'#506a5d'}" stroke="${bad?C.bad:C.ink}" stroke-width="2"/>`+circle(41,17,11,'#506a5d',C.ink,2);
 out+=text(8,3,car,25,color,'middle',700);
 if(car==='B'&&v.bed==='released')out+=path('M-60 -23L-76 -40',color,4);
 return out+'</g>';
}
function cargo(id,v,old,options){
 const next=cargoPose(v,id),before=cargoPose(old,id),m=motion(before,next,options),warm=id===1,fill=warm?'#efd2a4':'#d7d1e8',edge=warm?'#a36d26':'#73608f';
 if(cargoCarrier(v,id)!==cargoCarrier(old,id)){
  const q=typeof options.progress==='number'?ease(options.progress):1,side=id===1?-1:1;
  m.transform=`translate(${mix(before[0],next[0],q)+side*64*Math.sin(Math.PI*q)} ${mix(before[1],next[1],q)})`;
  if(m.animation){const midpoint=[(before[0]+next[0])/2+side*64,(before[1]+next[1])/2];m.animation=`<animateTransform attributeName="transform" type="translate" values="${before.join(' ')};${midpoint.join(' ')};${next.join(' ')}" dur="0.75s" fill="freeze"/>`;}
 }
 return `<g data-e113-cargo="${id===1?'urgent':'routine'}" data-carrier="${cargoCarrier(v,id)}" transform="${m.transform}">${m.animation}`+
 rect(-21,-23,42,37,fill,edge,3)+path('M-21 -23L-11 -31H31V6L21 14M21 -23L31 -31',edge,2,fill)+path('M-11 -31H31L21 -23H-21Z',edge,2,warm?'#f5e0bf':'#e8e3f0')+text(0,5,id,25,edge,'middle',700)+'</g>';
}
function building(x,y,name,kind){return rect(x-51,y-41,102,76,'#eef3ee',C.line,5)+path(`M${x-58} ${y-41}L${x} ${y-63}L${x+58} ${y-41}`,C.line,3)+rect(x-10,y+7,20,28,'#d4e3da',C.line,2)+(kind==='clinic'?path(`M${x-11} ${y-15}h22m-11 -11v22`,C.teal,5):path(`M${x-23} ${y-24}v20m16 -20v20m16 -20v20`,C.muted,3))+text(x,y-77,name,24,C.ink);}
function ownerValue(s,owner,key){return Object.hasOwn(s.private?.[owner]||{},key)?s.private[owner][key]:undefined}
function repair(s,old,actions,options){
 const v=s.public,b=old.public,rig=v.rig_state,ops=Object.values(actions).map(x=>x.id),has=id=>ops.includes(id);
 const error=['overturned','fractured','torn','sealed_slack'].includes(rig),col=error?C.bad:C.ink;
 let g=rect(18,360,684,174,'#eef4ef',C.line,12)+text(360,390,'Ремонт и крепление B',24,col,'middle',600);
 // Larger schematic detail of the same tyre. Its side is never obtained from a secret parameter.
 const flat=v.tyre==='flat',ry=flat?16:28,bry=b.tyre==='flat'?16:28;
 const fixed=typeof options.progress==='number',radius=fixed?mix(bry,ry,ease(options.progress)):ry;
 g+=`<g data-e113-detail="tyre"><ellipse cx="100" cy="448" rx="28" ry="${radius}" fill="${v.tyre==='stripped'?'#f1d4cb':'#d7e2dc'}" stroke="${v.tyre==='stripped'?C.bad:C.ink}" stroke-width="6">${!fixed&&options.animate!==false&&has('mount_spare')&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?`<animate attributeName="ry" from="${bry}" to="${ry}" dur=".75s" fill="freeze"/>`:''}</ellipse>`+circle(100,448,10,C.paper,C.ink,2)+text(100,500,({roadworthy:'Исправно',flat:'Прокол',repaired:'Колесо готово',stripped:'Срыв крепления'})[v.tyre]||'Колесо',24,col)+'</g>';
 const beamY=x=>['parked'].includes(x)?451:['preloaded','level','window_open','seated'].includes(x)?426:442;
 const bm=motion([0,beamY(b.rig_state)],[0,beamY(rig)],options);
 g+=path('M224 479H318M236 479V459M306 479V459',C.line,5)+`<g data-e113-detail="beam" transform="${bm.transform}">${bm.animation}`+rect(226,-8,90,16,'#c6dbcf',col,2)+path('M238 -8V-22M304 -8V-22',col,4)+(rig==='overturned'?path('M224 -26L319 18',C.bad,5):'')+'</g>';
 g+=text(271,500,['parked','preloaded'].includes(rig)?'Балка':'Проушина',24,col);
 // Only B's supplied window observation can reveal the seat geometry.
 const view=ownerValue(s,'driverB','window_view'),open=!['parked','preloaded','level'].includes(rig),seated=['seated','loaded','tightened','sealed','torn','sealed_slack'].includes(rig);
 g+=`<g data-e113-detail="lock" data-known="${view==='bore'||view==='groove'}">`+rect(398,421,76,57,'#d9e7df',col,5);
 if(!open)g+=rect(407,430,58,38,'#a9beb2',C.line,3);
 else if(seated)g+=rect(420,435,32,25,'#a6bdaf',col,3)+path('M423 447H449',col,3);
 else if(view==='bore')g+=circle(436,448,13,C.paper,col,3);
 else if(view==='groove')g+=rect(414,441,44,14,C.paper,col,3);
 else g+=text(436,458,'?',32,C.muted);
 if(rig==='fractured')g+=path('M422 434L449 465M449 434L422 465',C.bad,4);
 if(has('drive_crosspin')||has('press_wedge')){const pm=motion([0,-28],[0,0],options);g+=`<g data-e113-insert="true" transform="${pm.transform}">${pm.animation}`+path('M420 432H451',C.orange,7)+'</g>'}
 g+=text(436,500,'Фиксатор',24,col)+'</g>';
 const tension=ownerValue(s,'dispatcher','tension_dial'),tight=['tightened','sealed'].includes(rig),strapActive=['loaded','tightened','sealed','torn','sealed_slack'].includes(rig);
 g+=`<g data-e113-detail="strap" data-known="${tension==='taut'||tension==='loose'}">`+rect(566,429,80,43,'#e2e9e2',C.line,4);
 if(strapActive){const loose=tension==='loose'&&!tight,neutral=!tight&&!['loose','taut'].includes(tension);g+=path(loose?'M558 440Q607 478 654 440':'M558 447H654',error?C.bad:neutral?C.muted:C.orange,5,'',neutral?'stroke-dasharray="7 7"':'');}
 if(['sealed','sealed_slack'].includes(rig))g+=rect(595,436,24,23,rig==='sealed'?'#adcab7':'#f2bfb3',rig==='sealed'?C.ink:C.bad,2)+path('M601 441V455M608 441V455',col,2);
 if(rig==='torn')g+=path('M601 435L611 459M611 435L601 459',C.bad,4);
 g+=text(606,500,rig==='sealed'?'Опломбировано':'Лента и пломба',24,col)+'</g>';
 return g;
}
const jobs={dispatcher:'Подъёмник, проушина и нагрузка',driverB:'Машина B, окно и пломба',driverC:'Обмен грузов и срочная доставка',technician:'Заправка, колесо и фиксатор'};
const readings={dispatcher:['tension_dial'],driverB:['wheel_alarm','window_view','fuel_b'],driverC:['stem_inspection','fuel_c'],technician:['load_dial','fuel_c','fuel_cart']};
function instruments(s,actions){return `<div class="e113-instruments">${Object.keys(ROLE).map(actor=>{
 const own=s.private?.[actor],active=actions[actor]?.id&&actions[actor].id!=='wait';
 return `<section class="e113-instrument ${active?'is-active':''}" style="--role:${ROLE_COLOR[actor]}"><h4>${ROLE[actor]}</h4><p>${jobs[actor]}</p>${readings[actor].map(key=>{
  const exists=own&&Object.hasOwn(own,key),value=exists?(VALUE[own[key]]??String(own[key])):'личное показание';
  return `<div data-e113-reading="${key}" data-owner="${actor}" data-visible="${Boolean(exists)}"><span>${SENSOR[key]}</span><strong>${esc(value)}</strong></div>`;
 }).join('')}</section>`;
 }).join('')}</div>`;}
const style=`<style>.e113-scene{margin:0}.e113-map{display:block;width:100%;height:auto;max-height:none;background:#f5f8f5;border-radius:12px}.e113-cargo-key{display:flex;flex-wrap:wrap;gap:10px 24px;padding:14px 18px;background:#f5f8f5;font-size:16px;color:#294239}.e113-cargo-key span{display:flex;align-items:center;gap:8px}.e113-cargo-key b{display:inline-grid;place-items:center;width:27px;height:27px;border-radius:4px;background:#efd2a4;border:1px solid #a36d26;color:#7f541b}.e113-cargo-key span+span b{background:#d7d1e8;border-color:#73608f;color:#73608f}.e113-instruments{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.e113-instrument{border:1px solid #d3ded7;border-left:4px solid var(--role);border-radius:8px;padding:12px;background:#fff;min-width:0}.e113-instrument h4{margin:0 0 5px;font-size:17px;color:var(--role)}.e113-instrument p{margin:0 0 10px;font-size:13px;line-height:1.4;color:#6c8177}.e113-instrument [data-e113-reading]{display:flex;flex-direction:column;gap:3px;margin:9px 0;font-size:14px}.e113-instrument strong{font-size:15px;overflow-wrap:anywhere}.e113-instrument.is-active{background:#f4f8f4}.e113-action{margin:10px 3px 0;font-size:15px;line-height:1.5;color:#294239}.e113-reading-details{margin:10px 0;border:1px solid #d3ded7;border-radius:8px;padding:10px 12px;background:#fff}.e113-reading-details summary{cursor:pointer;font-size:15px;font-weight:600}.e113-location-note{margin:8px 2px;font-size:13px;color:#6c8177}@media(max-width:440px){.e113-instruments{grid-template-columns:1fr}.e113-cargo-key{font-size:14px;gap:8px;padding:10px}.e113-instrument{padding:10px}}@media(prefers-reduced-motion:reduce){.e113-scene *{animation:none!important;transition:none!important}}</style>`;
function render(id,snap,actions={},previous=snap,options={}){
 if(id!=='E113')return '';
 const s={public:snap.public||{},private:snap.private||{}},old={public:previous?.public||s.public,private:previous?.private||{}},v=s.public;
 let g=rect(0,0,720,548,C.paper,'none',0);
 g+=path('M102 176H583M330 284H584M370 182C441 182 467 266 550 279M370 279C441 279 467 189 550 167','#d5e0d7',16);
 g+=path('M102 176H583M330 284H584','#fdfefc',2,'none','stroke-dasharray="8 10"');
 g+=building(89,117,'Депо','depot')+building(640,119,'Клиника','clinic')+building(640,270,'Лаборатория','lab');
 g+=rect(254,87,156,243,'none','#c6d6cc',12)+text(332,70,'Узел обмена',24,C.ink,'middle',600);
 g+=text(116,269,({depot:'B · депо',hub_bound:'B → узел',hub:'B · на узле',clinic:'B · клиника',lab:'B · лаборатория'})[v.vehicle_b]||'Машина B',20,C.blue)+text(330,348,({locked:'Кузов B закрыт',released:'Кузов B открыт',swapped:'Грузы обменены'})[v.bed]||'Обмен грузами',24,C.ink);
 // Two persistent cargo IDs; their carrier changes only with the public swap state.
 g+=truck('B',v,old.public,options)+truck('C',v,old.public,options);
 g+=cargo(1,v,old.public,options)+cargo(2,v,old.public,options);
 if(['left','right','inaccessible'].includes(v.work_order))g+=text(95,307,v.work_order==='inaccessible'?'Подъёмник: ошибка':'Подъёмник '+VALUE[v.work_order],19,v.work_order==='inaccessible'?C.bad:C.purple);
 g+=repair(s,old,actions,options);
 const active=Object.entries(actions).filter(([,c])=>c.id!=='wait');
 const caption=active.map(([a,c])=>`${ROLE[a]||a}: ${LABEL[c.id]||c.id}${Object.keys(c.args||{}).length&&c.id!=='send_message'?' · '+Object.entries(c.args).map(([k,val])=>(SENSOR[k]||k)+': '+(VALUE[val]||val)).join(', '):''}`).join('; ');
 return style+`<section class="e113-scene"><div class="e113-cargo-key"><span><b>1</b>Срочный груз → клиника</span><span><b>2</b>Другой груз → лаборатория</span></div><svg class="e113-map" viewBox="0 0 720 548" role="img" aria-label="E113: две машины обмениваются грузами, машина B проходит ремонт" font-family="Arial,sans-serif">${g}</svg>${caption?`<p class="e113-action">${esc(caption)}</p>`:''}<p class="e113-location-note">Положение объектов условное. Личные показания подписаны владельцами.</p>${options.compact?'<details class="e113-reading-details"><summary>Показания по ролям</summary>'+instruments(s,actions)+'</details>':instruments(s,actions)}</section>`;
}
window.E113Scene={has:id=>id==='E113',render,ROLE,LABEL,SENSOR,VALUE,ROLE_COLOR};
})();
