/* Quick CDP probe: what does localhost:5173 actually render in headless Edge? */
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const errLog = fs.createWriteStream('.verify/edge-stderr.log');
const outLog = fs.createWriteStream('.verify/edge-stdout.log');

const child = spawn(
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  [
    '--headless=new',
    '--remote-debugging-port=9331',
    '--user-data-dir=' + process.cwd() + '\\.verify\\edge-profile',
    '--window-size=1280,800',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--enable-unsafe-swiftshader',
    'about:blank',
  ],
  { stdio: ['ignore', 'pipe', 'pipe'] },
);
child.stdout.pipe(outLog);
child.stderr.pipe(errLog);
child.on('error', (e) => {
  console.error('EDGE_SPAWN_FAIL', e.message);
  process.exit(2);
});

let wsUrl = null;
for (let i = 0; i < 60; i++) {
  try {
    const r = await fetch('http://127.0.0.1:9331/json/list');
    const l = await r.json();
    const p = l.find((t) => t.type === 'page');
    if (p) {
      wsUrl = p.webSocketDebuggerUrl;
      break;
    }
  } catch {
    /* not up yet */
  }
  await sleep(300);
}
if (!wsUrl) {
  console.error('CDP_UNREACHABLE');
  await sleep(500);
  console.error('STDERR:', fs.readFileSync('.verify/edge-stderr.log', 'utf8').slice(0, 2000));
  console.error('STDOUT:', fs.readFileSync('.verify/edge-stdout.log', 'utf8').slice(0, 2000));
  child.kill();
  process.exit(2);
}

const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pend = new Map();
const logs = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) {
    const p = pend.get(m.id);
    pend.delete(m.id);
    p(m.result);
  }
  if (m.method === 'Log.entryAdded') {
    const en = m.params.entry;
    logs.push(`log.${en.level} [${en.source}] ${String(en.text).slice(0, 300)}`);
  }
  if (m.method === 'Runtime.consoleAPICalled') {
    logs.push(
      'console.' + m.params.type + ': ' + (m.params.args || []).map((a) => a.value ?? a.description).join(' ').slice(0, 300),
    );
  }
};
const send = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    pend.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const ev = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  return r.result?.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
await send('Page.navigate', { url: 'http://localhost:5173/' });
await sleep(6000);

console.log('title:', await ev('document.title'));
console.log('rootHTML len:', await ev('(document.getElementById("root")||{}).innerHTML?.length'));
console.log('scripts:', await ev('JSON.stringify([...document.querySelectorAll("script")].map(s=>s.src||"inline"))'));
console.log('bodyStart:', await ev('document.body.innerHTML.slice(0,400)'));
console.log('LOGS:\n' + (logs.join('\n---\n') || '(none)'));
ws.close();
child.kill();
process.exit(0);
