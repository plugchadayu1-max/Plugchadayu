/* ============ ตัวทดลอง 2.5D (Three.js) ============
   เปิดด้วย index.html?view=25d เท่านั้น — ถ้าไม่ใส่พารามิเตอร์ไฟล์นี้ไม่ทำอะไรเลย (เกมเดิม 2D ไม่ถูกแตะ)
   แนวคิด: ตรรกะเกมทั้งหมดใช้ของเดิม เปลี่ยนเฉพาะ render() ให้วาดด้วย WebGL
   พื้น = groundCv ที่เกมสร้างไว้ปูเป็นระนาบ 3D • ตัวละคร/มอนสเตอร์/ต้นไม้ = สไปรต์ตั้งหันหน้าหากล้อง
   หน่วย 3D: 1 หน่วย = 1 พิกเซลอาร์ต (หน่วยเกม / A) • x → X, y → Z (ใต้ = +Z) */
(function(){
if(!/[?&]view=25d/.test(location.search))return;
const s=document.createElement('script');
s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
s.onload=init;s.onerror=()=>console.warn('[2.5D] โหลด three.js ไม่ได้ (ต้องต่ออินเทอร์เน็ต) — ใช้โหมด 2D ต่อ');
document.head.appendChild(s);

function init(){
const T=THREE;
const gl=document.createElement('canvas');gl.id='cv3';
gl.style.cssText='position:fixed;inset:0;width:100%;height:100%;display:block';
cv.parentNode.insertBefore(gl,cv);
const R=new T.WebGLRenderer({canvas:gl,antialias:false,alpha:false,powerPreference:'high-performance'});
const scene=new T.Scene();
const cam3=new T.PerspectiveCamera(30,1,10,5000);
const PHI=44*Math.PI/180,VFOV=34;                // มุมก้มของกล้อง / มุมมองแนวตั้ง
const TILT=PHI*.55,YS=1/Math.cos(PHI-TILT);       // สไปรต์เอนหากล้องบางส่วน + ชดเชยความสูงที่หดจากมุมเอียง
const SKY={forest:0x2b3d2d,desert:0x7a6a45,snow:0xa9bfd2};
let sw=0,sh=0,sdpr=0,lastLH=0;

/* ---------- เครื่องมือ ---------- */
const texCache=new Map();
function texOf(img,linear){
  let t=texCache.get(img);if(t)return t;
  t=new T.Texture(img);t.magFilter=linear?T.LinearFilter:T.NearestFilter;t.minFilter=linear?T.LinearMipmapLinearFilter:T.NearestFilter;
  t.generateMipmaps=!!linear;t.anisotropy=linear?R.capabilities.getMaxAnisotropy():1;t.needsUpdate=true;
  texCache.set(img,t);return t;
}
function mkTexCanvas(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return c}
const SHADOW_TEX=new T.CanvasTexture(mkTexCanvas(64,64,(c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,2,w/2,h/2,w/2);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h)}));
const RING_TEX=new T.CanvasTexture(mkTexCanvas(128,128,(c,w,h)=>{c.strokeStyle='#fff';c.lineWidth=7;c.beginPath();c.arc(w/2,h/2,w/2-8,0,7);c.stroke();c.globalAlpha=.18;c.fillStyle='#fff';c.fill()}));
const flatGeo=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2);

/* ---------- ตัวหน่วยสไปรต์ (pool ตามออบเจ็กต์เกม) ---------- */
const ents=new Map();let frame=0;
function getEnt(key,tex){
  let e=ents.get(key);
  if(!e){
    const geo=new T.PlaneGeometry(1,1),mat=new T.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.06});
    const mesh=new T.Mesh(geo,mat),g=new T.Group();g.rotation.x=-TILT;g.add(mesh);
    const shadow=new T.Mesh(flatGeo,new T.MeshBasicMaterial({map:SHADOW_TEX,transparent:true,depthWrite:false}));shadow.position.y=.2;shadow.renderOrder=1;
    scene.add(g);scene.add(shadow);mesh.userData.ref=key;
    e={g,mesh,geo,mat,shadow,tex:null};ents.set(key,e);
  }
  if(e.tex!==tex){e.mat.map=tex;e.mat.needsUpdate=true;e.tex=tex}
  e.seen=frame;e.g.visible=true;return e;
}
// วางสไปรต์: เท้าอยู่ที่ (x,y) หน่วยเกม • w,h = ขนาดพิกเซลอาร์ต • cx = จุดยึดแนวนอน (0-1) • foot = จุดเท้าจากขอบบน (0-1)
function place(e,x,y,w,h,cx,foot,sdw){
  e.g.position.set(x/A,.4,y/A);
  e.mesh.scale.set(w,h*YS,1);e.mesh.position.set((.5-cx)*w,(foot-.5)*h*YS,0);
  if(sdw){e.shadow.visible=true;e.shadow.position.set(x/A,.2,y/A);e.shadow.scale.set(sdw,sdw*.42,1)}else e.shadow.visible=false;
}
function setUV(e,u0,v0,u1,v1){const a=e.geo.attributes.uv.array;a[0]=u0;a[1]=v1;a[2]=u1;a[3]=v1;a[4]=u0;a[5]=v0;a[6]=u1;a[7]=v0;e.geo.attributes.uv.needsUpdate=true}
function setFull(e){setUV(e,0,0,1,1)}
function dropEnt(k,e){scene.remove(e.g);scene.remove(e.shadow);e.geo.dispose();e.mat.dispose();ents.delete(k)}

// ตัวละคร/มอนสเตอร์ที่ใช้สไปรต์ชีต
function putActor(key,a,x,y,o){
  const S=a.sh;if(!S)return null;
  // S.scale = ชีตความละเอียดสูง (tools/bake_vrm.html): ย่อขนาด + กรองภาพแบบเนียน
  const e=getEnt(key,texOf(S.im,!!S.scale)),idx=actorFrame(a),W=S.im.width,H=S.im.height,k=(a.px||1)*(S.scale||1)*(o.sc||1);
  const sx=(idx%S.cols)*S.cw,sy=Math.floor(idx/S.cols)*S.ch;
  setUV(e,sx/W,1-(sy+S.ch)/H,(sx+S.cw)/W,1-sy/H);
  place(e,x,y,S.cw*k,S.ch*k,S.cx,S.foot,o.shadow);
  e.mat.opacity=o.alpha==null?1:o.alpha;
  if(o.flash)e.mat.color.setScalar(1.8);else if(o.frozen)e.mat.color.setRGB(.65,1,1.45);else if(o.tc)e.mat.color.setRGB(o.tc[0],o.tc[1],o.tc[2]);else e.mat.color.setScalar(1);
  e.h=S.ch*k*YS;return e;
}
// สไปรต์จากภาพนิ่ง (ต้นไม้ ร้านค้า ฯลฯ) และจาก "ภาพที่เกมวาดลง 2D" (ประตูวาร์ป กองไฟ)
function putStill(key,im,x,y,alpha){
  const e=getEnt(key,texOf(im));setFull(e);place(e,x,y+3*A,im.width,im.height,.5,1,0);e.mat.opacity=alpha==null?1:alpha;e.mat.color.setScalar(1);e.h=im.height*YS;return e;
}
const snaps=new Map();
function putSnap(key,fn,x,y,w,h,ax,ay,sdw){
  let sn=snaps.get(key);if(!sn){const c=document.createElement('canvas');c.width=w;c.height=h;sn={c,x:c.getContext('2d')};snaps.set(key,sn)}
  const oX=CX,oY=CY;CX=Math.round(x/A)-ax;CY=Math.round(y/A)-ay;
  lx.save();lx.setTransform(LM,0,0,LM,0,0);lx.globalAlpha=1;lx.clearRect(0,0,w,h);fn();lx.restore();
  CX=oX;CY=oY;
  sn.x.clearRect(0,0,w,h);sn.x.drawImage(lo,0,0,w*LM,h*LM,0,0,w,h);
  const e=getEnt(key,texOf(sn.c));e.tex.needsUpdate=true;setFull(e);place(e,x,y,w,h,ax/w,ay/h,sdw||0);e.mat.opacity=1;e.mat.color.setScalar(1);e.h=h*YS;return e;
}

/* ---------- พื้น ---------- */
let curGround=null,groundMesh=null;
const groundPlane=new T.Plane(new T.Vector3(0,1,0),0);
function setGround(){
  if(groundMesh){scene.remove(groundMesh);groundMesh.geometry.dispose()}
  for(const [k,e] of [...ents])dropEnt(k,e);snaps.clear();
  const W=groundCv.width,H=groundCv.height;
  const tex=new T.Texture(groundCv);tex.magFilter=T.NearestFilter;tex.minFilter=T.LinearMipmapLinearFilter;tex.anisotropy=R.capabilities.getMaxAnisotropy();tex.needsUpdate=true;
  groundMesh=new T.Mesh(new T.PlaneGeometry(W,H).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:tex}));
  groundMesh.position.set(W/2,0,H/2);scene.add(groundMesh);
  const c=SKY[MAPID]||0x1b2430;scene.background=new T.Color(c);scene.fog=new T.Fog(c,distCam()*1.15,distCam()*2.7);
  curGround=groundCv;camOK=false;
}

/* ---------- กล้อง ---------- */
let tx=0,tz=0,camOK=false,lastT=performance.now();
// ให้ขนาดตัวละครใกล้เคียงโหมด 2D ที่กลางจอ • มือถือแนวตั้ง (จอสูงมาก) จำกัดความสูงที่เห็น ไม่ให้กล้องไกลจนตัวเล็ก
const distCam=()=>(Math.max(180,Math.min(LH,LW*1.35))/2)/Math.tan(VFOV*Math.PI/360);
function updateCam(dt){
  const lock=!!CLASSES[P.cls].camLock;   // ล็อกกล้องตามตัวละครตลอด (ธนู)
  const gx=P.x/A+(lock?0:(P.vx||0)/A*.22),gz=P.y/A+(lock?0:(P.vy||0)/A*.18)-16;
  if(lock||!camOK||!cam.ok||Math.hypot(gx-tx,gz-tz)>260){tx=gx;tz=gz;camOK=true}
  else{const k=1-Math.exp(-dt*6.5);tx+=(gx-tx)*k;tz+=(gz-tz)*k}
  // ไม่ให้กล้องเลยขอบแผนที่มากเกินไป
  const W=groundCv.width,H=groundCv.height,mx=Math.min(W/2,LW*.32),mz=Math.min(H/2,LH*.3);
  if(!lock){tx=clamp(tx,mx,W-mx);tz=clamp(tz,mz*.6,H-mz)}   // ล็อก: ไม่จำกัดที่ขอบแมพ ตัวละครอยู่กลางจอเสมอ
  const d=distCam(),on3=typeof SHAKE_ON==='undefined'||SHAKE_ON,sk3=on3?shake:0,shk=sk3>0?(Math.random()-.5)*sk3*.7:0,bob3=on3&&walkSpd>25?Math.sin(time*16)*.5:0;
  cam3.position.set(tx+shk,Math.sin(PHI)*d+bob3,tz+Math.cos(PHI)*d+shk*.5);
  cam3.lookAt(tx,0,tz);
}
function fit(){
  if(sw===VW&&sh===VH&&sdpr===DPR&&lastLH===LH)return;
  sw=VW;sh=VH;sdpr=DPR;lastLH=LH;R.setPixelRatio(DPR);R.setSize(VW,VH,false);
  cam3.aspect=VW/VH;cam3.fov=VFOV;cam3.updateProjectionMatrix();
  if(scene.fog){scene.fog.near=distCam()*1.15;scene.fog.far=distCam()*2.7}
}

/* ---------- ตัวชี้เมาส์/นิ้ว -> พิกัดโลก ---------- */
const ray=new T.Raycaster(),ndc=new T.Vector2(),hitPt=new T.Vector3();
let pickables=[];
worldPos=function(e){
  ndc.set(e.clientX/VW*2-1,-(e.clientY/VH*2-1));ray.setFromCamera(ndc,cam3);
  const hits=ray.intersectObjects(pickables,false);
  if(hits.length){
    const o=hits[0].object.userData.ref;
    if(o&&o.d)return{x:o.x,y:o.y-o.d.h/2};                       // มอนสเตอร์ -> ให้ตรรกะเดิมเลือกเป็นเป้า
    if(o&&o.k)return{x:o.x,y:o.y-ART[o.k].height*A/2};            // NPC/หีบ/ป้าย
  }
  if(ray.ray.intersectPlane(groundPlane,hitPt))return{x:hitPt.x*A,y:hitPt.z*A};
  return{x:P.x,y:P.y};
};

/* ---------- วาดทับ (ชื่อ แถบเลือด ตัวเลขดาเมจ) บน canvas 2D ---------- */
const v3=new T.Vector3();
function scr(wx,wy,wz){v3.set(wx,wy,wz).project(cam3);return[(v3.x+1)/2*VW,(1-v3.y)/2*VH,v3.z]}
function headPos(x,y,h){return scr(x/A,h*Math.cos(TILT),y/A-h*Math.sin(TILT))}
function txt(t,x,y,col,size){ctx.font=`bold ${size}px Tahoma`;ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=3;ctx.strokeStyle='#120c08';ctx.strokeText(t,x,y);ctx.fillStyle=col;ctx.fillText(t,x,y)}
function bar(x,y,w,f,col){ctx.fillStyle='#120c08';ctx.fillRect(x-1,y-1,w+2,5);ctx.fillStyle='#3a1c1c';ctx.fillRect(x,y,w,3);ctx.fillStyle=col;ctx.fillRect(x,y,w*Math.max(0,Math.min(1,f)),3)}

/* ---------- เอฟเฟกต์พื้น (วงแหวน) / เวทมนตร์ ---------- */
const ringPool=[],vfxPool=[];let ringN=0,vfxN=0;
function ringMesh(x,y,r,col,op,yy){
  let m=ringPool[ringN++];
  if(!m){m=new T.Mesh(flatGeo,new T.MeshBasicMaterial({map:RING_TEX,transparent:true,depthWrite:false}));m.renderOrder=2;scene.add(m);ringPool.push(m)}
  m.visible=true;m.position.set(x/A,yy||.35,y/A);m.scale.set(r*2,1,r*2);m.material.color.set(col);m.material.opacity=op;
}
function vfxMesh(V,f,t){
  let e=vfxPool[vfxN++];
  if(!e){
    const geo=new T.PlaneGeometry(1,1),mat=new T.MeshBasicMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending}),mesh=new T.Mesh(geo,mat),g=new T.Group();
    g.rotation.x=-TILT;g.add(mesh);scene.add(g);e={g,mesh,geo,mat};vfxPool.push(e);
  }
  const sc=f.scale||V.scale,fr=Math.min(V.n-1,Math.floor(t*V.n)),w=V.fw*sc,h=V.fh*sc,W=V.im.width,H=V.im.height;
  const tex=texOf(f.tint?tintedIm(V.im,f.tint):V.im);if(e.mat.map!==tex){e.mat.map=tex;e.mat.needsUpdate=true}
  setUV(e,fr*V.fw/W,1-V.fh/H,(fr+1)*V.fw/W,1);
  e.g.visible=true;e.mat.opacity=Math.min(1,(1-t)*1.6);
  if(f.to){   // ลำแสงยืดระหว่างสองจุด: วางราบกับพื้นตามแนวยิง (มองเห็นได้ทุกทิศ)
    const x0=f.x/A,z0=f.y/A,x1=f.to.x/A,z1=f.to.y/A,len=Math.hypot(x1-x0,z1-z0)||1;
    e.g.position.set((x0+x1)/2,14,(z0+z1)/2);e.g.rotation.set(0,-Math.atan2(z1-z0,x1-x0),0);
    e.mesh.rotation.set(-Math.PI/2,0,0);e.mesh.scale.set(len,h*.6,1);e.mesh.position.set(0,0,0);return;
  }
  e.g.rotation.set(-TILT,0,0);e.mesh.rotation.set(0,0,0);
  e.g.position.set(f.x/A,.6,f.y/A);
  e.mesh.scale.set(f.flip?-w:w,h*YS,1);e.mesh.position.set((.5-V.ax)*w*(f.flip?-1:1),(V.ay-.5)*h*YS,0);
}
// ออร่าที่เท้า (ภาพจาก f_skin.js: auraCur()) — แผ่นตั้งเอนหากล้องเหมือนสไปรต์ วางหลังตัวละครเล็กน้อย
let auraE=null;
function auraMesh(al){
  const a=typeof auraCur==='function'?auraCur():null;
  if(!a){if(auraE)auraE.g.visible=false;return}
  if(!auraE){
    const geo=new T.PlaneGeometry(1,1),mat=new T.MeshBasicMaterial({transparent:true,depthWrite:false}),mesh=new T.Mesh(geo,mat),g=new T.Group();
    g.rotation.x=-TILT;g.add(mesh);scene.add(g);auraE={g,mesh,geo,mat};
  }
  const e=auraE,w=a.dw*a.sx,h=a.dh;
  const tex=texOf(a.im,true);if(e.mat.map!==tex){e.mat.map=tex;e.mat.needsUpdate=true}
  e.mat.blending=a.add?T.AdditiveBlending:T.NormalBlending;
  setUV(e,a.x/a.W,1-(a.y+a.h)/a.H,(a.x+a.w)/a.W,1-a.y/a.H);
  e.g.visible=true;e.g.position.set(P.x/A,.3,P.y/A-.8);
  e.mesh.scale.set(w,h*YS,1);e.mesh.position.set((.5-a.fx)*w,(a.fy-.5)*h*YS-a.dy*YS,0);
  e.mat.opacity=a.alpha*al;
}
// ย้อมสีเอฟเฟกต์ (ค่า tint แบบ CSS filter เหมือนโหมด 2D) — ทำครั้งเดียวต่อภาพ+สี แล้วเก็บไว้
const tintCache=new WeakMap();
function tintedIm(im,tint){
  let m=tintCache.get(im);if(!m)tintCache.set(im,m=new Map());
  let c=m.get(tint);
  if(!c){c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.filter=tint;g.drawImage(im,0,0);m.set(tint,c)}
  return c;
}

/* ---------- วาดหนึ่งเฟรม ---------- */
render=function(){
  if(!P||!groundCv)return;
  frame++;fit();
  if(curGround!==groundCv)setGround();
  const now=performance.now(),dt=Math.min(.1,(now-lastT)/1000);lastT=now;
  updateCam(dt);
  ringN=0;vfxN=0;pickables=[];
  const near=(x,y,r)=>Math.abs(x/A-tx)<r*1.5&&Math.abs(y/A-tz)<r*1.1;
  const R_=Math.max(LW,LH)*.95;
  // ของประกอบฉาก
  for(const p of props){
    if(p.hide||!near(p.x,p.y,R_*.8))continue;
    let e;
    if(p.k==='portal')e=putSnap(p,()=>drawPortal(p),p.x,p.y,40,50,20,42,0);
    else{
      let al=1;
      if(/^(tree|pine|snowpine)\d?$/.test(p.k)||p.mtn){const im=ART[p.k];if(P.y<p.y&&P.y>p.y-im.height*A&&Math.abs(P.x-p.x)<im.width*A*.45)al=.4}
      e=ART[p.k]?putStill(p,ART[p.k],p.x,p.y,al):null;
    }
    if(e&&CLICKABLE[p.k])pickables.push(e.mesh);
  }
  for(const f of fires){if(near(f.x,f.y,R_*.6))putSnap(f,()=>drawFire(f),f.x,f.y,32,30,16,22,0)}
  // มอนสเตอร์
  const tags=[];
  for(const m of mobs){
    if(m.dead&&m.deadT>2.4)continue;if(!near(m.x,m.y,R_*.9))continue;
    const al=m.dead?clamp((2.4-m.deadT)/.8,0,1):1,hh=Math.round(m.d.h/A);
    const e=putActor(m,m.actor,m.x,m.y,{tc:m.d.tint&&m.d.tint.c,flash:m.hitT>0,frozen:m.slowT>0||m.stunT>0,alpha:al,shadow:Math.max(8,hh*.7),sc:UNIT_SCALE});
    if(!e)continue;if(!m.dead)pickables.push(e.mesh);
    if(!m.dead)tags.push(()=>{
      const[x,y]=headPos(m.x,m.y,e.h),k=PS/DPR;
      const hasBar=m.hp<m.mx||m.aggro,by=y-5*k-4;
      if(hasBar){const w=Math.max(14,hh*.5)*k;bar(x-w/2,by,w,m.hp/m.mx,'#e0524f');txt(Math.max(0,Math.ceil(m.hp))+'/'+m.mx,x,by-3,'#ffd6d2',8)}
      const ly=hasBar?by-12:by+2;
      if(m.d.boss||m.d.elite)txt((m.d.boss?'👑 ':'⭐ ')+m.d.name+'  Lv'+m.d.lv,x,ly-2,m.d.boss?'#f2c94c':'#ffb36b',12);
      else txt('Lv'+m.d.lv,x,ly,m.d.lv>P.lv+2?'#ff8a85':'#d6d6d6',8);    });
  }
  // ผู้เล่น
  const pal=P.dying>0?clamp(P.dying/.6,0,1):1;
  const pe=putActor(P,P.actor,P.x,P.y,{flash:P.hitT>0,alpha:pal,shadow:26*UNIT_SCALE+8,sc:UNIT_SCALE});
  auraMesh(pal);
  // ผู้ช่วยที่นักอัญเชิญเรียก (f_summon.js)
  if(window.MINIONS)for(const m of MINIONS){const fd=m.life<1.5?Math.max(0,m.life/1.5):1;putActor(m,m.actor,m.x,m.y,{alpha:fd,shadow:Math.max(8,26*UNIT_SCALE*.7+4),sc:UNIT_SCALE})}
  // สัตว์เลี้ยง (f_progress.js): ตัวที่พาไป 1 ตัว — บินลอยขวาบนหรือวิ่งตามหลัง
  if(typeof PT!=='undefined'&&PT.actor){const e=putActor(PT,PT.actor,PT.x,PT.y,{shadow:PT.fly?7:9,sc:UNIT_SCALE});if(e&&PT.fly)e.g.position.y=.4+(PT.zz||0)}
  // วงเป้าหมาย / จุดคลิก
  if(P.dest&&!(KEYS.w||KEYS.a||KEYS.s||KEYS.d))ringMesh(P.dest.x,P.dest.y,5+(Math.floor(time*6)%2),'#ffffff',.9);
  if(P.target&&!P.target.dead){const t=P.target;ringMesh(t.x,t.y,Math.round(t.d.h*.42/A)+4,'#ff5a52',.95)}
  // เอฟเฟกต์
  for(const f of fx){
    const t=f.age/f.life;
    if(f.k==='ring'){const r=L(f.r)*(.3+t*.7);ringMesh(f.x,f.y,r,f.col,(1-t)*.9)}
    else if(f.k==='vfx'&&f.age>=0&&VFXI[f.name])vfxMesh(VFXI[f.name],f,t);
  }
  for(let i=ringN;i<ringPool.length;i++)ringPool[i].visible=false;
  for(let i=vfxN;i<vfxPool.length;i++)vfxPool[i].g.visible=false;
  // เก็บกวาดสไปรต์ที่ไม่ได้ใช้ในเฟรมนี้
  for(const [k,e] of ents){if(e.seen!==frame){e.g.visible=false;e.shadow.visible=false;if(frame-e.seen>600)dropEnt(k,e)}}
  R.render(scene,cam3);

  /* ----- ชั้น 2D ทับ ----- */
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,VW,VH);
  const k=PS/DPR;
  for(const t of tags)t();
  if(pe){
    const[x,y]=headPos(P.x,P.y,0),w=22*k;
    bar(x-w/2,y+4*k,w,P.hp/maxHp(),'#e0524f');
    const wp=P.eq&&P.eq.weapon&&P.eq.weapon.plus||0;
    txt(`${pName()} Lv${P.lv}${wp?'  ⚔+'+wp:''}`,x,y+22*k,wp?PG_COL[plusTier(P.eq.weapon)]:'#ffffff',12);
  }
  for(const p of props){
    if(p.hide||(p.k!=='shop'&&p.k!=='portal'&&p.k!=='quest'&&p.k!=='smith'))continue;if(!near(p.x,p.y,R_))continue;
    const hgt=p.k==='portal'?44:ART[p.k].height,[x,y]=headPos(p.x,p.y,hgt);
    if(p.k==='shop')txt('ร้านค้า',x,y-6,'#f2c94c',13);else if(p.k==='quest')txt('📜 ป้ายเควสต์',x,y-6,'#9be58a',13);else if(p.k==='smith')txt('⚒ ช่างตีเหล็ก',x,y-6,'#ffb36b',13);
    else txt(`${MAPS[p.to].ic} ${MAPS[p.to].name} (Lv ${MAPS[p.to].lv})`,x,y-6,PORTAL_COL[p.to][1],12);
  }
  // ลูกเวท/ลูกธนู
  for(const p of projs){if(p.delay>0)continue;const[x,y]=scr(p.x/A,12,p.y/A);
    if(p.k==='orb'){ctx.globalAlpha=.35;ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(x,y,6*k,0,7);ctx.fill();ctx.globalAlpha=1;ctx.beginPath();ctx.arc(x,y,3*k,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(x-1.5,y-1.5,3,3)}
    else if(p.k==='bullet'){const c=Math.cos(p.ang),sn=Math.sin(p.ang);ctx.globalAlpha=.4;ctx.fillStyle='#ff9a2a';ctx.beginPath();ctx.arc(x,y,4*k,0,7);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#fff3b0';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(x-c*12*k,y-sn*6*k);ctx.lineTo(x+c*3*k,y+sn*1.5*k);ctx.stroke()}
    else{const c=Math.cos(p.ang),sn=Math.sin(p.ang);ctx.strokeStyle='#e8e0c8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-c*9*k,y-sn*5*k);ctx.lineTo(x+c*4*k,y+sn*2*k);ctx.stroke()}}
  // ตัวเลขดาเมจ
  for(const f of floats){ctx.globalAlpha=clamp((1-f.age)*1.8,0,1);const[x,y]=scr(f.x/A,0,f.y/A);txt(f.t,x,y-f.age*14*k-4,f.col,f.big?22:14);ctx.globalAlpha=1}
};
console.info('[2.5D] เปิดโหมดทดลองแล้ว');
}
})();
