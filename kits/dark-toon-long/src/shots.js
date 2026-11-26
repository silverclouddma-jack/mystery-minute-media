// MYSTERY MINUTE · DARK TOON LONG-FORM (16:9): a data-driven compilation. volume.json + script.json "beats"
// (tools/make_script.py). Per case: title card · setup (lineup or host) · statements · the note (code cases) ·
// evidence chips · question band + silent 5 s countdown · reveal (ring/stamp/OUT, or the decoded answer) · score.
// Plus the cold open, the casebook plug after case 3, and the close.
import * as THREE from 'three';
import { ctx, clamp, lerp, seg, eo, eio } from './core/lib.js';
import { L, Le } from './core/timing.js';
import { camera } from './core/engine.js';
import * as WD from './core/world.js';
import { Toon, PROPS } from './core/toon.js';
import * as UI from './ui.js';

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mix = (a, b, k) => a.clone().lerp(b, k);
const talk = (t) => 0.25 + 0.75 * Math.abs(Math.sin(t * 13)) * (0.6 + 0.4 * Math.sin(t * 5.3));
const blink = (t, off = 0) => (((t + off) % 3.3) < 0.12 ? 1 : 0);
const TINT = '#CFCBDD';
const HOST = { body: '#8A6E4A', pattern: 'plain', hat: 'fedora', hatCol: '#C8302A', band: '#1F1C33', neck: 'collar', neckCol: '#6E5638' };
const DEFAULT_LOOKS = [
  { body: '#8A5A7A', hat: 'bun', hatCol: '#3A2A22', pattern: 'apron', patCol: '#C9BFA8' },
  { body: '#4F7A9A', hat: 'cap', hatCol: '#5A4A3A', neck: 'scarf', neckCol: '#9A4A3A' },
  { body: '#6F8A5A', hat: 'flower', hatCol: '#C98AA0', neck: 'collar' },
  { body: '#3E4A6A', hat: 'bowler', hatCol: '#2A3040', neck: 'tie', neckCol: '#8A6514' },
];

function stormTex() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 768; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 768); gr.addColorStop(0, '#141A2C'); gr.addColorStop(1, '#2C3A5A'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 768);
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(120,135,170,${0.10 + (i % 5) * 0.03})`; g.beginPath(); g.ellipse((i * 173) % 1024, 120 + (i * 97) % 380, 160 + (i % 4) * 50, 50 + (i % 3) * 18, 0, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(200,215,255,0.35)'; g.lineWidth = 1.5; for (let i = 0; i < 160; i++) { const x = (i * 61) % 1024, y = (i * 137) % 768; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 10, y + 34); g.stroke(); }
  g.fillStyle = '#080A10'; for (let i = 0; i < 14; i++) { const w = 60 + (i * 37) % 70, h = 120 + (i * 53) % 200; g.fillRect(i * 76, 768 - h, w, h); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function buildShots(E) {
  const VOL = window.VOL, B = window.BEATS, CASES = VOL.cases, NC = CASES.length, FEAT = VOL.featured || 0;
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(30);
  const LOOK = { bloom: 0.5, bloomThreshold: 0.72, exposure: 1.0, vignette: 0.55, grain: 0.04, sat: 0.95, warm: 0.02 };

  // ── the night room (one set for the whole volume) ──
  const R = WD.interior(E, { wall: VOL.wall || '#2B2731', motif: VOL.motif || '#35303D', floor: VOL.floor || '#4A3A30', ceiling: '#15141A', bulbs: false, signText: null, picture: false, counterOn: false, litter: false, view: stormTex() });
  const scene = R.scene; scene.background = new THREE.Color('#07080C'); scene.environmentIntensity = 0.06;
  scene.traverse((o) => { if (o.isHemisphereLight) o.intensity = 0.3; else if (o.isDirectionalLight) { o.color.set('#5A6FA8'); o.intensity = 0.55; } else if (o.isPointLight) o.intensity = 0.9; });
  R.window.material.color.set('#9AA6C8');
  const spot = new THREE.SpotLight('#F1D9A6', 85, 14, 0.7, 0.55, 1.6); spot.position.set(0, 4.0, -1.6); spot.target.position.set(0, 0, -2.6);
  spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0005; scene.add(spot, spot.target);
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.3, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#2A2620', side: THREE.DoubleSide, roughness: 0.6 })); lampShade.position.set(0, 3.95, -1.6); scene.add(lampShade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshBasicMaterial({ color: '#C9B48A' })); bulb.position.set(0, 3.82, -1.6); scene.add(bulb);
  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.7), WD.mat({ color: '#3B2C22' })); desk.position.set(2.6, 0.4, -4.4); desk.castShadow = desk.receiveShadow = true; scene.add(desk);
  const ped = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.05, 0.55), WD.mat({ color: '#3A332C' })); ped.position.set(-2.7, 0.52, -4.2); ped.castShadow = ped.receiveShadow = true; scene.add(ped);
  const dl = new THREE.PointLight('#F1D9A6', 6, 3, 2); dl.position.set(2.6, 1.3, -4.2); scene.add(dl);

  // ── people: one lineup group per case (only the current one is visible) ──
  const Z = -2.6;
  const CAST = CASES.map((C) => {
    const ss = C.format === 'code' ? (C.suspects || []) : C.suspects; const n = ss.length, sp = n >= 4 ? 0.9 : 1.05;
    const xs = ss.map((_, i) => (i - (n - 1) / 2) * sp);
    const g = new THREE.Group(); g.visible = false; scene.add(g);
    const ppl = ss.map((s, i) => { const lk = s.look || DEFAULT_LOOKS[i % 4]; const p = new Toon({ ...lk, extra: [...(lk.extra || [])] }, { height: 1.72 }); p.tint(TINT).at(xs[i], 0, Z); g.add(p.group); return p; });
    return { g, ppl, xs };
  });
  const host = new Toon(HOST, { height: 1.8 }); host.tint(TINT).at(0.95, 0, -0.7); scene.add(host.group);
  let curCase = -1; const showCase = (k) => { if (curCase === k) return; CAST.forEach((c, i) => (c.g.visible = i === k)); curCase = k; };
  const proj = (v) => { const p = v.clone().project(cam); return [(p.x + 1) / 2 * 1920, (1 - p.y) / 2 * 1080]; };
  const shoot = (from, to, at, at2, k, look = {}, fov = 30) => {
    if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k)); const tgt = at2 ? mix(at, at2, k) : at; cam.lookAt(tgt); cam.updateMatrixWorld();
    CAST.forEach((c) => c.ppl.forEach((p) => p.face(cam))); host.face(cam);
    E.render(scene, cam, { ...LOOK, aperture: 0.0009, maxblur: 0.006, focus: cam.position.distanceTo(tgt), ...look });
  };
  const pose = (k, t, moods = {}, talkI = -1) => CAST[k].ppl.forEach((p, i) => p.set({ mood: moods[i] || 'neutral', blink: blink(t, i * 0.9), talk: i === talkI ? talk(t) : 0, look: [Math.round(Math.sin(t * 0.7 + i) * 3) / 10, 0] }));
  const W1 = V3(0, 1.35, 3.5), W2 = V3(0, 1.32, 3.0), WA = V3(0, 0.95, Z);
  const plates = (k, dim = -1) => CAST[k].ppl.forEach((_, i) => { const [x, y] = proj(V3(CAST[k].xs[i], 0, Z)); UI.plate(CASES[k].suspects[i].name, x, Math.min(y + 26, 845), 1, { col: i === dim ? UI.P.steel : UI.P.cream }); });
  const hostShot = (lt, d, t, mood = 'sly', up = 1) => {
    host.group.visible = true;
    host.set({ mood, blink: blink(t), armR: [Math.round(lerp(20, 125, up)), Math.round(lerp(10, 40, up))], holdR: PROPS.magnifier, armL: [10, 30] });
    shoot(V3(0.2, 1.5, 2.3), V3(0.32, 1.5, 1.95), V3(0.4, 1.25, -0.7), null, eio(clamp(lt / d)), { aperture: 0.003, maxblur: 0.012 }, 34);
  };

  // cached blurred background per case (one render each, per page)
  const BG = {};
  const bg = (k, lt, d, a = 0.4) => {
    if (!BG[k]) { showCase(k); host.group.visible = false; pose(k, 0); shoot(W1, W1, WA, null, 0, { aperture: 0.02, maxblur: 0.02, focus: 1.2 }); const c = document.createElement('canvas'); c.width = 1920; c.height = 1080; c.getContext('2d').drawImage(document.getElementById('gl'), 0, 0, 1920, 1080); BG[k] = c; }
    const s = 1 + 0.04 * clamp(lt / Math.max(d, 1)); ctx.drawImage(BG[k], 960 - 960 * s, 540 - 540 * s, 1920 * s, 1080 * s); UI.darken(a);
  };
  const cover = new Image(); cover.src = 'data/cover.jpg';
  const drawCover = (k, x = 430, y = 470, w = 380, rot = -0.05) => { if (!(cover.complete && cover.naturalWidth) || k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(UI.pop(k), UI.pop(k)); const h = w * cover.naturalHeight / cover.naturalWidth; ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-w / 2 + 12, -h / 2 + 14, w, h); ctx.drawImage(cover, -w / 2, -h / 2, w, h); ctx.restore(); };
  const hideCap = [];
  window.NOCAP = (t) => hideCap.some(([a, b]) => t > a && t < b);

  // ── cold open: host + the featured lineup behind him ──
  const FC = CASES[FEAT];
  add({ id: 'open', at: 0, draw: (lt, d, t, blit) => {
    showCase(FEAT); pose(FEAT, t, { 0: 'worried', 1: 'sly', 2: 'shock', 3: 'angry' }); hostShot(lt, d, t, 'sly', 1);
    blit(); UI.itemCard('FEATURED CASE · ' + FC.title.toUpperCase(), FC.item, 1); UI.pill(`${NC} CASES · ONLY 1% SOLVE ALL`, 430, 300, { k: seg(lt, 0.2, 0.5), px: 30 });
  } });

  // ── the cases ──
  CASES.forEach((C, k) => {
    const b = B.cases[k], cx = CAST[k].xs, isCode = C.format === 'code', A = C.answer;
    const head = `CASE ${k + 1} OF ${NC}`;
    add({ id: `c${k}-title`, at: cut(b.title), draw: (lt, d, t) => { bg(k, lt, d, 0.55); UI.dots(NC, k); UI.titleCard(k + 1, NC, C.title, seg(lt, 0, 0.3)); } });
    cue(cut(b.title), 'whoosh');
    if (b.setup.length) add({ id: `c${k}-setup`, at: cut(b.setup[0]), draw: (lt, d, t, blit) => {
      if (isCode && !cx.length) { showCase(k); hostShot(lt, d, t, 'neutral', 0); } else { showCase(k); host.group.visible = false; pose(k, t); shoot(W1, W2, WA, null, eio(clamp(lt / d))); }
      blit(); UI.dots(NC, k); UI.itemCard(head + ' · ' + C.title.toUpperCase(), C.item, 1); if (cx.length) plates(k);
    } });
    b.suspects.forEach((li, i) => {
      const s = C.suspects[i];
      add({ id: `c${k}-s${i}`, at: cut(li), draw: (lt, d, t, blit) => {
        showCase(k); host.group.visible = false; pose(k, t, { [i]: 'worried' }, i); const x = cx[i];
        shoot(V3(x - 0.45, 1.35, 0.55), V3(x - 0.4, 1.35, 0.25), V3(x - 0.78, 1.08, Z), null, eio(clamp(lt / d)), { aperture: 0.0016, maxblur: 0.01 });
        blit(); { const gr = ctx.createLinearGradient(0, 0, 1050, 0); gr.addColorStop(0, 'rgba(6,7,10,0.78)'); gr.addColorStop(0.75, 'rgba(6,7,10,0.55)'); gr.addColorStop(1, 'rgba(6,7,10,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, 1050, 1080); } UI.dots(NC, k); UI.statement(s.name, s.role, s.slip, seg(t, L(li) + 0.1, Le(li) - 0.2), 90, 190, 820);
      } });
      cue(cut(li), 'whoosh'); cue(L(li) + 0.1, 'pop');
    });
    if (isCode) { add({ id: `c${k}-note`, at: cut(b.note), draw: (lt, d, t) => { bg(k, lt, d, 0.5); UI.dots(NC, k); UI.note(C.note, seg(t, L(b.note) - 0.05, L(b.note) + 0.3), 460, 300, 1000); } }); cue(L(b.note), 'pop'); }
    const chips = (upto, t, lit, x, y, w, px = 38) => { C.clues.forEach((c, m) => { if (m > upto) return; const kk = m === lit ? seg(t, L(b.clues[m]) - 0.05, L(b.clues[m]) + 0.25) : 1; y += UI.chip(c.label, c.text, x, y, w, kk, { lit: m === lit, px }) + 30; }); return y; };
    b.clues.forEach((li, j) => {
      add({ id: `c${k}-e${j}`, at: cut(li), draw: (lt, d, t) => {
        bg(k, lt, d); UI.dots(NC, k); UI.pill('THE EVIDENCE', isCode ? 560 : 960, 110, { k: 1 });
        if (isCode) { UI.note(C.note, 1, 1000, 170, 840); chips(j, t, j, 80, 180, 860); } else chips(j, t, j, 260, 180, 1400);
      } });
      cue(L(li), 'tock');
    });
    // question band + countdown
    const cdS = Le(b.ask) + 0.15, cdE = L(b.reveal) - 0.1; hideCap.push([L(b.ask) - 0.05, L(b.reveal) - 0.05]);
    add({ id: `c${k}-ask`, at: cut(b.ask), note: 'question + countdown', draw: (lt, d, t) => {
      bg(k, lt, d, 0.5); UI.dots(NC, k);
      if (isCode) { UI.note(C.note, 1, 1000, 110, 840); let y = 130; C.clues.forEach((c) => { y += UI.chip(c.label, c.text, 80, y, 860, 1, { px: 32 }) + 24; }); }
      else {
        let y = 110;
        if (C.format === 'liar') C.suspects.forEach((s) => { UI.wrap(s.name + ': ' + s.slip, 820, UI.MONO(32)).forEach((l, q) => { UI.text(l, 80, y, 32, q === 0 ? UI.P.cream : '#CFC6B2', 'left'); y += 40; }); y += 14; });
        let y2 = 110; const cxL = C.format === 'liar' ? 1000 : 260, cw = C.format === 'liar' ? 840 : 1400;
        C.clues.forEach((c) => { y2 += UI.chip(c.label, c.text, cxL, y2 + 14, cw, 1, { px: 32 }) + 24; });
      }
      const n = Math.max(1, 5 - Math.floor((t - cdS) / ((cdE - cdS) / 5)));
      UI.band(C.question, seg(t, L(b.ask) - 0.05, L(b.ask) + 0.3), t >= cdS, n, clamp((t - cdS) / (cdE - cdS)));
    } });
    for (let n = 0; n < 5; n++) cue(cdS + n * (cdE - cdS) / 5, 'tock', { gain: 0.8 });
    // reveal (through the score line)
    const w0 = b.why.length ? L(b.why[0]) : Le(b.reveal), w1 = b.why.length ? Le(b.why[b.why.length - 1]) : Le(b.reveal) + 0.5;
    const others = cx.map((_, i) => i).filter((i) => i !== A), span = (w1 - w0) / Math.max(1, others.length);
    add({ id: `c${k}-reveal`, at: cut(b.reveal), draw: (lt, d, t, blit) => {
      if (isCode && !cx.length) {
        bg(k, lt, d, 0.5); UI.dots(NC, k); UI.note(C.note, 1, 460, 260, 1000, C.answerText, seg(t, L(b.reveal) + 0.1, L(b.reveal) + 0.5));
      } else {
        showCase(k); host.group.visible = false; const moods = {}; cx.forEach((_, i) => (moods[i] = i === A ? 'shock' : 'neutral')); pose(k, t, moods);
        shoot(W1, V3(cx[A] * 0.3, 1.33, 2.9), WA, V3(cx[A] * 0.35, 0.95, Z), eio(seg(lt, 0, 0.9)));
        blit(); UI.dots(NC, k); plates(k, A);
        const [hx, hy] = proj(V3(cx[A], 0.95, Z)), [, ty] = proj(V3(cx[A], 1.95, Z));
        UI.ring(hx, hy - 6, 120, 270, seg(t, L(b.reveal) + 0.05, L(b.reveal) + 0.55));
        UI.stamp(C.stamp || (C.format === 'liar' ? 'LIAR' : 'THIEF'), hx, Math.max(70, ty - 50), seg(t, L(b.reveal) + 0.25, L(b.reveal) + 0.45));
        const oth = C.format === 'liar' ? 'TRUTH' : 'OUT';
        others.forEach((i, o) => { const [ox0, oy] = proj(V3(cx[i], 0.95, Z)); UI.stamp(oth, clamp(ox0, 140, 1780), oy, seg(t, w0 + o * span, w0 + o * span + 0.25), { col: UI.P.cream, px: 40, rot: 0.1, sub: (C.out && C.out[i]) || '' }); });
        if (isCode && C.answerText) UI.pill(C.answerText, 960, 120, { bg: UI.P.red, fg: UI.P.cream, px: 40, k: seg(t, L(b.reveal) + 0.1, L(b.reveal) + 0.4) });
      }
      UI.pill('+1 POINT IF YOU GOT IT', 1660, 1030, { k: seg(t, L(b.score) - 0.05, L(b.score) + 0.25), px: 28 });
    } });
    cue(L(b.reveal) + 0.25, 'stamp'); others.forEach((_, o) => cue(w0 + o * span + 0.1, 'thud', { gain: 0.6 }));
  });

  if (B.plug != null) {
    add({ id: 'plug', at: cut(B.plug), draw: (lt, d, t, blit) => { showCase(-1); hostShot(lt, d, t, 'smug', 1); blit(); drawCover(seg(lt, 0.1, 0.45)); UI.pill('5 FREE CASES · MYSTERYMINUTEHQ.COM', 430, 900, { k: seg(lt, 0.4, 0.7), px: 28 }); } });
    cue(cut(B.plug), 'whoosh');
  }

  // ── close ──
  add({ id: 'close', at: cut(B.close[0]), draw: (lt, d, t, blit) => {
    showCase(-1); hostShot(lt, d, t, 'smug', 1); blit(); drawCover(seg(lt, 0.1, 0.45));
    UI.pill(`COMMENT YOUR SCORE OUT OF ${NC}`, 430, 860, { k: seg(lt, 0.2, 0.5), px: 30 }); UI.pill('50 CASES · MYSTERYMINUTEHQ.COM', 430, 930, { k: seg(lt, 0.4, 0.7), px: 30 });
  } });
  cue(cut(B.close[0]), 'whoosh');
  return { shots: S, cues: CUES };
}
