const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const port = 9333;
  const profileDir = path.join(__dirname, '.edge_profile_' + Date.now());
  
  const edge = spawn(edgePath, [
    '--remote-debugging-port=' + port,
    '--headless=new',
    '--disable-gpu',
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-fre',
    '--disable-sync',
    `--user-data-dir=${profileDir}`,
    'file:///' + __dirname.replace(/\\/g, '/') + '/index.html'
  ]);

  edge.on('error', err => console.error('Edge spawn error:', err));

  // Wait for DevTools port
  let targets = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 300));
    try {
      targets = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json`, res => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
          });
        }).on('error', reject);
      });
      if (targets && targets.length) break;
    } catch (_) {}
  }

  if (!targets) {
    console.error('Could not connect to Edge DevTools port.');
    edge.kill();
    return;
  }

  console.log('All targets:', targets.map(t => ({ title: t.title, url: t.url })));
  let page = targets.find(t => t.type === 'page' && t.url.includes('index.html'));
  if (!page) {
    page = targets.find(t => t.type === 'page');
  }
  console.log('Selected target:', page.title, page.url);

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let msgId = 1;
  const pending = new Map();

  ws.addEventListener('message', event => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      const args = msg.params.args.map(a => a.value || a.description || '').join(' ');
      console.log(`[BROWSER CONSOLE ${msg.params.type.toUpperCase()}]`, args);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails);
    }
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result);
      pending.delete(msg.id);
    }
  });

  await new Promise(r => ws.addEventListener('open', r, { once: true }));

  function send(method, params = {}) {
    return new Promise(resolve => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Enable events
  await send('Runtime.enable');
  await send('Page.enable');
  await send('DOM.enable');

  await send('Page.navigate', { url: 'file:///' + __dirname.replace(/\\/g, '/') + '/index.html' });
  await new Promise(r => setTimeout(r, 2000));

  // Check state
  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        three: typeof THREE !== 'undefined',
        gltfLoader: typeof THREE !== 'undefined' && typeof THREE.GLTFLoader !== 'undefined',
        handData: typeof window.HAND_GLB_BASE64 === 'string',
        createHand: typeof window.createRealisticHand === 'function',
        demo: typeof window.Demo !== 'undefined',
        sectionsCount: document.querySelectorAll('.ch').length,
        macScreen: !!document.getElementById('screen'),
        handCanvas: !!document.getElementById('handCanvas')
      };
    })()`,
    returnByValue: true
  });

  console.log('Environment Verification State:', evalRes.result.value);

  // Navigate to #s3 (Product Demo) and trigger Demo.enter()
  await send('Runtime.evaluate', {
    expression: `(() => {
      location.hash = '#s3';
      document.getElementById('s3').scrollIntoView();
      if (window.Demo) window.Demo.enter();
      return true;
    })()`
  });

  // Wait 2.5 seconds for interaction animation
  await new Promise(r => setTimeout(r, 2500));

  // Capture screenshot of #s3
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'verify_ch3_move.png'), Buffer.from(shot1.data, 'base64'));
  console.log('Saved verify_ch3_move.png');

  // Trigger PINCH gesture
  await send('Runtime.evaluate', {
    expression: `(() => {
      const tabs = document.querySelectorAll('#gTabs button');
      if (tabs[2]) tabs[2].click(); // PINCH tab
      return true;
    })()`
  });
  await new Promise(r => setTimeout(r, 1800));

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'verify_ch3_pinch.png'), Buffer.from(shot2.data, 'base64'));
  console.log('Saved verify_ch3_pinch.png');

  // Trigger TWIST gesture (App Switcher)
  await send('Runtime.evaluate', {
    expression: `(() => {
      const tabs = document.querySelectorAll('#gTabs button');
      if (tabs[3]) tabs[3].click(); // TWIST tab
      return true;
    })()`
  });
  await new Promise(r => setTimeout(r, 1800));

  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'verify_ch3_twist.png'), Buffer.from(shot3.data, 'base64'));
  console.log('Saved verify_ch3_twist.png');

  // Check Ch 00 (Opening)
  await send('Runtime.evaluate', {
    expression: `(() => { location.hash = '#s0'; document.getElementById('s0').scrollIntoView(); return true; })()`
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotS0 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'verify_s0_opening.png'), Buffer.from(shotS0.data, 'base64'));

  // Check Ch 01 (Problem)
  await send('Runtime.evaluate', {
    expression: `(() => { location.hash = '#s1'; document.getElementById('s1').scrollIntoView(); return true; })()`
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotS1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'verify_ch1_problem.png'), Buffer.from(shotS1.data, 'base64'));

  // Check Ch 02 (Vision)
  await send('Runtime.evaluate', {
    expression: `(() => { location.hash = '#s2'; document.getElementById('s2').scrollIntoView(); return true; })()`
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotS2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'verify_ch2_vision.png'), Buffer.from(shotS2.data, 'base64'));

  // Check Ch 04 (Tech)
  await send('Runtime.evaluate', {
    expression: `(() => { location.hash = '#s4'; document.getElementById('s4').scrollIntoView(); return true; })()`
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotS4 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'verify_ch4_tech.png'), Buffer.from(shotS4.data, 'base64'));

  // Check Ch 05 (Ecosystem)
  await send('Runtime.evaluate', {
    expression: `(() => { location.hash = '#s5'; document.getElementById('s5').scrollIntoView(); return true; })()`
  });
  await new Promise(r => setTimeout(r, 1200));
  const shotS5 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'verify_ch5_eco.png'), Buffer.from(shotS5.data, 'base64'));

  // Check Ch 07 (Future)
  await send('Runtime.evaluate', {
    expression: `(() => { location.hash = '#s7'; document.getElementById('s7').scrollIntoView(); return true; })()`
  });
  await new Promise(r => setTimeout(r, 1000));
  const shotS7 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(__dirname, 'verify_ch7_future.png'), Buffer.from(shotS7.data, 'base64'));

  ws.close();
  edge.kill();

  try {
    fs.rmSync(profileDir, { recursive: true, force: true });
  } catch (_) {}

  console.log('Verification completed successfully!');
}

main().catch(console.error);
