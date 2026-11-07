(() => {
  'use strict';

  /* ───────────── Config & data ───────────── */

  const TOTAL_SECONDS = 300;
  const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Chapters: index maps 1:1 to each `.ch` section (opening, 01–07, closing). */
  const CHAPTERS = [
    { name: '오프닝', start: 0, end: 10, script: '3BIT3BOARD, 퍼스널라이저입니다. 웨어러블 입력 OS. 새로운 상호작용의 시작입니다.' },
    { name: '상호작용', start: 10, end: 35, script: '컴퓨터의 성능은 빠르게 발전했지만, 컴퓨터를 다루는 방식은 크게 달라지지 않았습니다. 여전히 키보드와 마우스에 의존하는 입력 환경. 우리는 새로운 입력 경로를 더합니다.' },
    { name: '제품 소개', start: 35, end: 65, script: '웨어러블은 건강 정보나 알림을 보는 기기를 넘어, 컴퓨터와 상호작용하는 입력 장치가 될 수 있습니다. 서로 다른 하드웨어, 하나의 일관된 경험. 퍼스널라이저는 다양한 스마트 링을 단일 플랫폼으로 연결하는 소프트웨어 계층입니다.' },
    { name: '제품 시연', start: 65, end: 120, script: '퍼스널라이저의 핵심은 네 가지 제스처입니다. MOVE, 공간 손 움직임으로 컴퓨터 포인터를 부드럽게 제어합니다. CLICK, 검지 스마트 링의 탭 동작으로 파일과 앱을 즉시 실행합니다. 향후 Pro에서는 이 클릭을 AI 음성 호출로 확장할 수 있습니다. PINCH, 엄지와 검지를 맞닿게 해 항목을 선택하거나 프레젠테이션 슬라이드를 넘깁니다. TWIST, 손목의 회전 각도로 App Switcher를 호출하여 원하는 작업 창으로 전환합니다. 마지막으로 이 네 동작이 단일 입력 계층으로 끊김 없이 연결됩니다. 이 화면은 웹으로 구현한 콘셉트 시연이며, 실제 센서 연동은 앞으로 검증할 단계입니다.' },
    { name: '기술 구조', start: 120, end: 160, script: '퍼스널라이저는 웨어러블과 컴퓨터 사이의 소프트웨어 계층입니다. 웨어러블 입력이 제스처 인식을 거쳐, 사용자 설정에 따라 컴퓨터 동작으로 변환됩니다. 하드웨어는 가격이 아니라, 접근 가능한 센서와 입력 범위에 따라 세 등급으로 나눌 계획입니다. 아직 특정 제품을 등급에 확정하지 않았고, 미지아 링은 초기 테스트 후보일 뿐입니다. OS 수준의 입력 매핑도 앞으로 검증할 과제입니다.' },
    { name: '생태계', start: 160, end: 200, script: '우리는 특정 링 제조에 종속되지 않습니다. 호환 기기, 퍼스널라이저, 워크플로를 소프트웨어로 연결합니다. 확장은 네 방향입니다. 호환 기기 확대, 사용자별 제스처 프로필, 다양한 작업 환경, 그리고 제조사와 소프트웨어 기업과의 협력 가능성 모색입니다. 아직 체결된 제휴는 없습니다.' },
    { name: '사업 모델', start: 200, end: 255, script: '사업 모델은 소프트웨어 구독입니다. 무료 요금제 없이 Plus 월 9천 원, Pro 월 1만 2천 원 두 가지입니다. 기본 시나리오는 Plus와 Pro가 50대 50이라는 가정입니다. 평균 구독료는 1만 500원, 변동비 25%를 빼면 가입자당 월 공헌이익은 7,875원입니다. 월 고정비 410만 원을 나누면 운영 손익분기점은 약 520명입니다. 인프라 비용 40K만의 기준이 아니라 전체 고정비 기준입니다. 목표는 2년 차 유료 사용자 3천 명, 4년 차 ARR 10억 8천만 원이며, 시나리오 A(100% PLUS) 기준 1만 명, 시나리오 B(50:50) 기준 약 8천572명의 활성 구독자가 필요합니다. 모두 실적이 아닌 사업계획상의 가정입니다.' },
    { name: '미래 로드맵', start: 255, end: 290, script: '로드맵은 세 단계입니다. 첫째, 입력 기반 구축. 제스처 입력과 PC 매핑, 하드웨어 호환성을 검증합니다. 둘째, 개인화 생태계. 사용자 프로필과 고급 커스터마이징, 기기 확대를 추진합니다. 셋째, AI 인터랙션. 클릭으로 음성을 호출하고 AI 에이전트와 연동하는 방향입니다. AI는 현재 기능이 아니라 다음 단계의 확장 동력입니다.' },
    { name: '클로징', start: 290, end: 300, script: '웨어러블 입력을 소프트웨어 계층으로. 3BIT3BOARD, 컴퓨팅의 새로운 계층입니다.' },
  ];
  const LAST = CHAPTERS.length - 1;
  const PRODUCT_CHAPTER = 3;
  const BUSINESS_BEP = 520;

  /* ───────────── Helpers ───────────── */

  const $ = (sel) => document.querySelector(sel);
  const pad2 = (n) => String(n).padStart(2, '0');
  const mmss = (s) => `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;

  const sections = [...document.querySelectorAll('.ch')];
  const state = { chapter: 0 };
  window.state = state;

  /* ───────────── Navigation & HUD ───────────── */

  const nav = $('#nav');
  const planbar = $('#planbar');
  const progressFill = $('#progress i');

  CHAPTERS.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.textContent = i === 0 ? '●' : i === LAST ? '■' : pad2(i);
    btn.title = `${c.name}  ${mmss(c.start)}–${mmss(c.end)}`;
    btn.addEventListener('click', () => goTo(i));
    nav.appendChild(btn);

    const seg = document.createElement('i');
    seg.style.width = `${((c.end - c.start) / TOTAL_SECONDS) * 100}%`;
    planbar.appendChild(seg);
  });

  function goTo(i) {
    const idx = Math.max(0, Math.min(sections.length - 1, i));
    setChapter(idx);
    sections[idx].scrollIntoView({ behavior: REDUCED_MOTION ? 'auto' : 'smooth' });
  }
  window.goTo = goTo;

  function setChapter(i) {
    if (heroRingState === 1) return; // Never interrupt active hero transition
    const prev = state.chapter;
    state.chapter = i;
    if (window.Demo && prev !== i) {
      if (i === PRODUCT_CHAPTER) {
        document.body.classList.add('in-demo');
        window.Demo.enter();
      } else if (prev === PRODUCT_CHAPTER) {
        document.body.classList.remove('in-demo');
        window.Demo.leave();
      }
    }
    if (i === 0 && prev !== 0) {
      window.__ringReveal = 0;
      clearTimeout(state.introTimer);
      s0Stage = 0;
      const s0 = $('#s0');
      if (s0) s0.classList.remove('show-title');
      heroRingState = 0;
      spaceLocked = false;
    }
    const c = CHAPTERS[i];
    const ambPositions = [
      ['50%', '28%', '0.13'],
      ['78%', '32%', '0.08'],
      ['50%', '55%', '0.10'],
      ['26%', '48%', '0.12'],
      ['74%', '42%', '0.08'],
      ['72%', '50%', '0.11'],
      ['50%', '25%', '0.07'],
      ['76%', '62%', '0.09'],
      ['50%', '30%', '0.13'],
    ];
    const [ax, ay, aop] = ambPositions[i] || ambPositions[0];
    document.documentElement.style.setProperty('--amb-x', ax);
    document.documentElement.style.setProperty('--amb-y', ay);
    document.documentElement.style.setProperty('--amb-op', aop);
    [...nav.children].forEach((b, k) => b.classList.toggle('on', k === i));
    [...planbar.children].forEach((p, k) => p.classList.toggle('cur', k === i));
    progressFill.style.width = `${(c.end / TOTAL_SECONDS) * 100}%`;

    const s1 = $('#s1');
    if (s1) {
      if (i === 1) {
        s1.classList.remove('anim-complete');
        s1.classList.remove('is-active');
        void s1.offsetWidth; // re-trigger animations
        s1.classList.add('is-active');
        state.s1StartTime = Date.now();
      } else {
        s1.classList.remove('is-active');
      }
    }

    const s2 = $('#s2');
    if (s2) {
      s2.classList.remove('show-copy', 'show-platform', 'show-seq-1', 'show-seq-2', 'darken-out', 'saas-focus-api', 'saas-focus-integration');
      if (i === 2) {
        state.s2StartTime = performance.now();
        window.__saasManualScene = false;
        setSaasScene(1);
      }
    }

    const s4 = $('#s4');
    if (s4) {
      if (i === 4) {
        s4.classList.remove('anim-active');
        void s4.offsetWidth; // re-trigger animations
        s4.classList.add('anim-active');
      } else {
        s4.classList.remove('anim-active');
      }
    }

    const s8 = $('#s8');
    if (s8 && i !== LAST) {
      s8.classList.remove('show-punchline');
    }

    $('#nTitle').textContent = c.name;
    $('#nTime').textContent = `${mmss(c.start)} – ${mmss(c.end)} · ${c.end - c.start}초`;
    $('#nText').textContent = c.script;
    $('#nMeta').textContent = `공백 제외 ${c.script.replace(/\s/g, '').length}자 · 목표 ${c.end - c.start}초`;
  }

  let bepCounted = false;
  function countUpBep() {
    if (bepCounted || REDUCED_MOTION) return;
    bepCounted = true;
    const el = $('.count');
    let t0 = null;
    const step = (t) => {
      t0 ??= t;
      const k = Math.min(1, (t - t0) / 700);
      el.textContent = `≈ ${Math.round(BUSINESS_BEP * k)}`;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const { target, isIntersecting } = entry;
      // Tall sections (mobile) never reach 55% of their own height, so also accept 55% of the viewport.
      const viewH = entry.rootBounds ? entry.rootBounds.height : innerHeight;
      const active = isIntersecting && (entry.intersectionRatio >= 0.55 || entry.intersectionRect.height >= viewH * 0.55);
      target.dataset.vis = isIntersecting ? '1' : '0';
      if (!active) return;
      target.classList.add('in');
      setChapter(Number(target.dataset.i));
      if (target.id === 's6') countUpBep();
    });
  }, { threshold: [0.1, 0.3, 0.55, 0.8] });
  sections.forEach((s) => observer.observe(s));

  /* ───────────── Presenter notes ───────────── */

  const notes = $('#notes');
  const toggleNotes = () => { notes.hidden = !notes.hidden; };
  $('#nBtn').addEventListener('click', toggleNotes);
  $('#nClose').addEventListener('click', toggleNotes);

  /* ───────────── Timer ───────────── */

  const timerEl = $('#zenTimer');
  const timerText = $('#ztTime');
  const timer = { elapsed: 0, handle: null };

  const drawTimer = () => { timerText.textContent = mmss(Math.min(timer.elapsed, TOTAL_SECONDS)); };

  function resetTimer() {
    timer.elapsed = 0;
    drawTimer();
    timerEl.classList.remove('flash');
    void timerEl.offsetWidth; // restart the CSS animation
    timerEl.classList.add('flash');
  }

  function toggleTimer() {
    if (timer.handle) {
      clearInterval(timer.handle);
      timer.handle = null;
      timerEl.style.opacity = '.2';
      return;
    }
    timerEl.style.opacity = '';
    timer.handle = setInterval(() => {
      timer.elapsed++;
      drawTimer();
      if (timer.elapsed >= TOTAL_SECONDS) {
        clearInterval(timer.handle);
        timer.handle = null;
      }
    }, 1000);
  }

  timerEl.addEventListener('click', resetTimer);
  timerEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      resetTimer();
    }
  });

  /* ───────────── Universal Advance (Spacebar / Mouse Click) ───────────── */

  function advancePresentation() {
    const onProduct = state.chapter === PRODUCT_CHAPTER;

    if (state.chapter === 0) {
      if (s0Stage === 0) {
        // 1st SPACE / Click: Reveal PERSONALIZER
        s0Stage = 1;
        const s0 = $('#s0');
        if (s0) s0.classList.add('show-title');
        return;
      }
      if (s0Stage === 1) {
        // 2nd SPACE / Click: Ring ascends + Screen rises simultaneously
        if (spaceLocked) return;
        spaceLocked = true;
        s0Stage = 2;
        heroRingState = 1;
        heroRingStartTime = performance.now();
        document.documentElement.style.scrollSnapType = 'none';
        document.documentElement.style.scrollBehavior = 'auto';
        return;
      }
      // s0Stage === 2: Transition running, block duplicate presses
      return;
    } else if (state.chapter === 1) {
      // Slide 2: If animation is still running, 1st SPACE / Click completes reveal; 2nd advances to Slide 3
      const s1 = $('#s1');
      const elapsed = Date.now() - (state.s1StartTime || 0);
      if (s1 && !s1.classList.contains('anim-complete') && elapsed < 11500) {
        s1.classList.add('anim-complete');
      } else {
        goTo(2);
      }
    } else if (state.chapter === 2) {
      // Slide 3 (Chapter 02 Product Showcase): 1st SPACE / Click fast-forwards to Platform & Scene 1; next advances through scenes 2 & 3, then to Demo
      const s2 = $('#s2');
      const elapsed = (performance.now() - (state.s2StartTime || 0)) * 0.001;
      if (s2 && !s2.classList.contains('show-platform') && elapsed < 3.1) {
        state.s2StartTime = performance.now() - 3200;
        setSaasScene(1, true);
      } else if (curSaasScene === 1) {
        setSaasScene(2, true);
      } else if (curSaasScene === 2) {
        setSaasScene(3, true);
      } else {
        s2.classList.add('darken-out');
        setTimeout(() => {
          goTo(3);
        }, 360);
      }
    } else if (onProduct && window.Demo) {
      // Demo screen: 4 SPACE / Clicks run MOVE -> PINCH -> CLICK -> TWIST; 5th moves to next chapter
      if (!window.Demo.next(false)) goTo(state.chapter + 1);
    } else if (state.chapter === LAST) {
      // Closing Chapter 8: 1st SPACE / Click reveals the punchline between lead and sub
      const s8 = $('#s8');
      if (s8 && !s8.classList.contains('show-punchline')) {
        s8.classList.add('show-punchline');
      }
    } else {
      // Advance chapters anywhere on the site
      clearTimeout(state.introTimer);
      goTo(state.chapter + 1);
    }
  }
  window.advancePresentation = advancePresentation;

  /* ───────────── Keyboard & Mouse Controls ───────────── */

  const NEXT_KEYS = ['ArrowDown', 'ArrowRight', 'PageDown', ' '];
  const PREV_KEYS = ['ArrowUp', 'ArrowLeft', 'PageUp'];

  addEventListener('keydown', (e) => {
    const k = e.key;
    const onProduct = state.chapter === PRODUCT_CHAPTER;

    const inControl = e.target.closest && e.target.closest('button, input, textarea, select');
    if (inControl && (k === ' ' || k === 'Enter')) return;

    if (k === ' ') {
      advancePresentation();
      e.preventDefault();
      return;
    } else if (state.chapter === 2 && (k === 'ArrowRight' || k === 'ArrowDown')) {
      if (curSaasScene < 3) {
        setSaasScene(curSaasScene + 1, true);
        e.preventDefault();
      }
    } else if (state.chapter === 2 && (k === 'ArrowLeft' || k === 'ArrowUp')) {
      if (curSaasScene > 1) {
        setSaasScene(curSaasScene - 1, true);
        e.preventDefault();
      }
    } else if (state.chapter === LAST && (k === 'ArrowRight' || k === 'ArrowDown')) {
      const s8 = $('#s8');
      if (s8 && !s8.classList.contains('show-punchline')) {
        s8.classList.add('show-punchline');
        e.preventDefault();
      }
    } else if (state.chapter === LAST && (k === 'ArrowLeft' || k === 'ArrowUp')) {
      const s8 = $('#s8');
      if (s8 && s8.classList.contains('show-punchline')) {
        s8.classList.remove('show-punchline');
        e.preventDefault();
        return;
      }
    } else if (onProduct && (k === 'ArrowRight' || k === 'ArrowLeft') && window.Demo && window.Demo.step(k === 'ArrowRight' ? 1 : -1)) {
      e.preventDefault();
    } else if (NEXT_KEYS.includes(k)) {
      goTo(state.chapter + 1);
      e.preventDefault();
    } else if (PREV_KEYS.includes(k)) {
      goTo(state.chapter - 1);
      e.preventDefault();
    } else if (k === 'Home') goTo(0);
    else if (k === 'End') goTo(LAST);
    else if (k === 'p' || k === 'P') toggleNotes();
    else if (k === 't' || k === 'T') toggleTimer();
    else if (k === 'r' || k === 'R') resetTimer();
  });

  /* ───────────── Global Mouse Click Advance ───────────── */
  addEventListener('click', (e) => {
    // Only primary (left) click
    if (e.button !== 0) return;

    // Do not trigger advance if clicking on dedicated controls
    if (e.target.closest('button, a, input, select, textarea, #nav, #hud, #notes, #zenTimer, .saas-step-btn')) {
      return;
    }

    advancePresentation();
  });

  /* ───────────── Three.js Right-Edge 1/4 Ring + 4-Color Ambient Cycle ───────────── */

  const rings = [document.querySelector('canvas.ring')].filter(Boolean);
  const ringViews = [];
  // Navy, Burgundy & Coral Ambient Lighting Palette
  const AMBIENT_COLORS = [
    [255, 107, 91],   // Warm Vibrant Coral (MOVE)
    [255, 145, 115],  // Warm Coral & Cream Peach (PINCH)
    [235, 75, 90],    // Deep Wine & Coral Core (CLICK)
    [210, 85, 130]    // Deep Plum & Rose Coral (TWIST)
  ];

  function initRingScenes() {
    if (typeof THREE === 'undefined') return;

    let sharedRingGeom = null;
    if (typeof window.RING_GLB_BASE64 === 'string') {
      const bin = (typeof atob === 'function') ? atob(window.RING_GLB_BASE64) : Buffer.from(window.RING_GLB_BASE64, 'base64').toString('binary');
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const loader = new THREE.GLTFLoader();
      loader.parse(bytes.buffer, '', (gltf) => {
        let m = null;
        gltf.scene.traverse((o) => { if (o.isMesh && !m) m = o; });
        if (m) {
          sharedRingGeom = m.geometry.clone();
          sharedRingGeom.center();
          sharedRingGeom.rotateY(Math.PI / 2); // Align ring circle into XY plane so Z-rotation spins in place
          sharedRingGeom.computeVertexNormals();
          setupViews(sharedRingGeom);
          initProductShowcase(sharedRingGeom);
        }
      });
    }

    function setupViews(geom) {
      rings.forEach((canvas) => {
        try {
          const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
          renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
          renderer.outputEncoding = THREE.sRGBEncoding;

          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
          camera.position.set(0, 0, 5.8);

          const amb = new THREE.AmbientLight(0xdce4e8, 0.72);
          scene.add(amb);

          const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
          keyLight.position.set(-2.5, 3.2, 4.0);
          scene.add(keyLight);

          const rimLight = new THREE.DirectionalLight(0x00A878, 1.8);
          rimLight.position.set(-3.5, 1.2, 1.8);
          scene.add(rimLight);

          const fillLight = new THREE.DirectionalLight(0x9aa8b6, 1.4);
          fillLight.position.set(1.5, -2.5, 2.5);
          scene.add(fillLight);

          const mat = new THREE.MeshStandardMaterial({
            color: 0xf5f7fa,
            metalness: 0.96,
            roughness: 0.14,
            emissive: 0x11161b,
            emissiveIntensity: 0.08,
            side: THREE.DoubleSide
          });

          const ringGroup = new THREE.Group();
          const scale = 1.0;
          ringGroup.scale.setScalar(scale);
          ringGroup.rotation.set(0.28, -0.38, 0.08);

          const mesh = new THREE.Mesh(geom, mat);
          ringGroup.add(mesh);
          scene.add(ringGroup);

          ringViews.push({ canvas, renderer, scene, camera, ringGroup, mesh, rimLight, fillLight, mat, scale });
          resizeView(ringViews[ringViews.length - 1]);
        } catch (e) {
          console.warn('Canvas ring init error:', e);
        }
      });
    }

    function resizeView(v) {
      const w = window.innerWidth || v.canvas.clientWidth;
      const h = window.innerHeight || v.canvas.clientHeight;
      if (!w || !h) return;
      v.renderer.setSize(w, h, false);
      v.camera.aspect = w / h;
      v.camera.updateProjectionMatrix();

      // Hero ring starts hidden; frame() raises it under the title on SPACE
    }

    window.addEventListener('resize', () => {
      ringViews.forEach(resizeView);
      if (productShowcase && productShowcase.resize) productShowcase.resize();
      if (typeof updateConnectLines === 'function') updateConnectLines();
    });
  }

  /* ───────────── Chapter 02: Three.js Product Showcase (3 Rings on Liquid Landscape) ───────────── */

  let productShowcase = null;
  window.productShowcase = null;

  function initProductShowcase(sharedRingGeom) {
    const canvas = document.getElementById('canvasProduct');
    if (!canvas || typeof THREE === 'undefined') return;

    try {
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.outputEncoding = THREE.sRGBEncoding;

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x090e18, 5.0, 22.0);
      const camera = new THREE.PerspectiveCamera(40, (canvas.clientWidth || window.innerWidth) / (canvas.clientHeight || window.innerHeight), 0.1, 100);
      camera.position.set(0, 0.95, 6.3);
      camera.lookAt(0, 0.20, 0);

      // 1. Atmosphere Lighting
      const ambLight = new THREE.AmbientLight(0x32445c, 0.95);
      scene.add(ambLight);

      // Key light: Moonlight Silver / Platinum
      const keyLight = new THREE.DirectionalLight(0xf0f6ff, 2.5);
      keyLight.position.set(-4.5, 6.5, 6.0);
      scene.add(keyLight);

      // Upper right warm key light for Rose Gold ring
      const rightKeyLight = new THREE.DirectionalLight(0xffedd9, 2.0);
      rightKeyLight.position.set(4.5, 4.8, 4.0);
      scene.add(rightKeyLight);

      // Rim light: Deep Burgundy / Coral sheen along ridges and silhouettes
      const rimLight = new THREE.DirectionalLight(0xff6b5b, 2.4);
      rimLight.position.set(5.5, 4.5, -4.5);
      scene.add(rimLight);

      // Fill light: Deep Navy
      const fillLight = new THREE.DirectionalLight(0x182c4a, 1.7);
      fillLight.position.set(1.5, -3.0, 3.5);
      scene.add(fillLight);

      // 2. Mountainous Undulating Wave Terrain (Navy -> Burgundy -> Coral Gradient)
      const terrainGeom = new THREE.PlaneGeometry(64, 48, 96, 72);
      terrainGeom.rotateX(-Math.PI / 2);
      const pos = terrainGeom.attributes.position;
      const baseY = new Float32Array(pos.count);
      const colors = [];
      const cNavy = new THREE.Color(0x0a1424);
      const cBurgundy = new THREE.Color(0x38121f);
      const cCoral = new THREE.Color(0x8e2e26);
      const cVoid = new THREE.Color(0x090e18);

      const wHalf = 32, dHalf = 24;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);

        const distFromCenter = Math.sqrt(Math.pow(x / wHalf, 2.0) + Math.pow((z + 2) / dHalf, 2.0));
        const edgeFactor = Math.max(0, 1.0 - Math.pow(Math.min(1.0, distFromCenter), 2.2));

        let h = -1.82;
        const wave = Math.sin(x * 0.20 + z * 0.16) * 0.48
                   + Math.cos(x * 0.11 - z * 0.22) * 0.42
                   + Math.sin(x * 0.32 + z * 0.28) * 0.20;
        const distRidge = Math.sin(x * 0.15) * 0.35 + Math.max(0, -z - 4.0) * 0.18;
        const ringBasin = Math.exp(-(x * x * 0.18 + z * z * 0.35)) * 0.45;

        h += (wave + distRidge - ringBasin) * edgeFactor;

        pos.setY(i, h);
        baseY[i] = h;

        const normH = Math.max(0, Math.min(1.0, (h - (-2.1)) / 1.7));
        const col = new THREE.Color();
        if (normH < 0.45) {
          col.copy(cNavy).lerp(cBurgundy, normH / 0.45);
        } else {
          col.copy(cBurgundy).lerp(cCoral, (normH - 0.45) / 0.55);
        }
        col.lerp(cVoid, 1.0 - edgeFactor);
        colors.push(col.r, col.g, col.b);
      }
      terrainGeom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      terrainGeom.computeVertexNormals();

      const terrainMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.34,
        metalness: 0.58,
        side: THREE.DoubleSide
      });
      const terrainMesh = new THREE.Mesh(terrainGeom, terrainMat);
      terrainMesh.position.set(0, 0, 0);
      scene.add(terrainMesh);

      // 3. Circular Soft Shadows beneath the rings
      function createShadowTexture() {
        const cvs = document.createElement('canvas');
        cvs.width = 128; cvs.height = 128;
        const ctx = cvs.getContext('2d');
        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, 'rgba(4, 7, 14, 0.85)');
        grad.addColorStop(0.35, 'rgba(5, 9, 18, 0.58)');
        grad.addColorStop(0.7, 'rgba(8, 14, 26, 0.18)');
        grad.addColorStop(1.0, 'rgba(8, 14, 26, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(cvs);
      }
      const shadowTex = createShadowTexture();
      const shadowGeom = new THREE.PlaneGeometry(1.6, 1.6);
      shadowGeom.rotateX(-Math.PI / 2);

      function createShadowMesh() {
        const mat = new THREE.MeshBasicMaterial({
          map: shadowTex,
          transparent: true,
          opacity: 0,
          depthWrite: false
        });
        return new THREE.Mesh(shadowGeom, mat);
      }

      const shadowCenter = createShadowMesh();
      shadowCenter.position.set(0, -1.72, 0);
      scene.add(shadowCenter);

      const shadowLeft = createShadowMesh();
      shadowLeft.position.set(-1.95, -1.72, 0);
      scene.add(shadowLeft);

      const shadowRight = createShadowMesh();
      shadowRight.position.set(1.95, -1.72, 0);
      scene.add(shadowRight);

      // 4. Center Ring: Existing Silver Titanium Model
      const ringCenter = new THREE.Group();
      const matCenter = new THREE.MeshStandardMaterial({
        color: 0xf6f8fb,
        metalness: 0.96,
        roughness: 0.12,
        emissive: 0x141a24,
        emissiveIntensity: 0.08,
        side: THREE.DoubleSide
      });
      const meshCenter = new THREE.Mesh(sharedRingGeom, matCenter);
      ringCenter.add(meshCenter);
      ringCenter.scale.setScalar(0.78);
      ringCenter.position.set(0, 5.2, 0); // starts high up
      scene.add(ringCenter);

      // 5. Left Ring: Concave Stealth Matte Graphite Titanium
      function createConcaveRingGeometry() {
        const pts = [];
        const R_in = 0.82, R_out = 0.98, halfH = 0.22, steps = 16;
        for (let i = 0; i <= steps; i++) {
          const u = i / steps;
          pts.push(new THREE.Vector2(R_in, -halfH + u * 2 * halfH));
        }
        for (let i = steps; i >= 0; i--) {
          const u = i / steps;
          const y = -halfH + u * 2 * halfH;
          const waist = Math.sin(u * Math.PI) * 0.046;
          pts.push(new THREE.Vector2(R_out - waist, y));
        }
        const geom = new THREE.LatheGeometry(pts, 64);
        geom.rotateX(Math.PI / 2);
        geom.computeVertexNormals();
        return geom;
      }
      const ringLeft = new THREE.Group();
      const matLeft = new THREE.MeshStandardMaterial({
        color: 0x242830,
        metalness: 0.88,
        roughness: 0.38,
        emissive: 0x090c12,
        emissiveIntensity: 0.06,
        side: THREE.DoubleSide
      });
      const meshLeft = new THREE.Mesh(createConcaveRingGeometry(), matLeft);
      ringLeft.add(meshLeft);
      ringLeft.scale.setScalar(0.76);
      ringLeft.position.set(-5.0, -0.05, -2.2);
      ringLeft.visible = false;
      scene.add(ringLeft);

      // 6. Right Ring: Champagne / Rose Gold Stepped Chamfered Ring with Equator Groove
      function createChamferedRingGeometry() {
        const pts = [];
        const R_in = 0.82, R_out = 0.98, H = 0.20;
        pts.push(new THREE.Vector2(R_in, -H));
        pts.push(new THREE.Vector2(R_in, H));
        pts.push(new THREE.Vector2(R_in + 0.03, H + 0.02));
        pts.push(new THREE.Vector2(R_out - 0.03, H + 0.02));
        pts.push(new THREE.Vector2(R_out, H - 0.02));
        pts.push(new THREE.Vector2(R_out, 0.035));
        pts.push(new THREE.Vector2(R_out - 0.03, 0.025));
        pts.push(new THREE.Vector2(R_out - 0.03, -0.025));
        pts.push(new THREE.Vector2(R_out, -0.035));
        pts.push(new THREE.Vector2(R_out, -H + 0.02));
        pts.push(new THREE.Vector2(R_out - 0.03, -H - 0.02));
        pts.push(new THREE.Vector2(R_in + 0.03, -H - 0.02));
        const geom = new THREE.LatheGeometry(pts, 64);
        geom.rotateX(Math.PI / 2);
        geom.computeVertexNormals();
        return geom;
      }
      const ringRight = new THREE.Group();
      const matRight = new THREE.MeshStandardMaterial({
        color: 0xebb89b,
        metalness: 0.95,
        roughness: 0.16,
        emissive: 0x24140e,
        emissiveIntensity: 0.08,
        side: THREE.DoubleSide
      });
      const meshRight = new THREE.Mesh(createChamferedRingGeometry(), matRight);
      ringRight.add(meshRight);
      ringRight.scale.setScalar(0.76);
      ringRight.position.set(5.0, 0.20, -2.2);
      ringRight.visible = false;
      scene.add(ringRight);

      function resize() {
        const w = canvas.parentElement.clientWidth || window.innerWidth;
        const h = canvas.parentElement.clientHeight || window.innerHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      resize();

      window.productShowcase = productShowcase = {
        canvas, renderer, scene, camera,
        terrainGeom, baseY,
        rimLight, keyLight, rightKeyLight,
        ringCenter, shadowCenter,
        ringLeft, shadowLeft,
        ringRight, shadowRight,
        resize
      };
    } catch (err) {
      console.warn('Product showcase init error:', err);
    }
  }

  /* ───────────── SaaS Platform Narrative Scenes State Manager ───────────── */
  let curSaasScene = 1;
  function setSaasScene(sceneNum, manual = false) {
    curSaasScene = sceneNum;
    if (manual) {
      window.__saasManualScene = true;
    }
    const s2 = $('#s2');
    for (let n = 1; n <= 3; n++) {
      const sc = document.getElementById(`saasScene${n}`);
      const btn = document.getElementById(`saasStepBtn${n}`);
      if (sc) sc.classList.toggle('active', n === sceneNum);
      if (btn) btn.classList.toggle('active', n === sceneNum);
    }
    if (s2) {
      s2.classList.toggle('saas-focus-api', sceneNum === 2);
      s2.classList.toggle('saas-focus-integration', sceneNum === 3);
    }
  }
  window.setSaasScene = setSaasScene;

  // Click listener for scene step buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('.saas-step-btn');
    if (btn) {
      const sc = parseInt(btn.getAttribute('data-scene'), 10) || 1;
      setSaasScene(sc, true);
    }
  });

  // Dynamic SVG Stream Connection Update
  function updateConnectLines() {
    const svg = document.getElementById('ringConnectSvg');
    if (!svg || !productShowcase) return;
    const psc = productShowcase;
    const rectSvg = svg.getBoundingClientRect();
    if (rectSvg.width === 0 || rectSvg.height === 0) return;

    const rings = [psc.ringLeft, psc.ringCenter, psc.ringRight];
    const vec = new THREE.Vector3();

    for (let i = 1; i <= 3; i++) {
      const ringObj = rings[i - 1];
      const row = document.getElementById(`swStreamRow${i}`);
      const pathBg = svg.querySelector(`.stream-bg.line-${i}`);
      const pathPulse = svg.querySelector(`.stream-pulse.line-${i}`);
      if (!ringObj || !row || !pathBg || !pathPulse) continue;

      ringObj.getWorldPosition(vec);
      vec.project(psc.camera);

      const ringScreenX = (vec.x * 0.5 + 0.5) * rectSvg.width;
      const ringScreenY = (-vec.y * 0.5 + 0.5) * rectSvg.height;

      // Stream begins cleanly at the right edge of each 3D ring
      const x1 = ringScreenX + 44;
      const y1 = ringScreenY;

      // Position minimalist ring captions directly beneath each 3D ring
      const caption = document.getElementById(`ringCaption${i}`);
      if (caption) {
        caption.style.left = `${ringScreenX.toFixed(1)}px`;
        caption.style.top = `${(ringScreenY + 68).toFixed(1)}px`;
      }

      // Stream lands at the input channel row of the software platform card
      const rRect = row.getBoundingClientRect();
      const x2 = rRect.left - rectSvg.left - 4;
      const y2 = rRect.top + rRect.height / 2 - rectSvg.top;

      const dx = Math.max(40, (x2 - x1) * 0.48);
      const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${(x1 + dx).toFixed(1)} ${y1.toFixed(1)}, ${(x2 - dx).toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
      pathBg.setAttribute('d', d);
      pathPulse.setAttribute('d', d);
    }
  }

  function updateProductShowcase(now) {
    if (!productShowcase) return;
    const psc = productShowcase;
    const tSec = now * 0.001;

    // Subtle breathing waves on terrain surface
    const pos = psc.terrainGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const ripple = Math.sin(tSec * 0.85 + x * 0.35 + z * 0.25) * 0.035;
      pos.setY(i, psc.baseY[i] + ripple);
    }
    psc.terrainGeom.computeVertexNormals();
    psc.terrainGeom.attributes.position.needsUpdate = true;

    // Cinematic Timeline
    const rawElapsed = (performance.now() - (state.s2StartTime || performance.now())) * 0.001;
    const elapsed = Math.max(0, rawElapsed);
    const s2 = $('#s2');

    // Phase 1: 0s ~ 0.85s: Center Ring descends briskly
    if (elapsed <= 0.85) {
      const p = Math.min(1.0, elapsed / 0.80);
      const e = 1 - Math.pow(1 - p, 3.0);
      const yPos = 5.2 * (1 - e) + 0.20 * e;
      psc.ringCenter.position.set(0, yPos, 0);
      psc.ringCenter.rotation.set(0.28, elapsed * 0.9, 0.06);
      psc.ringCenter.scale.setScalar(0.76);

      psc.shadowCenter.visible = true;
      psc.shadowCenter.material.opacity = 0.10 + 0.60 * e;
      psc.shadowCenter.scale.setScalar(1.5 * (1 - e) + 1.0 * e);

      psc.ringLeft.visible = false;
      psc.ringRight.visible = false;
      psc.shadowLeft.visible = false;
      psc.shadowRight.visible = false;

      psc.camera.position.set(0, 0.95, 6.3);
      psc.camera.lookAt(0, 0.20, 0);

      if (s2) s2.classList.remove('show-copy', 'show-platform', 'show-seq-1', 'show-seq-2', 'darken-out');
    }
    // Phase 2: 0.85s ~ 1.55s: Center Ring smooth turn & camera gentle approach
    else if (elapsed <= 1.55) {
      const p = Math.min(1.0, (elapsed - 0.85) / 0.70);
      const e = 0.5 - 0.5 * Math.cos(p * Math.PI);
      const floatY = 0.20 + Math.sin(elapsed * 2.2) * 0.02;
      psc.ringCenter.position.set(0, floatY, 0);
      psc.ringCenter.rotation.set(0.28 + Math.sin(p * Math.PI) * 0.05, 0.85 * 0.9 + e * Math.PI * 1.1, 0.06);

      psc.shadowCenter.visible = true;
      psc.shadowCenter.material.opacity = 0.70;
      psc.shadowCenter.scale.setScalar(1.0);

      psc.ringLeft.visible = false;
      psc.ringRight.visible = false;
      psc.shadowLeft.visible = false;
      psc.shadowRight.visible = false;

      const camZ = 6.3 * (1 - e) + 5.3 * e;
      const camY = 0.95 * (1 - e) + 0.70 * e;
      psc.camera.position.set(0, camY, camZ);
      psc.camera.lookAt(0, 0.20, 0);

      if (s2) s2.classList.remove('show-copy', 'show-platform', 'show-seq-1', 'show-seq-2', 'darken-out');
    }
    // Phase 3: 1.55s ~ 2.60s: Left and Right rings emerge briskly, camera backs up to show 3 rings
    else if (elapsed <= 2.60) {
      const p = Math.min(1.0, (elapsed - 1.55) / 1.0);
      const e = 1 - Math.pow(1 - p, 3.0);

      psc.ringLeft.visible = true;
      psc.ringRight.visible = true;
      psc.shadowLeft.visible = true;
      psc.shadowRight.visible = true;

      // Left Ring (Stealth Dark Titanium)
      const xl = -4.5 * (1 - e) + (-1.95) * e;
      const yl = 0.20 + Math.sin(elapsed * 1.8 + 1.2) * 0.025;
      psc.ringLeft.position.set(xl, yl, 0);
      psc.ringLeft.scale.setScalar(0.76 * e);
      psc.ringLeft.rotation.set(0.30, elapsed * 0.80, -0.16);

      psc.shadowLeft.position.set(xl, -1.72, 0);
      psc.shadowLeft.material.opacity = 0.65 * e;
      psc.shadowLeft.scale.setScalar(1.0 * e);

      // Right Ring (Rose Gold Chamfer)
      const xr = 4.5 * (1 - e) + 1.95 * e;
      const yr = 0.20 + Math.sin(elapsed * 1.8 + 2.4) * 0.025;
      psc.ringRight.position.set(xr, yr, 0);
      psc.ringRight.scale.setScalar(0.76 * e);
      psc.ringRight.rotation.set(0.26, -elapsed * 0.75, 0.16);

      psc.shadowRight.position.set(xr, -1.72, 0);
      psc.shadowRight.material.opacity = 0.65 * e;
      psc.shadowRight.scale.setScalar(1.0 * e);

      // Center Ring
      const yc = 0.20 + Math.sin(elapsed * 1.8) * 0.025;
      psc.ringCenter.position.set(0, yc, 0);
      psc.ringCenter.scale.setScalar(0.76);
      psc.ringCenter.rotation.y = 0.85 * 0.9 + Math.PI * 1.1 + (elapsed - 1.55) * 0.7;

      // Camera pulls back
      const camZ = 5.3 * (1 - e) + 6.3 * e;
      const camY = 0.70 * (1 - e) + 0.95 * e;
      psc.camera.position.set(0, camY, camZ);
      psc.camera.lookAt(0, 0.20, 0);

      if (s2) {
        s2.classList.remove('show-platform', 'show-seq-1', 'show-seq-2', 'darken-out');
        s2.classList.add('show-copy');
      }
    }
    // Phase 4: 2.60s ~ 3.10s: 3 rings hold stably in center
    else if (elapsed <= 3.10) {
      psc.ringLeft.visible = true;
      psc.ringRight.visible = true;
      psc.shadowLeft.visible = true;
      psc.shadowRight.visible = true;

      const yl = 0.20 + Math.sin(elapsed * 1.6 + 1.2) * 0.02;
      const yc = 0.20 + Math.sin(elapsed * 1.6) * 0.02;
      const yr = 0.20 + Math.sin(elapsed * 1.6 + 2.4) * 0.02;

      psc.ringLeft.position.set(-1.95, yl, 0);
      psc.ringCenter.position.set(0, yc, 0);
      psc.ringRight.position.set(1.95, yr, 0);

      psc.ringLeft.scale.setScalar(0.76);
      psc.ringCenter.scale.setScalar(0.76);
      psc.ringRight.scale.setScalar(0.76);

      psc.ringLeft.rotation.set(0.24, elapsed * 0.6, -0.10);
      psc.ringCenter.rotation.set(0.22, elapsed * 0.55, 0);
      psc.ringRight.rotation.set(0.24, -elapsed * 0.6, 0.10);

      psc.camera.position.set(0, 0.95, 6.3);
      psc.camera.lookAt(0, 0.20, 0);

      if (s2) {
        s2.classList.remove('show-platform', 'show-seq-1', 'show-seq-2', 'darken-out');
        s2.classList.add('show-copy');
      }
    }
    // Phase 5: 3.10s+: 3 Rings slide left, shrink scale, align vertically on left + Platform Reveal on right
    else {
      psc.ringLeft.visible = true;
      psc.ringRight.visible = true;

      // Smooth slide-left interpolation (3.10s ~ 4.20s: 1.1s duration)
      const p = Math.min(1.0, (elapsed - 3.10) / 1.10);
      const e = 0.5 - 0.5 * Math.cos(p * Math.PI);

      // Rings shrink scale from 0.76 down to 0.42 for bold, clear hardware presence
      const curScale = 0.76 * (1 - e) + 0.42 * e;
      psc.ringLeft.scale.setScalar(curScale);
      psc.ringCenter.scale.setScalar(curScale);
      psc.ringRight.scale.setScalar(curScale);

      // Target X on left: -2.15 (placed comfortably in the left half)
      const xl = -1.95 * (1 - e) + (-2.15) * e;
      const xc = 0.00 * (1 - e) + (-2.15) * e;
      const xr = 1.95 * (1 - e) + (-2.15) * e;

      // Vertical alignment: Balanced wide gap (Left: +1.24, Center: +0.02, Right: -1.20)
      const baseFl = Math.sin(elapsed * 1.5) * 0.015;
      const yl = 0.20 * (1 - e) + (1.24 + baseFl) * e;
      const yc = 0.20 * (1 - e) + (0.02 + baseFl) * e;
      const yr = 0.20 * (1 - e) + (-1.20 + baseFl) * e;

      const zPos = 0.0 * (1 - e) + 0.35 * e;

      psc.ringLeft.position.set(xl, yl, zPos);
      psc.ringCenter.position.set(xc, yc, zPos);
      psc.ringRight.position.set(xr, yr, zPos);

      // Studio presentation angles: tilted so side profile, chamfers and hollows are beautifully lit
      psc.ringLeft.rotation.set(0.32, 0.45 + elapsed * 0.25, -0.15);
      psc.ringCenter.rotation.set(0.24, 0.20 + elapsed * 0.22, 0.04);
      psc.ringRight.rotation.set(0.28, -0.40 - elapsed * 0.24, 0.15);

      // Ground shadows fade smoothly
      psc.shadowLeft.position.set(xl, -1.72, 0);
      psc.shadowCenter.position.set(xc, -1.72, 0);
      psc.shadowRight.position.set(xr, -1.72, 0);

      const shadowOp = 0.65 * (1 - e) + 0.18 * e;
      psc.shadowLeft.material.opacity = shadowOp;
      psc.shadowCenter.material.opacity = shadowOp;
      psc.shadowRight.material.opacity = shadowOp;

      psc.camera.position.set(0, 0.95, 6.3);
      psc.camera.lookAt(0, 0.20, 0);

      if (s2) {
        s2.classList.remove('show-copy');
        s2.classList.add('show-platform');

        // Smooth automatic narrative progression if presenter has not manually switched scenes
        if (!window.__saasManualScene) {
          if (elapsed < 6.8) {
            if (curSaasScene !== 1) setSaasScene(1);
          } else if (elapsed < 10.5) {
            if (curSaasScene !== 2) setSaasScene(2);
          } else {
            if (curSaasScene !== 3) setSaasScene(3);
          }
        }
      }

      // Update dynamic connecting SVG lines to track badges and input rows
      updateConnectLines();
    }

    psc.renderer.render(psc.scene, psc.camera);
  }

  const spinSpeedBase = REDUCED_MOTION ? 0.35 : 0.75;
  let ambCur = AMBIENT_COLORS[0].slice();
  let lastNow = 0;
  window.__ambTarget = 0;

  // Space duplication guard, s0 stages & dynamic curtain
  let s0Stage = 0; // 0: only logo, 1: personalizer revealed, 2: transitioning to ch2
  let spaceLocked = false;
  let curtain = $('#curtain');
  if (!curtain) {
    curtain = document.createElement('div');
    curtain.id = 'curtain';
    document.body.appendChild(curtain);
  }

  // Chapter 1 -> Chapter 2 Ring Variable-Speed Motion & Simultaneous Screen Rise
  let heroRingState = 0; // 0: idle hidden, 1: moving, 2: complete
  let heroRingStartTime = 0;
  const HERO_RING_DURATION = 2.1;

  function getRingY(p) {
    if (p <= 0.40) {
      // 1. Ring bottom -> up start: slowly accelerates
      const t = p / 0.40;
      const h = 0.40;
      const ya = -3.5, yb = -0.2, ma = 0.8, mb = 1.3;
      return (2 * t * t * t - 3 * t * t + 1) * ya + (t * t * t - 2 * t * t + t) * h * ma + (-2 * t * t * t + 3 * t * t) * yb + (t * t * t - t * t) * h * mb;
    } else if (p <= 0.68) {
      // 2. Screen middle: speed sharply decreases, passes slowly
      const t = (p - 0.40) / 0.28;
      const h = 0.28;
      const ya = -0.2, yb = 0.35, ma = 1.3, mb = 1.6;
      return (2 * t * t * t - 3 * t * t + 1) * ya + (t * t * t - 2 * t * t + t) * h * ma + (-2 * t * t * t + 3 * t * t) * yb + (t * t * t - t * t) * h * mb;
    } else {
      // 3. Screen top: sharp acceleration and exits upward (cubic-bezier(0.7, 0, 0.84, 0))
      const t = (p - 0.68) / 0.32;
      const h = 0.32;
      const ya = 0.35, yb = 4.4, ma = 1.6, mb = 26.0;
      return (2 * t * t * t - 3 * t * t + 1) * ya + (t * t * t - 2 * t * t + t) * h * ma + (-2 * t * t * t + 3 * t * t) * yb + (t * t * t - t * t) * h * mb;
    }
  }

  function getScreenProgress(p) {
    if (p <= 0.40) {
      const t = p / 0.40;
      return 0.12 * (t * t);
    } else if (p <= 0.68) {
      const t = (p - 0.40) / 0.28;
      return 0.12 + 0.14 * t;
    } else {
      const t = (p - 0.68) / 0.32;
      const k = Math.pow(t, 2.6);
      return 0.26 + 0.74 * k;
    }
  }

  function frame(now) {
    const dt = Math.min(0.05, Math.max(0, (now - lastNow) / 1000));
    lastNow = now;
    if (!document.hidden) {
      const t = now * 0.001;
      const tc = AMBIENT_COLORS[window.__ambTarget] || AMBIENT_COLORS[0];
      const k = 1 - Math.exp(-2.4 * dt);
      for (let i = 0; i < 3; i++) ambCur[i] += (tc[i] - ambCur[i]) * k;
      const r = Math.round(ambCur[0]), g = Math.round(ambCur[1]), b = Math.round(ambCur[2]);

      document.documentElement.style.setProperty('--amb-rgb', `${r}, ${g}, ${b}`);
      window.__currentAmbRGB = [r / 255, g / 255, b / 255];

      if (heroRingState === 1) {
        const elapsed = (now - heroRingStartTime) * 0.001;
        const p = Math.min(1.0, elapsed / HERO_RING_DURATION);
        const yPos = getRingY(p);
        const screenP = getScreenProgress(p);

        // Screen itself rises up simultaneously with the ring
        const s1 = $('#s1');
        const targetScroll = s1 ? s1.offsetTop : window.innerHeight;
        window.scrollTo(0, targetScroll * screenP);


        for (const v of ringViews) {
          if (v.canvas.parentElement.dataset.vis !== '1') continue;
          v.ringGroup.scale.setScalar(0.76);
          v.ringGroup.position.set(0, yPos, 0);
          v.ringGroup.rotation.y = t * spinSpeedBase * 2.2;
          v.ringGroup.rotation.x = 0.45 + Math.sin(t * 0.35) * 0.14;
          v.ringGroup.rotation.z = Math.cos(t * 0.25) * 0.1;

          v.rimLight.color.setRGB((r / 255) * 0.85, (g / 255) * 0.85, (b / 255) * 0.85);
          v.fillLight.color.setRGB(0.08, 0.13, 0.24);
          v.mat.emissive.setRGB(0.04, 0.015, 0.02);

          v.renderer.render(v.scene, v.camera);
        }

        if (p >= 1.0) {
          heroRingState = 2;
          document.documentElement.style.scrollSnapType = '';
          document.documentElement.style.scrollBehavior = '';
          goTo(1);
          setTimeout(() => {
            spaceLocked = false;
          }, 200);
        }
      }

      if (state.chapter === 2 || ($('#s2') && $('#s2').dataset.vis === '1')) {
        updateProductShowcase(now);
      }
    }
    requestAnimationFrame(frame);
  }

  /* ───────────── Boot ───────────── */

  setChapter(0);
  drawTimer();
  toggleTimer(); // timer starts automatically; click the timer or press R to reset
  initRingScenes();
  requestAnimationFrame(frame);
})();
