/* ============ แถบเควสต์แบบเรียบ (มุมซ้าย) ============
   เห็นเฉพาะเควสต์ที่ "รับแล้ว": บทเนื้อเรื่องที่รับ + เควสต์จากป้ายเควสต์
   (รายวัน / ค่าหัว / คำแนะนำ ดูได้ในหน้าต่างเควสต์ J และเป้าหมาย O)
   แต่ละเควสต์: ชื่อสีทอง + เป้าหมายพร้อมความคืบหน้าชิดขวา • แตะ = ออโต้ไปทำ / รับรางวัล
   แทนที่ updateTracker ทั้งหมด (โหลดหลัง f_life.js และ f_guide.js) */

const QT={min:false,tab:'quest'};   // tab: 'quest' | 'party' (ปาร์ตี้มาจาก f_social.js)
(function(){
  const s=document.createElement('style');s.textContent=`
#tracker.qt{width:220px;padding:0 0 3px;font-size:11px;line-height:1.35;opacity:1;border:0;border-radius:6px 0 0 6px;box-shadow:none;
  background:linear-gradient(90deg,rgba(8,12,28,.62),rgba(8,12,28,.3) 80%,rgba(8,12,28,0))}
#tracker.qt .qh{display:flex;align-items:center;gap:6px;padding:3px 8px;cursor:pointer;border-bottom:1px solid rgba(160,190,255,.22)}
#tracker.qt .tab{color:#9fb0d8;font-weight:bold;padding:1px 9px;border-radius:9px;cursor:pointer}
#tracker.qt .tab.on{color:#eef3ff;background:rgba(80,110,190,.45)}
#tracker.qt .cnt{color:#9fb0d8;font-size:10px}
#tracker.qt .arr{margin-left:auto;color:#9fb0d8;font-size:10px}
#tracker.qt .qi{padding:3px 8px 3px 6px;cursor:pointer;border-left:2px solid transparent}
#tracker.qt .qi:hover{background:rgba(255,255,255,.07)}
#tracker.qt .qi.on{border-left-color:#7cc85e;background:rgba(124,200,94,.12)}
#tracker.qt .qn{color:#ffd84a;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 0 #000}
#tracker.qt .qo{display:flex;gap:6px;color:#d6dcef;text-shadow:0 1px 0 #000}
#tracker.qt .qo span{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#tracker.qt .qo b{color:#eef3ff;font-weight:normal;white-space:nowrap}
#tracker.qt .qo.ok,#tracker.qt .qo.ok b{color:#8be07a}
#tracker.qt .qe{padding:4px 8px;color:#9fb0d8;font-size:10px}
@media (max-width:640px){#tracker.qt{width:165px;font-size:10px}#tracker.qt .qi{padding:3px 6px 3px 5px}}`;
  document.head.appendChild(s);
})();

updateTracker=function(){
  const e=$('tracker');if(!e||!P)return;
  if(!e.classList.contains('qt')){e.classList.remove('panel','min');e.classList.add('qt')}
  const L=[],item=(on,click,title,obj,p,c,done)=>`<div class="qi${on?' on':''}" onclick="${click}"><div class="qn">${title}</div>`+
    `<div class="qo${done?' ok':''}"><span>${done?'✔ ':''}${obj}</span><b>${done?'เสร็จ':p+'/'+c}</b></div></div>`;
  // บทเนื้อเรื่องที่รับแล้ว
  if(P.dx&&typeof STORY!=='undefined'){
    const S=P.dx.story,c=S&&STORY[S.ch];
    if(c&&S.st===1){const p=Math.min(c.obj.c,storyProg());L.push(item(AUTO.focusRef==='s:'+S.ch,'storyGo()','📖 '+c.t,c.obj.txt,p,c.obj.c,false))}
    else if(c&&S.st===2)L.push(item(false,'openStory()','📖 '+c.t,'แตะรับรางวัล',0,0,true));
  }
  // เควสต์จากป้ายเควสต์ที่รับแล้ว
  for(const q of QUESTS){const s=P.qs[q.id];if(!s||s.s!==1)continue;const d=s.p>=q.c;
    L.push(item(AUTO.focusRef==='q:'+q.id,`trackGo('q:${q.id}')`,q.n,d?'แตะรับรางวัล':qText(q),Math.min(s.p,q.c),q.c,d))}
  e.style.display='block';
  const hasP=typeof partyRows==='function',pn=hasP&&typeof SOC!=='undefined'?SOC.members.length:0,tab=hasP?QT.tab:'quest';
  const T=(k,t)=>`<span class="tab${tab===k?' on':''}" onclick="event.stopPropagation();QT.tab='${k}';QT.min=false;updateTracker()">${t}</span>`;
  e.innerHTML=`<div class="qh" onclick="QT.min=!QT.min;updateTracker()">${T('quest',`📜 เควส <span class="cnt">${L.length}</span>`)}${hasP?T('party',`👥 ปาร์ตี้${pn?` <span class="cnt">${pn}</span>`:''}`):''}<span class="arr">${QT.min?'▸ แสดง':'▾ ซ่อน'}</span></div>`+
    (QT.min?'':tab==='party'?partyRows():L.length?L.join(''):'<div class="qe">ยังไม่ได้รับเควส • รับได้ที่ป้ายเควสต์ (J)</div>');
};
