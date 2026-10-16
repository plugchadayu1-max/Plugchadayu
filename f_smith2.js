/* ---------- ช่างตีเหล็ก: หน้าตีบวกแบบแท่นบูชา (วางอุปกรณ์ 1 ช่อง + หินตีบวก 1 ช่อง) ----------
   เกิน +8 ถ้าล้มเหลว อุปกรณ์แตกเหลือ +0 ยกเว้นวางอุปกรณ์กันแตก (ซื้อได้ในหน้านี้) */
(function(){
  const PROT_FROM=8,PROT_PRICE=200000;
  const st=document.createElement('style');
  st.textContent=`
  .sm2{display:flex;gap:10px;flex-wrap:wrap}
  .sm2 .alt{flex:1 1 230px;min-width:220px;background:radial-gradient(circle at 50% 38%,#3a2a14,#1d140a 70%);border:2px solid #8a6a2e;border-radius:10px;padding:8px;text-align:center}
  .sm2 .ring{position:relative;width:200px;height:190px;margin:0 auto}
  .sm2 .sl{position:absolute;width:62px;height:62px;border:2px solid #c9a24a;border-radius:10px;background:#120c06;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-direction:column;font-size:11px;color:#ffe9b0}
  .sm2 .sl img{width:48px;height:48px;object-fit:contain}
  .sm2 .sl.dim{opacity:.4;cursor:default;border-style:dashed}
  .sm2 .sl.on{box-shadow:0 0 12px 2px #ffd04a}
  .sm2 .sl .pl{position:absolute;right:-8px;top:-10px;background:#ffd04a;color:#000;border-radius:9px;padding:0 5px;font-size:12px;font-weight:700}
  .sm2 .sl .ct{position:absolute;right:2px;bottom:0;font-size:11px;color:#fff;text-shadow:0 0 3px #000}
  .sm2 .go{margin-top:6px;width:100%;padding:8px;font-weight:700;font-size:15px}
  .sm2 .inv{flex:1 1 230px;min-width:220px;background:#1a1410;border:2px solid #5a4528;border-radius:10px;padding:8px}
  .sm2 .grid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;max-height:210px;overflow:auto}
  .sm2 .grid .bs{position:relative;width:auto;height:auto;aspect-ratio:1}
  .sm2 .grid .bs.cur{outline:3px solid #ffd04a;outline-offset:-1px}
  .sm2 .info{font-size:12px;line-height:1.5;margin-top:6px;text-align:left;color:#f2e6c8}
  .sm2 .warn{color:#ff9d9a}.sm2 .good{color:#9be58a}`;
  document.head.appendChild(st);

  window.SM2={sel:null,stone:false,prot:false};
  const rowsOf=()=>{const r=[];for(const s of Object.keys(P.eq))if(P.eq[s]&&P.eq[s].st)r.push(['eq',s,P.eq[s]]);P.bag.forEach((it,i)=>{if(it&&it.slot&&it.st)r.push(['bag',i,it])});return r};
  const get=(wh,k)=>wh==='eq'?P.eq[k]:P.bag[+k];
  const cur=()=>{const s=SM2.sel;if(!s)return null;const it=get(s[0],s[1]);return it&&it.st?it:null};
  const stoneNeed=c=>({ore:c.ore,gem:c.gem});

  const origRefresh=window.refreshSmith;
  window.refreshSmith=function(){
    if(typeof SM==='undefined'||SM.tab!=='enh')return origRefresh();
    const w=$('winSmith');if(!w||w.style.display!=='block')return;
    const rows=rowsOf();
    if(!cur())SM2.sel=rows.length?[rows[0][0],rows[0][1]]:null;
    const it=cur(),p=it?(it.plus||0):0,c=it?enhCost(it):null,max=it&&p>=ENH_MAX;
    const risk=it&&!max&&p>=PROT_FROM,prot=P.mats.prot||0;
    const haveStone=it&&P.mats.ore>=c.ore&&P.mats.gem>=c.gem,haveZ=it&&P.zeny>=c.zeny;
    const stoneIc=it&&c.gem?'💎':'⛏';
    const slotItem=it?`<div class="sl on ${pgx(it)}" style="left:69px;top:64px;width:72px;height:72px"><img${pgc(it)} src="${itemIcon(it)}"><span class="pl">${p?'+'+p:''}</span></div>`
      :`<div class="sl dim" style="left:69px;top:64px;width:72px;height:72px">เลือกอุปกรณ์</div>`;
    const stoneSlot=`<div class="sl ${SM2.stone&&it&&!max?'on':''}${it&&!max?'':' dim'}" style="left:69px;top:0" onclick="SM2.pickStone()">${it&&!max?`<span style="font-size:28px">${stoneIc}</span><span>หินตีบวก</span>${SM2.stone?'<span class="pl">✔</span>':''}`:'หินตีบวก'}</div>`;
    const protSlot=`<div class="sl ${SM2.prot&&risk?'on':''}${risk?'':' dim'}" style="left:69px;top:128px" onclick="SM2.pickProt()"><span style="font-size:26px">🛡️</span><span>กันแตก</span><span class="ct">x${prot}</span>${SM2.prot&&risk?'<span class="pl">✔</span>':''}</div>`;
    const grid=rows.map(([wh,k,x])=>{const s=SM2.sel&&SM2.sel[0]===wh&&SM2.sel[1]==k;
      return `<div class="bs r${x.rar}${pgx(x)}${s?' cur':''}" onclick="SM2.select('${wh}','${k}')"><img${pgc(x)} src="${itemIcon(x)}"><span class="lv">${x.plus?'+'+x.plus:'Lv'+x.lv}</span></div>`}).join('')||'<div class="small">ยังไม่มีอุปกรณ์</div>';
    let info='';
    if(!it)info='<span class="small">เลือกอุปกรณ์จากช่องด้านขวา</span>';
    else if(max)info='<span class="good">ตีบวกสูงสุดแล้ว +'+ENH_MAX+'</span>';
    else{
      info=`<b class="c${it.rar}">${itName(it)}</b> → <b>+${p+1}</b><br>
        ต้องใช้ ⛏ แร่ ${c.ore}${c.gem?` • 💎 หินเวท ${c.gem}`:''} • 💰 ${c.zeny.toLocaleString()}z<br>
        โอกาสสำเร็จ <b>${Math.round(c.rate*100)}%</b>${risk?`<br><span class="warn">⚠ ล้มเหลวแล้วอุปกรณ์จะแตกเหลือ +0 ${SM2.prot?(prot>0?'(ใช้กันแตก: ระดับไม่ลด)':'(ไม่มีอุปกรณ์กันแตก!)'):'(ไม่ได้วางกันแตก)'}</span>`:'<br><span class="small">ล้มเหลวแล้วระดับไม่ลด (วัตถุดิบหาย)</span>'}`;
    }
    const can=it&&!max&&SM2.stone&&haveStone&&haveZ&&(!risk||!SM2.prot||prot>0);
    const label=!it||max?'ตีบวก':!SM2.stone?'วางหินตีบวกก่อน':!haveStone?'วัตถุดิบไม่พอ':!haveZ?'Zeny ไม่พอ':(risk&&SM2.prot&&!prot)?'ไม่มีอุปกรณ์กันแตก':`ตีบวก +${p+1}`;
    const body=`<div class="sm2"><div class="alt"><div class="ring">${stoneSlot}${slotItem}${protSlot}</div>
        <div class="info">${info}</div>
        <button class="go" ${can?'':'disabled'} onclick="SM2.go()">${label}</button></div>
      <div class="inv"><div class="small">อุปกรณ์ของคุณ (แตะเพื่อวางบนแท่น)</div><div class="grid">${grid}</div>
        <div class="sep"></div>
        <div class="small">🛡️ อุปกรณ์กันแตก มี ${prot} ชิ้น</div>
        <button onclick="SM2.buyProt()" ${P.zeny>=PROT_PRICE?'':'disabled'} style="width:100%;margin-top:4px">ซื้ออุปกรณ์กันแตก ${PROT_PRICE.toLocaleString()}z</button>
        <div class="small" style="margin-top:4px">ล้มเหลวหลังตี +${PROT_FROM} ขึ้นไป อุปกรณ์จะแตกเหลือ +0 วางอุปกรณ์กันแตกเพื่อป้องกัน (ใช้ 1 ชิ้นต่อครั้งที่ล้มเหลว)</div></div></div>`;
    w.innerHTML=`<h3><span>⚒ ช่างตีเหล็ก</span><button class="x" onclick="toggleWin('winSmith')">✕</button></h3>
      <div class="mat"><span>⛏ แร่ ${P.mats.ore}</span><span>💎 หินเวท ${P.mats.gem}</span><span>🛡️ ${prot}</span><span>💰 ${P.zeny.toLocaleString()}</span></div>
      <div class="tabs2">${[['enh','ตีบวก'],['craft','คราฟต์']].map(([k,n])=>`<button class="${SM.tab===k?'on':''}" onclick="SM.tab='${k}';refreshSmith()">${n}</button>`).join('')}</div><div class="winbody">${body}</div>`;
  };

  SM2.select=(wh,k)=>{SM2.sel=[wh,k];SM2.stone=false;SM2.prot=false;refreshSmith()};
  SM2.pickStone=()=>{const it=cur();if(!it||(it.plus||0)>=ENH_MAX)return;SM2.stone=!SM2.stone;refreshSmith()};
  SM2.pickProt=()=>{const it=cur();if(!it||(it.plus||0)<PROT_FROM||(it.plus||0)>=ENH_MAX)return;SM2.prot=!SM2.prot;refreshSmith()};
  SM2.buyProt=()=>{if(P.zeny<PROT_PRICE)return;P.zeny-=PROT_PRICE;P.mats.prot=(P.mats.prot||0)+1;say('ซื้ออุปกรณ์กันแตกแล้ว','#9be58a');refreshSmith()};
  SM2.go=()=>{const s=SM2.sel;if(s)window.enhance(s[0],s[1])};

  window.enhance=function(wh,key){
    const it=get(wh,key);if(!it||!it.st)return;
    const p=it.plus||0;if(p>=ENH_MAX)return;const c=enhCost(it);
    if(!SM2.stone){say('วางหินตีบวกที่ช่องบนแท่นก่อน','#ffe28a');return}
    if(P.mats.ore<c.ore||P.mats.gem<c.gem||P.zeny<c.zeny){say('วัตถุดิบหรือ Zeny ไม่พอ','#ff9d9a');return}
    const risk=p>=PROT_FROM,useProt=risk&&SM2.prot;
    if(useProt&&!(P.mats.prot>0)){say('ไม่มีอุปกรณ์กันแตก','#ff9d9a');return}
    P.mats.ore-=c.ore;P.mats.gem-=c.gem;P.zeny-=c.zeny;
    const win=Math.random()<c.rate;sfx(win?'enhOk':'enhFail');FXI={uid:it.uid,t:win?'fl':'shk'};setTimeout(()=>{FXI=null},900);
    if(win){it.plus=p+1;P.st.enh++;P.st.maxPlus=Math.max(P.st.maxPlus,it.plus);toast(`✨ ตีบวกสำเร็จ! ${itName(it)}`);say(`ตีบวกสำเร็จ → ${itName(it)}`,RAR[it.rar].g);qEvent('enh')}
    else if(risk){
      if(useProt){P.mats.prot--;toast('🛡️ อุปกรณ์กันแตกช่วยไว้!');say(`ตีบวกล้มเหลว แต่อุปกรณ์กันแตกช่วยไว้ ยังเป็น +${p}`,'#ffe28a')}
      else{it.plus=0;toast('💥 อุปกรณ์แตก! เหลือ +0');say(`💥 ${it.name} แตก! กลับเป็น +0`,'#ff6b66')}
    }else{toast('💥 ตีบวกล้มเหลว');say('ตีบวกล้มเหลว... วัตถุดิบสูญหาย (ระดับไม่ลด)','#ff9d9a')}
    if(wh==='eq'){recalcGear();P.hp=Math.min(P.hp,maxHp());refreshChar()}
    SM2.stone=false;if(!(it.plus>=PROT_FROM))SM2.prot=false;
    checkAch();refreshSmith();refreshBag();
  };
})();
