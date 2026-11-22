/* Read-only communication visualization. Events come from delivered histories. */
(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let current=null,lastKey=null;
const palette=['#3266c9','#087f8c','#a96620','#8556a8','#ae4b6e','#52744a'];
function person(x,y,color,label,board=false){
 const lines=label.length>(window.innerWidth<600?10:19)?label.replace(/ (?!.* )/,'\n').split('\n'):[label];
 const shape=board?`<rect x="${x-22}" y="${y-27}" width="44" height="57" rx="4"/><path d="M${x-13} ${y-12}h26m-26 12h26m-26 12h18"/>`:`<circle cx="${x}" cy="${y-32}" r="13"/><path d="M${x} ${y-19}v10"/><rect x="${x-12}" y="${y-10}" width="24" height="35" rx="10"/><path d="M${x-11} ${y-2}l-17 18m39-18 17 18M${x-6} ${y+25}l-8 23m20-23 8 23"/>`;
 return `<g stroke="${color}" stroke-width="3.3" fill="#fff" stroke-linecap="round" stroke-linejoin="round">${shape}</g>${lines.map((s,i)=>`<text x="${x}" y="${y+70+i*18}" text-anchor="middle" fill="${color}" font-size="15" font-family="Arial,sans-serif">${esc(s)}</text>`).join('')}`;
}
function diagram(event,options,animate){
 const ids=[event.sender,...event.recipients], count=ids.length, width=window.innerWidth<600?360:600, x=i=>count===1?width/2:40+i*(width-80)/(count-1), yy=86;
 const color=id=>options.color?.(id)||palette[options.actors.indexOf(id)%palette.length]||'#627286';
 const name=id=>options.name?.(id)||id;
 let paths='';
 event.recipients.forEach((r,i)=>{const end=x(i+1),start=x(0),dy=Math.max(22,50-i*7),route=`M ${start+13} ${yy-3} Q ${(start+end)/2} ${yy-dy-60} ${end-13} ${yy-3}`;
  paths+=`<path d="${route}" fill="none" stroke="${color(event.sender)}" opacity=".38" stroke-width="2" stroke-dasharray="5 5"/><g class="comm-envelope ${animate?'comm-moving':''}" transform="translate(${end-13} ${yy-3})" style="--route:path('${route}')"><rect x="-10" y="-7" width="20" height="14" rx="2" fill="#fff" stroke="${color(event.sender)}" stroke-width="2"/><path d="m-9-6 9 7 9-7" fill="none" stroke="${color(event.sender)}" stroke-width="1.5"/></g>`;
 });
 return `<svg viewBox="0 0 ${width} 185" role="img" aria-label="${esc(name(event.sender)+' → '+event.recipients.map(name).join(', '))}">${paths}${ids.map((id,i)=>person(x(i),yy,color(id),name(id),id.startsWith('board:'))).join('')}</svg>`;
}
function summary(text){try{if(text.startsWith('NETCERT1:')){const d=JSON.parse(text.slice(9));return `Сообщает известные связи для ${Object.keys(d.adjacency||{}).length} вершин.`;}const d=JSON.parse(text);if(typeof d.flow==='boolean'&&Object.hasOwn(d,'block'))return `Пробный поток ${d.flow?'проходит':'не проходит'}. Блок ${d.block}.`;}catch{}return '';}
function preview(text){return text.length>210?text.slice(0,210)+'…':text;}
function render(events,options){
 const key=options.key,animate=key!==lastKey;lastKey=key;
 if(!events.length){current=null;return `<section class="communication-scene"><h3>Обмен сообщениями</h3><p class="empty">${esc(options.empty||'В доступной истории сообщений пока нет.')}</p></section>`;}
 const latest=Math.max(...events.map(e=>e.tick)),batch=events.filter(e=>e.tick===latest);
 current={events:batch,options,selected:0};
 const event=batch[0],name=options.name|| (x=>x);
 return `<section class="communication-scene"><div class="section-head"><h3>${latest===options.round?'Передачи этого такта':'Последняя передача'}</h3><small>такт ${latest}</small></div><div class="comm-diagram">${diagram(event,options,animate&&latest===options.round)}</div><p class="comm-status">${esc(options.timing||'Текст уже доставлен; доступен перед следующим выбором действия. Движение повторяет доставку этого такта.')}</p><div class="comm-events">${batch.map((e,i)=>`<article class="comm-event"><button type="button" class="comm-select ${i===0?'active':''}" data-comm="${i}" aria-pressed="${i===0}">${esc(name(e.sender))} → ${esc(e.recipients.map(name).join(', '))}<span>${esc(e.channel)}</span></button>${summary(e.text)?`<p class="comm-summary">${esc(summary(e.text))}</p>`:''}<p>${esc(preview(e.text))}</p>${e.text.length>210?`<details><summary>Полный текст</summary><p>${esc(e.text)}</p></details>`:''}</article>`).join('')}</div>${batch.length>1?'<p class="mode-note">Несколько передач в одном такте. Нажмите на отправителя, чтобы увидеть маршрут.</p>':''}</section>`;
}
function fromChats(chats,channels,selected=null,full=false){
 const events=[];
 for(const c of channels){if(!full&&!c.members.includes(selected))continue;
  for(const h of chats[c.id]||[])for(const m of h.messages)events.push({tick:h.tick,sender:m.sender||'Анонимный участник',recipients:c.members.filter(a=>a!==m.sender),channel:c.members.length>2?'Общий чат':c.members.join(' ↔ '),text:m.content});
 }
 return events;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-comm]');if(!b||!current)return;const n=Number(b.dataset.comm);if(n===current.selected)return;current.selected=n;document.querySelector('.comm-diagram').innerHTML=diagram(current.events[n],current.options,current.events[n].tick===current.options.round);document.querySelectorAll('[data-comm]').forEach((x,i)=>{x.classList.toggle('active',i===n);x.setAttribute('aria-pressed',String(i===n));});});
window.CommunicationScene={render,fromChats};
})();
