/* 3BIT3BOARD PERSONALIZER — Mac-Inspired Computer Interface & Gesture Demo
   Synchronized real-time interaction:
   - MOVE: Ring-wearing hand moves cursor + hand gesture turns Gesture Mode ON
   - PINCH: Thumb & index finger touch -> pointer click
   - CLICK: Thumb presses smart ring on index finger -> calls AI Assistant
   - TWIST: Hand rotation selects among 3 functions
*/
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
  const damp = (rate, dt) => 1 - Math.exp(-rate * dt);
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const section = $('#s3');
  const pane = $('#handPane');
  const canvas = $('#handCanvas');
  const screen = $('#screen');
  if (!section || !pane || !canvas || !screen) return;

  /* ───────────── Four Official Gestures ───────────── */
  const GESTURES = [
    {
      id: 'move',
      tab: 'MOVE',
      name: 'MOVE',
      desc: '반지를 낀 손이 움직이며 커서가 이동하고, 손 제스처로 제스처 기능이 켜집니다.',
      keys: ''
    },
    {
      id: 'pinch',
      tab: 'PINCH',
      name: 'PINCH',
      desc: '엄지와 검지가 맞닿으면 포인터가 즉시 클릭됩니다.',
      keys: ''
    },
    {
      id: 'click',
      tab: 'CLICK',
      name: 'CLICK',
      desc: '반지를 엄지로 눌러 AI 비서를 즉시 호출합니다.',
      keys: ''
    },
    {
      id: 'twist',
      tab: 'TWIST',
      name: 'TWIST',
      desc: '손을 돌려 세 가지 기능 중 원하는 기능을 선택합니다.',
      keys: ''
    }
  ];

  /* Camera Presets per Gesture Scene — framed for maximum clarity of hand & ring */
  const CAM_PRESETS = {
    move:  { pos: [0.16, 0.09, 0.48], look: [0.00, 0.02, 0.00], fov: 38, mac: [-0.8,  1.4, 1.000] },
    pinch: { pos: [0.08, 0.06, 0.40], look: [-0.01, 0.02, 0.00], fov: 33, mac: [-0.6, -1.2, 1.008] },
    click: { pos: [0.10, 0.07, 0.36], look: [-0.01, 0.03, 0.01], fov: 31, mac: [ 0.7, -1.4, 1.012] },
    twist: { pos: [0.18, 0.14, 0.44], look: [0.00, 0.02, 0.00], fov: 36, mac: [ 0.9,  1.2, 1.004] }
  };

  /* Immediate zero-delay scripts per gesture */
  const SCRIPTS = {
    move: [
      { to: '#winFinder .file:nth-child(1)', move: 0.70, hold: 0.35 },
      { to: '#winFinder .file:nth-child(3)', gesturePose: 1.0, gestureOn: true, move: 0.75, hold: 0.85 },
      { to: '[data-app=slide]', gesturePose: 0.0, move: 0.85, hold: 0.40 },
      { to: '#winFinder .file:nth-child(2)', move: 0.75, hold: 0.50 }
    ],
    pinch: [
      { to: '#winFinder .file:nth-child(1)', pinch: 1.0, pinchClick: 1, move: 0.40, hold: 0.90 },
      { to: '#winFinder .file:nth-child(3)', pinch: 0.0, move: 0.75, hold: 0.35 },
      { pinch: 1.0, pinchClick: 3, openSlideAfter: true, move: 0.30, hold: 0.95 },
      { pinch: 0.0, move: 0.40, hold: 0.60 }
    ],
    click: [
      { to: [0.50, 0.46], tap: 1.0, callAi: true, move: 0.30, hold: 1.10 },
      { tap: 0.0, aiReply: true, move: 0.40, hold: 1.20 },
      { tap: 0.85, move: 0.30, hold: 0.70 },
      { tap: 0.0, move: 0.35, hold: 0.60 }
    ],
    twist: [
      { to: [0.50, 0.46], roll: -0.85, openSwitcher: true, switchApp: 0, move: 0.35, hold: 0.90 },
      { roll: 0.05, switchApp: 1, move: 0.65, hold: 0.90 },
      { roll: 0.92, switchApp: 2, move: 0.65, hold: 0.95 },
      { roll: 0.0, confirmSwitcher: true, move: 0.55, hold: 0.90 }
    ]
  };

  /* ───────────── State Management ───────────── */
  const S = {
    idx: 0,
    u: 0.5, v: 0.5, tu: 0.5, tv: 0.5,
    roll: 0, troll: 0,
    pinch: 0, tpinch: 0,
    tap: 0, ttap: 0,
    gpose: 0, tgpose: 0,
    gestureMode: false,
    camPos: [0.18, 0.10, 0.50],
    camLook: [0.00, 0.02, 0.00],
    camFov: 38,
    macRot: [-0.8, 1.4, 1.0],
    activeApp: 'finder',
    slideIdx: 0,
    switcherActive: false,
    switcherIdx: 0,
    aiActive: false,
    script: null,
    visible: false,
    running: false,
    next: 0,
    stepCount: 0,
    ringAngle: 0,
    ringSpeed: 0,
    z: 10
  };

  /* ───────────── Three.js 3D Hand Scene ───────────── */
  let renderer = null, scene = null, camera = null, hand = null, rimLight = null, fillLight = null;

  function initThree() {
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      console.warn('WebGL initialization fallback:', e);
      return false;
    }

    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(38, 1, 0.05, 10);
    camera.position.set(0.18, 0.10, 0.50);
    camera.lookAt(0, 0.02, 0);

    const amb = new THREE.AmbientLight(0xf2f4f8, 0.9);
    scene.add(amb);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(1.4, 2.2, 1.8);
    scene.add(keyLight);

    fillLight = new THREE.DirectionalLight(0xa0abb6, 1.2);
    fillLight.position.set(-1.8, 0.5, 1.2);
    scene.add(fillLight);

    rimLight = new THREE.DirectionalLight(0xdde5ed, 1.9);
    rimLight.position.set(-1.1, 1.8, -1.8);
    scene.add(rimLight);

    if (typeof window.createRealisticHand === 'function') {
      hand = window.createRealisticHand(THREE, function () {});
      scene.add(hand.root);
    }

    resize();
    return true;
  }

  function resize() {
    if (!renderer) return;
    const w = pane.clientWidth, h = pane.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(pane);

  /* ───────────── Computer Screen UI Elements ───────────── */
  const pointerEl = $('#pointer');
  const toastEl = $('#toast');
  const macEl = $('#mac');
  const winFinder = $('#winFinder');
  const winSlide = $('#winSlide');
  const winNotes = $('#winNotes');
  const appSwitcher = $('#appSwitcher');
  const gestureHud = $('#gestureHud');
  const gestureHudText = $('#gestureHudText');
  const aiAssistant = $('#aiAssistant');
  const aiStateText = $('#aiStateText');
  const aiBodyText = $('#aiBodyText');
  const slideDeck = $('#slideDeck');
  const slideCounter = $('#slideCounter');
  let toastTimer = null;
  let pulseTimer = null;
  const ringSvg = $('#ringSvg');
  const ringHalo = $('#ringHalo');

  function setRunning(on) {
    S.running = on;
  }

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
    if (macEl) {
      macEl.classList.add('laser-pulse');
      clearTimeout(pulseTimer);
      pulseTimer = setTimeout(() => macEl.classList.remove('laser-pulse'), 600);
    }
  }

  function setGestureHud(on) {
    S.gestureMode = on;
    if (gestureHud) {
      gestureHud.classList.toggle('active', on);
    }
    if (gestureHudText) {
      gestureHudText.textContent = on ? '제스처 기능 ON' : '제스처 기능 대기';
    }
    if (pointerEl) {
      pointerEl.classList.toggle('gesture-on', on);
    }
  }

  function showAiAssistant(stage) {
    if (!aiAssistant) return;
    if (!stage) {
      S.aiActive = false;
      aiAssistant.classList.remove('active');
      return;
    }
    S.aiActive = true;
    aiAssistant.classList.add('active');
    if (stage === 'call') {
      if (aiStateText) aiStateText.textContent = '반지 클릭 감지 · AI 비서 호출됨';
      if (aiBodyText) aiBodyText.textContent = '“무엇을 도와드릴까요? 음성 명령을 듣고 있습니다...”';
    } else if (stage === 'reply') {
      if (aiStateText) aiStateText.textContent = 'AI 비서 응답 완료';
      if (aiBodyText) aiBodyText.textContent = '“발표 자료 핵심 요약과 워크스페이스 정리를 완료했습니다.”';
    }
  }

  function bringFront(win) {
    if (!win) return;
    screen.querySelectorAll('.win.front').forEach(w => w.classList.remove('front'));
    win.style.zIndex = String(++S.z);
    win.classList.add('front');
  }

  /* Presentation Slide Flip */
  const SLIDES = [
    { title: '3BIT3BOARD PERSONALIZER', sub: 'The Wearable Input OS' },
    { title: '4가지 제스처 시스템', sub: 'MOVE · PINCH · CLICK · TWIST' },
    { title: '단일 입력 소프트웨어 계층', sub: '웨어러블과 컴퓨터 사이의 혁신' }
  ];

  function setSlide(idx) {
    S.slideIdx = (idx + SLIDES.length) % SLIDES.length;
    if (slideDeck) {
      slideDeck.innerHTML = `
        <div class="slide-card">
          <small class="slide-tag">KEYNOTE SLIDE ${S.slideIdx + 1}/${SLIDES.length}</small>
          <h4>${SLIDES[S.slideIdx].title}</h4>
          <p>${SLIDES[S.slideIdx].sub}</p>
        </div>
      `;
    }
    if (slideCounter) slideCounter.textContent = `${S.slideIdx + 1} / ${SLIDES.length}`;
  }

  /* 3-Function Selector HUD (TWIST) */
  const APPS = [
    { id: 'finder', name: '파일 탐색' },
    { id: 'slide', name: '발표 제어' },
    { id: 'notes', name: 'AI 메모' }
  ];

  function openSwitcher() {
    S.switcherActive = true;
    if (appSwitcher) {
      appSwitcher.classList.add('active');
      renderSwitcher();
    }
  }

  function closeSwitcher(activate = false) {
    S.switcherActive = false;
    if (appSwitcher) appSwitcher.classList.remove('active');
    if (activate) {
      activateApp(APPS[S.switcherIdx].id);
    }
  }

  function setSwitcherIdx(idx) {
    S.switcherIdx = (idx + APPS.length) % APPS.length;
    renderSwitcher();
  }

  function renderSwitcher() {
    if (!appSwitcher) return;
    const items = appSwitcher.querySelectorAll('.switcher-item');
    items.forEach((item, k) => {
      item.classList.toggle('selected', k === S.switcherIdx);
    });
  }

  function activateApp(appId) {
    S.activeApp = appId;
    if (appId === 'finder') {
      winFinder.hidden = false;
      bringFront(winFinder);
    } else if (appId === 'slide') {
      winSlide.hidden = false;
      bringFront(winSlide);
    } else if (appId === 'notes') {
      winNotes.hidden = false;
      bringFront(winNotes);
    }
    screen.querySelectorAll('.dock-item').forEach(d => {
      d.classList.toggle('open', d.dataset.app === appId);
    });
  }

  /* ───────────── Script Runner ───────────── */
  function resolveTarget(t) {
    if (Array.isArray(t)) return { u: t[0], v: t[1] };
    const el = screen.querySelector(t);
    if (!el || el.closest('[hidden]')) return null;
    const r = el.getBoundingClientRect(), s = screen.getBoundingClientRect();
    return {
      u: (r.left + r.width / 2 - s.left) / s.width,
      v: (r.top + r.height / 2 - s.top) / s.height
    };
  }

  function triggerPointerRipple() {
    if (!pointerEl) return;
    pointerEl.classList.remove('click');
    void pointerEl.offsetWidth;
    pointerEl.classList.add('click');
  }

  function nextStep() {
    const sc = S.script;
    if (!sc) return;
    sc.i++;
    if (sc.i >= sc.steps.length) {
      S.script = null;
      setRunning(false);
      S.ttap = S.tpinch = S.troll = S.tgpose = 0;
      return;
    }
    const st = sc.steps[sc.i];

    if (st.gesturePose !== undefined) S.tgpose = st.gesturePose;
    if (st.gestureOn) {
      setGestureHud(true);
      showToast('MOVE: 손 제스처 감지 → 제스처 기능 ON');
    }

    if (st.pinch !== undefined) S.tpinch = st.pinch;
    if (st.pinchClick !== undefined) {
      triggerPointerRipple();
      const file = screen.querySelector(`#winFinder .file:nth-child(${st.pinchClick})`);
      if (file) {
        screen.querySelectorAll('.file.sel').forEach(f => f.classList.remove('sel'));
        file.classList.add('sel');
        showToast(`PINCH: 엄지·검지 맞닿음 → ‘${file.dataset.name}’ 포인터 클릭`);
      } else {
        showToast('PINCH: 엄지·검지 맞닿음 → 포인터 클릭');
      }
      if (st.openSlideAfter) {
        setTimeout(() => {
          activateApp('slide');
          setSlide(1);
        }, 350);
      }
    }

    if (st.tap !== undefined) {
      S.ttap = st.tap;
      if (st.tap > 0.5) triggerPointerRipple();
    }
    if (st.callAi) {
      showAiAssistant('call');
      showToast('CLICK: 반지를 엄지로 클릭 → AI 비서 호출');
    }
    if (st.aiReply) {
      showAiAssistant('reply');
      showToast('AI 비서: 요청하신 발표 요약 및 작업 준비 완료');
    }

    if (st.openSwitcher) {
      openSwitcher();
    }
    if (st.roll !== undefined) {
      S.troll = st.roll;
      if (!S.switcherActive) openSwitcher();
    }
    if (st.switchApp !== undefined) {
      setSwitcherIdx(st.switchApp);
      const appName = APPS[st.switchApp] ? APPS[st.switchApp].name : '';
      showToast(`TWIST: 손을 돌려 기능 선택 — ${appName} (${st.switchApp + 1}/3)`);
    }
    if (st.confirmSwitcher) {
      const chosen = APPS[S.switcherIdx] || APPS[2];
      activateApp(chosen.id);
      showToast(`TWIST: ‘${chosen.name}’ 기능 선택 완료`);
    }

    sc.from = { u: S.tu, v: S.tv };
    const dest = st.to ? resolveTarget(st.to) : null;
    sc.to = { u: dest ? dest.u : sc.from.u, v: dest ? dest.v : sc.from.v };
    sc.t = 0;
    sc.move = st.move || 0;
    sc.hold = st.hold || 0.2;
  }

  function play(id) {
    setRunning(true);
    window.__ambTarget = S.idx;
    S.next = (S.idx + 1) % GESTURES.length;
    S.script = { steps: SCRIPTS[id] || SCRIPTS.move, i: -1, t: 0 };
    nextStep();
  }

  function stopDemo() {
    S.script = null;
    setRunning(false);
    S.tu = S.tv = 0.5;
    S.troll = S.tpinch = S.ttap = S.tgpose = 0;
    setGestureHud(false);
    showAiAssistant(null);
    if (S.switcherActive) closeSwitcher(false);
  }

  function stepScript(dt) {
    const sc = S.script;
    if (!sc) return;
    sc.t += dt;
    const k = sc.move > 0 ? ease(clamp(sc.t / sc.move)) : 1;
    S.tu = lerp(sc.from.u, sc.to.u, k);
    S.tv = lerp(sc.from.v, sc.to.v, k);
    if (sc.t >= sc.move + sc.hold) nextStep();
  }

  /* ───────────── Render Loop + Gimbal Camera ───────────── */
  let lastTime = performance.now();
  let hoveredEl = null;

  function loop(now) {
    if (!S.visible) return;
    requestAnimationFrame(loop);

    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    const t = now * 0.001;

    stepScript(dt);

    // Idle gentle motion when waiting so the 3D hand always looks alive
    if (!S.running && S.stepCount === 0) {
      S.tu = 0.5 + Math.sin(t * 1.4) * 0.14;
      S.tv = 0.48 + Math.cos(t * 1.1) * 0.10;
    }

    // Smooth, graceful damping for calm and clear presentation
    S.u += (S.tu - S.u) * damp(10, dt);
    S.v += (S.tv - S.v) * damp(10, dt);
    S.roll += (S.troll - S.roll) * damp(8, dt);
    S.pinch += (S.tpinch - S.pinch) * damp(12, dt);
    S.tap += (S.ttap - S.tap) * damp(14, dt);
    S.gpose += (S.tgpose - S.gpose) * damp(10, dt);

    // Update Computer Pointer
    const sr = screen.getBoundingClientRect();
    const px = S.u * sr.width;
    const py = S.v * sr.height;
    if (pointerEl) {
      pointerEl.style.transform = `translate(${px}px, ${py}px)`;
    }

    // Hit test hover
    if (sr.width > 0) {
      const el = document.elementFromPoint(sr.left + px, sr.top + py);
      const hit = el && screen.contains(el) ? el.closest('[data-hit]') : null;
      if (hit !== hoveredEl) {
        if (hoveredEl) hoveredEl.classList.remove('hover');
        if (hit) hit.classList.add('hover');
        hoveredEl = hit;
      }
    }

    // Camera interpolation (calm, cinematic response)
    const gId = (GESTURES[S.idx] || GESTURES[0]).id;
    const preset = CAM_PRESETS[gId] || CAM_PRESETS.move;
    const camDamp = damp(3.6, dt);

    const orbitX = Math.sin(t * 0.6) * 0.018;
    const orbitY = Math.cos(t * 0.45) * 0.012;
    const orbitZ = Math.sin(t * 0.4) * 0.015;

    S.camPos[0] += (preset.pos[0] + orbitX - S.camPos[0]) * camDamp;
    S.camPos[1] += (preset.pos[1] + orbitY - S.camPos[1]) * camDamp;
    S.camPos[2] += (preset.pos[2] + orbitZ - S.camPos[2]) * camDamp;

    S.camLook[0] += (preset.look[0] - S.camLook[0]) * camDamp;
    S.camLook[1] += (preset.look[1] - S.camLook[1]) * camDamp;
    S.camLook[2] += (preset.look[2] - S.camLook[2]) * camDamp;

    S.camFov += (preset.fov - S.camFov) * camDamp;

    S.macRot[0] += (preset.mac[0] + Math.cos(t * 0.45) * 0.25 - S.macRot[0]) * camDamp;
    S.macRot[1] += (preset.mac[1] + Math.sin(t * 0.45) * 0.35 - S.macRot[1]) * camDamp;
    S.macRot[2] += (preset.mac[2] - S.macRot[2]) * camDamp;

    if (macEl && !REDUCED) {
      macEl.style.transform = `perspective(1400px) rotateX(${S.macRot[0].toFixed(2)}deg) rotateY(${S.macRot[1].toFixed(2)}deg) scale(${S.macRot[2].toFixed(4)})`;
    }

    // 2D ring ambient spin (calm rotation)
    S.ringSpeed += ((S.running ? 110 : 22) - S.ringSpeed) * damp(2.5, dt);
    S.ringAngle = (S.ringAngle + S.ringSpeed * dt) % 360;
    if (ringHalo) ringHalo.style.transform = `rotate(${S.ringAngle.toFixed(2)}deg)`;
    if (ringSvg) ringSvg.style.transform = `rotate(${(S.ringAngle * 0.5).toFixed(2)}deg)`;

    // Update 3D Hand Scene
    if (renderer && hand && hand.isLoaded()) {
      camera.position.set(S.camPos[0], S.camPos[1], S.camPos[2]);
      camera.lookAt(S.camLook[0], S.camLook[1], S.camLook[2]);
      const baseFov = camera.aspect < 0.85 ? S.camFov + 6 : S.camFov;
      if (Math.abs(camera.fov - baseFov) > 0.02) {
        camera.fov = baseFov;
        camera.updateProjectionMatrix();
      }

      // Large, unmistakable spatial movement of the 3D hand synced to cursor
      hand.root.position.x = (S.u - 0.5) * 0.22;
      hand.root.position.y = (0.5 - S.v) * 0.14;

      hand.applyPose({
        curlIndex: 0.05,
        curlMiddle: 0.10,
        curlRing: 0.14,
        curlPinky: 0.18,
        pinch: S.pinch,
        ringTap: S.tap,
        gesturePose: S.gpose,
        wristRoll: S.roll,
        wristYaw: (S.u - 0.5) * 0.85,
        wristPitch: (S.v - 0.5) * 0.65
      });

      renderer.render(scene, camera);
    }
  }

  function start() {
    if (S.visible) return;
    S.visible = true;
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) start();
      else S.visible = false;
    });
  }, { threshold: 0.15 }).observe(section);

  /* ───────────── Navigation & Tab Controls ───────────── */
  const tabs = $('#gTabs');
  if (tabs) {
    tabs.innerHTML = '';
    GESTURES.forEach((g, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = g.tab;
      b.addEventListener('click', () => {
        S.next = (i + 1) % GESTURES.length;
        S.stepCount = i + 1;
        setGesture(i, true);
      });
      tabs.appendChild(b);
    });
  }

  function setGesture(idx, autoPlay = true) {
    S.idx = (idx + GESTURES.length) % GESTURES.length;
    window.__ambTarget = S.idx;
    const g = GESTURES[S.idx];
    S.troll = 0;
    S.tpinch = 0;
    S.ttap = 0;
    S.tgpose = 0;

    // Reset overlays before starting the selected gesture
    showAiAssistant(null);
    if (g.id !== 'twist' && S.switcherActive) closeSwitcher(false);

    if (g.id === 'move') {
      setGestureHud(false);
      activateApp('finder');
      winSlide.hidden = true;
      winNotes.hidden = true;
    } else if (g.id === 'pinch') {
      setGestureHud(true);
      activateApp('finder');
      winSlide.hidden = true;
      winNotes.hidden = true;
      // Pre-position near first file so pinch happens immediately
      const dest = resolveTarget('#winFinder .file:nth-child(1)');
      if (dest) { S.tu = dest.u; S.tv = dest.v; }
    } else if (g.id === 'click') {
      setGestureHud(true);
    } else if (g.id === 'twist') {
      setGestureHud(true);
      openSwitcher();
    }

    $('#gNum').textContent = `${String(S.idx + 1).padStart(2, '0')} / ${String(GESTURES.length).padStart(2, '0')}`;
    $('#gName').textContent = g.name;
    $('#gDesc').textContent = g.desc;

    if (tabs) {
      [...tabs.children].forEach((b, k) => b.classList.toggle('on', autoPlay && k === S.idx));
    }

    if (autoPlay) play(g.id);
  }

  const replayBtn = $('#replayBtn');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      S.next = 1;
      S.stepCount = 1;
      setGesture(0, true);
    });
  }

  const resetBtn = $('#resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      stopDemo();
      S.next = 0;
      S.stepCount = 0;
      setGesture(0, false);
      showToast('시연 초기화 완료');
    });
  }

  // Global Demo hook
  window.Demo = {
    enter() {
      stopDemo();
      S.next = 0;
      S.stepCount = 0;
      window.__ambTarget = 0;
      setGesture(0, false);
    },
    leave() {
      stopDemo();
      window.__ambTarget = 0;
    },
    next(loopWrap = false) {
      if (!loopWrap && S.stepCount >= GESTURES.length) {
        return false; // All 4 gestures done -> allow SPACE to advance to next chapter (#s4)
      }
      const targetIdx = S.next;
      S.stepCount++;
      setGesture(targetIdx, true);
      return true;
    },
    step(dir) {
      const next = S.idx + dir;
      if (next < 0 || next >= GESTURES.length) return false;
      S.next = (next + 1) % GESTURES.length;
      S.stepCount = next + 1;
      setGesture(next, true);
      return true;
    }
  };

  initThree();
  setSlide(0);
  setGesture(0, false);
})();
