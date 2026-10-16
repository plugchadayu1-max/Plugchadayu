/* ---------- ภาพอาคารในเมือง (ร้านค้า ช่างตีเหล็ก กระท่อมลุงปลา ศาลเทพีเอลิน ปราสาท) จาก art2_assets.js / castle.png ----------
   ART[k] เป็นแคนวาสความละเอียด 3 เท่า แต่รายงานขนาด width/height เป็น "พิกเซลอาร์ต" (โค้ดเดิมใช้ขนาดนี้คำนวณตำแหน่ง/คลิก) ส่วนการวาดอยู่ที่ index.html (im._k) */
(function(){
  const K=3;
  function hdArt(im,Wa){
    const Ha=Math.round(Wa*im.height/im.width),c=document.createElement('canvas');
    c.width=Wa*K;c.height=(Ha+4)*K;
    const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(c.width/2,(Ha+1)*K,Wa*.4*K,3.5*K,0,0,7);g.fill();
    g.drawImage(im,0,0,c.width,Ha*K);
    c._bw=c.width;c._bh=c.height;c._k=K;
    Object.defineProperty(c,'width',{get:()=>Wa});Object.defineProperty(c,'height',{get:()=>Ha+4});
    return c;
  }
  window.hdArt=hdArt;
  REG.art.push(()=>{
    const I=window.ART2_IM||{};
    if(I.bld_shop)ART.shop=hdArt(I.bld_shop,110);
    if(I.bld_smith)ART.smith=hdArt(I.bld_smith,92);
    if(I.bld_hut)ART.hut=hdArt(I.bld_hut,88);
    if(I.bld_shrine)ART.shrine=hdArt(I.bld_shrine,96);
    if(window.CASTLE_IM&&CASTLE_IM.width>300)ART.castle=hdArt(CASTLE_IM,150);
    // ของประดับทะเลทราย (ตัดจากภาพแมพใหม่)
    const D=[['prop_cactus','dcactus'],['prop_crysG1','dcrys1'],['prop_crysG2','dcrys2'],['prop_bush2','dbush'],['prop_tree','dtree']];
    for(const [k,n] of D)if(I[k]){ART[n]=hdArt(I[k],k==='prop_tree'?34:(ART2[k+'_w']||24));if(typeof MAPS!=='undefined'&&MAPS.desert&&!MAPS.desert.deco.includes(n))MAPS.desert.deco.push(n)}
  });
})();



