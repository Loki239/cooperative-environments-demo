/* Read-only communication visualization. Events come from delivered histories. */
(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let current=null,lastKey=null;
const palette=['#3266c9','#087f8c','#a96620','#8556a8','#ae4b6e','#52744a'];
function person(x,y,color,label,board=false,sending=false,actor="",row=null,number=null,wrap=18){
 const lines=label.length>(window.innerWidth<600?10:19)?label.replace(/ (?!.* )/,'\n').split('\n'):[label];
 const shape=board?`<rect x="${x-22}" y="${y-27}" width="44" height="57" rx="4"/><path d="M${x-13} ${y-12}h26m-26 12h26m-26 12h18"/>`:`<circle cx="${x}" cy="${y-32}" r="13"/><path d="M${x} ${y-19}v10"/><rect x="${x-12}" y="${y-10}" width="24" height="35" rx="10"/><path d="M${x-11} ${y-2}l-17 18m39-18 17 ${sending?-7:18}M${x-6} ${y+25}l-8 23m20-23 8 23"/>`;
 return `<g class="team-person" data-person="${esc(label)}" data-actor="${esc(actor)}" ${row?.kind==='physical'&&row.target?`data-action-actor="${esc(actor)}" role="button" tabindex="0" aria-label="${esc(label+': '+row.label)}"`: ''} stroke="${color}" stroke-width="3.3" fill="#fff" stroke-linecap="round" stroke-linejoin="round">${shape}</g>${lines.map((s,i)=>`<text x="${x}" y="${y+70+i*18}" text-anchor="middle" fill="${color}" font-size="15" font-family="Arial,sans-serif">${esc(s)}</text>`).join('')}${!board&&number?`<g class="person-number" transform="translate(${x-22} ${y-44})"><circle r="9" fill="#fff" stroke="${color}" stroke-width="2"/><text y="4" text-anchor="middle" fill="${color}" font-size="12" font-family="Arial,sans-serif">${number}</text></g>`:''}${actionCaption(row,actor,x,color,wrap)}`;
}
function actionCaption(row,actor,x,color,wrap){
 if(!row?.label)return '';
 const visible=row.kind==='send'?'Сообщает':row.kind==='wait'?'Ждёт':row.label;
 const words=visible.split(' ').flatMap(word=>{const parts=[];while(word.length>wrap){parts.push(word.slice(0,wrap-1)+'‑');word=word.slice(wrap-1);}if(word)parts.push(word);return parts;}),lines=[''];for(const w of words){const n=lines.length-1;if(lines[n].length+w.length+1>wrap&&lines[n])lines.push(w);else lines[n]+=(lines[n]?' ':'')+w;}
 const shown=lines.slice(0,2);if(lines.length>2)shown[1]+='…';
 return `<g class="person-action" ${row.kind==='physical'&&row.target?`data-action-actor="${esc(actor)}" role="button" tabindex="0" aria-label="${esc(row.label)}"`:''}><title>${esc(row.label)}</title>${shown.map((line,i)=>`<text x="${x}" y="${195+i*14}" fill="${color}" font-size="12" text-anchor="middle" font-family="Arial,sans-serif">${esc(line)}</text>`).join('')}</g>`;
}
function diagram(events,options,animate){
 const ids=[...new Set([...options.actors,...events.flatMap(e=>[e.sender,...e.recipients])])];
 const width=window.innerWidth<600?360:600, margin=ids.length>5?34:40, x=id=>ids.length===1?width/2:margin+ids.indexOf(id)*(width-2*margin)/(ids.length-1), yy=86;
 const color=id=>options.color?.(id)||palette[options.actors.indexOf(id)%palette.length]||'#627286';
 const name=id=>options.name?.(id)||id;
 let paths='';
 events.forEach((event,n)=>event.recipients.forEach(r=>{
  const direction=x(r)>x(event.sender)?1:-1,end=x(r)-13*direction,start=x(event.sender)+13*direction,route=`M ${start} ${yy-3} Q ${(start+end)/2} ${-16+n%3*17} ${end} ${yy-3}`;
  paths+=`<path class="comm-route" d="${route}" fill="none" stroke="${color(event.sender)}" opacity=".55" stroke-width="2" stroke-dasharray="5 5"/><g class="comm-envelope ${animate?'comm-moving':''}" data-sender="${esc(event.sender)}" data-recipient="${esc(r)}" transform="translate(${end} ${yy-3})" style="--route:path('${route}')"><rect x="-11" y="-8" width="22" height="16" rx="2" fill="#fff" stroke="${color(event.sender)}" stroke-width="2"/><path d="m-10-7 10 8 10-8" fill="none" stroke="${color(event.sender)}" stroke-width="1.5"/></g>`;
 }));
 return `<svg viewBox="0 0 ${width} 230" role="img" aria-label="Команда и фактические передачи сообщений">${paths}${ids.map(id=>person(x(id),yy,color(id),name(id),id.startsWith('board:'),animate&&events.some(e=>e.sender===id),id,(options.actionRows||[]).find(r=>r.actor===id),options.roleNumbers?.[id],Math.max(7,Math.floor(Math.min(2*x(id)-8,2*(width-x(id))-8,(width-2*margin)/Math.max(1,ids.length-1)-10)/6.5)))).join('')}</svg>`;
}
function summary(text){try{if(text.startsWith('NETCERT1:')){const d=JSON.parse(text.slice(9));return `Сообщает известные связи для ${Object.keys(d.adjacency||{}).length} вершин.`;}const d=JSON.parse(text);if(typeof d.flow==='boolean'&&Object.hasOwn(d,'block'))return `Пробный поток ${d.flow?'проходит':'не проходит'}. Блок ${d.block}.`;}catch{}return '';}
function preview(text){return text.length>210?text.slice(0,210)+'…':text;}
function render(events,options){
 const key=options.key,animate=key!==lastKey;lastKey=key;
 const latest=events.length?Math.max(...events.map(e=>e.tick)):null,batch=events.filter(e=>e.tick===latest),name=options.name|| (x=>x);
 current={events:batch,options,selected:0};
 return `<section class="communication-scene"><div class="section-head"><h3>Команда</h3><small>${latest===null?'До первой передачи':latest===options.round?'Связь · такт '+latest:'Последняя связь · такт '+latest}</small></div><div class="comm-diagram">${diagram(batch,options,animate&&latest===options.round)}</div>${(options.actionRows||[]).some(r=>r.kind==='physical'&&r.target)?'<p class="action-key">Цвет предмета совпадает с цветом исполнителя. Конверт и пунктир — сообщение.</p>':''}${batch.length?`<div class="comm-events">${batch.map((e,i)=>`<article class="comm-event"><button type="button" class="comm-select ${i===0?'active':''}" data-comm="${i}" aria-pressed="${i===0}">${esc(name(e.sender))} → ${esc(e.recipients.map(name).join(', '))}<span>${esc(e.channel)}</span></button>${summary(e.text)?`<p class="comm-summary">${esc(summary(e.text))}</p>`:''}<p class="comm-preview">${esc(preview(e.text))}</p><details><summary>Полный текст и доставка</summary><p>${esc(e.text)}</p><p>${esc(options.timing||'Доставлено после указанного такта; доступно перед следующим выбором. Движение повторяет этот переход.')}</p></details></article>`).join('')}</div>`:`<p class="empty">${esc(options.empty||'Пока сообщений нет. Люди показаны на своих местах; передача появится после отправки.')}</p>`}</section>`;
}
function fromChats(chats,channels,selected=null,full=false){
 const events=[];
 for(const c of channels){if(!full&&!c.members.includes(selected))continue;
  for(const h of chats[c.id]||[])for(const m of h.messages)events.push({tick:h.tick,sender:m.sender||'Анонимный участник',recipients:c.members.filter(a=>a!==m.sender),channel:c.members.length>2?'Общий чат':c.members.join(' ↔ '),text:m.content});
 }
 return events;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-comm]');if(!b||!current)return;const n=Number(b.dataset.comm);if(n===current.selected)return;current.selected=n;document.querySelectorAll('[data-comm]').forEach((x,i)=>{x.classList.toggle('active',i===n);x.setAttribute('aria-pressed',String(i===n));});});
window.addEventListener('resize',()=>{const d=document.querySelector('.comm-diagram');if(d&&current){d.innerHTML=diagram(current.events,current.options,false);window.ActionOverlay?.mount(current.options);}});
window.CommunicationScene={render,fromChats,mountActions(){if(current)window.ActionOverlay?.mount(current.options);}};
})();
