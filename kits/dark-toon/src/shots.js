// MYSTERY MINUTE · DARK TOON: a data-driven shot list. Everything comes from case.json + script.json "beats"
// (tools/make_script.py), so a new case needs no code. Beats: hook · setup[] · examine · suspects[] · clues[] ·
// question (+ silent 5 s countdown) · reveal · why[] · close.
// Look (claude/mm-style-test.md): dim room, one warm lamp over the lineup, storm/night window, unlit toon cut-outs tinted
// #CFCBDD, FreeMono cream captions, paper slips, dark record chips with brass tabs, red only for the question + answer.
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

function stormTex(kind = 'storm') {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 768; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 768); gr.addColorStop(0, kind === 'storm' ? '#141A2C' : '#0C1224'); gr.addColorStop(1, kind === 'storm' ? '#2C3A5A' : '#1B2846'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 768);
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(${kind === 'storm' ? '120,135,170' : '90,110,150'},${0.10 + (i % 5) * 0.03})`; g.beginPath(); g.ellipse((i * 173) % 1024, 120 + (i * 97) % 380, 160 + (i % 4) * 50, 50 + (i % 3) * 18, 0, 0, 7); g.fill(); }
  if (kind === 'storm') { g.strokeStyle = 'rgba(200,215,255,0.35)'; g.lineWidth = 1.5; for (let i = 0; i < 160; i++) { const x = (i * 61) % 1024, y = (i * 137) % 768; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 10, y + 34); g.stroke(); } }
  else { g.fillStyle = '#E6E1CF'; g.beginPath(); g.arc(760, 170, 54, 0, 7); g.fill(); for (let i = 0; i < 70; i++) { g.fillStyle = 'rgba(230,225,207,0.7)'; g.fillRect((i * 149) % 1024, (i * 83) % 420, 2, 2); } }
  g.fillStyle = '#080A10'; for (let i = 0; i < 14; i++) { const w = 60 + (i * 37) % 70, h = 120 + (i * 53) % 200; g.fillRect(i * 76, 768 - h, w, h); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function buildShots(E) {
  const C = window.CASE, B = window.BEATS;
  const S = [], CUES = [], add = (o) => (S.push(o), o), cue = (t, type, o = {}) => CUES.push({ t: +t.toFixed(3), type, ...o });
  const cut = (i) => (i === 0 ? 0 : L(i) - 0.06);
  const cam = camera(56);
  const LOOK = { bloom: 0.5, bloomThreshold: 0.72, exposure: 1.0, vignette: 0.6, grain: 0.04, sat: 0.95, warm: 0.02 };

  // ── the night room ──────────────────────────────────────────────────
  const st = C.set || {};
  const R = WD.interior(E, { wall: st.wall || '#2B2731', motif: st.motif || '#35303D', floor: st.floor || '#4A3A30', ceiling: '#15141A', bulbs: false, signText: null, picture: false, counterOn: false, litter: false, view: stormTex(st.sky || 'storm') });
  const scene = R.scene; scene.background = new THREE.Color('#07080C'); scene.environmentIntensity = 0.06;
  scene.traverse((o) => {
    if (o.isHemisphereLight) o.intensity = 0.3;
    else if (o.isDirectionalLight) { o.color.set('#5A6FA8'); o.intensity = 0.55; }
    else if (o.isPointLight) o.intensity = 0.9;
  });
  R.window.material.color.set('#9AA6C8');
  const spot = new THREE.SpotLight('#F1D9A6', 85, 14, 0.62, 0.55, 1.6); spot.position.set(0, 4.0, -1.6); spot.target.position.set(0, 0, -2.6);
  spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0005; scene.add(spot, spot.target);
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.3, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#2A2620', side: THREE.DoubleSide, roughness: 0.6 })); lampShade.position.set(0, 3.95, -1.6); scene.add(lampShade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), new THREE.MeshBasicMaterial({ color: '#C9B48A' })); bulb.position.set(0, 3.82, -1.6); scene.add(bulb);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.6), new THREE.MeshBasicMaterial({ color: '#3A3328' })); cord.position.set(0, 4.25, -1.6); scene.add(cord);
  // a dim pedestal labelled with the missing item (left) and a desk (right); unlit labels stay dim so they don't bloom
  const ped = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.05, 0.55), WD.mat({ color: '#3A332C' })); ped.position.set(-2.7, 0.52, -4.2); ped.castShadow = ped.receiveShadow = true; scene.add(ped);
  const lab = WD.canvasTex('lab', 512, 160, (g) => { g.fillStyle = '#8E897E'; g.fillRect(0, 0, 512, 160); g.fillStyle = '#2A2620'; g.font = '700 44px FreeMono'; g.textAlign = 'center'; g.fillText('MISSING', 256, 70); g.font = '700 30px FreeMono'; g.fillText((C.item || '').slice(0, 26), 256, 120); });
  const lp = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.16), new THREE.MeshBasicMaterial({ map: lab, color: '#77726A', toneMapped: false })); lp.position.set(-2.7, 0.8, -3.92); scene.add(lp);
  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.7), WD.mat({ color: '#3B2C22' })); desk.position.set(2.6, 0.4, -4.4); desk.castShadow = desk.receiveShadow = true; scene.add(desk);
  const dl = new THREE.PointLight('#F1D9A6', 6, 3, 2); dl.position.set(2.6, 1.3, -4.2); scene.add(dl);

  // ── people ──────────────────────────────────────────────────────────
  const N = C.suspects.length, SP = N >= 4 ? 0.76 : 0.95, Z = -2.6;
  const xs = C.suspects.map((_, i) => (i - (N - 1) / 2) * SP);
  const sus = C.suspects.map((s, i) => { const lk = s.look || DEFAULT_LOOKS[i % 4]; const p = new Toon({ ...lk, extra: [...(lk.extra || [])] }, { height: 1.72 }); p.tint(TINT).at(xs[i], 0, Z); scene.add(p.group); return p; });
  const host = new Toon(HOST, { height: 1.8 }); host.tint(TINT).at(0.95, 0, -0.7); scene.add(host.group);
  const feet = (i) => V3(xs[i], 0, Z);
  const proj = (v) => { const p = v.clone().project(cam); return [(p.x + 1) / 2 * 1080, (1 - p.y) / 2 * 1920]; };
  const A = C.answer;

  const shoot = (from, to, at, at2, k, look = {}, fov = 56) => {
    if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    cam.position.copy(mix(from, to, k)); const tgt = at2 ? mix(at, at2, k) : at; cam.lookAt(tgt); cam.updateMatrixWorld();
    sus.forEach((p) => p.face(cam)); host.face(cam);
    E.render(scene, cam, { ...LOOK, aperture: 0.0009, maxblur: 0.006, focus: cam.position.distanceTo(tgt), ...look });
  };
  const pose = (t, moods = {}, talkI = -1) => sus.forEach((p, i) => p.set({ mood: moods[i] || 'neutral', blink: blink(t, i * 0.9), talk: i === talkI ? talk(t) : 0, look: [Math.round(Math.sin(t * 0.7 + i) * 3) / 10, 0] }));
  const W1 = V3(0, 1.45, 2.6), W2 = V3(0, 1.4, 2.15), WA = V3(0, 0.7, Z);
  const plates = (k, dim = -1) => sus.forEach((_, i) => { const [x, y] = proj(feet(i)); UI.plate(C.suspects[i].name, x, y + 34, k, { col: i === dim ? UI.P.steel : UI.P.cream }); });

  // cached blurred background (rendered once per page) for the evidence / question shots
  let BG = null;
  const bg = (lt, d) => {
    if (!BG) { host.group.visible = false; pose(0); shoot(W1, W1, WA, null, 0, { aperture: 0.02, maxblur: 0.02, focus: 1.2 }); BG = document.createElement('canvas'); BG.width = 1080; BG.height = 1920; BG.getContext('2d').drawImage(document.getElementById('gl'), 0, 0, 1080, 1920); }
    const s = 1 + 0.05 * clamp(lt / Math.max(d, 1)); ctx.drawImage(BG, 540 - 540 * s, 960 - 960 * s, 1080 * s, 1920 * s); UI.darken(0.38);
  };

  // ── hook (+ setup): the lineup under the lamp + the item card, on screen from frame 1 ──
  add({ id: 'hook', at: 0, note: 'lineup + item card from frame 1', draw: (lt, d, t, blit) => {
    host.group.visible = false; pose(t); shoot(W1, W2, WA, V3(0, 0.66, Z), eio(clamp(lt / d)));
    blit(); UI.itemCard(C.title, C.item, 1); plates(1);
  } });

  // ── examine: host with the magnifier ──
  add({ id: 'examine', at: cut(B.examine), draw: (lt, d, t, blit) => {
    host.group.visible = true; pose(t);
    const up = eo(seg(lt, 0, 0.5));
    host.set({ mood: 'sly', blink: blink(t), armR: [Math.round(lerp(20, 128, up)), Math.round(lerp(10, 40, up))], holdR: PROPS.magnifier, armL: [10, 30] });
    shoot(V3(0.55, 1.5, 1.6), V3(0.7, 1.52, 1.25), V3(0.95, 1.25, -0.7), null, eio(clamp(lt / d)), { aperture: 0.003, maxblur: 0.012 }, 44);
    blit(); UI.pill('EXAMINE THE EVIDENCE', 540, 250, { k: seg(lt, 0.05, 0.3) });
  } });
  cue(cut(B.examine), 'whoosh');

  // ── suspects: close on each, the statement typed on a paper slip ──
  B.suspects.forEach((li, i) => {
    const s = C.suspects[i];
    add({ id: 'suspect' + i, at: cut(li), draw: (lt, d, t, blit) => {
      host.group.visible = false; pose(t, { [i]: 'worried' }, i);
      const x = xs[i];
      shoot(V3(x * 0.55 + 0.15, 1.45, 1.25), V3(x * 0.6, 1.42, 0.95), V3(x, 1.02, Z), null, eio(clamp(lt / d)), { aperture: 0.0016, maxblur: 0.01 }, 44);
      blit(); UI.statement(s.name, s.role, s.slip, seg(t, L(li) + 0.1, Le(li) - 0.2), 90);
    } });
    cue(cut(li), 'whoosh'); cue(L(li) + 0.1, 'pop');
  });

  // ── clues: record chips stacked over the blurred room ──
  const chipW = 940;
  B.clues.forEach((li, j) => {
    add({ id: 'clue' + j, at: cut(li), note: 'cached background', draw: (lt, d, t) => {
      bg(lt, d); UI.pill('THE EVIDENCE', 540, 170, { k: 1 });
      let y = 260; C.clues.forEach((c, m) => { if (m > j) return; const k = m === j ? seg(t, L(li) - 0.05, L(li) + 0.25) : 1; y += UI.chip(c.label, c.text, 70, y, chipW, k, { lit: m === j }) + 34; });
    } });
    cue(L(li), 'tock');
  });

  // ── question + silent 5 s countdown, with everything needed on screen ──
  const qa = B.question, cdS = Le(qa) + 0.15, cdE = L(B.reveal) - 0.1;
  window.NOCAP = (t) => t > Le(qa) + 0.05 && t < L(B.reveal) - 0.05;
  add({ id: 'question', at: cut(qa), note: 'question + countdown', draw: (lt, d, t) => {
    bg(lt, d);
    let y = 120;
    if (C.format === 'liar') {
      C.suspects.forEach((s) => { UI.wrap(s.name + ': ' + s.slip, 900, UI.MONO(34)).forEach((l, k) => { ctx.font = UI.MONO(34); ctx.fillStyle = k === 0 ? UI.P.cream : '#CFC6B2'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(l, 90, y); y += 42; }); y += 12; });
      y += 10;
    }
    C.clues.forEach((c) => { y += UI.chip(c.label, c.text, 70, y, chipW, 1, { px: 32 }) + 22; });
    const n = Math.max(1, 5 - Math.floor((t - cdS) / ((cdE - cdS) / 5)));
    ctx.save(); ctx.globalAlpha = seg(t, L(qa) - 0.05, L(qa) + 0.3); UI.question(C.question, clamp((t - cdS) / (cdE - cdS)), t >= cdS, n); ctx.restore();
  } });
  for (let n = 0; n < 5; n++) cue(cdS + n * (cdE - cdS) / 5, 'tock', { gain: 0.8 });

  // ── reveal: push to the answer, red ring + stamp; OUT stamps on the others during "why" ──
  const rv = B.reveal, w0 = L(B.why[0]), w1 = Le(B.why[B.why.length - 1]);
  const others = C.suspects.map((_, i) => i).filter((i) => i !== A), span = (w1 - w0) / Math.max(1, others.length);
  add({ id: 'reveal', at: cut(rv), draw: (lt, d, t, blit) => {
    host.group.visible = false;
    const moods = {}; sus.forEach((_, i) => (moods[i] = i === A ? 'shock' : 'neutral'));
    pose(t, moods);
    shoot(W1, V3(xs[A] * 0.25, 1.42, 2.25), WA, V3(xs[A] * 0.3, 0.72, Z), eio(seg(lt, 0, 0.9)));
    blit();
    plates(1, A);
    const [hx, hy] = proj(V3(xs[A], 1.0, Z)), [, ty] = proj(V3(xs[A], 1.95, Z));
    UI.ring(hx, hy - 10, 150, 330, seg(t, L(rv) + 0.05, L(rv) + 0.55));
    UI.stamp(C.stamp || 'GUILTY', hx, ty - 70, seg(t, L(rv) + 0.25, L(rv) + 0.45), { px: 70 });
    others.forEach((i, o) => { const [ox0, oy] = proj(V3(xs[i], 0.95, Z)), ox = clamp(ox0, 120, 960); UI.stamp('OUT', ox, oy, seg(t, w0 + o * span, w0 + o * span + 0.25), { col: UI.P.cream, px: 48, rot: 0.1, sub: (C.out && C.out[i]) || '' }); });
  } });
  cue(L(rv) + 0.25, 'stamp');
  others.forEach((_, o) => cue(w0 + o * span + 0.1, 'thud', { gain: 0.6 }));

  // ── close: host + the casebook ──
  const cover = new Image(); cover.src = 'data/cover.jpg';
  add({ id: 'close', at: cut(B.close), draw: (lt, d, t, blit) => {
    host.group.visible = true; pose(t);
    host.set({ mood: 'smug', blink: blink(t), armR: [120, 40], holdR: PROPS.magnifier, armL: [10, 30] });
    shoot(V3(0.62, 1.5, 2.3), V3(0.7, 1.5, 2.0), V3(0.7, 1.3, -0.7), null, eio(clamp(lt / d)), { aperture: 0.003, maxblur: 0.012 }, 46);
    blit();
    const k = UI.pop(seg(lt, 0.1, 0.45));
    if (cover.complete && cover.naturalWidth && k > 0) { ctx.save(); ctx.translate(255, 560); ctx.rotate(-0.06); ctx.scale(k, k); const w = 330, h = w * cover.naturalHeight / cover.naturalWidth; ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-w / 2 + 12, -h / 2 + 14, w, h); ctx.drawImage(cover, -w / 2, -h / 2, w, h); ctx.restore(); }
    UI.pill('50 CASES · MYSTERYMINUTEHQ.COM', 540, 1150, { k: seg(lt, 0.3, 0.6), px: 32 });
  } });
  cue(cut(B.close), 'whoosh');

  return { shots: S, cues: CUES };
}
