// Dark toon overlays, LANDSCAPE (1920x1080). Same palette and type as the Shorts kit.
import { ctx, clamp, lerp, eob, eo } from './core/lib.js';

export const P = { void: '#0A0C11', cream: '#EAE3D2', lamp: '#F1D9A6', brass: '#C9A13B', brassDk: '#8A6514', paper: '#E2D4B4', ink: '#1F1C33', red: '#E4322B', steel: '#7F8AA3' };
export const MONO = (px) => `700 ${px}px FreeMono`;
export const pop = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : lerp(0.6, 1, eob(k)));

export function wrap(text, maxW, font) {
  ctx.font = font; const out = []; let cur = '';
  String(text).split(/\s+/).forEach((w) => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; });
  if (cur) out.push(cur); return out;
}
export function text(s, x, y, px, col, align = 'center', font = null) { ctx.font = font || MONO(px); ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }
export function darken(a) { ctx.fillStyle = `rgba(6,7,10,${a})`; ctx.fillRect(0, 0, 1920, 1080); }

export function pill(s, x, y, { bg = P.brass, fg = P.void, px = 30, k = 1 } = {}) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(pop(k), pop(k)); ctx.font = MONO(px);
  const w = ctx.measureText(s).width + 44, h = px + 22; ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill();
  text(s, 0, 2, px, fg); ctx.restore();
}

/** case card (top left): CASE n OF N · title / the item */
export function itemCard(head, item, k = 1, x = 70, y = 60, w = 720) {
  if (k <= 0) return; ctx.save(); ctx.translate(x + w / 2, y + 85); ctx.scale(pop(k), pop(k)); ctx.translate(-w / 2, -85);
  ctx.fillStyle = 'rgba(11,13,18,0.86)'; ctx.strokeStyle = P.brass; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(0, 0, w, 170, 16); ctx.fill(); ctx.stroke();
  text(head, 30, 40, 26, P.brass, 'left');
  const ls = wrap(item, w - 60, MONO(50)); ls.slice(0, 2).forEach((l, i) => text(l, 30, 96 + i * 52 - (ls.length > 1 ? 18 : 0), 50, P.cream, 'left'));
  ctx.restore();
}

/** statement slip: name/role header + typed body */
export function statement(name, role, body, k, x, y, w) {
  if (k <= 0) return 0; const lines = wrap(body, w - 70, MONO(42)); const h = 110 + lines.length * 52;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(-0.012); ctx.scale(pop(k * 3), pop(k * 3)); ctx.translate(-w / 2, -h / 2);
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(8, 10, w, h); ctx.fillStyle = P.paper; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = P.ink; ctx.fillRect(0, 0, w, 60);
  text(name, 28, 32, 38, P.cream, 'left'); text(role.toUpperCase(), w - 28, 32, 26, P.lamp, 'right');
  let shown = Math.ceil(clamp((k - 0.15) / 0.75) * lines.join(' ').length);
  lines.forEach((l, i) => { text(l.slice(0, Math.max(0, shown)), 34, 100 + i * 52, 42, P.ink, 'left'); shown -= l.length + 1; });
  ctx.restore(); return h;
}

/** dark record chip with brass tab */
export function chip(label, body, x, y, w, k = 1, { lit = false, px = 38 } = {}) {
  if (k <= 0) return 0; const lines = wrap(body, w - 70, MONO(px)); const h = 70 + lines.length * (px + 10);
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(pop(k), pop(k)); ctx.translate(-w / 2, -h / 2);
  ctx.fillStyle = 'rgba(11,13,18,0.9)'; ctx.strokeStyle = lit ? P.brass : 'rgba(201,161,59,0.45)'; ctx.lineWidth = lit ? 4 : 2; ctx.beginPath(); ctx.roundRect(0, 0, w, h, 12); ctx.fill(); ctx.stroke();
  ctx.font = MONO(26); const tw = ctx.measureText(label).width + 36;
  ctx.fillStyle = lit ? P.brass : P.brassDk; ctx.beginPath(); ctx.roundRect(24, -18, tw, 38, 8); ctx.fill(); text(label, 42, 1, 26, P.void, 'left');
  lines.forEach((l, i) => text(l, 34, 46 + i * (px + 10) + px / 2, px, lit ? P.cream : '#BDB6A6', 'left'));
  ctx.restore(); return h;
}

/** the coded note on paper (big), optional answer written under it in red */
export function note(code, k, x, y, w, answer = '', ka = 0) {
  if (k <= 0) return 0; const lines = wrap(code, w - 80, MONO(72)); const h = 120 + lines.length * 84 + (answer ? 110 : 0);
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(0.015); ctx.scale(pop(k), pop(k)); ctx.translate(-w / 2, -h / 2);
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(10, 12, w, h); ctx.fillStyle = P.paper; ctx.fillRect(0, 0, w, h);
  text('THE NOTE', 34, 44, 28, P.brassDk, 'left');
  lines.forEach((l, i) => text(l, w / 2, 112 + i * 84, 72, P.ink));
  if (answer && ka > 0) { ctx.globalAlpha = clamp(ka * 2); const ay = 112 + lines.length * 84 + 40; ctx.fillStyle = 'rgba(228,50,43,0.12)'; ctx.fillRect(20, ay - 46, w - 40, 92); text(answer, w / 2, ay, 64, P.red); }
  ctx.restore(); return h;
}

export function plate(name, x, y, k = 1, { col = P.cream, px = 26 } = {}) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(pop(k), pop(k)); ctx.font = MONO(px);
  const w = ctx.measureText(name).width + 28; ctx.fillStyle = 'rgba(11,13,18,0.85)'; ctx.strokeStyle = 'rgba(201,161,59,0.6)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(-w / 2, -px * 0.8, w, px * 1.6, 8); ctx.fill(); ctx.stroke(); text(name, 0, 2, px, col); ctx.restore();
}

export function stamp(s, x, y, k = 1, { col = P.red, px = 64, rot = -0.14, sub = '' } = {}) {
  if (k <= 0) return; const sc = k < 1 ? lerp(1.8, 1, eo(k)) : 1; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = clamp(k * 2);
  ctx.font = MONO(px); const w = ctx.measureText(s).width + 46, h = px + 30; ctx.strokeStyle = col; ctx.lineWidth = 7;
  ctx.fillStyle = 'rgba(10,12,17,0.55)'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 10); ctx.fill(); ctx.stroke();
  text(s, 0, 4, px, col); if (sub) text(sub, 0, h / 2 + 26, 24, P.cream); ctx.restore();
}

export function ring(x, y, rx, ry, k = 1) {
  if (k <= 0) return; ctx.save(); ctx.strokeStyle = P.red; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, -0.08, -1.6, -1.6 + 6.6 * clamp(k)); ctx.stroke(); ctx.restore();
}

/** bottom band: the question (red) + "PAUSE · COMMENT" + the 5-to-1 number on the right */
export function band(lines, k, showNum, n, prog) {
  ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = 'rgba(8,9,13,0.92)'; ctx.fillRect(0, 860, 1920, 220); ctx.fillStyle = P.brass; ctx.fillRect(0, 858, 1920, 3);
  const q = lines.join(' '); text(q, 90, 930, 62, P.red, 'left'); text('PAUSE THE VIDEO · COMMENT YOUR ANSWER', 90, 1010, 30, P.lamp, 'left');
  if (showNum) {
    ctx.fillStyle = 'rgba(11,13,18,1)'; ctx.beginPath(); ctx.arc(1760, 970, 80, 0, 7); ctx.fill();
    ctx.strokeStyle = P.brass; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(1760, 970, 80, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - prog)); ctx.stroke();
    text(String(n), 1760, 976, 96, P.cream);
  }
  ctx.restore();
}

/** score dots, top centre: n cases, `cur` = current case (0-based) */
export function dots(n, cur) {
  const w = (n - 1) * 34; for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(960 - w / 2 + i * 34, 40, i === cur ? 11 : 8, 0, 7); ctx.fillStyle = i < cur ? P.brassDk : i === cur ? P.brass : 'rgba(234,227,210,0.25)'; ctx.fill(); }
}

/** case title card */
export function titleCard(n, total, title, k) {
  if (k <= 0) return; ctx.save(); ctx.translate(960, 500); ctx.scale(pop(k), pop(k));
  text(`CASE FILE ${n} OF ${total}`, 0, -90, 40, P.brass);
  const ls = wrap(title.toUpperCase(), 1500, MONO(96)); ls.forEach((l, i) => text(l, 0, 20 + i * 104 - (ls.length - 1) * 52, 96, P.cream));
  ctx.fillStyle = P.red; ctx.fillRect(-160, 110 + (ls.length - 1) * 52, 320, 6); ctx.restore();
}
