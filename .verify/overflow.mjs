/* Find elements overflowing the viewport width at the current stage. */
import { spawn } from 'node:child_process';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const child = spawn(
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  [
    '--headless=new',
    '--remote-debugging-port=9332',
    '--user-data-dir=' + process.cwd() + '\\.verify\\edge-profile3',
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
    const r = await fetch('http://127.0.0.1:9332/json/list');
    const l = await r.json();
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
const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.value;

await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: 'http://localhost:5173/' });
for (let i = 0; i < 40; i++) { if (await ev('!!document.querySelector(".stage--hero")')) break; await sleep(250); }
await sleep(6200);

const click = (t, sel = 'button, label') => ev(`(() => { const el=[...document.querySelectorAll(${JSON.stringify(sel)})].find(e=>e.textContent.toLowerCase().includes(${JSON.stringify(t)})); if(!el) return 'NF:'+${JSON.stringify(t)}; el.click(); return 'ok'; })()`);

console.log('enter:', await click('enter the experience'));
await sleep(700);
await ev(`(() => { const i=document.querySelector('input'); const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set; s.call(i,'Overflow Probe'); i.dispatchEvent(new Event('input',{bubbles:true})); })()`);
console.log('cont:', await click('continue'));
await sleep(700);
console.log('cat:', await click('fifth semester', 'label'));
console.log('cont:', await click('continue'));
await sleep(900);

const probe = async (label) => {
  const bad = await ev(`(() => {
    const vw = window.innerWidth;
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      if (r.right > vw + 1 || r.left < -1) {
        out.push(el.tagName + '.' + (el.className && el.className.toString ? el.className.toString().split(' ').join('.') : '') + ' L' + Math.round(r.left) + ' R' + Math.round(r.right));
      }
    }
    return JSON.stringify({ vw, scrollW: document.documentElement.scrollWidth, bad: out.slice(0, 15) }, null, 1);
  })()`);
  console.log('--- ' + label + ' ---\n' + bad);
};

await probe('fifth question');
console.log('choice:', await click('all done', 'button.scene__choice'));
await sleep(700);
await probe('fifth reaction');
console.log('cont:', await click('invitation'));
await sleep(900);
await probe('invitation');
console.log('cont:', await click('continue'));
await sleep(3000);
await probe('finale');

ws.close(); child.kill(); process.exit(0);
