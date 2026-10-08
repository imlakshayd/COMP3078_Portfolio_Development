// Hero background v3 — "signal field": a slow coherent wave, not noise.
// A grid of points undulates on one traveling sine wave (green), one pale
// ribbon traces the crest line, and a faint wireframe skeleton anchors it.
// Lazy: dynamic import fires only when the hero is first scrolled near.
export function initHero3D() {
  const hero = document.getElementById('home');
  if (!hero) return;
  let canvas = document.getElementById('hero-3d');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'hero-3d';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { canvas.style.display = 'none'; return; }

  let started = false, THREE = null, raf = 0, visible = true;
  let mx = 0, my = 0, camTX = 0, camTY = 0;
  let scrollFade = 1;

  function cssColor(name) {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return raw || '#1ed760';
  }

  const io = new IntersectionObserver((entries) => {
    visible = entries.some(e => e.isIntersecting);
    if (visible && started && !raf) loop(performance.now());
  }, { threshold: 0 });
  io.observe(hero);

  load();

  function load() {
    import('https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js')
      .then(init)
      .catch(() => import('https://unpkg.com/three@0.166.1/build/three.module.js').then(init).catch(() => {}));
  }

  function init(T) {
    THREE = T;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 15);

    // ---- the wave lattice: one coherent traveling sine, green points ----
    const NX = 46, NZ = 26;             // grid resolution
    const W = 34, D = 20;               // world size
    const n = NX * NZ;
    const pos = new Float32Array(n * 3);
    const base = new Float32Array(n * 2); // x,z footprints
    for (let i = 0; i < n; i++) {
      const gx = (i % NX) / (NX - 1) - 0.5;
      const gz = Math.floor(i / NX) / (NZ - 1) - 0.5;
      base[i * 2] = gx * W;
      base[i * 2 + 1] = gz * D;
      pos[i * 3] = gx * W;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = gz * D - 4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const accentColor = new THREE.Color(cssColor('--accent'));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({
      color: accentColor, size: 0.055, transparent: true, opacity: 0.5,
      sizeAttenuation: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    pts.frustumCulled = false;
    scene.add(pts);

    // ---- pale crest ribbon tracing one line of the same wave ----
    const RN = 90;
    const rpos = new Float32Array(RN * 3);
    const rgeo = new THREE.BufferGeometry();
    rgeo.setAttribute('position', new THREE.BufferAttribute(rpos, 3));
    const ribbon = new THREE.Line(rgeo, new THREE.LineBasicMaterial({
      color: new THREE.Color('#b3b3b3'), transparent: true, opacity: 0.4, depthWrite: false,
    }));
    ribbon.frustumCulled = false;
    scene.add(ribbon);

    // ---- faint geometry skeleton ----
    const wireColor = new THREE.Color(cssColor('--accent'));
    const lat = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(7.5, 1)),
      new THREE.LineBasicMaterial({ color: wireColor, transparent: true, opacity: 0.05, depthWrite: false })
    );
    lat.position.set(0, 0, -9);
    scene.add(lat);

    const WAVE_K = 0.32;   // spatial frequency
    const WAVE_A = 0.9;    // amplitude
    const WAVE_V = 0.00016; // rad/ms — ~1 cycle per 39 s
    function wave(x, z, t) {
      const p = (x * WAVE_K + z * WAVE_K * 0.45) - t * WAVE_V;
      return Math.sin(p) * WAVE_A + Math.sin(p * 0.5 + 1.3) * WAVE_A * 0.35;
    }

    function deform(t) {
      for (let i = 0; i < n; i++) {
        pos[i * 3 + 1] = wave(base[i * 2], base[i * 2 + 1], t);
      }
      geo.attributes.position.needsUpdate = true;
      for (let i = 0; i < RN; i++) {
        const x = (i / (RN - 1) - 0.5) * W;
        rpos[i * 3] = x;
        rpos[i * 3 + 1] = wave(x, D * 0.18, t) * 1.6;
        rpos[i * 3 + 2] = D * 0.18 - 4;
      }
      rgeo.attributes.position.needsUpdate = true;
    }

    function resize() {
      const w = innerWidth, h = innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    addEventListener('resize', resize);

    addEventListener('pointermove', (e) => {
      mx = (e.clientX / innerWidth - 0.5) * 2;
      my = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });

    function onScroll() {
      scrollFade = Math.max(0, 1 - scrollY / (innerHeight * 0.85));
      canvas.style.opacity = scrollFade.toFixed(3);
      if (scrollFade <= 0 && raf) { cancelAnimationFrame(raf); raf = 0; }
      else if (scrollFade > 0 && !raf && visible) loop(performance.now());
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const obs = new MutationObserver(() => {
      pts.material.color.set(cssColor('--accent'));
      lat.material.color.set(cssColor('--accent'));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    let last = 0;
    function loop(t) {
      if (!visible || scrollFade <= 0) { raf = 0; return; }
      raf = requestAnimationFrame(loop);
      if (t - last < 24) return; // ~40 fps cap — deliberately unhurried
      last = t;
      deform(t);
      lat.rotation.y = t * 0.000008;
      camTX = mx * 1.2;
      camTY = -my * 0.8 + scrollFade * 1.2;
      camera.position.x += (camTX - camera.position.x) * 0.014;
      camera.position.y += (camTY - camera.position.y) * 0.014;
      camera.lookAt(0, 0, -2);
      renderer.render(scene, camera);
    }
    deform(performance.now());
    renderer.render(scene, camera);
    canvas.style.opacity = scrollFade.toFixed(3);
    loop(performance.now());

    canvas._heroDestroy = () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
      geo.dispose(); rgeo.dispose(); lat.geometry.dispose();
      pts.material.dispose(); ribbon.material.dispose(); lat.material.dispose();
      renderer.dispose();
    };
  }

  addEventListener('pagehide', () => { if (canvas._heroDestroy) canvas._heroDestroy(); });
}
