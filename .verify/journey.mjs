/*
 * Dependency-free browser verification for FRESHERS 2026.
 * Drives headless Microsoft Edge over the DevTools protocol (CDP) using only
 * Node built-ins + global fetch/WebSocket. Used because the IDE browser bridge
 * was unavailable. Not part of the app; safe to delete.
 *
 * Usage:
 *   node .verify/journey.mjs --category=first --width=1280 --height=800 --tag=desktop
 *   node .verify/journey.mjs --category=fifth --choice=what --width=320 --height=640 --tag=small
 *   node .verify/journey.mjs --rm --width=1280 --height=800 --tag=reduced
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const argv = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
    return m ? [m[1], m[2] ?? true] : [a, true];
  }),
);

const WIDTH = Number(argv.width ?? 1280);
const HEIGHT = Number(argv.height ?? 800);
const CATEGORY = String(argv.category ?? 'first');
const CHOICE = String(argv.choice ?? 'all');
const TAG = String(argv.tag ?? 'run');
const RM = Boolean(argv.rm);
const PORT = Number(argv.port ?? 9331);
const URL = String(argv.url ?? 'http://localhost:5173/');

const EDGE =
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUT = path.resolve('.verify/shots', TAG);
const PROFILE = path.resolve(`.verify/edge-profile-${TAG}`);
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- launch edge ---------- */
const edgeArgs = [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE}`,
  `--window-size=${WIDTH},${HEIGHT}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-extensions',
  '--enable-unsafe-swiftshader',
  'about:blank',
];
if (RM) edgeArgs.splice(-1, 0, '--force-prefers-reduced-motion');

const child = spawn(EDGE, edgeArgs, { stdio: 'ignore' });
child.on('error', (e) => {
  console.error('EDGE_SPAWN_FAIL', e.message);
  process.exit(2);
});

/* ---------- wait for CDP target ---------- */
let wsUrl = null;
for (let i = 0; i < 60; i++) {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const list = await res.json();
    const page = list.find((t) => t.type === 'page');
    if (page) {
      wsUrl = page.webSocketDebuggerUrl;
      break;
    }
  } catch {
    /* not up yet */
  }
  await sleep(300);
}
if (!wsUrl) {
  console.error('CDP_UNREACHABLE');
  child.kill();
  process.exit(2);
}

/* ---------- tiny CDP client ---------- */
const ws = new WebSocket(wsUrl);
await new Promise((r, j) => {
  ws.onopen = r;
  ws.onerror = () => j(new Error('ws connect failed'));
});
let msgId = 0;
const pending = new Map();
const consoleErrors = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    return;
  }
  if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
    const text = (msg.params.args ?? [])
      .map((a) => a.value ?? a.description ?? a.type)
      .join(' ');
    consoleErrors.push(`[console.${msg.params.type}] ${text.slice(0, 300)}`);
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    const d = msg.params.exceptionDetails;
    consoleErrors.push(`[exception] ${(d.exception?.description ?? d.text ?? '').slice(0, 300)}`);
  }
  if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
    const en = msg.params.entry;
    consoleErrors.push(`[log.${en.source}] ${String(en.text).slice(0, 200)} ${en.url ?? ''}`);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  return r.result?.value;
};
const shot = async (name) => {
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  const file = path.join(OUT, `${name}.png`);
  fs.writeFileSync(file, Buffer.from(data, 'base64'));
  console.log('SHOT', file);
};

const clickSel = (sel) =>
  evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return 'NO_EL:' + ${JSON.stringify(sel)}; el.click(); return 'CLICKED:' + el.textContent.trim().slice(0, 60); })()`);

/* click the first element whose visible text contains `text` */
const clickByText = (text, selector = 'button, label') =>
  evaluate(`(() => {
    const els = [...document.querySelectorAll(${JSON.stringify(selector)})];
    const el = els.find((e) => e.textContent.toLowerCase().includes(${JSON.stringify(text.toLowerCase())}));
    if (!el) return 'NOT_FOUND:' + ${JSON.stringify(text)};
    el.click();
    return 'CLICKED:' + el.textContent.trim().slice(0, 60);
  })()`);

/* ---------- helpers ---------- */
const report = [];
const note = (s) => {
  report.push(s);
  console.log('NOTE', s);
};

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
await send('Page.navigate', { url: URL });
/* wait for React + canvas to mount so timings start at the real intro */
for (let i = 0; i < 40; i++) {
  const ok = await evaluate('!!document.querySelector("canvas") && !!document.querySelector(".stage--hero")');
  if (ok) break;
  await sleep(250);
}
await sleep(RM ? 2500 : 1800);

/* ---------- hero ---------- */
const webgl = await evaluate(`(() => {
  const c = document.querySelector('canvas');
  if (!c) return 'NO_CANVAS';
  const gl = c.getContext('webgl2') || c.getContext('webgl');
  return gl ? 'WEBGL_OK ' + c.width + 'x' + c.height : 'CANVAS_NO_GL';
})()`);
note(`canvas: ${webgl}`);
await shot('hero-mid');
await sleep(RM ? 300 : 1600);
await shot('hero-mid2');
await sleep(RM ? 300 : 2800);
await shot('hero-settled');

/* rotation progress: read the 3D group once mid-run is not exposed to DOM; the
   two mid shots + settled shot are the visual evidence. */

/* ---------- enter ---------- */
let r = await clickByText('enter the experience');
note(`enter: ${r}`);
await sleep(900);
await shot('name-panel');

/* ---------- name ---------- */
r = await evaluate(`(() => {
  const i = document.querySelector('input[type="text"], input:not([type])');
  if (!i) return 'NO_INPUT';
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(i, 'Test Student');
  i.dispatchEvent(new Event('input', { bubbles: true }));
  return 'TYPED';
})()`);
note(`name: ${r}`);
r = await clickByText('Continue', 'button');
note(`name continue: ${r}`);
await sleep(900);
await shot('category-panel');

/* ---------- category ---------- */
const catLabel = { first: 'First Semester', third: 'Third Semester', fifth: 'Fifth Semester', faculty: 'Faculty' }[CATEGORY];
r = await clickByText(catLabel, 'label');
note(`category select: ${r}`);
const contDisabled1 = await evaluate(`(() => {
  const b = [...document.querySelectorAll('button')].find(e => e.textContent.includes('Continue'));
  return b ? b.disabled : 'NO_CONTINUE';
})()`);
note(`continue disabled after select: ${contDisabled1}`);
r = await clickByText('Continue', 'button');
note(`category continue: ${r}`);
await sleep(1000);
await shot(`scene-${CATEGORY}-1`);
const fit1 = await evaluate('document.documentElement.scrollHeight + "|" + window.innerHeight');
note(`scene-1 scrollH|innerH: ${fit1}`);

/* ---------- per-category beats ---------- */
if (CATEGORY === 'fifth') {
  r = await clickByText(CHOICE, 'button.scene__choice');
  note(`fifth choice ${CHOICE}: ${r}`);
  await sleep(900);
  await shot(`scene-fifth-react-${CHOICE}`);
  r = await clickByText('invitation', 'button');
  note(`fifth continue: ${r}`);
} else if (CATEGORY === 'third') {
  for (let i = 0; i < 3; i++) {
    const rr = await evaluate(`(() => {
      const boxes = document.querySelectorAll('.scene__check input[type="checkbox"]');
      if (!boxes[${i}]) return 'NO_CHECKBOX';
      boxes[${i}].click();
      return 'CHECKED';
    })()`);
    note(`mission task ${i + 1}: ${rr}`);
  }
  await shot('scene-third-checklist');
  r = await clickByText('accept', 'button');
  note(`third accept: ${r}`);
  await sleep(900);
  await shot('scene-third-2');
  r = await clickByText('invitation', 'button');
  note(`third continue: ${r}`);
} else {
  /* first / faculty: two beats — click the scene's primary CTA each time */
  r = await clickSel('.stage--scene .enter-cta');
  note(`${CATEGORY} beat1: ${r}`);
  await sleep(900);
  await shot(`scene-${CATEGORY}-2`);
  r = await clickSel('.stage--scene .enter-cta');
  note(`${CATEGORY} to invitation: ${r}`);
}
await sleep(1100);
await shot('invitation');
const fitI = await evaluate('document.documentElement.scrollHeight + "|" + window.innerHeight');
note(`invitation scrollH|innerH: ${fitI}`);

const inviteText = await evaluate(`document.querySelector('.stage--invitation')?.innerText ?? 'MISSING'`);
note(`invitation text: ${JSON.stringify((inviteText || '').replace(/\s+/g, ' ').slice(0, 400))}`);

/* ---------- finale ---------- */
r = await clickSel('.stage--invitation .enter-cta');
note(`invitation continue: ${r}`);
await sleep(3200);
await shot('finale');
const finaleText = await evaluate(`document.querySelector('.stage--finale')?.innerText ?? 'MISSING'`);
note(`finale text: ${JSON.stringify((finaleText || '').replace(/\s+/g, ' ').slice(0, 300))}`);

/* overflow check */
const overflow = await evaluate('document.documentElement.scrollWidth + "|" + window.innerWidth');
note(`scrollWidth|innerWidth: ${overflow}`);
const vfit = await evaluate(
  `(() => { const el = document.querySelector('.stage-overlay'); return document.documentElement.scrollHeight + '|' + window.innerHeight + '|' + (el ? el.getBoundingClientRect().height : '?'); })()`,
);
note(`finale scrollH|innerH|stageH: ${vfit}`);

/* back-from-invitation via finale control (desktop only, optional) */
r = await clickByText('View invitation again', 'button');
note(`finale -> invitation again: ${r}`);
await sleep(900);
await shot('invitation-again');

console.log('\n=== CONSOLE ERRORS/WARNINGS ===');
console.log(consoleErrors.length ? consoleErrors.join('\n') : '(none)');
console.log('\n=== SUMMARY ===');
console.log(report.join('\n'));

ws.close();
child.kill();