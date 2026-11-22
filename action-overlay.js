/* Read-only links between recorded actors and explicitly mapped scene objects. */
(()=>{
'use strict';
const NS='http://www.w3.org/2000/svg',esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let current=null,selected=null,lastKey=null,resizeFrame=null;
function svgElement(name,attrs={}){const e=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));return e;}
function screenPoint(svg,x,y,stage){const pt=svg.createSVGPoint();pt.x=x;pt.y=y;const matrix=svg.getScreenCTM();if(!matrix)return null;const p=pt.matrixTransform(matrix),box=stage.getBoundingClientRect();return {x:p.x-box.left,y:p.y-box.top};}
function draw(){
 if(!current)return;const stage=document.querySelector('.team-stage');if(!stage)return;
 stage.querySelector('.action-overlay')?.remove();stage.querySelector('.action-explanation')?.remove();
 const rows=current.rows.filter(r=>r.kind==='physical'&&r.target),points=[];
 for(const r of rows){const targetSvg=stage.querySelector(r.target.selector);if(!targetSvg)continue;const point=screenPoint(targetSvg,r.target.x,r.target.y,stage);if(!point)continue;points.push({...r,point});}
 if(!points.some(r=>r.actor===selected))selected=points[0]?.actor||null;
 stage.querySelectorAll('[data-action-actor]').forEach(e=>{const active=points.some(r=>r.actor===e.dataset.actionActor);e.classList.toggle('has-physical-action',active);e.classList.toggle('selected-action',e.dataset.actionActor===selected);e.setAttribute('aria-pressed',String(e.dataset.actionActor===selected));});
 if(!points.length)return;
 const focused=points.find(r=>r.actor===selected),color=focused.color;
 const detail=document.createElement('div');detail.className='action-explanation';detail.style.setProperty('--role',color);detail.innerHTML=`<span class="action-role-number">${focused.number}</span><span>${esc(focused.roleName)} · ${esc(focused.label)} → ${esc(focused.target.name)}</span>`;stage.append(detail);
 const box=stage.getBoundingClientRect(),overlay=svgElement('svg',{class:'action-overlay',viewBox:`0 0 ${box.width} ${box.height}`,'aria-hidden':'true'});
 const defs=svgElement('defs'),marker=svgElement('marker',{id:'physical-action-arrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:5,markerHeight:5,orient:'auto'});marker.append(svgElement('path',{d:'M0 0L10 5L0 10Z',fill:color}));defs.append(marker);overlay.append(defs);
 const origin=stage.querySelector(`[data-action-origin="${CSS.escape(focused.actor)}"]`);
 if(origin){const r=origin.getBoundingClientRect(),start={x:r.left+r.width/2-box.left,y:r.bottom-box.top+3},end=focused.point,rail=start.x<box.width/2?7:box.width-7;
  // Keep the long vertical leg outside message text; the final leg enters the object.
  const approach=Math.max(end.y-28,start.y+16),d=`M${start.x} ${start.y} V${start.y+7} H${rail} V${approach} H${end.x} V${end.y-15}`;
  overlay.append(svgElement('path',{class:'physical-action-link',d,fill:'none',stroke:color,'stroke-width':2.3,'stroke-linejoin':'round',opacity:.8,'marker-end':'url(#physical-action-arrow)','data-actor':focused.actor,'data-target':focused.target.name}));
 }
 const occupied=new Map();
 for(const r of points){const k=`${Math.round(r.point.x/16)}/${Math.round(r.point.y/16)}`,count=occupied.get(k)||0;occupied.set(k,count+1);const x=r.point.x,y=r.point.y;
  overlay.append(svgElement('circle',{class:'physical-target-ring',cx:x,cy:y,r:r.actor===selected?17:13,fill:'none',stroke:r.color,'stroke-width':r.actor===selected?2.7:1.7,opacity:.85,'data-actor':r.actor,'data-target':r.target.name}));
  const mark=svgElement('g',{'data-role-marker':r.actor,transform:`translate(${Math.max(11,Math.min(box.width-11,x+17+count*19))} ${y-17})`});
  mark.append(svgElement('circle',{r:9,fill:'#fff',stroke:r.color,'stroke-width':2}));const text=svgElement('text',{y:4,'text-anchor':'middle','font-size':12,'font-family':'Arial,sans-serif',fill:r.color,'font-weight':700});text.textContent=r.number;mark.append(text);overlay.append(mark);
 }
 stage.append(overlay);

}
function mount(options){
 const rows=options.actionRows||[];if(lastKey!==options.key){selected=null;lastKey=options.key;}current={rows,key:options.key};
 requestAnimationFrame(draw);
}
document.addEventListener('click',e=>{const choice=e.target.closest('[data-action-actor]');if(!choice||!current)return;const row=current.rows.find(r=>r.actor===choice.dataset.actionActor&&r.kind==='physical'&&r.target);if(!row)return;selected=row.actor;draw();});
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const choice=e.target.closest('[data-action-actor]');if(choice){e.preventDefault();choice.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(draw);});
document.addEventListener('toggle',e=>{if(e.target.closest?.('.team-stage'))requestAnimationFrame(draw);},true);
window.ActionOverlay={mount};
})();
