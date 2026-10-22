import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

// No remote textures or APIs: the studio lighting and all geometry are local.
export function createCore() {
  const canvas = document.querySelector('#core-canvas');
  const host = document.querySelector('.hero-art');
  let renderer;
  try {renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: true, powerPreference: 'low-power'});} catch {return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.6;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);camera.position.set(0, 0, 7.5);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  room.dispose();pmrem.dispose();
  scene.add(new THREE.AmbientLight(0xc4d5ff, 1));
  const cool = new THREE.PointLight(0x657aff, 16);cool.position.set(-3, 2, 3);scene.add(cool);
  const rim = new THREE.PointLight(0xc8a7ff, 14);rim.position.set(3, -1, 2);scene.add(rim);
  const group = new THREE.Group();scene.add(group);
  const geometry = new THREE.TorusKnotGeometry(1.04, .32, 160, 28, 2, 3);
  const material = new THREE.MeshPhysicalMaterial({color: 0x738ae6, metalness: .54, roughness: .13, transmission: .22, thickness: .65, ior: 1.45, clearcoat: 1, clearcoatRoughness: .1, iridescence: .5, iridescenceIOR: 1.3, envMapIntensity: 1.8});
  const knot = new THREE.Mesh(geometry, material);knot.rotation.set(.4, -.3, -.5);group.add(knot);
  const ringMaterial = new THREE.MeshStandardMaterial({color: 0xa2b4ff, metalness: .7, roughness: .2, emissive: 0x4356b5, emissiveIntensity: .35});
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.88, .007, 8, 160), ringMaterial);ring.rotation.set(1.15, .2, -.5);group.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.6, .004, 8, 160), ringMaterial);ring2.rotation.set(.3, 1.1, .5);group.add(ring2);
  const marker = new THREE.Mesh(new THREE.SphereGeometry(.045, 16, 16), new THREE.MeshBasicMaterial({color: 0xc6d1ff}));group.add(marker);
  let width, height;
  function resize() {width = host.clientWidth;height = host.clientHeight;renderer.setSize(width, height, false);camera.aspect = width / height;camera.updateProjectionMatrix();if (reducedMotion) renderer.render(scene, camera);}
  new ResizeObserver(resize).observe(host);resize();
  const pointer = {x: 0, y: 0};
  host.addEventListener('pointermove', (event) => {if (event.pointerType !== 'mouse') return;const rect = host.getBoundingClientRect();pointer.x = ((event.clientX - rect.left) / rect.width - .5) * .5;pointer.y = ((event.clientY - rect.top) / rect.height - .5) * .4;});
  host.addEventListener('pointerleave', () => {pointer.x = 0;pointer.y = 0;});
  let visible = true;
  new IntersectionObserver(([entry]) => {visible = entry.isIntersecting;}).observe(host);
  let elapsed = 0, last = 0;
  function render(now) {
    if (!last) last = now;
    const delta = Math.min((now - last) / 1000, .05);last = now;
    if (visible && !document.hidden) {
      elapsed += delta;
      if (!reducedMotion) {
        knot.rotation.y += delta * .12;knot.rotation.z = -.5 + Math.sin(elapsed * .3) * .1;
        group.rotation.y += (pointer.x - group.rotation.y) * .035;
        group.rotation.x += (pointer.y - group.rotation.x) * .035;
        group.position.y = Math.sin(elapsed * .6) * .07;
      }
      marker.position.set(Math.cos(elapsed * .2) * 1.88, Math.sin(elapsed * .2) * .73, Math.sin(elapsed * .2) * 1.7);
      renderer.render(scene, camera);
      host.classList.add('webgl-ready');
    }
    if (!reducedMotion) requestAnimationFrame(render);
  }
  canvas.addEventListener('webglcontextlost', (event) => {event.preventDefault();host.classList.remove('webgl-ready');});
  requestAnimationFrame(render);
}
