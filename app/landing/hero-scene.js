import * as THREE from 'three';

// Image-based 2.5D scene: preserve the approved artwork and character identities.
const host = document.querySelector('.hero-landscape');
const fallback = host.querySelector('img');
const toggle = host.querySelector('.scene-toggle');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let renderer, scene, camera, landscape, texture, resizeObserver, visibilityObserver;
let ready = false, failed = false, visible = true, paused = motion.matches;
let elapsed = 0, lastTime = null, frames = 0;
const pointer = new THREE.Vector2();
const easedPointer = new THREE.Vector2();
const uniforms = { uImage: { value: null }, uTime: { value: 0 } };

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // Foreground terrain projects forward; distant sky stays behind it.
    p.z = 0.13 * pow(1.0 - uv.y, 2.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const fragmentShader = `
  uniform sampler2D uImage;
  uniform float uTime;
  varying vec2 vUv;
  float region(vec2 p, vec2 center, vec2 radius) {
    return 1.0 - smoothstep(0.45, 1.0, length((p - center) / radius));
  }
  void main() {
    vec2 uv = vUv;
    float t = uTime;
    // Move the sky slowly, with a soft boundary above the sculpted houses.
    float sky = smoothstep(0.79, 0.95, uv.y);
    uv.x += sin(t * 0.10) * 0.023 * sky;
    // A breeze through the grass, kept away from buildings and companions.
    float grass = 1.0 - smoothstep(0.10, 0.27, uv.y);
    uv.x += sin(uv.y * 100.0 + uv.x * 32.0 + t * 1.1) * 0.0011 * grass;
    uv.y += sin(uv.x * 72.0 - t * 0.8) * 0.0006 * grass;
    // Luma's playful sway and Nori's slower breathing remain deliberately small.
    float luma = region(uv, vec2(0.18, 0.42), vec2(0.115, 0.31));
    float nori = region(uv, vec2(0.81, 0.36), vec2(0.085, 0.24));
    uv.x += sin(t * 1.25) * 0.0027 * luma;
    uv.y += sin(t * 1.25) * 0.0035 * luma;
    uv.y += sin(t * 0.9) * 0.0018 * nori;
    float ball = region(uv, vec2(0.26, 0.235), vec2(0.033, 0.075));
    uv.y += (0.5 + 0.5 * sin(t * 1.25)) * 0.006 * ball;
    vec4 color = texture2D(uImage, clamp(uv, vec2(0.001), vec2(0.999)));
    gl_FragColor = color;
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function updateControl() {
  toggle.hidden = !ready || failed || motion.matches;
  toggle.setAttribute('aria-label', paused ? 'Play landscape animation' : 'Pause landscape animation');
  toggle.querySelector('use').setAttribute('href', `./hugeicons.svg#${paused ? 'play' : 'pause'}`);
}
function syncPlayback() {
  if (!renderer || !ready || failed) return;
  const running = !paused && !motion.matches && visible && !document.hidden;
  host.dataset.sceneState = running ? 'running' : 'paused';
  renderer.setAnimationLoop(running ? frame : null);
  lastTime = null;
  updateControl();
}
function frame(time) {
  const delta = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;
  elapsed += delta;
  uniforms.uTime.value = elapsed;
  easedPointer.lerp(pointer, 1 - Math.exp(-delta * 3));
  camera.position.x = easedPointer.x * 0.085 + Math.sin(elapsed * 0.17) * 0.035;
  camera.position.y = easedPointer.y * 0.035 + Math.sin(elapsed * 0.13) * 0.018;
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
  // Low-frequency diagnostic attributes make pause/offscreen behavior inspectable.
  if (++frames % 30 === 0) host.dataset.sceneFrame = String(frames);
}
function resize() {
  if (!renderer || !landscape || failed) return;
  const width = fallback.clientWidth, height = fallback.clientHeight;
  if (!width || !height) return;
  renderer.setPixelRatio(Math.min(devicePixelRatio, width < 761 ? 1.5 : 2));
  renderer.setSize(width, height, false);
  renderer.domElement.style.top = `${fallback.offsetTop}px`;
  const aspect = width / height;
  camera.left = -aspect; camera.right = aspect;
  camera.updateProjectionMatrix();
  const cover = Math.max(1, aspect / (8 / 3)) * 1.035;
  landscape.scale.setScalar(cover);
  renderer.render(scene, camera);
}
function useFallback() {
  failed = true;
  ready = false;
  host.dataset.sceneState = 'fallback';
  host.classList.remove('scene-ready');
  toggle.hidden = true;
  renderer?.setAnimationLoop(null);
  resizeObserver?.disconnect();
  visibilityObserver?.disconnect();
  renderer?.domElement.remove();
  landscape?.geometry.dispose();
  landscape?.material.dispose();
  texture?.dispose();
  renderer?.dispose();
}
async function init() {
  if (renderer || failed || motion.matches) return;
  try {
    await fallback.decode();
    renderer = new THREE.WebGLRenderer({ alpha: false, antialias: false, powerPreference: 'low-power' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = 'hero-canvas';
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.addEventListener('webglcontextlost', (event) => { event.preventDefault(); useFallback(); });
    host.insertBefore(renderer.domElement, toggle);
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-8/3, 8/3, 1, -1, 0.1, 10);
    camera.position.z = 3;
    texture = new THREE.Texture(fallback);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    uniforms.uImage.value = texture;
    landscape = new THREE.Mesh(new THREE.PlaneGeometry(16/3, 2, 80, 32),
      new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader }));
    scene.add(landscape);
    let shaderFailed = false;
    renderer.debug.onShaderError = () => { shaderFailed = true; };
    resize();
    if (shaderFailed) throw new Error('Landscape shader unavailable');
    ready = true;
    host.classList.add('scene-ready');
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(fallback);
    visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncPlayback(); });
    visibilityObserver.observe(host);
    syncPlayback();
  } catch { useFallback(); }
}
host.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse') return;
  const rect = host.getBoundingClientRect();
  pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2);
});
host.addEventListener('pointerleave', () => pointer.set(0, 0));
toggle.addEventListener('click', () => { paused = !paused; syncPlayback(); });
document.addEventListener('visibilitychange', syncPlayback);
motion.addEventListener('change', () => {
  paused = motion.matches;
  if (motion.matches) {
    host.classList.remove('scene-ready');
    syncPlayback();
  } else if (ready) {
    host.classList.add('scene-ready');
    syncPlayback();
  } else init();
});
window.addEventListener('pagehide', () => { renderer?.setAnimationLoop(null); lastTime = null; });
window.addEventListener('pageshow', syncPlayback);
init();
