'use strict';
/* ===== f_summon.js — ผู้ช่วยที่นักอัญเชิญเรียก (สกิล Raise Skeleton: type 'summon') =====
   โครงกระดูกอัศวิน (ชีต sk_warrior) ช่วยสู้ชั่วคราว: เดินตามผู้เล่น วิ่งเข้าหาเป้าที่ผู้เล่นตี/ศัตรูใกล้ๆ แล้วฟัน
   ไม่โดนโจมตี (อายุจำกัด) • พร้อมกันได้ตาม s.maxMinions (ตัวเก่าสุดหายเมื่อเกิน) • ดาเมจ = calcDmg(s.mult) ตามเลเวลสกิล
   วาด: โหมด 2D ผ่าน REG.draw ด้านล่าง • โหมด 2.5D ผ่านลูปใน f_25d.js (อ่าน window.MINIONS) */
(function(){
const MIN=window.MINIONS=[];
const SPR='sk_warrior';

window.summonMinion=function(s){
  if(!P||!SHEETS[SPR])return;
  const max=s.maxMinions||3,cnt=s.count||1,c=s.col||'#b98cff';
  const spr=s.spr&&SHEETS[s.spr]?s.spr:SPR;
  const pxo=typeof MOBS==='object'?Object.values(MOBS).find(d=>d.sprite===spr):null;
  const px=(pxo&&pxo.px)||1;
  for(let k=0;k<cnt;k++){
    while(MIN.length>=max)MIN.shift();
    const a=(k/cnt)*Math.PI*2+Math.random()*.6,r=36+k*7;
    const m={x:P.x+Math.cos(a)*r,y:P.y+Math.sin(a)*r*.65,life:s.life||16,mult:s.mult||1,ls:s.ls||0,atkCd:.6+k*.1,hitIn:0,tgt:null,map:MAPID,actor:makeActor(spr,px)};
    m.actor.ang=P.actor.ang;oneShot(m.actor,'spawn',.7);
    MIN.push(m);
    ring(m.x,m.y,46,c,.6);burst(m.x,m.y-16,c,14);
  }
  say(cnt>1?`เรียกโครงกระดูก ${cnt} ตนมาช่วยสู้!${s.ls?' (ดูดเลือด +'+Math.round(s.ls*100)+'%)':''}`:'เรียกโครงกระดูกอัศวินมาช่วยสู้!','#c9a8ff');
};

REG.tick.push(dt=>{
  if(!P||!MIN.length)return;
  if(P.dying>0){MIN.length=0;return}
  for(let i=MIN.length-1;i>=0;i--){
    const m=MIN[i];
    if(m.map!==MAPID||(m.life-=dt)<=0){ring(m.x,m.y,38,'#b98cff',.5);MIN.splice(i,1);continue}
    tickActor(m.actor,dt);
    if(m.actor.anim==='spawn'&&m.actor.busy>0)continue;     // กำลังผุดขึ้นจากพื้น
    if(dist(m,P)>720){m.x=P.x+rnd(-40,40);m.y=P.y+rnd(-30,30)}   // ตามไม่ทัน/ข้ามแมพจน -> วาร์ปมาหาเจ้านาย
    // เป้าหมาย: ตัวที่ผู้เล่นกำลังตี > ตัวใกล้ผู้เล่นที่สุดในรัศมี 320
    let t=P.target&&!P.target.dead&&dist(P,P.target)<440?P.target:null;
    if(!t){let bd=320;for(const o of mobs){if(o.dead)continue;const d=dist(P,o);if(d<bd){bd=d;t=o}}}
    let tx,ty,reach;
    if(t){tx=t.x;ty=t.y;reach=26+(t.d.h||0)*.12}
    else{tx=P.x+Math.cos(i*2.2+1)*54;ty=P.y+Math.sin(i*2.2+1)*34;reach=10}
    const dx=tx-m.x,dy=ty-m.y,d=Math.hypot(dx,dy)||1;
    m.atkCd-=dt;
    const busy=m.actor.busy>0;
    if(d>reach){
      const st=Math.min(150*dt,d);m.x+=dx/d*st;m.y+=dy/d*st;m.actor.ang=Math.atan2(dy,dx);
      if(!busy)loopAnim(m.actor,'walk');
    }else{
      if(t){
        m.actor.ang=Math.atan2(dy,dx);
        if(m.atkCd<=0&&!busy){m.atkCd=1.1;oneShot(m.actor,'attack',.5);m.hitIn=.24;m.tgt=t}
        else if(!busy)loopAnim(m.actor,'idle');
      }else if(!busy)loopAnim(m.actor,'idle');
    }
    if(m.hitIn>0){
      m.hitIn-=dt;
      if(m.hitIn<=0&&m.tgt&&!m.tgt.dead){
        const dm=calcDmg(m.mult);hitMob(m.tgt,dm,false);
        if(m.ls&&P&&P.hp>0){const hl=Math.max(1,Math.round(dm*m.ls));P.hp=Math.min(maxHp(),P.hp+hl);float(P.x,P.y-90,`+${hl}`,'#8bf08b');ring(m.x,m.y,22,'#8bf08b',.25)}   // ดูดเลือด
        vfx('war1',m.tgt.x,m.tgt.y-(m.tgt.d.h||40)*.5,{tint:'hue-rotate(255deg)',flip:dx<0});
      }
    }
  }
});

// โหมด 2D: วาดคู่กับตัวละคร (เรียงตามแกน y)
REG.draw.push((Ls,iv)=>{
  if(!MIN.length)return;
  for(const m of MIN){
    if(!iv(m.x,m.y,120,160))continue;
    Ls.push({y:m.y,f:()=>{
      const fade=m.life<1.5?Math.max(0,m.life/1.5):1;
      lx.globalAlpha=.28*fade;pxEllipse(sxL(m.x),syL(m.y),Math.max(3,Math.round(9*UNIT_SCALE)),2,'#000',true);lx.globalAlpha=1;
      drawActor(m.actor,m.x,m.y,{sc:UNIT_SCALE,alpha:fade});
      // วงม่วงบางๆ ใต้เท้าให้รู้ว่าเป็นผู้ช่วย
      lx.globalAlpha=.55*fade;pxEllipse(sxL(m.x),syL(m.y)+1,Math.max(5,Math.round(12*UNIT_SCALE)),2,'#b98cff');lx.globalAlpha=1;
    }});
  }
});
})();
