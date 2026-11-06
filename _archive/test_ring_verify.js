const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function testScreenshots() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const port = 9555;
  const profileDir = path.join(__dirname, '.edge_test_ring_' + Date.now());
  const edge = spawn(edgePath, [
    `--remote-debugging-port=${port}`,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-fre',
    `--user-data-dir=${profileDir}`,
    'file:///' + __dirname.replace(/\\/g, '/') + '/index.html'
  ]);

  let targets = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 250));
    try {
      targets = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json`, res => {
          let data = '';
          res.on('data', c => data += c);
          res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
        }).on('error', reject);
      });
      if (targets && targets.find(t => t.url.includes('index.html'))) break;
    } catch (_) {}
  }

  const page = targets.find(t => t.url.includes('index.html')) || targets[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let msgId = 1;
  const pending = new Map();
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.method === 'Runtime.consoleAPICalled') {
      console.log('Browser log:', m.params.args.map(a => a.value || a.description).join(' '));
    }
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  });
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  const send = (method, params = {}) => new Promise(res => { const id = msgId++; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: 'file:///' + __dirname.replace(/\\/g, '/') + '/index.html#s0' });
  await new Promise(r => setTimeout(r, 1800));

  // Screenshot hero opening (s0)
  const shotS0 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'verify_ring_hero.png'), Buffer.from(shotS0.data, 'base64'));

  // Navigate to s3 (Demo with Hand + Ring)
  await send('Runtime.evaluate', { expression: `location.hash = '#s3'; document.getElementById('s3').scrollIntoView(); if(window.Demo) window.Demo.enter();` });
  await new Promise(r => setTimeout(r, 1800));

  const shotS3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'verify_ring_hand.png'), Buffer.from(shotS3.data, 'base64'));

  ws.close();
  edge.kill();
  try { fs.rmSync(profileDir, { recursive: true, force: true }); } catch (_) {}
  console.log('Verification screenshots saved.');
}

testScreenshots().catch(console.error);

