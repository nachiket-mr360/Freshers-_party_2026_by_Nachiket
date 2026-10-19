/* Lists elements overflowing the viewport (vertical + horizontal) at each stage. */
import { spawn } from 'node:child_process';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TAG = process.argv[2] ?? 'probe';
const PORT = Number(process.argv[3] ?? 9350);
const TARGET = process.argv[4] ?? 'http://localhost:5173/';
const child = spawn(
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.cwd()}\\.verify\\edge-profile-fit-${TAG}`,
    '--window-size=1280,800',
    '--no-first-run',
    '--enable-unsafe-swiftshader',
    'about:blank',
  ],
  { stdio: 'ignore' },
);
let wsUrl = null;
for (let i = 0; i < 60; i++) {
  try {
    const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    const p = l.find((t) => t.type === 'page');
    if (p) { wsUrl = p.webSocketDebuggerUrl; break; }
  } catch {}
  await sleep(300);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pend = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); p(m.result); }
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.value;

await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: TARGET });
for (let i = 0; i < 40; i++) { if (await ev('!!document.querySelector(".stage--hero")')) break; await sleep(250); }
await sleep(6200);

const clickSel = (sel) => ev(`(() => { const el=document.querySelector(${JSON.stringify(sel)}); if(!el) return 'NF'; el.click(); return 'ok'; })()`);
const clickText = (t, sel = 'button, label') => ev(`(() => { const el=[...document.querySelectorAll(${JSON.stringify(sel)})].find(e=>e.textContent.toLowerCase().includes(${JSON.stringify(t)})); if(!el) return 'NF:'+${JSON.stringify(t)}; el.click(); return 'ok'; })()`);

const probe = async (label) => {
  const out = await ev(`(() => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const bad = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      const over = [];
      if (r.bottom > vh + 1) over.push('bottom+' + Math.round(r.bottom - vh));
      if (r.top < -1) over.push('top' + Math.round(r.top));
      if (r.right > vw + 1) over.push('right+' + Math.round(r.right - vw));
      if (r.left < -1) over.push('left' + Math.round(r.left));
      if (over.length) bad.push(el.tagName + '.' + String(el.className || '').split(' ').join('.') + ' ' + over.join(','));
    }
    return JSON.stringify({ scrollH: document.documentElement.scrollHeight, vh, scrollW: document.documentElement.scrollWidth, vw, bad: bad.slice(0, 20) }, null, 1);
  })()`);
  console.log('=== ' + label + ' ===\n' + out);
};

console.log('enter:', await clickText('enter the experience'));
await sleep(700);
await ev(`(() => { const i=document.querySelector('input'); const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; s.call(i,'Fit Probe'); i.dispatchEvent(new Event('input',{bubbles:true})); })()`);
await clickSel('.glass-panel .enter-cta, .glass-panel button[type="submit"], .glass-panel .btn--primary');
await sleep(700);
await clickText('first semester', 'label');
await clickSel('.glass-panel .enter-cta, .glass-panel button:not(.btn--ghost)');
await sleep(900);
await probe('first scene-1');
await clickSel('.stage--scene .enter-cta');
await sleep(900);
await probe('first scene-2');
await clickSel('.stage--scene .enter-cta');
await sleep(1100);
await probe('invitation');

ws.close(); child.kill(); process.exit(0);
