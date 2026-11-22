/* Explicit targets for the five existing object scenes. Public poses only. */
(()=>{
"use strict";
const SCHEMA={"E121":{"raise_glass_lever":{"owners":["Glass"],"parameters":{}},"raise_grove_lever":{"owners":["Grove"],"parameters":{}},"lift_hinge_veil":{"owners":["Glass"],"parameters":{}},"pin_stone_bridge":{"owners":["Stone"],"parameters":{"rotation":["clockwise","counterclockwise"]}},"wind_glass_tether":{"owners":["Glass"],"parameters":{}},"haul_cart_across_roots":{"owners":["Grove"],"parameters":{}},"peel_arch_bark":{"owners":["Grove"],"parameters":{}},"unfold_glass_arch":{"owners":["Glass"],"parameters":{"route":["over","under"]}},"draw_cart_through_stone_exit":{"owners":["Stone"],"parameters":{}},"read_seam_route":{"owners":["Grove"],"parameters":{}},"choose_seam_support":{"owners":["Glass"],"parameters":{"support":["root_lattice","glass_runner","stone_cradle"]}},"operate_glass":{"owners":["Glass"],"parameters":{"operation":["tension_root_sling","lower_glass_runner","transfer_load_to_cradle","raise_small_pulley","make_low_haul","engage_reverse_pulley","release_spring_pawl"]}},"operate_grove":{"owners":["Grove"],"parameters":{"operation":["route_root_sling","reel_two_short_pulls","release_cradle_tether","pass_over_rib","feed_under_slab","push_pawl_cart","slacken_drum_tether"]}},"operate_stone":{"owners":["Stone"],"parameters":{"operation":["anchor_live_root","brace_runner_edge","place_stone_cradle","lock_upper_guide","open_lower_cleat","cock_spring_pawl","wind_lock_counterweight_drum"]}},"read_tether_channel":{"owners":["Stone"],"parameters":{}},"choose_tether_route":{"owners":["Grove"],"parameters":{"route":["over_rib","under_groove"]}},"read_terminal_catch":{"owners":["Glass"],"parameters":{}},"choose_terminal_catch":{"owners":["Stone"],"parameters":{"catch":["spring_pawl","counterweight_drum"]}}},"NG017":{"descend_to_ledge":{"owners":["ROVOperator"],"parameters":{}},"map_colony_attachment":{"owners":["Biologist"],"parameters":{}},"grab_encrusted_primary":{"owners":["ROVOperator"],"parameters":{"approach":["left","right"]}},"place_primary_on_assay_tray":{"owners":["ROVOperator"],"parameters":{}},"assay_primary_interior":{"owners":["Geologist"],"parameters":{}},"align_alternative_nodule":{"owners":["ROVOperator"],"parameters":{"mineral":["iron","silica"]}},"grab_aligned_nodule":{"owners":["ROVOperator"],"parameters":{}},"stow_and_recover_pair":{"owners":["ROVOperator"],"parameters":{}},"inspect_ledge_corridor":{"owners":["Biologist"],"parameters":{}},"execute_corridor_route":{"owners":["ROVOperator"],"parameters":{"route":["open_lane","low_overhang","side_groove"]}},"inspect_second_surface":{"owners":["ROVOperator"],"parameters":{}},"select_surface_protocol":{"owners":["Geologist"],"parameters":{"protocol":["friable","coherent"]}},"handle_friable_nodule":{"owners":["ROVOperator"],"parameters":{}},"handle_coherent_nodule":{"owners":["ROVOperator"],"parameters":{}},"inspect_colony_after_pair_lift":{"owners":["ROVOperator"],"parameters":{}},"select_recovery_plan":{"owners":["Biologist"],"parameters":{"plan":["vertical","shielded_lateral"]}},"close_and_raise_vertical":{"owners":["ROVOperator"],"parameters":{}},"place_soft_screen":{"owners":["ROVOperator"],"parameters":{}},"retreat_laterally_and_raise":{"owners":["ROVOperator"],"parameters":{}}},"E057":{"south_feed_and_arm_trap":{"owners":["South"],"parameters":{}},"west_tension_wall":{"owners":["West"],"parameters":{}},"north_serve":{"owners":["North"],"parameters":{}},"north_strobe_release":{"owners":["North"],"parameters":{}},"east_reflect":{"owners":["East"],"parameters":{"arc":["left","right"]}},"south_catch_on_transfer_rail":{"owners":["South"],"parameters":{}},"south_measure_and_roll_out":{"owners":["South"],"parameters":{}},"west_reflect":{"owners":["West"],"parameters":{"lean":["shallow","steep"]}},"east_open_receiver_shutter":{"owners":["East"],"parameters":{}},"north_guide_into_receiver":{"owners":["North"],"parameters":{}},"north_read_roll_strobe":{"owners":["North"],"parameters":{}},"east_install_roll_brake":{"owners":["East"],"parameters":{"brake":["clockwise","counterclockwise","axial"]}},"east_read_pawl_phase":{"owners":["East"],"parameters":{}},"south_choose_pawl_order":{"owners":["South"],"parameters":{"order":["early","late"]}},"south_engage_pawl":{"owners":["South"],"parameters":{}},"west_tighten_bearing":{"owners":["West"],"parameters":{}},"west_read_frame_offset":{"owners":["West"],"parameters":{}},"north_choose_frame_route":{"owners":["North"],"parameters":{"route":["inboard","outboard"]}},"north_install_center_pin":{"owners":["North"],"parameters":{}},"north_place_corrective_shim":{"owners":["North"],"parameters":{}},"east_close_side_latch":{"owners":["East"],"parameters":{}},"south_tension_receiver_ratchet":{"owners":["South"],"parameters":{}}},"E138":{"deploy_wind_vane":{"owners":["engineer"],"parameters":{}},"commit_differential_thrust":{"owners":["pilot"],"parameters":{"bias":["port","starboard"]}},"extend_landing_gear":{"owners":["first_officer"],"parameters":{}},"cross_radar_beacon":{"owners":["pilot"],"parameters":{}},"sweep_traffic_radar":{"owners":["navigator"],"parameters":{}},"lock_wheel_truck":{"owners":["first_officer"],"parameters":{"steering":["with_bias","against_bias"]}},"extend_landing_flaps":{"owners":["engineer"],"parameters":{}},"arm_spring_spoilers":{"owners":["first_officer"],"parameters":{}},"touch_down":{"owners":["pilot"],"parameters":{}},"read_runout_airflow":{"owners":["engineer"],"parameters":{}},"commit_reverser_profile":{"owners":["pilot"],"parameters":{"profile":["reduced","standard","boosted"]}},"read_open_taxi_exit":{"owners":["navigator"],"parameters":{}},"select_taxi_exit":{"owners":["first_officer"],"parameters":{"exit":["port","starboard"]}},"perform_taxi_maneuver":{"owners":["first_officer"],"parameters":{"operation":["hold_straight","turn_with_bias","turn_against_bias","align_taxiway"]}},"read_brake_pack_temperature":{"owners":["first_officer"],"parameters":{}},"select_cooling_procedure":{"owners":["engineer"],"parameters":{"procedure":["normal","overheated"]}},"perform_cooling_step":{"owners":["engineer"],"parameters":{"operation":["normal_purge","isolate_hot_section","boosted_fan_cycle","final_check_and_close"]}}},"NG008":{"inspect_flooded_yard":{"owners":["SiteInspector"],"parameters":{}},"energize_trailer_feeder":{"owners":["PowerEngineer"],"parameters":{"cabinet":["west","east"]}},"load_and_pressurize_trailer":{"owners":["Logistician"],"parameters":{}},"inspect_active_relief_outlet":{"owners":["Logistician"],"parameters":{}},"open_protected_refuge_approach":{"owners":["ResponseCoordinator"],"parameters":{"approach":["north","south"]}},"drive_loaded_trailer_to_refuge":{"owners":["Logistician"],"parameters":{}},"connect_permanent_refuge_cooling":{"owners":["PowerEngineer"],"parameters":{}},"escort_all_personnel_across_threshold":{"owners":["SiteInspector"],"parameters":{}},"inspect_refuge_bus_configuration":{"owners":["SiteInspector"],"parameters":{}},"select_backup_bus_topology":{"owners":["PowerEngineer"],"parameters":{"topology":["north_bus","south_bus","split_bus"]}},"isolate_split_bus_sections":{"owners":["PowerEngineer"],"parameters":{}},"install_split_bus_link":{"owners":["PowerEngineer"],"parameters":{}},"verify_backup_bus":{"owners":["PowerEngineer"],"parameters":{}},"inspect_coldroom_return_channel":{"owners":["PowerEngineer"],"parameters":{}},"place_batches_and_finalize_trailer":{"owners":["Logistician"],"parameters":{"return_zone":["left","right"]}},"inspect_refuge_drain_edge":{"owners":["Logistician"],"parameters":{}},"isolate_drain_ingress":{"owners":["ResponseCoordinator"],"parameters":{"side":["north","south"]}}}};

const target=(x,y,name)=>({selector:'.legacy-object-scene',x,y,name});
function locate(id,op,v,args){
 if(id==='E121'){
  const late=v.seam_progress!=='locked',x=late?335:({courtyard:155,arch_chamber:310,exit:555}[v.cart_position]);
  if(['raise_glass_lever','raise_grove_lever','lift_hinge_veil','pin_stone_bridge'].includes(op)&&!late)return target(287,435,'Механизм моста');
  if(['peel_arch_bark','unfold_glass_arch'].includes(op)&&!late)return target(420,315,'Арка');
  return Number.isFinite(x)?target(x,late?360:390,'Тележка и её крепления'):null;
 }
 if(id==='NG017'){
  if(['place_primary_on_assay_tray','assay_primary_interior'].includes(op))return target(365,v.delivered?350:450,'Проба на лотке');
  let x=390,y=['aboard','stored'].includes(v.position)?260:340;if(v.recovery_step==='recovery_complete'||v.delivered){x=455;y=255;}
  return target(x,y,'Подводный аппарат и захват');
 }
 if(id==='E057'){
  const close=v.ball_place==='receiver';
  if(close){
   if(['east_install_roll_brake'].includes(op))return target(260,355,'Тормоз чаши');
   if(['south_engage_pawl','south_choose_pawl_order','east_read_pawl_phase'].includes(op))return target(332,432,'Стопор чаши');
   if(['west_tighten_bearing'].includes(op))return target(455,355,'Подшипник');
   if(['north_install_center_pin'].includes(op))return target(360,242,'Центральный штифт');
   if(['north_place_corrective_shim','east_close_side_latch'].includes(op))return target(466,392,'Боковое крепление');
   if(op==='south_tension_receiver_ratchet')return target(410,445,'Храповик чаши');
   return target(360,355,'Чаша и её рама');
  }
  if(op==='west_tension_wall')return target(170,340,'Западный отражатель');
  if(op==='east_reflect')return target(550,340,'Восточный отражатель');
  if(op==='west_reflect')return target(170,340,'Западный отражатель');
  if(op==='east_open_receiver_shutter')return target(430,330,'Шторка приёмника');
  const positions={rack:[270,435],serve_cup:[360,255],north_launch:[360,255],east_approach:[510,320],south_approach:[360,430],south_cradle:[360,430],west_approach:[210,340],target_approach:[430,330],escaped:[620,470]};
  const p=positions[v.ball_place];return p?target(...p,'Мяч и направляющая'):null;
 }
 if(id==='E138'){
  const side=v.selected_taxi_exit,off=v.taxi_maneuver_step===4&&v.taxi_route_safe;
  let x=360,y=v.landed?315:405;if(v.taxi_maneuver_step>=2&&['port','starboard'].includes(side)){x=side==='port'?235:485;y=345;}if(off){x=side==='port'?165:555;y=345;}
  if(off&&['normal_purge','isolate_hot_section','boosted_fan_cycle','final_check_and_close'].includes(op)&&['normal','overheated'].includes(v.cooling_procedure))return target(side==='port'?225:495,450,'Установка охлаждения');
  return target(x,y,'Самолёт и бортовые системы');
 }
 if(id==='NG008'){
  const late=v.bus_status!=='locked';
  if(late){
   if(['inspect_refuge_bus_configuration','select_backup_bus_topology','isolate_split_bus_sections','install_split_bus_link','verify_backup_bus'].includes(op))return target(235,360,'Резервная шина');
   if(op==='place_batches_and_finalize_trailer'||op==='inspect_coldroom_return_channel')return target(403,390,'Партии и воздушный канал');
   if(op==='isolate_drain_ingress')return target(365,v.drain_selection==='north'?235:500,'Защита притока');
   return target(360,360,'Убежище');
  }
  if(op==='inspect_flooded_yard')return target(180,455,'Затопленный двор');
  if(['open_protected_refuge_approach','connect_permanent_refuge_cooling','escort_all_personnel_across_threshold'].includes(op))return target(550,365,'Убежище и вход');
  return target(['arrived','secured','evacuated'].includes(v.phase)?490:285,390,'Прицеп с партиями');
 }
 return null;
}
function describe(id,actor,call,context={}){
 const schema=SCHEMA[id],entry=schema?.[call?.id];
 if(!schema)return null;
 if(call?.id==='wait')return {kind:'wait',label:'Ожидает'};
 if(call?.id==='send_message')return {kind:'send',label:'Отправляет сообщение'};
 if(!entry||!entry.owners.includes(actor))return {kind:'unmapped',label:'Действие'};
 const args=call.args||{};if(Object.keys(args).some(k=>!Object.hasOwn(entry.parameters,k))||Object.entries(entry.parameters).some(([k,values])=>!values.includes(args[k])))return {kind:'unmapped',label:'Действие'};
 const op=args.operation||call.id,base=window.EnvironmentScenes;
 let label=base.LABEL[op]||base.LABEL[call.id];if(!label)return {kind:'unmapped',label:'Действие'};
 const parameters=Object.entries(args).filter(([k])=>k!=='operation').map(([,v])=>base.VALUE[v]??String(v));if(parameters.length)label+=' · '+parameters.join(', ');
 const t=locate(id,op,context.public||{},args);return t?{kind:'physical',label,target:t}:{kind:'unmapped',label};
}
window.LegacyActionTargets={has:id=>Object.hasOwn(SCHEMA,id),describe};
})();
