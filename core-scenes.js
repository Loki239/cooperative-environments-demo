/* Draw only the supplied public state and permitted local observations. */
(()=>{
'use strict';
const base=window.EnvironmentScenes;
const color={blue:'#3266c9',teal:'#087f8c',orange:'#a96620',purple:'#8556a8',ink:'#294239',line:'#c5d4ce',metal:'#dbe5e2',paper:'#f6f9f7',red:'#ad493d'};
const roles={FlowDiagnostic:'Диагност',FieldPerformer:'Исполнитель',ProtectionChecker:'Контролёр',Power:'Энергетик',Water:'Водный контур',Stores:'Снабжение',Air:'Воздушный контур',designer:'Конструктор',builder:'Сборщик',tester:'Испытатель'};
const roleColors={FlowDiagnostic:color.blue,FieldPerformer:color.teal,ProtectionChecker:color.orange,Power:color.blue,Water:color.teal,Stores:color.orange,Air:color.purple,designer:color.blue,builder:color.teal,tester:color.orange};
const labels={lock_hot_water_isolation:'Изолировать горячую воду',pin_verified_valves:'Зафиксировать клапаны',run_differential_flow_check:'Проверить перепад потока',realign_restriction_bypass:'Переключить обходной контур',open_circulation_unlocked_test_port:'Открыть пробоотборник',analyze_guarded_cold_sample:'Проверить холодную пробу',connect_contents_recovery:'Подключить сбор содержимого',empty_through_protected_route:'Разгрузить резерв',seal_cold_backup:'Опломбировать аппарат',read_head_differential:'Измерить давление в головке',seat_relief_insert:'Установить разгрузочный вкладыш',inspect_retainer_profile:'Осмотреть крепление',extract_split_ring:'Извлечь разрезное кольцо',brace_spring_carrier:'Подпереть пружинный держатель',lift_braced_carrier:'Снять держатель с подпоркой',gauge_sealing_land:'Измерить поверхность штуцера',crimp_fitting_cap:'Обжать герметичную крышку',discharge_generator:'Зарядить систему',probe_condenser:'Проверить конденсатор',meter_repair_coolant:'Отмерить хладагент',restore_return_loop:'Восстановить обратный контур',sample_return_catalyst:'Проверить катализатор',prepare_air_cartridge:'Подготовить воздушный картридж',run_oxygen_converter:'Наполнить кислородный бак',fill_drinking_tank:'Наполнить питьевой бак',read_membrane_stroke:'Измерить ход мембраны',inject_metered_charge:'Закачать мерный заряд',sample_regulator_response:'Проверить регулятор',pulse_service_drain:'Включить сервисный слив',heat_closed_regulator:'Прогреть закрытый регулятор',reconnect_thawed_regulator:'Подключить оттаявший регулятор',inspect_outlet_window:'Осмотреть выходной фланец',crimp_cabin_seal:'Обжать уплотнение',gauge_socket:'Измерить гнездо',punch_die_line:'Пробить строку матрицы',mount_die:'Установить матрицу',press_socket:'Обжать гнездо',clip_coil:'Подключить испытатель',pulse_coil:'Подать импульс катушке',punch_wiring_line:'Пробить строку разводки',rivet_from_strip:'Соединить провода по ленте',cycle_load:'Проверить контакт под нагрузкой',take_edge_imprint:'Снять отпечаток кромки',punch_correction:'Пробить строку коррекции',press_from_correction:'Поправить направляющую',pulse_armature:'Испытать ход якоря',expand_with_mandrel:'Раздать втулку оправкой',crimp_with_jaws:'Обжать втулку снаружи',weigh_spring:'Измерить пружину',punch_preload:'Пробить зарубку натяжения',stake_from_preload:'Закрепить пружину по ленте'};
const sensors={restriction_reading:'Сужение потока',charge_reading:'Холодная проба',cavity_reading:'Нагруженная полость',retainer_reading:'Крепление головки',land_reading:'Поверхность штуцера',condenser_reading:'Хладагент для ремонта',catalyst_reading:'Семейство катализатора',stroke_reading:'Объём аккумулятора',flow_reading:'Помеха регулятора',seat_reading:'Посадка фланца',target_contact:'Нужный контакт',fit_mark:'Профиль гнезда',scope_trace:'Разводка катушки',edge_imprint:'Отпечаток кромки',swing_trace:'Ход якоря',weight_stroke:'Ход пружины',head_condition:'Состояние головки',backup_empty:'Резерв разгружен',cold_isolated:'Аппарат опломбирован',heat_locked:'Горячая вода изолирована',valves_pinned:'Клапаны зафиксированы',flow_established:'Обходной поток',test_port_open:'Пробоотборник открыт',handling_connected:'Приёмник подключён',damaged:'Аппарат повреждён',phase:'Этап',charge:'Заряд',coolant:'Хладагент',loop_damaged:'Контур повреждён',oxygen_tank:'Кислородный бак',drinking_tank:'Питьевой бак',accumulator_status:'Аккумулятор',regulator_status:'Регулятор',outlet_status:'Выходной фланец',socket:'Гнездо',die_line:'Строка матрицы',socket_fixture:'Установленная матрица',test_clip:'Испытательный зажим',wire_line:'Строка разводки',riveted_leads:'Соединение проводов',load_contact:'Контакт под нагрузкой',guide:'Направляющая',correction_line:'Строка коррекции',pivot:'Втулка',spring:'Пружина',preload_line:'Зарубка натяжения'};
const values={unmeasured:'не измерено',unread:'не прочитано',unseen:'не измерено',inlet:'на входе',outlet:'на выходе',liquid:'жидкость',gas:'газ',inner:'внутренняя',outer:'внешняя',split_ring:'разрезное кольцо',captive_spring:'пружинный держатель',face:'торцевая',radial:'радиальная',small:'малый',large:'большой',ice:'лёд',flat:'плоская',grooved:'с канавкой',toe:'носок',heel:'пятка',nose:'носок',tail:'пятка',normal:'прямая',reverse:'обратная',make:'замкнуть',break:'разомкнуть',inner_edge:'внутренняя кромка',outer_edge:'внешняя кромка',slow_return:'медленный возврат',double_strike:'двойной удар',long:'длинный',short:'короткий',blank:'пусто',straight:'прямо',cross:'крест-накрест',inward:'внутрь',outward:'наружу',near:'ближняя',far:'дальняя'};
Object.assign(base.ROLE,roles);Object.assign(base.ROLE_COLOR,roleColors);Object.assign(base.LABEL,labels);Object.assign(base.SENSOR,sensors);
for(const [k,v] of Object.entries(values))if(!Object.hasOwn(base.VALUE,k))base.VALUE[k]=v;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(x,y,t,size=20,fill=color.ink,anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${fill}">${esc(t)}</text>`;
const rect=(x,y,w,h,fill=color.paper,stroke=color.line,r=9,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2" ${extra}/>`;
const circle=(x,y,r,fill=color.paper,stroke=color.ink,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="3" ${extra}/>`;
const path=(d,stroke=color.line,w=5,extra='')=>`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const known=(s,key)=>{for(const v of Object.values(s.private||{}))if(Object.hasOwn(v,key))return v[key];return undefined;};
let moving=false;
const tween=(attr,from,to)=>moving&&from!==undefined&&from!==to?`<animate attributeName="${attr}" from="${from}" to="${to}" dur="0.7s" fill="freeze"/>`:'';
const shake=(yes,dy=12)=>moving&&yes?`<animateTransform attributeName="transform" type="translate" values="0 0;0 ${dy};0 0" dur="0.65s" additive="sum"/>`:'';
const progress=(a,yes)=>yes?color.teal:color.line;
function flow(d,enabled,active){return path(d,enabled?'#89b8c4':color.line,8)+(enabled?`<path d="${d}" fill="none" stroke="${color.blue}" stroke-width="3" stroke-dasharray="7 11">${moving&&active?'<animate attributeName="stroke-dashoffset" from="36" to="0" dur="0.7s"/>':''}</path>`:'');}
function halo(x,y,r,active,c){return active?`<circle cx="${x}" cy="${y}" r="${r}" stroke="${c}" stroke-width="3" fill="none" opacity=".3">${moving?'<animate attributeName="opacity" values=".25;.9;.25" dur="0.7s"/>':''}</circle>`:'';}
function stateLine(parts){const gap=610/parts.length;return parts.map(([name,done],i)=>circle(25+i*gap,24,5,done?color.teal:'#fff',done?color.teal:color.line)+text(39+i*gap,30,name,17,done?color.teal:'#7b8e84','start')).join('');}
function head(s,old,actions){
 const v=s.public,o=old.public,ids=Object.values(actions).map(c=>c.id),active=id=>ids.includes(id),detached=['detached','land_gauged','tight_cap','cap_leaking'].includes(v.head_condition),wasDetached=['detached','land_gauged','tight_cap','cap_leaking'].includes(o.head_condition),cap=['tight_cap','cap_leaking'].includes(v.head_condition),relieved=['window_open','profile_inspected','spring_braced','detached','land_gauged','tight_cap','cap_leaking'].includes(v.head_condition);
 const bad=v.damaged||['pressure_trapped','retainer_jammed','fitting_torn','cap_leaking'].includes(v.head_condition);
 let g=stateLine([['Изоляция',v.heat_locked&&v.valves_pinned],['Разгрузка',v.backup_empty],['Головка',detached],['Крышка',v.head_condition==='tight_cap']]);
 g+=flow('M126 160H270',v.flow_established,ids.length>0)+flow('M340 250H520V213',v.handling_connected,active('empty_through_protected_route'));
 g+=rect(35,105,92,115,v.heat_locked?'#e5eeea':'#f6dfce',v.heat_locked?color.teal:color.orange)+text(80,145,'Контур',18)+text(80,179,v.heat_locked?'закрыт':'горячий',18,v.heat_locked?color.teal:color.orange);
 g+=circle(190,160,20,v.valves_pinned?'#deefe6':'#fff',v.valves_pinned?color.teal:color.ink)+path(v.valves_pinned?'M190 145V175':'M175 160H205',color.ink,4);
 g+=rect(252,105,153,147,'#e7efed',bad?color.red:color.ink)+path('M268 124H389M268 236H389',color.line,3)+text(330,290,'Съёмная головка',20);
 // Translate from the previous public pose; hidden cavity and retainer never set geometry.
 const dx=detached?90:0,dy=detached?-44:0,oldx=wasDetached?90:0,oldy=wasDetached?-44:0;
 g+=`<g data-part="head" transform="translate(${dx} ${dy})">${moving&&(dx!==oldx||dy!==oldy)?`<animateTransform attributeName="transform" type="translate" from="${oldx} ${oldy}" to="${dx} ${dy}" dur="0.7s" fill="freeze"/>`:''}`+circle(330,178,55,relieved?'#dff0ed':'#e6eaf2',bad?color.red:color.blue)+circle(330,178,30,'#fff',color.teal)+path('M285 178H375',color.line,3)+text(330,184,relieved?'сброшено':'2 полости',16)+`</g>`;
 if(cap)g+=`<g data-part="cap">${shake(active('crimp_fitting_cap'),8)}`+circle(330,178,46,v.head_condition==='tight_cap'?'#dbefe5':'#f5d6cf',v.head_condition==='tight_cap'?color.teal:color.red)+path('M306 178H354M330 154V202',v.head_condition==='tight_cap'?color.teal:color.red,6)+'</g>';
 if(v.head_condition==='spring_braced')g+=path('M275 235H387M282 235V211M381 235V211',color.orange,8);
 g+=rect(485,111,115,102,'#eef5f4',color.teal)+text(542,138,'Приёмник',18)+`<rect data-part="receiver-fill" x="497" y="${v.backup_empty?157:198}" width="91" height="${v.backup_empty?44:3}" rx="5" fill="#75b5bc">${tween('height',o.backup_empty?44:3,v.backup_empty?44:3)}${tween('y',o.backup_empty?157:198,v.backup_empty?157:198)}</rect>`;
 g+=halo(330,178,64,active('read_head_differential')||active('inspect_retainer_profile')||active('gauge_sealing_land'),roleColors[Object.keys(actions)[0]]||color.blue);
 g+=text(542,247,v.backup_empty?'резерв пуст':'закрытый сбор',17,color.teal);
 g+=text(320,330,bad?'Повреждение — проверьте последний ход':v.cold_isolated?'Аппарат опломбирован':v.head_condition==='tight_cap'?'Штуцер закрыт герметично':'Показания датчиков доступны своим участникам',18,bad?color.red:color.ink);
 return g;
}
function station(s,old,actions){
 const v=s.public,o=old.public,ids=Object.values(actions).map(c=>c.id),active=id=>ids.includes(id),bad=v.loop_damaged||['locked_low','ruptured'].includes(v.accumulator_status)||v.regulator_status==='broken'||v.outlet_status==='leaking';
 let g=stateLine([['Контур',v.phase>=4&&!v.loop_damaged],['Баки',v.oxygen_tank&&v.drinking_tank],['Регулятор',v.regulator_status==='in_line'],['Уплотнение',v.outlet_status==='sealed']]);
 g+=flow('M117 136H252V96H438',v.phase>=4&&!v.loop_damaged,ids.length>0)+flow('M252 136V260H580',v.accumulator_status==='pressurized',active('inject_metered_charge')||active('pulse_service_drain'));
 g+=rect(27,88,95,94,'#e8eef9',color.blue)+text(75,114,'Энергия',18)+path('M80 124L66 145H84L72 169',color.blue,4);
 for(let i=0;i<3;i++)g+=rect(41+i*24,190,17,12,i<v.charge?color.blue:'#e2e8e5','none',2);
 g+=rect(190,86,116,105,v.loop_damaged?'#f5d6cf':'#e4f0ed',v.loop_damaged?color.red:color.teal)+text(248,112,'Конденсатор',16)+path('M207 128H288L207 145H288L207 162H288',color.teal,4)+halo(248,139,69,active('probe_condenser'),color.teal);
 for(const [x,key,label,c] of [[420,'oxygen_tank','Кислород',color.purple],[535,'drinking_tank','Вода',color.teal]]){
  const level=v[key]?58:0,prev=o[key]?58:0;
  g+=rect(x,68,84,130,'#f7f9f8',c,15)+`<rect data-part="${key}" x="${x+8}" y="${190-level}" width="68" height="${level}" rx="8" fill="${c}" opacity=".6">${tween('height',prev,level)}${tween('y',190-prev,190-level)}</rect>`+text(x+42,224,label,18,c);
 }
 g+=rect(37,246,72,55,'#f8eee0',color.orange)+text(73,270,'Запас',17,color.orange)+text(73,292,String(v.coolant)+'/4',17,color.orange);
 g+=rect(185,231,105,65,'#edf4f2',bad&&['locked_low','ruptured'].includes(v.accumulator_status)?color.red:color.teal)+text(237,322,'Аккумулятор',17);
 const shift=v.accumulator_status==='pressurized'?29:0,oldShift=o.accumulator_status==='pressurized'?29:0;
 g+=`<rect data-part="piston" x="${203+shift}" y="240" width="12" height="45" fill="${color.teal}">${tween('x',203+oldShift,203+shift)}</rect>`;
 const regulatorGood=v.regulator_status==='in_line',heated=v.regulator_status==='thawed'||active('heat_closed_regulator');
 g+=`<g data-part="regulator">${shake(active('pulse_service_drain')||active('reconnect_thawed_regulator'),-7)}`+circle(400,262,31,heated?'#f5dfb8':regulatorGood?'#dceee4':'#e4e9e7',v.regulator_status==='broken'?color.red:color.blue)+path(regulatorGood?'M382 262H418':'M400 244V280',color.ink,5)+'</g>'+text(400,322,'Регулятор',17);
 if(heated)g+=path('M365 239Q353 228 364 217M399 222Q387 212 399 203M430 239Q442 228 431 217',color.orange,3);
 g+=rect(556,238,44,48,v.outlet_status==='sealed'?'#dceee4':'#edf2ef',v.outlet_status==='leaking'?color.red:color.purple,8)+path(v.outlet_status==='sealed'?'M565 249L590 275M590 249L565 275':'M567 260H588',color.purple,4)+text(578,322,'Фланец',17);
 g+=text(320,355,bad?'Контур повреждён':v.outlet_status==='sealed'?'Герметично: система восстановлена':'Показания определяют дозу и последующий ремонт',18,bad?color.red:color.ink);
 return g;
}
function relay(s,old,actions){
 const v=s.public,o=old.public,ids=Object.values(actions).map(c=>c.id),active=id=>ids.includes(id),bad=['split'].includes(v.socket)||v.guide==='dented'||['seized','torn'].includes(v.pivot)||['underloaded','overloaded'].includes(v.spring);
 let g=stateLine([['Гнездо',v.socket==='seated'],['Провода',v.riveted_leads!=='loose'],['Втулка',v.pivot==='sized'],['Пружина',v.spring==='working']]);
 g+=rect(25,69,145,225,'#f4ead4','#d0b480',5)+text(98,96,'Перфолента',19);
 const rows=[['die_line','Матрица'],['wire_line','Разводка'],['correction_line','Коррекция'],['preload_line','Натяжение']];
 rows.forEach(([key,name],i)=>{const y=126+i*46;g+=text(42,y,name,15,color.ink,'start');if(v[key]!=='blank'){g+=circle(46,y+15,4,'#fff','#b39560')+circle(140,y+15,4,'#fff','#b39560');g+=text(98,y+20,values[v[key]]||v[key],14,color.blue);}else g+=path(`M47 ${y+15}H144`,'#deccaa',2);});
 g+=rect(223,114,205,150,'#e5eeeb',bad?color.red:color.teal,12)+text(325,292,'Релейный модуль',20);
 // Public socket and wiring determine these parts; private winding never does.
 const seated=v.socket==='seated',oldSeated=o.socket==='seated',sy=seated?169:142,oldy=oldSeated?169:142;
 g+=`<g data-part="socket" transform="translate(0 ${sy})">${moving&&sy!==oldy?`<animateTransform attributeName="transform" type="translate" from="0 ${oldy}" to="0 ${sy}" dur=".7s" fill="freeze"/>`:''}`+rect(246,0,59,49,v.socket==='split'?'#f4d5cf':'#bfd6cf',v.socket==='split'?color.red:color.teal,5)+path('M255 9H296M255 20H296M255 31H296',color.teal,3)+'</g>';
 if(v.riveted_leads!=='loose')g+=path(v.riveted_leads==='cross'?'M271 226L385 161M271 161L385 226':'M271 161H385M271 226H385',color.orange,4);
 g+=`<g data-part="armature">${shake(active('pulse_armature')||active('cycle_load'),-13)}`+path('M326 151H389V202',color.ink,7)+circle(389,202,13,v.pivot==='sized'?'#d8ede3':'#fff',bad?color.red:color.teal)+'</g>';
 g+=path(v.spring==='working'?'M330 235l5 -13l8 23l8 -23l8 23l8 -23l5 13':'M330 235l7 -17l10 29l10 -29l10 29l10 -17',v.spring==='working'?color.teal:color.orange,3);
 g+=rect(480,86,133,111,'#e9eff8',color.blue)+text(546,111,'Испытатель',18,color.orange);
 const trace=known(s,'scope_trace');
 g+=rect(493,124,107,49,'#f8fbfa','#cadad2',4);
 if(trace==='normal'||trace==='reverse')g+=path(trace==='normal'?'M501 159H519V137H547V159H588':'M501 140H519V159H547V140H588',color.orange,3);else g+=text(546,155,trace==='unseen'?'нет замера':'лично',16,'#7b8e84');
 g+=flow('M480 180H451V219H428',v.test_clip!=='off',active('pulse_coil')||active('pulse_armature')||active('weigh_spring'));
 const contact=v.load_contact==='make';
 g+=circle(515,261,7,color.paper,color.ink)+circle(581,261,7,color.paper,color.ink)+path(contact?'M522 261H574':'M522 261L566 239',color.blue,4)+text(548,295,v.load_contact==='idle'?'Контакт не испытан':contact?'Замкнут':'Разомкнут',16);
 g+=halo(389,202,24,active('expand_with_mandrel')||active('crimp_with_jaws'),color.teal);
 g+=text(320,337,bad?'Ошибка сборки: повреждена деталь':v.spring==='working'&&v.test_clip==='released'?'Сборка и испытание завершены':'Строки ленты задают последующие действия',18,bad?color.red:color.ink);
 return g;
}
const config={
 NG007:{draw:head,roles:[['FlowDiagnostic','Поток и давление',['restriction_reading','cavity_reading']],['FieldPerformer','Клапаны и головка',['retainer_reading']],['ProtectionChecker','Проба и герметизация',['charge_reading','land_reading']]]},
 'E082-core':{draw:station,roles:[['Power','Питание и ремонт',['seat_reading']],['Water','Вода и мембрана',['condenser_reading','stroke_reading']],['Stores','Дозы и запасы',[]],['Air','Воздух и уплотнение',['catalyst_reading','flow_reading']]]},
 IN013:{draw:relay,roles:[['designer','Строки инструкции',['target_contact']],['builder','Обжим и сборка',['fit_mark','edge_imprint']],['tester','Импульсы и испытания',['scope_trace','swing_trace','weight_stroke']]]}
};
function readouts(id,s,actions){return `<div class="scene-instruments">${config[id].roles.map(([actor,job,keys])=>{
 const own=s.private?.[actor],isActive=actions[actor]&&actions[actor].id!=='wait';
 return `<section class="scene-instrument ${isActive?'is-active':''}" style="--role:${roleColors[actor]}"><h4>${esc(roles[actor])}</h4><p class="instrument-job">${esc(job)}</p>${keys.map(key=>{const value=own?.[key],unread=value===undefined?'личное показание':(key==='condenser_reading'&&value===0?'не измерено':values[value]??String(value));return `<div class="instrument-reading"><span>${esc(sensors[key])}</span><strong data-reading="${key}">${esc(unread)}</strong></div>`;}).join('')}${!keys.length?'<p class="instrument-job">Подготавливает материалы и инструменты</p>':''}</section>`;
 }).join('')}</div>`;}
window.CoreEnvironmentScenes={has:id=>Boolean(config[id]),render(id,s,actions={},previous=s,options={}){
 moving=options.animate!==false&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const active=Object.entries(actions).filter(([,c])=>c.id!=='wait');
 const caption=active.map(([a,c])=>`${roles[a]||a}: ${c.id==='send_message'?'отправлено сообщение':labels[c.id]||c.id}`).join('; ');
 return `<svg class="mechanism-scene" viewBox="0 0 640 375" role="img" aria-label="Предметная схема: состояние механизма" data-environment="${id}" font-family="Arial,sans-serif">${config[id].draw(s,previous,actions)}</svg>${caption?`<p class="scene-action" role="status">${esc(caption)}</p>`:''}${options.compact?`<details class="scene-observations"><summary>Показания по ролям</summary>${readouts(id,s,actions)}</details>`:readouts(id,s,actions)}`;
}};
})();
