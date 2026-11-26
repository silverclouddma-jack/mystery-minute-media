// Dark toon overlays (2D, drawn on top of the 3D frame). Palette and fonts from claude/mm-style-test.md.
import { ctx, clamp, lerp, eob, eo } from './core/lib.js';

export const P = { void: '#0A0C11', panel: '#0B0D12', cream: '#EAE3D2', lamp: '#F1D9A6', brass: '#C9A13B', brassDk: '#8A6514', paper: '#E2D4B4', ink: '#1F1C33', red: '#E4322B', steel: '#7F8AA3' };
export const MONO = (px) => `700 ${px}px FreeMono`;

/** wrap text to a width with the current font */
export function wrap(text, maxW, font) {
  ctx.font = font; const out = []; let cur = '';
  String(text).split(/\s+/).forEach((w) => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; } else cur = t; });
  if (cur) out.push(cur); return out;
}
function text(s, x, y, px, col, align = 'center', base = 'middle') { ctx.font = MONO(px); ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y); }

/** pop-in scale for k 0..1 (cards pop in by scale, never slide through the caption zone) */
export const pop = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : lerp(0.6, 1, eob(k)));

/** small pill label */
export function pill(s, x, y, { bg = P.brass, fg = P.void, px = 30, k = 1 } = {}) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(pop(k), pop(k)); ctx.font = MONO(px);
  const w = ctx.measureText(s).width + 44, h = px + 22; ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2); ctx.fill();
  text(s, 0, 2, px, fg); ctx.restore();
}

/** the item / case card at the top of the hook */
export function itemCard(title, item, k = 1, y = 230) {
  if (k <= 0) return; ctx.save(); ctx.translate(540, y); ctx.scale(pop(k), pop(k));
  ctx.fillStyle = 'rgba(11,13,18,0.86)'; ctx.strokeStyle = P.brass; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(-430, -120, 860, 240, 18); ctx.fill(); ctx.stroke();
  text('CASE FILE · ' + title.toUpperCase(), 0, -70, 30, P.brass);
  const lines = wrap(item, 780, MONO(62)); lines.forEach((l, i) => text(l, 0, 10 + (i - (lines.length - 1) / 2) * 66, 62, P.cream));
  text('MISSING', 0, 86, 28, P.steel); ctx.restore();
}

/** a statement on a paper slip: name + role header, typed body (k 0..1 types it) */
export function statement(name, role, body, k = 1, y = 110, { hi = false } = {}) {
  if (k <= 0) return; const lines = wrap(body, 760, MONO(44)); const h = 120 + lines.length * 54;
  ctx.save(); ctx.translate(540, y + h / 2); ctx.rotate(-0.012); ctx.scale(pop(k * 3), pop(k * 3));
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(-424, -h / 2 + 10, 860, h);
  ctx.fillStyle = P.paper; ctx.fillRect(-430, -h / 2, 860, h);
  ctx.fillStyle = hi ? P.brassDk : P.ink; ctx.fillRect(-430, -h / 2, 860, 64);
  text(name, -400, -h / 2 + 34, 40, P.cream, 'left'); text(role.toUpperCase(), 400, -h / 2 + 34, 28, P.lamp, 'right');
  const total = lines.join(' ').length; let shown = Math.ceil(clamp((k - 0.15) / 0.75) * total);
  lines.forEach((l, i) => { const s = l.slice(0, Math.max(0, shown)); shown -= l.length + 1; text(s, -400, -h / 2 + 108 + i * 54, 44, P.ink, 'left'); });
  ctx.restore(); return h;
}

/** a dark record chip with a brass tab: LABEL | text */
export function chip(label, body, x, y, w, k = 1, { lit = false, px = 40 } = {}) {
  if (k <= 0) return 0; const lines = wrap(body, w - 70, MONO(px)); const h = 78 + lines.length * (px + 10);
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(pop(k), pop(k)); ctx.translate(-w / 2, -h / 2);
  ctx.fillStyle = 'rgba(11,13,18,0.9)'; ctx.strokeStyle = lit ? P.brass : 'rgba(201,161,59,0.45)'; ctx.lineWidth = lit ? 4 : 2; ctx.beginPath(); ctx.roundRect(0, 0, w, h, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = lit ? P.brass : P.brassDk; ctx.beginPath(); ctx.roundRect(24, -18, ctx.measureText ? Math.min(w - 48, label.length * 20 + 40) : 200, 40, 8); ctx.fill();
  text(label, 44, 2, 28, P.void, 'left');
  lines.forEach((l, i) => text(l, 34, 52 + i * (px + 10) + px / 2, px, lit ? P.cream : '#BDB6A6', 'left'));
  ctx.restore(); return h;
}

/** name plate under a person */
export function plate(name, x, y, k = 1, { col = P.cream, bg = 'rgba(11,13,18,0.85)', px = 30 } = {}) {
  if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(pop(k), pop(k)); ctx.font = MONO(px);
  const w = ctx.measureText(name).width + 30; ctx.fillStyle = bg; ctx.strokeStyle = 'rgba(201,161,59,0.6)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(-w / 2, -px * 0.8, w, px * 1.6, 8); ctx.fill(); ctx.stroke(); text(name, 0, 2, px, col); ctx.restore();
}

/** rubber stamp (red for the answer, cream for OUT) */
export function stamp(s, x, y, k = 1, { col = P.red, px = 76, rot = -0.14, sub = '' } = {}) {
  if (k <= 0) return; const sc = k < 1 ? lerp(1.8, 1, eo(k)) : 1; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = clamp(k * 2);
  ctx.font = MONO(px); const w = ctx.measureText(s).width + 50, h = px + 34; ctx.strokeStyle = col; ctx.lineWidth = 8;
  ctx.fillStyle = 'rgba(10,12,17,0.55)'; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 10); ctx.fill(); ctx.stroke();
  text(s, 0, 4, px, col); if (sub) text(sub, 0, h / 2 + 30, 28, P.cream); ctx.restore();
}

/** red ring around the answer */
export function ring(x, y, rx, ry, k = 1) {
  if (k <= 0) return; ctx.save(); ctx.strokeStyle = P.red; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, -0.08, -1.6, -1.6 + 6.6 * clamp(k)); ctx.stroke(); ctx.restore();
}

/** the question + countdown number (k = countdown progress 0..1 over 5 s) */
export function question(lines, k, showNum, n) {
  ctx.save(); lines.forEach((l, i) => { ctx.font = MONO(66); ctx.lineJoin = 'round'; ctx.strokeStyle = P.void; ctx.lineWidth = 12; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeText(l, 540, 1090 + i * 82); text(l, 540, 1090 + i * 82, 66, P.red); });
  if (showNum) {
    ctx.fillStyle = 'rgba(11,13,18,0.85)'; ctx.beginPath(); ctx.arc(540, 1345, 92, 0, 7); ctx.fill();
    ctx.strokeStyle = P.brass; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(540, 1345, 92, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - k)); ctx.stroke();
    text(String(n), 540, 1350, 110, P.cream);
    text('PAUSE · COMMENT YOUR ANSWER', 540, 1480, 32, P.lamp);
  }
  ctx.restore();
}

export function darken(a) { ctx.fillStyle = `rgba(6,7,10,${a})`; ctx.fillRect(0, 0, 1080, 1920); }
