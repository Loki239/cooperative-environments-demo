/* Adapted from envs_vis/good30-five/player.js; source hash in provenance. */
(()=>{
/* Immutable snapshot renderer. Geometry is schematic, not recorded physics. */
const C={ink:'#152d3c',muted:'#607581',accent:'#087f8c',sample:'#df9d3b',line:'#c7d5d4',paper:'#f8f9f6',blue:'#377fab',green:'#4e886b',purple:'#7253a4',orange:'#b06135',metal:'#b8cbd0',light:'#e5eff0',water:'#c8e4ec',warm:'#f3dfb9'};
const ROLE_COLOR={Glass:C.blue,Grove:C.green,Stone:C.purple,Geologist:C.orange,Biologist:C.green,ROVOperator:C.blue,North:C.blue,East:C.orange,South:C.accent,West:C.purple,pilot:C.blue,first_officer:C.purple,engineer:C.accent,navigator:C.orange,SiteInspector:C.purple,PowerEngineer:C.accent,Logistician:C.blue,ResponseCoordinator:C.orange};
const META={
 E121:['E121 (три слоя мира)','Провести и закрепить общую тележку'],
 NG017:['NG017 (подводные пробы)','Два захвата · два класса · целая колония'],
 E057:['E057 (мяч и приёмник)','Доставить мяч и закрепить чашу'],
 E138:['E138 (посадка самолёта)','Посадка → руление → охлаждение'],
 NG008:['NG008 (эвакуация запасов)','Спасти две партии и защитить убежище']};
const ROLE={Glass:'Стекло',Grove:'Корни',Stone:'Камень',Geologist:'Геолог',Biologist:'Биолог',ROVOperator:'Оператор',North:'Север',East:'Восток',South:'Юг',West:'Запад',pilot:'Пилот',first_officer:'Офицер',engineer:'Инженер',navigator:'Штурман',SiteInspector:'Инспектор',PowerEngineer:'Инженер',Logistician:'Логист',ResponseCoordinator:'Координатор'};
const VALUE={clockwise:'по часовой',counterclockwise:'против часовой',over:'над аркой',under:'под аркой',stone_cradle:'каменная люлька',root_lattice:'корневая опора',glass_runner:'стеклянный полоз',over_rib:'над ребром',under_groove:'под плитой',spring_pawl:'пружинный стопор',counterweight_drum:'барабан с противовесом',left:'слева',right:'справа',iron:'железистая',silica:'кремнистая',open_lane:'открытый проход',low_overhang:'низкий навес',side_groove:'боковая канавка',friable:'рыхлая поверхность',coherent:'плотная поверхность',extended:'полипы вытянуты',retracted:'полипы втянуты',shielded_lateral:'боковой отход с экраном',vertical:'вертикальный подъём',shallow:'пологий рельс',steep:'крутой рельс',axial:'осевое движение',early:'стопор раньше подшипника',late:'подшипник раньше стопора',inboard:'внутреннее смещение',outboard:'наружное смещение',push_port:'ветер толкает влево',push_starboard:'ветер толкает вправо',port:'левый',starboard:'правый',calm:'штиль',headwind:'встречный ветер',tailwind:'попутный ветер',standard:'обычный',boosted:'усиленный',reduced:'сниженный',normal:'нормальная температура',overheated:'перегрев',north:'север',south:'юг',west:'запад',east:'восток',north_bus:'северная шина',south_bus:'южная шина',split_bus:'разделённая шина',true:'проход безопасен'};
const LABEL={
 raise_glass_lever:'Поднять стеклянный рычаг',raise_grove_lever:'Поднять корневой рычаг',lift_hinge_veil:'Открыть показание шарнира',pin_stone_bridge:'Закрепить мост',wind_glass_tether:'Натянуть трос',haul_cart_across_roots:'Перетянуть тележку через мост',peel_arch_bark:'Открыть показание арки',unfold_glass_arch:'Развернуть арку',draw_cart_through_stone_exit:'Вывести тележку через арку',read_seam_route:'Прочитать тип опоры',choose_seam_support:'Выбрать опору',read_tether_channel:'Прочитать канал троса',choose_tether_route:'Выбрать проводку троса',read_terminal_catch:'Прочитать тип захвата',choose_terminal_catch:'Выбрать конечный захват',
 tension_root_sling:'Натянуть корневую петлю',lower_glass_runner:'Опустить стеклянный полоз',transfer_load_to_cradle:'Передать нагрузку люльке',raise_small_pulley:'Поднять малый блок',make_low_haul:'Протянуть трос снизу',engage_reverse_pulley:'Включить обратный блок',release_spring_pawl:'Освободить пружинный стопор',route_root_sling:'Провести корневую петлю',reel_two_short_pulls:'Сделать два коротких подтяга',release_cradle_tether:'Освободить трос люльки',pass_over_rib:'Провести трос над ребром',feed_under_slab:'Провести трос под плитой',push_pawl_cart:'Подать тележку к стопору',slacken_drum_tether:'Ослабить трос барабана',anchor_live_root:'Закрепить живой корень',brace_runner_edge:'Подпереть край полоза',place_stone_cradle:'Поставить каменную люльку',lock_upper_guide:'Закрыть верхнюю направляющую',open_lower_cleat:'Открыть нижний зажим',cock_spring_pawl:'Взвести пружинный стопор',wind_lock_counterweight_drum:'Зафиксировать барабан',
 descend_to_ledge:'Опустить аппарат к уступу',map_colony_attachment:'Определить сторону колонии',grab_encrusted_primary:'Взять первую пробу',place_primary_on_assay_tray:'Положить пробу на лоток',assay_primary_interior:'Определить класс первой пробы',align_alternative_nodule:'Навести захват на другой класс',grab_aligned_nodule:'Взять вторую пробу',stow_and_recover_pair:'Доставить обе пробы',inspect_ledge_corridor:'Осмотреть проход',execute_corridor_route:'Пройти выбранным маршрутом',inspect_second_surface:'Осмотреть вторую пробу',select_surface_protocol:'Выбрать способ захвата',handle_friable_nodule:'Подготовить рыхлую пробу',handle_coherent_nodule:'Подготовить плотную пробу',inspect_colony_after_pair_lift:'Проверить полипы после захвата',select_recovery_plan:'Выбрать способ подъёма',close_and_raise_vertical:'Закрыть захват и подняться',place_soft_screen:'Поставить мягкий экран',retreat_laterally_and_raise:'Отойти вбок и подняться',
 south_feed_and_arm_trap:'Подать мяч и взвести ловушку',west_tension_wall:'Натянуть отражатель',north_serve:'Подать мяч',north_strobe_release:'Измерить вращение мяча',east_reflect:'Отразить мяч к югу',south_catch_on_transfer_rail:'Поймать мяч на рельсе',south_measure_and_roll_out:'Измерить рельс и выкатить мяч',west_reflect:'Отразить мяч к приёмнику',east_open_receiver_shutter:'Открыть шторку приёмника',north_guide_into_receiver:'Направить мяч в чашу',north_read_roll_strobe:'Измерить движение кольца',east_install_roll_brake:'Поставить выбранный тормоз',east_read_pawl_phase:'Прочитать фазу кулачка',south_choose_pawl_order:'Выбрать порядок крепления',south_engage_pawl:'Включить стопор',west_tighten_bearing:'Затянуть подшипник',west_read_frame_offset:'Измерить смещение рамы',north_choose_frame_route:'Выбрать поправку рамы',north_install_center_pin:'Поставить центральный штифт',north_place_corrective_shim:'Установить прокладку',east_close_side_latch:'Закрыть боковой фиксатор',south_tension_receiver_ratchet:'Затянуть храповик чаши',
 deploy_wind_vane:'Прочитать боковой ветер',commit_differential_thrust:'Выбрать поправку тяги',extend_landing_gear:'Выпустить шасси',cross_radar_beacon:'Пройти радиомаяк',sweep_traffic_radar:'Проверить свободную сторону',lock_wheel_truck:'Зафиксировать колёсную тележку',extend_landing_flaps:'Выпустить закрылки',arm_spring_spoilers:'Взвести спойлеры',touch_down:'Посадить самолёт',read_runout_airflow:'Измерить ветер на пробеге',commit_reverser_profile:'Выбрать режим реверса',read_open_taxi_exit:'Прочитать доступный съезд',select_taxi_exit:'Выбрать съезд',hold_straight:'Продолжить прямо',turn_with_bias:'Повернуть по отклонению',turn_against_bias:'Повернуть против отклонения',align_taxiway:'Выровняться на рулёжной дорожке',read_brake_pack_temperature:'Измерить температуру тормозов',select_cooling_procedure:'Выбрать процедуру охлаждения',normal_purge:'Выполнить обычную продувку',isolate_hot_section:'Изолировать горячую секцию',boosted_fan_cycle:'Выполнить цикл вентилятора',final_check_and_close:'Проверить и завершить охлаждение',
 inspect_flooded_yard:'Определить затопленный ввод',energize_trailer_feeder:'Подключить безопасный ввод',load_and_pressurize_trailer:'Загрузить обе партии',inspect_active_relief_outlet:'Прочитать сторону сброса',open_protected_refuge_approach:'Открыть защищённый подход',drive_loaded_trailer_to_refuge:'Перевезти партии к убежищу',connect_permanent_refuge_cooling:'Подключить охлаждение убежища',escort_all_personnel_across_threshold:'Вывести всех людей',inspect_refuge_bus_configuration:'Прочитать схему резервной шины',select_backup_bus_topology:'Выбрать резервную шину',isolate_split_bus_sections:'Изолировать секции шины',install_split_bus_link:'Поставить перемычку',verify_backup_bus:'Проверить резервное питание',inspect_coldroom_return_channel:'Определить воздушный канал',place_batches_and_finalize_trailer:'Расставить партии, оставив канал',inspect_refuge_drain_edge:'Определить сторону притока',isolate_drain_ingress:'Перекрыть приток воды'};
const SENSOR={glass_hinge_reading:'Шарнир',grove_arch_reading:'Арка',seam_route_reading:'Опора',tether_channel_reading:'Трос',terminal_catch_reading:'Захват',habitat_reading:'Колония',mineral_reading:'Первая проба',corridor_reading:'Проход',surface_reading:'Поверхность',colony_posture_reading:'Полипы',corridor_safe:'Маршрут',north_spin_reading:'Вращение',south_camber_reading:'Рельс',north_roll_axis_reading:'Кольцо',east_pawl_phase_reading:'Порядок',west_frame_offset_reading:'Рама',wind_reading:'Ветер',traffic_reading:'Свободная сторона',runout_airflow_reading:'Пробег',taxi_exit_reading:'Съезд',brake_pack_reading:'Тормоза',feeder_reading:'Затопленный ввод',relief_reading:'Сброс',refuge_bus_reading:'Резервная шина',return_channel_reading:'Воздушный канал',drain_ingress_reading:'Приток'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tx=(x,y,s,size=26,fill=C.ink,anchor='start',weight=400)=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${weight}" font-family="Arial,sans-serif">${esc(s)}</text>`;
const rect=(x,y,w,h,fill='white',rx=0,stroke=C.ink,sw=3)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const path=(d,stroke=C.ink,sw=3,fill='none',extra='')=>`<path d="${d}" stroke="${stroke}" stroke-width="${sw}" fill="${fill}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const circle=(x,y,r,fill='white',stroke=C.ink,sw=3)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const known=(snap,key)=>Object.values(snap.private).map(x=>x[key]).find(x=>x!==undefined&&!['unread','unmeasured','veiled','barked'].includes(x));
const clamp=x=>Math.max(0,Math.min(1,x));
const active=(event,actor)=>actor in event.actions;
function ownerText(line){
 const names=REPLAY.actors.map(a=>({name:ROLE[a],color:ROLE_COLOR[a]})).sort((a,b)=>b.name.length-a.name.length);
 let result='',at=0;
 while(at<line.length){const name=names.find(n=>line.startsWith(n.name,at));if(name){result+=`<tspan fill="${name.color}" font-weight="700">${esc(name.name)}</tspan>`;at+=name.name.length;}else{result+=esc(line[at]);at++;}}
 return result;
}
function wrap(s,max=44){const lines=[''];for(const word of s.split(' ')){if((lines.at(-1)+' '+word).trim().length>max)lines.push(word);else lines[lines.length-1]=(lines.at(-1)+' '+word).trim()}return lines}
function caption(e,after){
 if(e.kind==='intro')return wrap(META[REPLAY.source_id][1]);
 if(e.kind==='outcome')return [REPLAY.outcome.success?'Цель выполнена':'Цель не выполнена'];
 const active=Object.entries(e.actions),repeat=active.some(([a,c])=>c.id==='south_engage_pawl'&&e.previous.public.pawl_engaged);
 if(after&&Object.keys(e.private_changes).length){
  const [a,changes]=Object.entries(e.private_changes)[0],[key,value]=Object.entries(changes)[0];
  if(repeat&&key==='west_frame_offset_reading')return [`Запад · лично: рама смещена ${value==='inboard'?'внутрь':'наружу'}`,'Юг: стопор уже включён'];
  return [`${ROLE[a]} · лично`,`${SENSOR[key]}: ${VALUE[value]??value}`];
 }
 if(active.length===2&&active.every(([a,c])=>c.id.startsWith('raise_')))return ['Стекло и Корни:','поднять рычаги вместе'];
 const meaningful=active.filter(([a,c])=>!(c.id==='south_engage_pawl'&&e.previous.public.pawl_engaged));
 const labels=(meaningful.length?meaningful:active).map(([a,c])=>`${ROLE[a]}: ${(LABEL[c.args.operation||c.id]||c.id).toLowerCase()}`);
 if(repeat){labels.push('Юг: стопор уже включён');return labels;}
 return labels.flatMap(x=>wrap(x));
}
function trolley(x,y,k=1){return `<g transform="translate(${x},${y}) scale(${k})">`+path('M-54 -32H54V22H-54Z',C.ink,3,C.metal)+path('M-49 -27H49V-15H-49Z',C.light,1,C.light)+path('M-34 -32V-61H30V-32',C.blue,5)+circle(-32,32,12,C.ink,C.ink)+circle(32,32,12,C.ink,C.ink)+circle(-32,32,4,C.paper,C.paper,1)+circle(32,32,4,C.paper,C.paper,1)+path('M-40 7H40',C.blue,5)+'</g>'}
function cartScene(s,e,p){
 const v=s.public,late=v.seam_progress!=='locked';let g='';
 if(!late){
  g+=path('M100 435H605',C.line,4)+path('M230 435H345',v.bridge_status==='pinned'?C.purple:C.metal,10)+path('M375 435V315Q420 250 465 315V435',v.arch_status==='deployed'?C.blue:C.metal,12);
  const positions={courtyard:155,arch_chamber:310,exit:555};let x=positions[v.cart_position],old=positions[e.previous.public.cart_position];if(old!==x)x=old+(x-old)*clamp((p-.35)/.55);
  g+=trolley(x,390,1.1);
  if(v.tether_tension)g+=path(`M${x-59} 370L90 370`,C.blue,4);
 }else{
  g+=trolley(335,360,1.4);
  const terminal=v.terminal_progress!=='locked',tether=v.tether_progress!=='locked';
  if(!terminal&&!tether){
   if(v.seam_choice==='stone_cradle')g+=path('M235 415L270 455H400L435 415L429 432L405 468H264L241 432Z',C.purple,3,'#c6b5dc');
   if(v.seam_choice==='glass_runner')g+=path('M225 432H445M225 451H445',C.blue,8);
   if(v.seam_choice==='root_lattice')g+=path('M225 445Q275 390 335 445Q390 485 445 430M225 430Q335 490 445 430',C.green,8);
  }else if(!terminal){
   if(v.tether_choice==='over_rib')g+=path('M180 405V275H505V405',C.blue,5)+circle(180,275,17,C.light,C.blue,4);
   if(v.tether_choice==='under_groove')g+=path('M180 405V475H505V405',C.green,5);
   g+=path('M475 335V425',C.purple,9);
  }else{
   const secured=v.terminal_progress==='secured';
   if(v.terminal_choice==='spring_pawl')g+=path(secured?'M410 385H490L525 350V435':'M460 395L505 350L535 390V435',C.purple,8)+circle(505,350,11,C.sample,C.purple,3);
   if(v.terminal_choice==='counterweight_drum')g+=circle(520,360,40,'#c6b5dc',C.purple,5)+circle(520,360,12,C.paper,C.purple,3)+path('M520 360V460H570V415',C.purple,4)+rect(553,413,34,43,C.sample,0,C.ink,3);
  }
 }
 return g;
}
function sample(x,y,mineral,filled){
 const stroke=filled?(mineral==='silica'?C.blue:mineral==='iron'?C.orange:'#86979c'):C.line;
 return mineral==='silica'?path(`M${x} ${y-16}L${x+16} ${y}L${x} ${y+16}L${x-16} ${y}Z`,stroke,3,filled?stroke:'white'):circle(x,y,15,filled?stroke:'white',stroke,3);
}
function rovScene(s,e,p){
 const v=s.public,side=known(s,'habitat_reading'),cx=side==='right'?540:170;let g=path('M115 465H605L590 480H130Z',C.metal,2,'#dce8e4');
 if(side){const ext=known(s,'colony_posture_reading')==='extended';for(let i=0;i<3;i++)g+=path(`M${cx+i*20-20} 465v-${ext?70:42}m0 19l-9 -12m9 12l9 -12`,C.orange,7);}
 let x=390,y=v.position==='aboard'||v.position==='stored'?260:340;
 if(v.recovery_step==='recovery_complete'||v.delivered){x=455;y=255;}
 if(v.recovery_step==='screen_placed')g+=rect(cx+59,375,13,90,C.warm,3,C.orange,3);
 g+=`<g transform="translate(${x},${y})">`+rect(-76,-40,152,74,'#e3ab55',18,active(e,'ROVOperator')?C.blue:C.ink,4)+path('M-60 -29H50',C.warm,7)+circle(-76,-2,18,C.metal,C.ink)+circle(76,-2,18,C.metal,C.ink)+circle(36,-4,15,'#72bbd4',C.blue,3)+path('M28 -12L38 -17',C.paper,3)+path('M-34 -40V-56H34V-40',C.ink,5)+path('M-12 34L-28 72L12 96L28 78',C.ink,5)+'</g>';
 const trayY=v.delivered?350:450;
 g+=path(`M325 ${trayY+23}H475`,C.muted,5);
 g+=sample(365,trayY,known(s,'mineral_reading'),v.captures_used>=1)+sample(435,trayY,v.captures_used>=2?v.aligned_mineral:undefined,v.captures_used>=2);
 return g;
}
function ballScene(s,e,p){
 const v=s.public,close=v.ball_place==='receiver';let g='';
 if(!close){
  g+=path('M315 225H405',C.blue,12)+path('M550 295V385',C.orange,12)+path('M315 465H405',C.accent,12)+path('M170 295V385',C.purple,12);
  const pos={rack:[270,435],serve_cup:[360,255],north_launch:[360,255],east_approach:[510,320],south_approach:[360,430],south_cradle:[360,430],west_approach:[210,340],target_approach:[430,330],receiver:[430,330],escaped:[620,470]};
  const old=pos[e.previous.public.ball_place]||[270,435],next=pos[v.ball_place]||old,a=clamp((p-.35)/.55),x=old[0]+(next[0]-old[0])*a,y=old[1]+(next[1]-old[1])*a;
  g+=circle(430,330,40,C.light,C.muted,5)+circle(x,y,17,C.sample,C.orange,2)+path(`M${x-10} ${y-5}Q${x} ${y} ${x+7} ${y+13}`,C.orange,2);
  if(!v.receiver_open)g+=path('M402 302L458 358',C.accent,3);
 }else{
  g+=circle(360,355,100,C.metal,C.ink,4)+circle(360,355,75,C.light,C.paper,4)+circle(360,355,24,C.sample,C.orange,2)+path('M346 344Q361 351 369 374',C.orange,2);
  if(v.roll_alignment_ok)g+=path('M264 320L245 329V385L264 394Z',C.orange,3,'#d9a17c');
  if(v.bearing_tight)g+=circle(455,355,15,'#c6b5dc',C.purple,4)+circle(455,355,5,C.paper,C.purple,2);
  if(v.pawl_engaged)g+=path('M315 445L330 415L350 443Z',C.accent,3,'#86bdb7');
  if(v.frame_correction_route.includes('inboard'))g+=path('M360 226V258',C.blue,9);
  if(v.frame_correction_route.includes('outboard'))g+=path('M464 379L479 387L473 405L458 397Z',C.blue,3,'#91bdd5');
  if(v.receiver_cup_secured)g+=path('M392 443L420 428L430 449L402 464Z',C.accent,4,'#86bdb7');
 }
 return g;
}
function plane(x,y,angle=0,gear=false){return `<g transform="translate(${x},${y}) rotate(${angle}) scale(1.2)">`+path('M0 -62Q14 -50 13 -5L70 26L68 39L12 22L10 55L33 67L30 77L0 68L-30 77L-33 67L-10 55L-12 22L-68 39L-70 26L-13 -5Q-14 -50 0 -62',C.ink,3,'#edf4f4')+path('M-7 -37Q0 -48 7 -37V-25H-7Z',C.blue,2,'#72bbd4')+path('M-62 28L-16 9M62 28L16 9',C.blue,5)+path('M0 20V59',C.metal,3)+(gear?circle(-18,30,4,C.ink)+circle(18,30,4,C.ink):'')+'</g>'}
function aircraftScene(s,e,p){
 const v=s.public,exit=v.selected_taxi_exit,off=v.taxi_maneuver_step===4&&v.taxi_route_safe;
 let g=rect(290,170,140,330,'#8da7ad',0,'#708e97',2)+rect(110,315,180,60,'#bdccc8',0,'none')+rect(430,315,180,60,'#bdccc8',0,'none')+path('M360 185V495',C.paper,4,'none','stroke-dasharray="18 18"')+path('M110 345H290M430 345H610',C.warm,3,'none','stroke-dasharray="12 12"');
 let x=360,y=v.landed?315:405,angle=0;
 if(v.taxi_maneuver_step>=2&&['port','starboard'].includes(exit)){x=exit==='port'?235:485;y=345;angle=exit==='port'?-90:90;}
 if(off){x=exit==='port'?165:555;y=345;}
 if(['port','starboard'].includes(exit))g+=path(exit==='port'?'M290 345H110':'M430 345H610',C.purple,4);
 g+=plane(x,y,angle,v.gear_down);
 if(off&&['normal','overheated'].includes(v.cooling_procedure)){
  const fanX=exit==='port'?225:495,fanY=450,active=Object.values(e.actions).some(c=>['boosted_fan_cycle','normal_purge'].includes(c.args.operation));
  const a=active?Math.floor(p*4)*22.5:0,finished=v.brake_pack_safe;
  g+=circle(fanX,fanY,26,C.light,finished?C.accent:C.muted,4)+`<g transform="translate(${fanX} ${fanY}) rotate(${a})">`;
  for(const rotation of [0,120,240])g+=`<g transform="rotate(${rotation})">`+path('M0 0Q-14 -6 -6 -18Q7 -22 7 -10L0 0',finished||active?C.accent:C.muted,2,finished||active?C.accent:C.metal)+'</g>';
  g+=circle(0,0,3,'white',finished?C.accent:C.muted,2)+'</g>';
  g+=path(`M${fanX} ${fanY-26}V${fanY-46}`,C.line,2);
 }
 return g;
}
function people(x,y){return circle(x,y-22,7,C.warm,C.ink,2)+path(`M${x} ${y-14}V${y+10}m0 -15l-11 10m11 -10l11 10m-11 5l-8 14m8 -14l8 14`,C.ink,3.5);}
function box(x,y,accent){return rect(x,y,48,50,accent,1,C.ink,3)+path(`M${x+24} ${y}V${y+50}`,C.paper,3)+path(`M${x+5} ${y+8}H${x+43}`,C.paper,2);}
function refuge(x,y,w,h){return rect(x,y+30,w,h-30,'#e5eee4',0,C.green,3)+path(`M${x-8} ${y+30}L${x+w/2} ${y}L${x+w+8} ${y+30}Z`,C.green,3,'#7ba88b');}
function floodScene(s,e,p){
 const v=s.public,late=v.bus_status!=='locked';let g='';
 if(!late){
  g+=path('M95 443H460V480H95Z',C.water,1,C.water)+refuge(475,245,155,210)+path('M95 455H630',C.metal,3);
  const arrived=['arrived','secured','evacuated'].includes(v.phase);let x=arrived?490:285;
  if(e.previous.public.batch_location==='trailer'&&v.batch_location==='refuge')x=285+(490-285)*clamp((p-.35)/.55);
  g+=path(`M${x-60} 375H${x+60}V420H${x-60}Z`,C.ink,3,C.metal)+path(`M${x-55} 383H${x+55}`,C.light,4)+circle(x-35,432,12,C.ink)+circle(x+35,432,12,C.ink);
  for(let i=0;i<2;i++){const bx=v.batch_location==='store'?115+i*65:x-52+i*57;g+=box(bx,320,i?C.blue:C.sample);}
  const personX=v.crew_location==='threshold'?570:140;g+=people(personX,395)+people(personX+30,400);
 }else{
  g+=refuge(140,195,440,305)+box(355,365,C.sample)+box(420,365,C.blue)+people(510,410)+people(540,415);
  const ready=v.bus_status==='commissioned';
  g+=path(v.bus_selection==='split_bus'?'M185 330H285M185 395H285M235 330V395':'M235 325V400',ready?C.accent:C.muted,9);
  g+=circle(235,330,7,ready?C.accent:C.metal,C.ink,2)+circle(235,395,7,ready?C.accent:C.metal,C.ink,2);
  if(v.airflow_status==='placed'){const ax=v.airflow_placement==='left'?320:485;g+=path(`M${ax} 460V310m-8 13l8 -13l8 13`,C.blue,4);}
  if(v.drain_status==='isolated'){const dy=v.drain_selection==='north'?235:500;g+=path(`M290 ${dy}H440`,C.orange,9);}
 }
 return g;
}
const SCENE={E121:cartScene,NG017:rovScene,E057:ballScene,E138:aircraftScene,NG008:floodScene};

window.EnvironmentScenes={ROLE,ROLE_COLOR,LABEL,VALUE,SENSOR,
  has:id=>Boolean(SCENE[id]),
  render:(id,snapshot,actions={})=>SCENE[id](snapshot,{previous:snapshot,actions},1)};
})();
