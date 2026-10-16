// ตัวละคร chibi 3D สร้างด้วยโค้ด (ใช้กับ tools/bake_vrm.html แทนไฟล์ .vrm)
// คืนออบเจ็กต์หน้าตาเหมือน VRM ที่ตัวแปลงใช้: scene, humanoid.getRawBoneNode/getNormalizedBoneNode,
// humanoid.resetNormalizedPose, expressionManager.setValue('blink'), update(dt)
// กระดูกทุกชิ้นวางแบบ T-pose หันหน้า +Z (ซ้ายของตัวละคร = +X) เหมือน VRM ที่ normalize แล้ว
import * as T from 'three';

const SKIN = 0xffe2cc;
export const CHIBI = {
  warrior: {name: 'นักรบ', weapon: 'sword', hair: 0xe8c27a, hairD: 0xb88a42, eye: '#3d6fd8', style: 'spiky',
    outfit: 'knight'},
  mage: {name: 'จอมเวท', weapon: 'staff', hair: 0x8a5530, hairD: 0x5e3519, eye: '#3f7fe0', style: 'short',
    outfit: 'robe', hat: 'wizard'},
  archer: {name: 'นักธนู', weapon: 'bow', hair: 0x8f5a2e, hairD: 0x5f3816, eye: '#3f9a4a', style: 'spiky',
    outfit: 'ranger'},
  rogue: {name: 'โจร (สาวปีศาจ)', weapon: 'spear', hair: 0xff8424, hairD: 0xd2501a, eye: '#d22a1e', style: 'long',
    outfit: 'devil', horns: true, elf: true, girl: true},
};

// ไล่เฉด toon 3 ระดับ (เงาคม ไม่ไล่สีเนียน)
const GRAD = (() => {
  const t = new T.DataTexture(new Uint8Array([110, 190, 255]), 3, 1, T.RedFormat);
  t.minFilter = t.magFilter = T.NearestFilter; t.needsUpdate = true; return t;
})();
const toon = (c, e = 0) => new T.MeshToonMaterial({color: c, gradientMap: GRAD, emissive: e ? c : 0, emissiveIntensity: e});

function faceTex(eye, closed, girl) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  const ex = [256 - 108, 256 + 108], ey = 124;
  for (const x of ex) {
    if (closed) {
      g.strokeStyle = '#3a2028'; g.lineWidth = 7; g.lineCap = 'round';
      g.beginPath(); g.arc(x, ey - 6, 30, .25 * Math.PI, .75 * Math.PI); g.stroke();
      continue;
    }
    // ตาขาว + ม่านตาไล่สี + รูม่านตา + ประกาย
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x, ey, 32, 40, 0, 0, Math.PI * 2); g.fill();
    const gr = g.createLinearGradient(0, ey - 36, 0, ey + 36);
    gr.addColorStop(0, '#1d1420'); gr.addColorStop(.45, eye); gr.addColorStop(1, '#ffffffcc');
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, ey + 3, 25, 35, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#140c14'; g.beginPath(); g.ellipse(x, ey + 2, 11, 17, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x - 9, ey - 13, 9, 11, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x + 9, ey + 15, 4, 0, Math.PI * 2); g.fill();
    // ขนตาบน
    g.strokeStyle = '#2a1820'; g.lineWidth = 8; g.lineCap = 'round';
    g.beginPath(); g.ellipse(x, ey + 2, 34, 42, 0, 1.12 * Math.PI, 1.88 * Math.PI); g.stroke();
    if (girl) { g.lineWidth = 5; g.beginPath(); g.moveTo(x + (x < 256 ? -30 : 30), ey - 22); g.lineTo(x + (x < 256 ? -42 : 42), ey - 30); g.stroke(); }
  }
  // คิ้ว / แก้ม / ปาก
  g.strokeStyle = '#5a3a30'; g.lineWidth = 5;
  for (const x of ex) { g.beginPath(); g.moveTo(x - 22, ey - 62); g.quadraticCurveTo(x, ey - 70, x + 22, ey - 63); g.stroke(); }
  g.fillStyle = 'rgba(255,120,130,.38)';
  for (const x of ex) { g.beginPath(); g.ellipse(x + (x < 256 ? -10 : 10), ey + 58, 26, 11, 0, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = '#8a3a3a'; g.lineWidth = 5; g.beginPath(); g.moveTo(244, 196); g.quadraticCurveTo(256, 204, 268, 196); g.stroke();
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t;
}

export function buildChibi(cls) {
  const D = CHIBI[cls];
  const root = new T.Group(); root.name = 'chibi_' + cls;
  const bones = {};
  const B = (n, p, x, y, z) => { const o = new T.Object3D(); o.name = n; o.position.set(x, y, z); (p ? bones[p] : root).add(o); bones[n] = o; return o; };
  B('hips', null, 0, .36, 0); B('spine', 'hips', 0, .06, 0); B('chest', 'spine', 0, .1, 0); B('neck', 'chest', 0, .1, 0); B('head', 'neck', 0, .04, 0);
  for (const [s, k] of [['left', 1], ['right', -1]]) {
    B(s + 'UpperLeg', 'hips', .055 * k, -.02, 0); B(s + 'LowerLeg', s + 'UpperLeg', 0, -.16, 0); B(s + 'Foot', s + 'LowerLeg', 0, -.14, 0);
    B(s + 'UpperArm', 'chest', .1 * k, .07, 0); B(s + 'LowerArm', s + 'UpperArm', .12 * k, 0, 0); B(s + 'Hand', s + 'LowerArm', .11 * k, 0, 0);
  }
  const add = (bone, geo, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) => {
    const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.set(rx, ry, rz); bones[bone].add(m); return m;
  };
  const sph = r => new T.SphereGeometry(r, 24, 16);
  const cap = (r, l) => new T.CapsuleGeometry(r, l, 6, 12);
  const cyl = (a, b, h, n = 16) => new T.CylinderGeometry(a, b, h, n);
  const skin = toon(SKIN), hair = toon(D.hair), hairD = toon(D.hairD);

  /* ---------- สีชุดตามอาชีพ ---------- */
  const O = {
    knight: {top: 0xc9d2de, topD: 0x8792a4, low: 0x3a3f4e, boot: 0x9aa4b4, glove: 0x8792a4, trim: 0xe0b040, sleeve: 0x3a3f4e},
    robe: {top: 0x2e3a86, topD: 0x1f2760, low: 0x2e3a86, boot: 0x4a2e1e, glove: SKIN, trim: 0xe8c050, sleeve: 0x2e3a86},
    ranger: {top: 0x64773a, topD: 0x46552a, low: 0x5a4430, boot: 0x5a3a22, glove: 0x7a5232, trim: 0x8a5a30, sleeve: 0x64773a},
    devil: {top: 0x26222e, topD: 0x18151e, low: 0x26222e, boot: 0x26222e, glove: 0x26222e, trim: 0xff6a1a, sleeve: SKIN},
  }[D.outfit];
  const top = toon(O.top), topD = toon(O.topD), low = toon(O.low), boot = toon(O.boot), glove = O.glove === SKIN ? skin : toon(O.glove), trim = toon(O.trim, .1);

  /* ---------- ขา ---------- */
  for (const [s, k] of [['left', 1], ['right', -1]]) {
    add(s + 'UpperLeg', cap(.036, .1), D.outfit === 'devil' ? skin : low, 0, -.08, 0);
    add(s + 'LowerLeg', cap(.033, .09), D.outfit === 'devil' ? boot : low, 0, -.07, 0);
    add(s + 'Foot', sph(.045), boot, 0, -.012, .022, .9, .62, 1.45);
    add(s + 'LowerLeg', cyl(.042, .038, .07), boot, 0, -.1, 0);                       // ข้อบูท
    if (D.outfit === 'devil' || D.outfit === 'knight') add(s + 'LowerLeg', new T.TorusGeometry(.04, .008, 6, 16), trim, 0, -.065, 0, 1, 1, 1, Math.PI / 2);
  }
  /* ---------- ลำตัว ---------- */
  add('hips', sph(.085), D.outfit === 'devil' ? low : low, 0, .015, 0, 1.08, .75, .9);
  add('chest', sph(.092), D.outfit === 'devil' ? skin : top, 0, -.02, 0, 1, 1.15, .82);
  add('neck', cyl(.03, .034, .06, 10), skin, 0, .01, 0);
  if (D.outfit === 'robe') {
    add('hips', cyl(.1, .21, .4, 20), top, 0, -.12, 0);
    add('hips', new T.TorusGeometry(.205, .012, 6, 28), trim, 0, -.31, 0, 1, 1, 1, Math.PI / 2);
    add('hips', new T.BoxGeometry(.03, .38, .01), trim, 0, -.12, .155, 1, 1, 1, -.27);
    add('hips', new T.TorusGeometry(.098, .012, 6, 24), trim, 0, .07, 0, 1, 1, 1, Math.PI / 2);
    add('chest', new T.TorusGeometry(.055, .014, 6, 20), trim, 0, .085, 0, 1, 1, 1, Math.PI / 2);
  } else if (D.outfit === 'ranger') {
    add('hips', cyl(.09, .125, .15, 18), top, 0, -.06, 0);
    add('hips', new T.TorusGeometry(.092, .013, 6, 22), toon(0x4a3020), 0, .02, 0, 1, 1, 1, Math.PI / 2);
    add('hips', new T.BoxGeometry(.03, .025, .01), toon(0xe0b040, .1), 0, .02, .093);
    add('chest', new T.BoxGeometry(.02, .22, .012), toon(0x5a3a22), 0, 0, .075, 1, 1, 1, 0, 0, .75);   // สายพาดอก
    const q = add('chest', cyl(.035, .03, .24, 12), toon(0x7a4a28), -.04, .04, -.1, 1, 1, 1, .15, 0, .55);   // ซองธนู
    for (let i = 0; i < 3; i++) q.add(Object.assign(new T.Mesh(new T.BoxGeometry(.012, .05, .03), toon(0xd84030)), {position: new T.Vector3(-.015 + i * .015, .14, 0)}));
  } else if (D.outfit === 'knight') {
    add('chest', sph(.1), top, 0, -.01, .005, 1.02, 1.08, .86);
    add('hips', cyl(.095, .13, .13, 8), topD, 0, -.05, 0);
    add('hips', new T.TorusGeometry(.097, .012, 6, 22), trim, 0, .02, 0, 1, 1, 1, Math.PI / 2);
    const cape = add('chest', new T.BoxGeometry(.2, .36, .012), toon(0xc0302c), 0, -.12, -.085, 1, 1, 1, .16);
    cape.name = 'cape';
    add('chest', new T.TorusGeometry(.06, .012, 6, 20), trim, 0, .085, 0, 1, 1, 1, Math.PI / 2);
  } else if (D.outfit === 'devil') {
    add('chest', sph(.094), top, 0, .02, .004, 1.02, .55, .86);                         // เกราะอก
    add('chest', new T.TorusGeometry(.083, .009, 6, 22), trim, 0, -.025, .004, 1, 1, .85, Math.PI / 2);
    add('hips', cyl(.092, .15, .13, 10), low, 0, -.04, 0);                              // กระโปรงเกราะ
    add('hips', new T.TorusGeometry(.094, .011, 6, 22), trim, 0, .02, 0, 1, 1, 1, Math.PI / 2);
    add('hips', new T.ConeGeometry(.025, .045, 3), trim, 0, -.03, .125, 1, 1, .4, Math.PI);
  }
  /* ---------- แขน ---------- */
  for (const [s, k] of [['left', 1], ['right', -1]]) {
    add(s + 'UpperArm', cap(.03, .07), D.outfit === 'devil' ? skin : toon(O.sleeve), .06 * k, 0, 0, 1, 1, 1, 0, 0, Math.PI / 2);
    if (D.outfit === 'robe') add(s + 'LowerArm', cyl(.035, .062, .1, 14), top, .045 * k, 0, 0, 1, 1, 1, 0, 0, k * Math.PI / 2);
    else add(s + 'LowerArm', cap(.028, .065), glove, .055 * k, 0, 0, 1, 1, 1, 0, 0, Math.PI / 2);
    add(s + 'Hand', sph(.032), glove === skin || D.outfit === 'robe' ? skin : glove, .012 * k, 0, 0);
    const pad = {knight: [top, .062], devil: [top, .05], ranger: [toon(0x7a5232), .045]}[D.outfit];
    if (pad) add(s + 'UpperArm', sph(pad[1]), pad[0], .015 * k, .02, 0, 1.05, .8, 1);
  }
  if (D.outfit === 'knight') {   // โล่ที่แขนซ้าย
    const sh = add('leftLowerArm', cyl(.11, .11, .022, 24), toon(0x2f56b0), .05, 0, .05, 1, 1, 1, Math.PI / 2);
    sh.add(Object.assign(new T.Mesh(new T.TorusGeometry(.11, .012, 6, 28), trim), {}));
    sh.children[0].rotation.x = Math.PI / 2;
    const emb = new T.Mesh(new T.OctahedronGeometry(.035), trim); emb.position.y = .015; emb.scale.set(1, .4, 1); sh.add(emb);
  }

  /* ---------- หัว ---------- */
  const HC = .17, R = .2;
  add('head', sph(R), skin, 0, HC, 0, 1.05, .95, 1);
  const open = faceTex(D.eye, false, D.girl), closed = faceTex(D.eye, true, D.girl);
  const faceMat = new T.MeshBasicMaterial({map: open, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2});
  add('head', new T.SphereGeometry(R * 1.004, 32, 16, Math.PI / 2 - .95, 1.9, 1.0, 1.3), faceMat, 0, HC, 0, 1.05, .95, 1).renderOrder = 2;
  if (D.elf) for (const k of [1, -1]) add('head', new T.ConeGeometry(.035, .15, 8), skin, .2 * k, HC + .02, -.01, 1, 1, .55, 0, 0, -k * (Math.PI / 2 - .35));
  // ผม: หมวกผม + หน้าม้า + ปอยข้าง
  add('head', sph(R * 1.08), hair, 0, HC + .035, -.035, 1.07, 1.0, 1.06);
  for (let i = -3; i <= 3; i++) {
    const x = i * .045, y = HC + .14 - Math.abs(i) * .012, z = .155 - Math.abs(i) * .022;
    add('head', sph(.05), i % 2 ? hairD : hair, x, y, z, .95, 2.0, .6, -.45, 0, -i * .12);
  }
  for (const k of [1, -1]) add('head', sph(.045), hair, .19 * k, HC - .02, .05, .85, 2.6, .9, .1, 0, k * .12);
  if (D.style === 'spiky') {
    const dirs = [[0, 1, -.2], [.5, .8, -.3], [-.5, .8, -.3], [.3, .6, -.75], [-.3, .6, -.75], [0, .35, -1], [.7, .45, -.55], [-.7, .45, -.55]];
    for (const d of dirs) {
      const v = new T.Vector3(...d).normalize(), m = add('head', new T.ConeGeometry(.055, .14, 8), hair, 0, 0, 0);
      m.position.set(v.x * R * 1.05, HC + .035 + v.y * R * 1.0, -.035 + v.z * R * 1.05);
      m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v);
    }
  } else if (D.style === 'long') {
    add('head', sph(.2), hair, 0, HC - .13, -.12, 1.15, 1.7, .55);
    add('head', sph(.08), hairD, .12, HC - .32, -.1, .9, 1.9, .7);
    add('head', sph(.08), hairD, -.12, HC - .32, -.1, .9, 1.9, .7);
    for (const k of [1, -1]) add('head', sph(.05), hair, .2 * k, HC - .14, .03, .8, 3.0, .8, .05, 0, k * .1);
  } else {
    add('head', sph(.17), hair, 0, HC - .04, -.1, 1.15, 1.05, .8);
  }
  if (D.horns) for (const k of [1, -1]) {
    const h1 = add('head', new T.ConeGeometry(.032, .13, 10), toon(0x24202c), .11 * k, HC + .2, .02, 1, 1, 1, 0, 0, -k * .55);
    const h2 = add('head', new T.ConeGeometry(.022, .1, 10), toon(0x24202c), .17 * k, HC + .29, -.01, 1, 1, 1, -.15, 0, k * .35);
    h1.name = h2.name = 'horn';
  }
  if (D.hat === 'wizard') {
    const hm = toon(0x2e3a86), hd = toon(0x1f2760);
    add('head', cyl(.31, .31, .022, 32), hd, 0, HC + .17, -.01, 1, 1, 1, -.1);
    add('head', cyl(.07, .205, .25, 24), hm, 0, HC + .3, -.025, 1, 1, 1, -.1);
    add('head', new T.ConeGeometry(.07, .2, 16), hm, 0, HC + .5, -.09, 1, 1, 1, -.75);
    add('head', new T.TorusGeometry(.19, .016, 6, 28), trim, 0, HC + .2, -.012, 1, 1, 1, Math.PI / 2 - .1);
    add('head', new T.OctahedronGeometry(.03), toon(0xffe080, .4), 0, HC + .27, .18, 1, 1, .5);
  }

  root.traverse(o => { if (o.isMesh) o.frustumCulled = false; });
  let blink = 0;
  return {
    scene: root, meta: {chibi: true, cls, weapon: D.weapon, name: D.name},
    humanoid: {
      getRawBoneNode: n => bones[n] || null, getNormalizedBoneNode: n => bones[n] || null,
      resetNormalizedPose() { for (const b of Object.values(bones)) b.quaternion.identity(); bones.hips.position.set(0, .36, 0); },
      update() {},
    },
    expressionManager: {setValue(n, v) { if (n === 'blink') blink = v; }},
    update() { faceMat.map = blink > .5 ? closed : open; },
  };
}
