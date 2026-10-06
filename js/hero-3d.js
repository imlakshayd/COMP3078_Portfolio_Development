/* ============================================
   Three.js hero background — "paper dust" field
   Lazily imported by script.js; the site works
   fine if three.js fails to load.
   ============================================ */

const CDN_URLS = [
  'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js',
  'https://unpkg.com/three@0.166.1/build/three.module.js',
];

async function loadThree() {
  for (const url of CDN_URLS) {
    try { return await import(url); } catch (e) { /* try next */ }
  }
  return null;
}

function cssColor(name) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return raw || '#c06a3b';
}

export async function initHero3D() {
  // Respect motion preference entirely
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const THREE = await loadThree();
  if (!THREE || !THREE.WebGLRenderer) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'hero-3d';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  cam.position.z = 14;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  cam.position.z = 15;

  // Two interleaved fields: warm accent dust + pale "paper" motes
  const isMobile = matchMedia('(max-width: 768px)').matches;
  const accentColor = new THREE.Color(cssColor('--accent'));
  const paperColor = new THREE.Color('#ede4d6');

  function makeField(count, color, size, opacity) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 34;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 26;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color, size, transparent: true, opacity,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);
    return { geo, mat, baseOpacity: opacity };
  }

  const dust  = makeField(isMobile ? 900 : 2200, accentColor, 0.06, 0.55);
  const motes = makeField(isMobile ? 450 : 1200, paperColor,  0.03, 0.35);

  /* Wireframe geometry behind the hero — quiet structural depth */
  const lattice = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(6.5, 1)),
    new THREE.LineBasicMaterial({ color: accentColor, transparent: true, opacity: 0.16 })
  );
  lattice.position.set(0, 0.5, -6);
  scene.add(lattice);

  const orbit = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.TorusGeometry(9, 0.6, 5, 42)),
    new THREE.LineBasicMaterial({ color: paperColor, transparent: true, opacity: 0.10 })
  );
  orbit.position.set(4.5, -1, -5);
  orbit.rotation.x = 1.15;
  scene.add(orbit);

  // Pointer + scroll state (eased, never raw)
  let mx = 0, my = 0, scrollFade = 1;
  addEventListener('pointermove', (e) => {
    mx = e.clientX / innerWidth - 0.5;
    my = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  const hero = document.getElementById('home');
  function onScroll() {
    const h = hero ? hero.offsetHeight : innerHeight;
    scrollFade = Math.max(0, 1 - scrollY / h);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  addEventListener('resize', () => {
    cam.aspect = innerWidth / innerHeight;
    cam.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  // Pause rendering entirely once the hero scrolls away
  let heroVisible = true;
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }, { threshold: 0 })
    .observe(hero || document.body);

  // Re-read theme colors when dark/light toggles
  new MutationObserver(() => {
    dust.mat.color.set(cssColor('--accent'));
    motes.mat.color.set(cssColor('--text-primary'));
    dust.mat.opacity = 0.5;
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  motes.mat.color.set(cssColor('--text-primary'));

  renderer.setAnimationLoop((t) => {
    if (!heroVisible || scrollFade <= 0.01) return;
    dust.geo.rotateY(t * 0.000035);
    motes.geo.rotateY(-t * 0.00002);
    cam.position.x += (mx * 2.2 - cam.position.x) * 0.045;
    cam.position.y += (-my * 1.4 + scrollFade * 2 - cam.position.y) * 0.045;
    cam.lookAt(0, 0, 0);
    dust.mat.opacity  = 0.5  * scrollFade;
    motes.mat.opacity = 0.3  * scrollFade;
    canvas.style.opacity = scrollFade.toFixed(3);
    renderer.render(scene, cam);
  });
}
