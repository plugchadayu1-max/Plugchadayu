// โหลดภาพจาก art2_assets.js (data URI) ให้พร้อมก่อนสร้างฉาก — เรียกจาก loadSheets() ใน index.html
window.ART2_IM={};
window.loadArt2=function(){return Promise.all(Object.entries(window.ART2||{}).filter(e=>typeof e[1]==='string'&&e[1].startsWith('data:')).map(([k,u])=>new Promise(r=>{const i=new Image();i.onload=()=>{ART2_IM[k]=i;r()};i.onerror=r;i.src=u})))};

