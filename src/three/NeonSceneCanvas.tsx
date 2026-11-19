import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { buildNeonSculpture } from './neonGlyphs';

interface NeonSceneCanvasProps {
  reducedMotion: boolean;
  isScheduleOpen: boolean;
}

const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 0.55, 11.8);
const DEFAULT_TARGET = new THREE.Vector3(0, 0.35, 0);

const PRIMARY_COLOR = new THREE.Color('#22D3EE');
const SECONDARY_COLOR = new THREE.Color('#EC4899');
const RING_COLOR = new THREE.Color('#38BDF8');

const _tempColor = new THREE.Color();
const _raycaster = new THREE.Raycaster();
const _pointerNDC = new THREE.Vector2();
const _vec3 = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createParticleTexture(): THREE.CanvasTexture {
  const size = 16;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Crisp square pixel particle with bright core and 2px stepped border
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(2, 2, 12, 12);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(4, 4, 8, 8);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

function createHorizonGridTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
    const step = size / 8;
    for (let i = 0; i < 8; i++) {
      const p = i * step;
      ctx.fillRect(p, 0, 2, size);
      ctx.fillRect(0, p, size, 2);
      // Pixel intersection dot
      ctx.fillStyle = 'rgba(34, 211, 238, 0.45)';
      ctx.fillRect(p - 1, p - 1, 4, 4);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
    }

    ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(18, 18);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export const NeonSceneCanvas: React.FC<NeonSceneCanvasProps> = ({
  reducedMotion,
  isScheduleOpen,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const reducedMotionRef = useRef(reducedMotion);
  const isScheduleOpenRef = useRef(isScheduleOpen);
  const surgeIntensityRef = useRef(1.05);

  const [contextLost, setContextLost] = useState(false);
  const [webglError, setWebglError] = useState(false);
  const [remountKey, setRemountKey] = useState(0);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    isScheduleOpenRef.current = isScheduleOpen;
  }, [isScheduleOpen]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const isSoftwareGl = detectSoftwareWebGL();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x05070d, 1);

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(canvas);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070d);
    scene.fog = new THREE.FogExp2(0x05070d, 0.032);

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 120);
    camera.position.copy(DEFAULT_CAMERA_POS);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnvTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = roomEnvTexture;
    pmremGenerator.dispose();

    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x0b0f1c, 0.55);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xf8fafc, 0.95);
    keyLight.position.set(5, 8, 9);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.72);
    rimLight.position.set(-6, 5, -7);
    scene.add(rimLight);

    const primaryPointLight = new THREE.PointLight(0x22d3ee, 8.5, 22, 1.8);
    primaryPointLight.position.set(-1.8, 1.4, 2.5);
    scene.add(primaryPointLight);

    const secondaryPointLight = new THREE.PointLight(0xec4899, 7.5, 22, 1.8);
    secondaryPointLight.position.set(1.8, -1.1, 2.5);
    scene.add(secondaryPointLight);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const sculpture = buildNeonSculpture(maxAnisotropy);
    scene.add(sculpture.root);

    sculpture.primaryCoreMat.emissive.copy(PRIMARY_COLOR);
    sculpture.primaryTubeMat.color.copy(PRIMARY_COLOR);
    sculpture.primaryTubeMat.emissive.copy(PRIMARY_COLOR);
    sculpture.secondaryCoreMat.emissive.copy(SECONDARY_COLOR);
    sculpture.secondaryTubeMat.color.copy(SECONDARY_COLOR);
    sculpture.secondaryTubeMat.emissive.copy(SECONDARY_COLOR);
    sculpture.frameTubeMat.color.copy(RING_COLOR);
    sculpture.frameTubeMat.emissive.copy(PRIMARY_COLOR);
    sculpture.ringOuterMat.color.copy(PRIMARY_COLOR);
    sculpture.ringOuterMat.emissive.copy(PRIMARY_COLOR);
    sculpture.ringInnerMat.color.copy(SECONDARY_COLOR);
    sculpture.ringInnerMat.emissive.copy(SECONDARY_COLOR);
    sculpture.primaryHaloMat.color.copy(PRIMARY_COLOR);
    sculpture.secondaryHaloMat.color.copy(SECONDARY_COLOR);

    const particleTex = createParticleTexture();

    // --- LSL School Dissolve Particle Cloud ---
    const dissolveCount = sculpture.dissolveSamples.length;
    const dissolveGeo = new THREE.BufferGeometry();
    const dissolvePos = new Float32Array(dissolveCount * 3);
    const dissolveVel = new Float32Array(dissolveCount * 3);
    const dissolveColors = new Float32Array(dissolveCount * 3);

    for (let i = 0; i < dissolveCount; i++) {
      const sample = sculpture.dissolveSamples[i];
      dissolvePos[i * 3] = sample.position.x;
      dissolvePos[i * 3 + 1] = sample.position.y;
      dissolvePos[i * 3 + 2] = sample.position.z;

      const c = sample.isPrimary ? PRIMARY_COLOR : SECONDARY_COLOR;
      dissolveColors[i * 3] = c.r;
      dissolveColors[i * 3 + 1] = c.g;
      dissolveColors[i * 3 + 2] = c.b;
    }

    dissolveGeo.setAttribute('position', new THREE.BufferAttribute(dissolvePos, 3));
    dissolveGeo.setAttribute('color', new THREE.BufferAttribute(dissolveColors, 3));

    const dissolveMat = new THREE.PointsMaterial({
      size: 0.28,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const dissolveCloud = new THREE.Points(dissolveGeo, dissolveMat);
    dissolveCloud.visible = false;
    scene.add(dissolveCloud);

    // Subtle Distant Horizon Reflection Grid
    const gridTexture = createHorizonGridTexture(maxAnisotropy);
    const gridGeo = new THREE.CircleGeometry(36, 64);
    gridGeo.rotateX(-Math.PI / 2);
    const gridMat = new THREE.MeshStandardMaterial({
      map: gridTexture,
      color: 0x0f172a,
      roughness: 0.24,
      metalness: 0.72,
      transparent: true,
      opacity: 0.8,
    });
    const gridFloor = new THREE.Mesh(gridGeo, gridMat);
    gridFloor.position.y = -4.25;
    scene.add(gridFloor);

    // Ambient Floating Particles
    const particleCount = 460;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);
    const baseRadii = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const r = 2.8 + Math.random() * 11.2;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 9.2;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r * 0.75 - 1.0;

      speeds[i] = 0.2 + Math.random() * 0.52;
      phases[i] = Math.random() * Math.PI * 2;
      baseRadii[i] = r;

      _tempColor.copy(PRIMARY_COLOR).lerp(SECONDARY_COLOR, Math.random());
      colors[i * 3] = _tempColor.r;
      colors[i * 3 + 1] = _tempColor.g;
      colors[i * 3 + 2] = _tempColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.2,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.055;
    controls.enablePan = false;
    controls.minDistance = 6.2;
    controls.maxDistance = 21.0;
    controls.minPolarAngle = Math.PI * 0.2;
    controls.maxPolarAngle = Math.PI * 0.76;
    controls.target.copy(DEFAULT_TARGET);

    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;

    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.88,
        0.55,
        0.28,
      );
      composer.addPass(bloomPass);
      composer.addPass(new OutputPass());
      renderer.compile(scene, camera);
    }

    let pointerX = 0;
    let pointerY = 0;
    let downX = 0;
    let downY = 0;
    let lastHoverCheck = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointerX = THREE.MathUtils.clamp(nx, -1, 1);
      pointerY = THREE.MathUtils.clamp(ny, -1, 1);

      if (isScheduleOpenRef.current) {
        canvas.style.cursor = 'default';
        return;
      }

      const now = performance.now();
      if (now - lastHoverCheck > 50) {
        lastHoverCheck = now;
        _pointerNDC.set(nx, ny);
        _raycaster.setFromCamera(_pointerNDC, camera);
        const hits = _raycaster.intersectObjects(sculpture.clickableMeshes, false);
        canvas.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isScheduleOpenRef.current) return;
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moved < 6) {
        const rect = canvas.getBoundingClientRect();
        _pointerNDC.set(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1,
        );
        _raycaster.setFromCamera(_pointerNDC, camera);
        const hits = _raycaster.intersectObjects(sculpture.clickableMeshes, false);
        if (hits.length > 0) {
          surgeIntensityRef.current = 1.35;
        }
      }
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composer && bloomPass) {
        composer.setSize(w, h);
        bloomPass.resolution.set(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    };

    const clock = new THREE.Clock();
    let prevScheduleOpen = isScheduleOpenRef.current;
    let sculptureFade = prevScheduleOpen ? 0 : 1;
    let dissolveTimer = 0;
    let dissolveActive = false;

    const triggerDissolveBurst = () => {
      sculpture.root.updateMatrixWorld(true);
      const posAttr = dissolveGeo.getAttribute('position') as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;

      for (let i = 0; i < dissolveCount; i++) {
        _vec3.copy(sculpture.dissolveSamples[i].position);
        _vec3.applyMatrix4(sculpture.root.matrixWorld);
        posArr[i * 3] = _vec3.x;
        posArr[i * 3 + 1] = _vec3.y;
        posArr[i * 3 + 2] = _vec3.z;

        const outX = _vec3.x * 0.48 + (Math.random() - 0.5) * 2.4;
        const outY = _vec3.y * 0.26 + 0.9 + Math.random() * 2.2;
        const outZ = (Math.random() - 0.5) * 2.8;
        dissolveVel[i * 3] = outX;
        dissolveVel[i * 3 + 1] = outY;
        dissolveVel[i * 3 + 2] = outZ;
      }

      posAttr.needsUpdate = true;
      dissolveTimer = 0;
      dissolveActive = true;
      dissolveCloud.visible = true;
      dissolveMat.opacity = 1;
    };

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();
      const isReduced = reducedMotionRef.current;
      const ampScale = isReduced ? 0.2 : 1.0;
      const scheduleOpen = isScheduleOpenRef.current;

      // Detect mode transition (Logo -> Schedule dissolve or Schedule -> Logo restore)
      if (scheduleOpen !== prevScheduleOpen) {
        prevScheduleOpen = scheduleOpen;
        if (scheduleOpen) {
          triggerDissolveBurst();
        } else {
          dissolveActive = false;
          dissolveCloud.visible = false;
          surgeIntensityRef.current = 1.15;
        }
      }

      // Smooth fade for LSL School 3D sculpture
      const targetFade = scheduleOpen ? 0 : 1;
      const fadeSpeed = scheduleOpen ? 10.5 : 5.2;
      sculptureFade = THREE.MathUtils.damp(sculptureFade, targetFade, fadeSpeed, delta);
      sculpture.setVisibilityFade(sculptureFade);

      // Update Dissolve Particle Cloud burst
      if (dissolveActive) {
        dissolveTimer += delta;
        const posAttr = dissolveGeo.getAttribute('position') as THREE.BufferAttribute;
        const posArr = posAttr.array as Float32Array;
        const drag = Math.exp(-1.15 * delta);

        for (let i = 0; i < dissolveCount; i++) {
          const i3 = i * 3;
          dissolveVel[i3] *= drag;
          dissolveVel[i3 + 1] = dissolveVel[i3 + 1] * drag + 0.35 * delta;
          dissolveVel[i3 + 2] *= drag;

          posArr[i3] += dissolveVel[i3] * delta;
          posArr[i3 + 1] += dissolveVel[i3 + 1] * delta;
          posArr[i3 + 2] += dissolveVel[i3 + 2] * delta;
        }
        posAttr.needsUpdate = true;

        const life = THREE.MathUtils.clamp(1 - dissolveTimer / 1.15, 0, 1);
        dissolveMat.opacity = life * life;
        if (life <= 0.01) {
          dissolveActive = false;
          dissolveCloud.visible = false;
        }
      }

      // Surge decay & subtle organic neon breathing
      surgeIntensityRef.current = THREE.MathUtils.damp(
        surgeIntensityRef.current,
        0,
        3.2,
        delta,
      );
      const surgeBoost = surgeIntensityRef.current;
      const flickerWave =
        surgeBoost > 0.15
          ? 0.88 + 0.22 * Math.sin(elapsed * 42)
          : 1.0 + Math.sin(elapsed * 2.0) * 0.035;
      const glowScale = 1.05 * (1 + surgeBoost * 0.85) * flickerWave;

      sculpture.primaryCoreMat.emissiveIntensity = 2.4 * glowScale * sculptureFade;
      sculpture.primaryTubeMat.emissiveIntensity = 1.45 * glowScale * sculptureFade;
      sculpture.secondaryCoreMat.emissiveIntensity = 2.35 * glowScale * sculptureFade;
      sculpture.secondaryTubeMat.emissiveIntensity = 1.4 * glowScale * sculptureFade;
      sculpture.frameTubeMat.emissiveIntensity = 1.15 * glowScale * sculptureFade;
      sculpture.ringOuterMat.emissiveIntensity = 1.15 * glowScale * sculptureFade;
      sculpture.ringInnerMat.emissiveIntensity = 1.15 * glowScale * sculptureFade;

      sculpture.primaryHaloMat.opacity =
        THREE.MathUtils.clamp(0.34 * glowScale, 0.12, 0.68) * sculptureFade;
      sculpture.secondaryHaloMat.opacity =
        THREE.MathUtils.clamp(0.3 * glowScale, 0.1, 0.62) * sculptureFade;

      primaryPointLight.intensity = 8.0 * glowScale * (0.25 + 0.75 * sculptureFade);
      secondaryPointLight.intensity = 7.2 * glowScale * (0.25 + 0.75 * sculptureFade);

      if (bloomPass) {
        bloomPass.strength = THREE.MathUtils.clamp(0.75 * glowScale, 0.3, 1.9);
      }

      // Single gentle floating motion + subtle pointer parallax
      if (sculpture.root.visible) {
        const targetY = Math.sin(elapsed * 1.1) * 0.25 * ampScale;
        const targetZ = Math.cos(elapsed * 0.8) * 0.12 * ampScale;
        const targetRotZ = Math.sin(elapsed * 0.7) * 0.028 * ampScale;
        const targetRotX = Math.cos(elapsed * 0.85) * 0.025 * ampScale;

        const parallaxX = pointerY * -0.12 * ampScale;
        const parallaxY = pointerX * 0.16 * ampScale;

        sculpture.root.position.y = THREE.MathUtils.damp(
          sculpture.root.position.y,
          targetY,
          4.5,
          delta,
        );
        sculpture.root.position.z = THREE.MathUtils.damp(
          sculpture.root.position.z,
          targetZ,
          4.5,
          delta,
        );
        sculpture.root.rotation.x = THREE.MathUtils.damp(
          sculpture.root.rotation.x,
          targetRotX + parallaxX,
          5.0,
          delta,
        );
        sculpture.root.rotation.y = THREE.MathUtils.damp(
          sculpture.root.rotation.y,
          parallaxY,
          5.0,
          delta,
        );
        sculpture.root.rotation.z = THREE.MathUtils.damp(
          sculpture.root.rotation.z,
          targetRotZ,
          5.0,
          delta,
        );

        for (const lg of sculpture.letterGroups) {
          const baseY = lg.userData.baseY as number;
          const phase = lg.userData.phase as number;
          lg.position.y = THREE.MathUtils.damp(
            lg.position.y,
            baseY + Math.sin(elapsed * 1.85 + phase) * 0.036 * ampScale,
            7,
            delta,
          );
        }

        sculpture.outerRing.rotation.z += delta * 0.22 * ampScale;
        sculpture.outerRing.rotation.y += delta * 0.1 * ampScale;
        sculpture.innerRing.rotation.z -= delta * 0.18 * ampScale;
        sculpture.innerRing.rotation.x += delta * 0.06 * ampScale;
      }

      // Ambient particles floating gently upward
      const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      const burstVel = 1 + surgeBoost * 2.0;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        posArr[i3 + 1] += speeds[i] * delta * 0.6 * burstVel * ampScale;
        posArr[i3] += Math.sin(elapsed * 0.55 + phases[i]) * delta * 0.2 * ampScale;
        posArr[i3 + 2] += Math.cos(elapsed * 0.45 + phases[i]) * delta * 0.14 * ampScale;

        if (posArr[i3 + 1] > 5.0) {
          posArr[i3 + 1] = -4.6;
          const angle = Math.random() * Math.PI * 2;
          const r = baseRadii[i];
          posArr[i3] = Math.cos(angle) * r;
          posArr[i3 + 2] = Math.sin(angle) * r * 0.75 - 1.0;
        }
      }
      posAttr.needsUpdate = true;

      controls.enabled = !scheduleOpen;
      controls.update();

      if (isSoftwareGl || !composer) {
        renderer.render(scene, camera);
      } else {
        composer.render();
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);

      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);

      controls.dispose();
      sculpture.dispose();
      dissolveGeo.dispose();
      dissolveMat.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      gridTexture.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTex.dispose();
      roomEnvTexture.dispose();
      composer?.dispose();
      renderer.dispose();
    };
  }, [remountKey]);

  if (webglError || contextLost) {
    return (
      <div className="pixel-grid-bg absolute inset-0 flex items-center justify-center bg-[#05070d] px-6">
        <div className="pixel-panel max-w-md p-8 text-center">
          <div
            className="font-display text-5xl font-bold tracking-tight text-cyan-400"
            style={{ textShadow: '4px 4px 0 #083344' }}
          >
            LSL
          </div>
          <div
            className="font-display mt-1 text-2xl font-bold text-pink-500"
            style={{ textShadow: '3px 3px 0 #500724' }}
          >
            School
          </div>
          <h2 className="font-display mt-5 text-sm font-bold text-slate-100">
            LSL School — 3D Scene Paused
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            The 3D WebGL context was suspended on this device. Click below to restore the scene.
          </p>
          <button
            type="button"
            onClick={() => {
              setWebglError(false);
              setContextLost(false);
              setRemountKey((k) => k + 1);
            }}
            className="pixel-btn mt-6 border-2 border-cyan-300 bg-cyan-500 px-5 py-2.5 font-display text-xs font-bold text-slate-950 hover:bg-cyan-400"
          >
            Restore 3D Scene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 h-full w-full"
      aria-label="LSL School 3D Interactive Neon Scene"
    />
  );
};
