# เพิ่มมิติให้ฉาก: ต้นไม้ใหญ่ 2 แบบ (โอ๊ก/สนหลายชั้นที่มีแสงเงา), ภูเขาตามผืนหน้าผา, ผนังหน้าผาไล่เงา-ชั้นหิน, เงาทอดจากหน้าผา
import os
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b, cnt=1):
    assert a in t, a[:70]
    return t.replace(a, b, cnt)

h = rd('index.html')
assert 'ART.tree2' not in h, 'already applied'

ART_JS = r"""  // ---- มิติเพิ่มเติม: ต้นไม้ใหญ่ (แสงจากซ้ายบน เงาทอดขวาล่าง) ----
  const oak=(w,hh,dk,md,lt,trunk)=>mk(w,hh,c=>{
    const cx=w>>1;
    pxEllipseOn(c,cx+7,hh-4,Math.round(w*.38),5,'rgba(0,0,0,.28)');
    c.fillStyle='#1d1208';c.fillRect(cx-5,hh-26,10,22);c.fillRect(cx-8,hh-8,16,5);
    c.fillStyle=trunk[0];c.fillRect(cx-4,hh-26,8,22);c.fillRect(cx-7,hh-8,14,4);c.fillStyle=trunk[1];c.fillRect(cx-4,hh-26,2,22);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(cx+2,hh-26,2,22);
    const cl=[[cx,hh-40,15],[cx-13,hh-33,11],[cx+13,hh-33,11],[cx-7,hh-52,11],[cx+8,hh-50,10],[cx,hh-30,12]];
    for(const [x,y,r] of cl)pxCircle(c,x,y+1,r+1,'#10260c');
    for(const [x,y,r] of cl)pxCircle(c,x,y,r,dk);
    for(const [x,y,r] of cl)pxCircle(c,x-2,y-2,Math.max(2,r-3),md);
    for(const [x,y,r] of cl.slice(0,5))pxCircle(c,x-4,y-4,Math.max(1,r-7),lt);
    for(let i=0;i<26;i++){const a=i*2.4,rr=(i*7)%15;c.fillStyle=i%3?lt:dk;c.fillRect(Math.round(cx-6+Math.cos(a)*rr),Math.round(hh-42+Math.sin(a)*rr*.8),2,1)}
  });
  ART.tree2=oak(52,66,'#235a22','#3a8a34','#78c85a',['#6b4a2b','#9a7040']);
  ART.tree3=oak(44,56,'#2c6228','#468e3a','#8ad060',['#7a5632','#a67c48']);
  const pine2=(snow,w,hh)=>mk(w,hh,c=>{
    const cx=w>>1;
    pxEllipseOn(c,cx+6,hh-3,Math.round(w*.36),4,'rgba(0,0,0,.28)');
    c.fillStyle='#1d1208';c.fillRect(cx-3,hh-14,7,12);c.fillStyle='#6b4a2b';c.fillRect(cx-2,hh-14,5,11);c.fillStyle='#8a6038';c.fillRect(cx-2,hh-14,2,11);
    const tiers=5,th=Math.round((hh-12)/tiers*1.5);
    for(let t=0;t<tiers;t++){
      const top=2+t*Math.round((hh-20)/tiers),hw0=3+t*Math.round((w/2-5)/tiers);
      for(let y=0;y<th;y++){
        const hw=Math.max(1,Math.round(hw0*(y+1)/th)),yy=top+y;
        c.fillStyle='#10260c';c.fillRect(cx-hw-1,yy,hw*2+3,1);
        c.fillStyle=snow&&y<th*.4?'#f4f9fc':'#3a8a46';c.fillRect(cx-hw,yy,hw+1,1);          // ด้านรับแสง
        c.fillStyle=snow&&y<th*.4?'#c8d8e6':'#1f5a2c';c.fillRect(cx+1,yy,hw,1);               // ด้านเงา
        if(!snow&&y%3===2){c.fillStyle='#5aaa5e';c.fillRect(cx-hw+1,yy,Math.max(1,hw>>1),1)}
      }
    }
  });
  ART.pine2=pine2(false,40,70);ART.snowpine2=pine2(true,40,70);
  // ภูเขา: ไล่แสงซ้ายสว่าง/ขวามืด มีสันและชั้นหิน ยอดหิมะตามแมพ (3 ขนาด)
  const mtn=(w,hh,col,snow)=>mk(w,hh,c=>{
    const img=c.createImageData(w,hh),D=img.data,[r0,g0,b0]=hexRGB(col),pk=Math.round(w*(.42+hash2(w,hh,3)*.16)),bt=hh-5;
    const top=x=>{const k=x<pk?x/pk:(w-1-x)/(w-1-pk),base=bt-(bt-3)*Math.pow(k,.78);return base+(vnoise(x/5,3,w)-.5)*7*Math.min(1,k*2.5)};
    for(let x=0;x<w;x++){const y0=Math.round(top(x));
      for(let y=Math.max(0,y0);y<bt;y++){
        const lit=x<pk,dep=(y-y0)/Math.max(1,bt-y0),ridge=Math.sin((x*.9+y*.5+(lit?0:7)))*.5+.5,strata=((y>>2)&1)?.93:1;
        let f=(lit?1.18:.74)*strata*(.88+.22*ridge)*(1-dep*.22);
        let r=r0*f,g=g0*f,b=b0*f;
        if(snow&&y-y0<(hh*.3)*(1-Math.abs(x-pk)/(w*.75))+3*vnoise(x/3,y/3,9)){r=lit?246:190;g=lit?250:204;b=lit?255:222}
        if(y===y0||(x<=0)||x>=w-1){r*=.35;g*=.35;b*=.35}
        const p=(y*w+x)*4;D[p]=Math.min(255,r);D[p+1]=Math.min(255,g);D[p+2]=Math.min(255,b);D[p+3]=255}}
    c.putImageData(img,0,0);
    pxEllipseOn(c,w>>1,hh-3,Math.round(w*.46),3,'rgba(0,0,0,.3)');
  });
  for(const id of MAP_ORDER){const M=MAPS[id];if(M.mtn===false)continue;const col=M.mcol||M.pal[4][1],sn=!!M.snowcap;
    ART['mtnS_'+id]=mtn(56,50,col,sn);ART['mtnM_'+id]=mtn(84,74,col,sn);ART['mtnL_'+id]=mtn(116,100,col,sn)}
"""
h = rep(h, "  ART.pine=pine(false);ART.snowpine=pine(true);\n", "  ART.pine=pine(false);ART.snowpine=pine(true);\n" + ART_JS)

# ผนังหน้าผา: ไล่เงา + ชั้นหิน
h = rep(h, "      else if(face){c=face<=2?[30,22,18]:P_[0].map(v=>v*.75)}",
"""      else if(face){const s=hash2(x>>1,y>>2,5),sh=face<=2?.36:.58+Math.min(.32,(face-2)*.045);c=(s>.62?P_[1]:P_[0]).map(v=>v*sh);if(y%4===0)c=c.map(v=>v*.86)}""")
h = rep(h, "      let face=0;for(let k=1;k<=6;k++)if(T(x,y+k)!==4){face=k;break}",
          "      let face=0;for(let k=1;k<=10;k++)if(T(x,y+k)!==4){face=k;break}")
# เงาทอดจากหน้าผาลงพื้น 5 พิกเซล
h = rep(h, "    if(t!==4&&t!==3&&t!==7&&T(x,y-1)===4)c=c.map(v=>v*.7);   // เงาใต้หน้าผา",
"""    if(t!==4&&t!==3&&t!==7){for(let k=1;k<=5;k++)if(T(x,y-k)===4){const f=.62+k*.07;c=c.map(v=>v*f);break}}   // เงาใต้หน้าผา (ไล่จางตามระยะ)""")
# ต้นไม้ตามขอบป่าหลายแบบ
h = rep(h, "pr.push({k:R()<.6?'tree':'pine',x:x*A,y:y*A})",
           "pr.push({k:R()<.6?['tree','tree2','tree3'][R()*3|0]:(R()<.5?'pine':'pine2'),x:x*A,y:y*A})")
# หิมะ: สนหิมะหลายแบบ + ภูเขา วางในผืนหน้าผาด้านใน
h = rep(h, "    if(ch==='r'&&R()<.8)pr.push",
"""    if(ch==='#'&&M.mtn!==false&&cx>0&&cx<GN-1&&cy>1&&cy<GN-1&&gc(cx,cy-1)==='#'&&gc(cx-1,cy)==='#'&&gc(cx+1,cy)==='#'&&gc(cx,cy+1)==='#'&&((cx+cy)&1)===0&&R()<.6){
      let up=1;while(up<4&&gc(cx,cy-1-up)==='#')up++;
      pr.push({k:(up>=4?'mtnL_':up>=3?'mtnM_':'mtnS_')+id,x:(cx+.5)*CELL,y:(cy+.95)*CELL,mtn:1})}
    if(ch==='r'&&R()<.8)pr.push""")
# ความโปร่งเมื่อผู้เล่นอยู่หลังต้นไม้/ภูเขา (2D)
h = rep(h, "    if(p.k==='tree'||p.k==='pine'||p.k==='snowpine'){\n      const behind=",
           "    if(/^(tree|pine|snowpine)\\d?$/.test(p.k)||p.mtn){\n      const behind=")
wr('index.html', h)

f = rd('f_25d.js')
f = rep(f, "if(p.k==='tree'||p.k==='pine'||p.k==='snowpine'){const im=ART[p.k];",
           "if(/^(tree|pine|snowpine)\\d?$/.test(p.k)||p.mtn){const im=ART[p.k];")
wr('f_25d.js', f)

# ธีมแมพ: ยอดหิมะ/สีภูเขา
h = rd('index.html')
h = rep(h, "    deco:['snowrock','crystal','snowpine'],trees:null,\n", "    deco:['snowrock','crystal','snowpine'],trees:null,snowcap:1,mcol:'#7e8aa0',\n")
h = rep(h, "    deco:['cactus','bones','rock'],trees:null,\n", "    deco:['cactus','bones','rock'],trees:null,mcol:'#b08a52',\n")
h = rep(h, "    deco:['bush','flower','rock'],trees:'tree',\n    },\n  ruinvillage", "    deco:['bush','flower','rock'],trees:'tree',mtn:false,\n    },\n  ruinvillage")
h = rep(h, "    deco:['bush','flower','rock'],trees:'tree',\n    }\n};", "    deco:['bush','flower','rock'],trees:'tree',mcol:'#8a7058',\n    }\n};")
wr('index.html', h)
print('ok')
