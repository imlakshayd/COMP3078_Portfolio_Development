// Hero background v4 — a quiet planet, not a particle storm.
// Wireframe sphere with a rim-lit atmosphere shell, two tilted ring bands,
// slow rotation + breathing, camera drift follows the pointer.
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
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { canvas.style.display = 'none'; return; }

  let THREE = null, raf = 0, visible = true, scrollFade = 1;
  let mx = 0, my = 0;

  function cssColor(name) {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return raw || '#1ed760';
  }

  const io = new IntersectionObserver((entries) => {
    visible = entries.some(e => e.isIntersecting);
    if (visible && raf === -1) { raf = 0; loop(performance.now()); }
  }, { threshold: 0 });
  io.observe(hero);

  import('https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js')
    .then(init)
    .catch(() => import('https://unpkg.com/three@0.166.1/build/three.module.js').then(init).catch(() => {}));

  function init(T) {
    THREE = T;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 15);

    const accent = new THREE.Color(cssColor('--accent'));
    const R = 4.4;

    // ---- planet: wireframe core ----
    const core = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(R, 2)),
      new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.08, depthWrite: false })
    );
    scene.add(core);

    // ---- atmosphere: inverted shell, rim glow via fresnel shader ----
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(R * 1.16, 48, 48),
      new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: accent.clone() } },
        vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'uniform vec3 uColor; varying vec3 vN; void main(){ float i = pow(0.72 - dot(vN, vec3(0.0,0.0,1.0)), 3.5); gl_FragColor = vec4(uColor, 1.0) * clamp(i, 0.0, 1.0) * 0.7; }'
      })
    );
    scene.add(atmo);

    // ---- ring bands (Saturn, but drafting-table) ----
    function ring(r0, r1, segments, opacity) {
      const g = new THREE.RingGeometry(r0, r1, segments);
      const m = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false });
      const mesh = new THREE.Mesh(g, m);
      mesh.rotation.x = Math.PI / 2.35;
      return mesh;
    }
    const ringA = ring(R * 1.5, R * 1.545, 128, 0.14);
    const ringB = ring(R * 1.82, R * 1.845, 128, 0.08);
    ringB.rotation.z = 0.22;
    const ringGroup = new THREE.Group();
    ringGroup.add(ringA, ringB);
    scene.add(ringGroup);

    // ---- one faint moon tracing the outer ring ----
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 12, 12),
      new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.7 })
    );
    scene.add(moon);

    function place() {
      // planet to the right, behind the copy column — like the old torus orbit
      core.position.set(5.6, -1.2, -7);
      atmo.position.copy(core.position);
      ringGroup.position.copy(core.position);
      ringGroup.rotation.x = 0.42;
      ringGroup.rotation.y = 0.16;
    }
    place();

    function resize() {
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      // keep the planet right-of-center on narrow screens too
      const squeeze = Math.max(0, 1 - innerWidth / 1100);
      core.position.x = 5.6 - squeeze * 5.6;
      atmo.position.x = core.position.x;
      ringGroup.position.x = core.position.x;
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
      if (scrollFade <= 0 && raf > 0) { cancelAnimationFrame(raf); raf = -1; }
      else if (scrollFade > 0 && raf === 0 && visible) loop(performance.now());
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function applyTheme() {
      const light = document.documentElement.getAttribute('data-theme') === 'light';
      const c = new THREE.Color(cssColor('--accent'));
      core.material.color.copy(c);
      atmo.material.uniforms.uColor.value.copy(c);
      ringA.material.color.copy(c);
      ringB.material.color.copy(c);
      moon.material.color.copy(c);
      // additive glow reads on dark; on light backgrounds switch to normal
      core.material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      atmo.material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      ringA.material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      ringB.material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      moon.material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      core.material.needsUpdate = atmo.material.needsUpdate = true;
      core.material.opacity = light ? 0.22 : 0.08;
      ringA.material.opacity = light ? 0.26 : 0.14;
      ringB.material.opacity = light ? 0.16 : 0.08;
    }
    applyTheme();
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    let last = 0;
    function loop(t) {
      if (!visible || scrollFade <= 0) return;
      raf = requestAnimationFrame(loop);
      if (t - last < 30) return; // ~33 fps — deliberately calm
      last = t;
      const spin = t * 0.000028;                 // ~1 rev / 6 min
      core.rotation.y = spin;
      core.rotation.x = 0.25 + Math.sin(t * 0.000015) * 0.06;
      const breathe = 1 + Math.sin(t * 0.00006) * 0.015;
      atmo.scale.setScalar(breathe);
      ringGroup.rotation.z = spin * 0.4;
      const a = t * 0.00007;                     // moon orbit ~2.5 min
      const rr = R * 1.66;
      moon.position.set(
        core.position.x + Math.cos(a) * rr,
        core.position.y + Math.sin(a) * rr * Math.sin(0.42),
        core.position.z + Math.sin(a) * rr * Math.cos(0.42)
      );
      camera.position.x += (mx * 1.1 - camera.position.x) * 0.014;
      camera.position.y += (-my * 0.7 + scrollFade * 1.0 - camera.position.y) * 0.014;
      camera.lookAt(0.8, 0, -2);
      renderer.render(scene, camera);
    }
    renderer.render(scene, camera);
    loop(performance.now());

    canvas._heroDestroy = () => {
      cancelAnimationFrame(raf);
      core.geometry.dispose(); core.material.dispose();
      atmo.geometry.dispose(); atmo.material.dispose();
      ringA.geometry.dispose(); ringA.material.dispose();
      ringB.geometry.dispose(); ringB.material.dispose();
      moon.geometry.dispose(); moon.material.dispose();
      renderer.dispose();
    };
  }

  addEventListener('pagehide', () => { if (canvas._heroDestroy) canvas._heroDestroy(); });
}
