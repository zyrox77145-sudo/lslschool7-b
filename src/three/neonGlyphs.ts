import * as THREE from 'three';

export interface DissolveSample {
  position: THREE.Vector3;
  isPrimary: boolean;
}

export interface NeonSculptureRig {
  root: THREE.Group;
  signGroup: THREE.Group;
  primaryTubeMat: THREE.MeshStandardMaterial;
  primaryCoreMat: THREE.MeshStandardMaterial;
  secondaryTubeMat: THREE.MeshStandardMaterial;
  secondaryCoreMat: THREE.MeshStandardMaterial;
  frameTubeMat: THREE.MeshStandardMaterial;
  ringOuterMat: THREE.MeshStandardMaterial;
  ringInnerMat: THREE.MeshStandardMaterial;
  primaryHaloMat: THREE.SpriteMaterial;
  secondaryHaloMat: THREE.SpriteMaterial;
  outerRing: THREE.Object3D;
  innerRing: THREE.Object3D;
  letterGroups: THREE.Group[];
  clickableMeshes: THREE.Object3D[];
  dissolveSamples: DissolveSample[];
  setVisibilityFade: (fade: number) => void;
  dispose: () => void;
}

const UPPER_BITMAPS: Record<string, string[]> = {
  L: [
    '10000',
    '10000',
    '10000',
    '10000',
    '10000',
    '10000',
    '11111',
  ],
  S: [
    '01111',
    '10000',
    '10000',
    '01110',
    '00001',
    '00001',
    '11110',
  ],
};

const LOWER_BITMAPS: Record<string, string[]> = {
  S: [
    '01111',
    '10000',
    '10000',
    '01110',
    '00001',
    '00001',
    '11110',
  ],
  c: [
    '00000',
    '00000',
    '01110',
    '10001',
    '10000',
    '10001',
    '01110',
  ],
  h: [
    '10000',
    '10000',
    '11110',
    '10001',
    '10001',
    '10001',
    '10001',
  ],
  o: [
    '00000',
    '00000',
    '01110',
    '10001',
    '10001',
    '10001',
    '01110',
  ],
  l: [
    '110',
    '010',
    '010',
    '010',
    '010',
    '010',
    '111',
  ],
};

function createPixelHaloTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Stepped concentric pixel glow squares (authentic 8-bit pixel halo)
    const steps = 16;
    const cell = size / steps;
    for (let y = 0; y < steps; y++) {
      for (let x = 0; x < steps; x++) {
        const dx = Math.abs(x + 0.5 - steps / 2) / (steps / 2);
        const dy = Math.abs(y + 0.5 - steps / 2) / (steps / 2);
        const dist = Math.max(dx, dy) * 0.72 + Math.hypot(dx, dy) * 0.28;
        const alpha = Math.max(0, 1 - dist);
        const steppedAlpha = Math.floor(alpha * 6) / 6;
        if (steppedAlpha > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${(steppedAlpha * 0.55).toFixed(3)})`;
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
}

export function buildNeonSculpture(maxAnisotropy = 4): NeonSculptureRig {
  const disposables: Array<{ dispose: () => void }> = [];
  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const root = new THREE.Group();
  const signGroup = new THREE.Group();
  root.add(signGroup);

  // --- Pixel-Art / Voxel Neon Materials ---
  const primaryCoreMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ecfeff'),
      emissive: new THREE.Color('#22D3EE'),
      emissiveIntensity: 2.25,
      roughness: 0.22,
      metalness: 0.08,
      transparent: true,
      opacity: 1,
    }),
  );

  const primaryTubeMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#22D3EE'),
      emissive: new THREE.Color('#22D3EE'),
      emissiveIntensity: 1.35,
      roughness: 0.16,
      metalness: 0.14,
      transparent: true,
      opacity: 0.48,
    }),
  );

  const secondaryCoreMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#fdf2f8'),
      emissive: new THREE.Color('#EC4899'),
      emissiveIntensity: 2.2,
      roughness: 0.22,
      metalness: 0.08,
      transparent: true,
      opacity: 1,
    }),
  );

  const secondaryTubeMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#EC4899'),
      emissive: new THREE.Color('#EC4899'),
      emissiveIntensity: 1.3,
      roughness: 0.16,
      metalness: 0.14,
      transparent: true,
      opacity: 0.48,
    }),
  );

  const frameTubeMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#38BDF8'),
      emissive: new THREE.Color('#22D3EE'),
      emissiveIntensity: 1.25,
      roughness: 0.24,
      metalness: 0.25,
      transparent: true,
      opacity: 1,
    }),
  );

  const ringOuterMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#22D3EE'),
      emissive: new THREE.Color('#22D3EE'),
      emissiveIntensity: 1.25,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 1,
    }),
  );

  const ringInnerMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#EC4899'),
      emissive: new THREE.Color('#EC4899'),
      emissiveIntensity: 1.25,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 1,
    }),
  );

  const titaniumMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#131b2e'),
      roughness: 0.35,
      metalness: 0.85,
      transparent: true,
      opacity: 1,
    }),
  );

  const letterGroups: THREE.Group[] = [];
  const clickableMeshes: THREE.Object3D[] = [];
  const dissolveSamples: DissolveSample[] = [];

  const frameCenterY = 0.22;

  // Shared voxel cube geometries
  const upperPitch = 0.29;
  const upperCoreGeo = track(new THREE.BoxGeometry(0.22, 0.22, 0.22));
  const upperShellGeo = track(new THREE.BoxGeometry(0.265, 0.265, 0.265));
  const upperMountGeo = track(new THREE.BoxGeometry(0.24, 0.24, 0.16));

  const lowerPitch = 0.175;
  const lowerCoreGeo = track(new THREE.BoxGeometry(0.132, 0.132, 0.145));
  const lowerShellGeo = track(new THREE.BoxGeometry(0.16, 0.16, 0.17));
  const lowerMountGeo = track(new THREE.BoxGeometry(0.145, 0.145, 0.12));

  const buildVoxelLetter = (
    bitmap: string[],
    pitch: number,
    coreGeo: THREE.BoxGeometry,
    shellGeo: THREE.BoxGeometry,
    mountGeo: THREE.BoxGeometry,
    coreMat: THREE.MeshStandardMaterial,
    shellMat: THREE.MeshStandardMaterial,
    posX: number,
    posY: number,
    posZ: number,
    phase: number,
    isPrimary: boolean,
  ): number => {
    const rows = bitmap.length;
    const cols = bitmap[0]?.length ?? 0;
    const letterGroup = new THREE.Group();
    letterGroup.position.set(posX, posY, posZ);
    letterGroup.userData = { baseY: posY, phase, tier: isPrimary ? 'primary' : 'secondary' };

    for (let r = 0; r < rows; r++) {
      const rowStr = bitmap[r];
      for (let c = 0; c < cols; c++) {
        if (rowStr[c] !== '1') continue;
        const vx = (c + 0.5) * pitch;
        const vy = (rows - 1 - r + 0.5) * pitch;

        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.set(vx, vy, 0.02);
        letterGroup.add(core);
        clickableMeshes.push(core);

        const shell = new THREE.Mesh(shellGeo, shellMat);
        shell.position.set(vx, vy, 0.02);
        letterGroup.add(shell);

        const mount = new THREE.Mesh(mountGeo, titaniumMat);
        mount.position.set(vx, vy, -0.15);
        letterGroup.add(mount);

        // 2 voxel scatter samples per pixel block for dense 8-bit shatter burst
        for (let k = 0; k < 2; k++) {
          dissolveSamples.push({
            position: new THREE.Vector3(
              posX + vx + (k === 0 ? -0.04 : 0.04),
              posY - frameCenterY + vy + (k === 0 ? 0.04 : -0.04),
              posZ + 0.02,
            ),
            isPrimary,
          });
        }
      }
    }

    signGroup.add(letterGroup);
    letterGroups.push(letterGroup);
    return cols * pitch;
  };

  // --- Build Upper Row: "LSL" in glowing Cyan voxels ---
  const upperChars = ['L', 'S', 'L'];
  const upperGap = 0.54;
  const upperWidths = upperChars.map((ch) => (UPPER_BITMAPS[ch][0].length) * upperPitch);
  const totalUpperWidth =
    upperWidths.reduce((a, b) => a + b, 0) + upperGap * (upperChars.length - 1);

  let cursorX = -totalUpperWidth / 2;
  const upperY = 0.02;

  upperChars.forEach((ch, idx) => {
    const w = buildVoxelLetter(
      UPPER_BITMAPS[ch],
      upperPitch,
      upperCoreGeo,
      upperShellGeo,
      upperMountGeo,
      primaryCoreMat,
      primaryTubeMat,
      cursorX,
      upperY,
      0.04,
      idx * 0.85,
      true,
    );
    cursorX += w + upperGap;
  });

  // --- Build Lower Row: "School" in glowing Magenta voxels ---
  const lowerChars = ['S', 'c', 'h', 'o', 'o', 'l'];
  const lowerGap = 0.22;
  const lowerWidths = lowerChars.map((ch) => (LOWER_BITMAPS[ch][0].length) * lowerPitch);
  const totalLowerWidth =
    lowerWidths.reduce((a, b) => a + b, 0) + lowerGap * (lowerChars.length - 1);

  cursorX = -totalLowerWidth / 2;
  const lowerY = -1.52;

  lowerChars.forEach((ch, idx) => {
    const w = buildVoxelLetter(
      LOWER_BITMAPS[ch],
      lowerPitch,
      lowerCoreGeo,
      lowerShellGeo,
      lowerMountGeo,
      secondaryCoreMat,
      secondaryTubeMat,
      cursorX,
      lowerY,
      0.06,
      2.2 + idx * 0.55,
      false,
    );
    cursorX += w + lowerGap;
  });

  // --- Stepped 8-Bit Voxel Marquee Frame ---
  const frameStep = 0.22;
  const frameCols = 38;
  const frameRows = 24;
  const frameVoxelGeo = track(new THREE.BoxGeometry(0.16, 0.16, 0.16));
  const frameHalfW = ((frameCols - 1) * frameStep) / 2;
  const frameHalfH = ((frameRows - 1) * frameStep) / 2;

  for (let r = 0; r < frameRows; r++) {
    for (let c = 0; c < frameCols; c++) {
      const isTop = r === 0;
      const isBottom = r === frameRows - 1;
      const isLeft = c === 0;
      const isRight = c === frameCols - 1;

      // Stepped pixel chamfered corners: skip the 2x2 outer corner cells and step inward
      const inCornerCut =
        (r <= 1 && c <= 1) ||
        (r <= 1 && c >= frameCols - 2) ||
        (r >= frameRows - 2 && c <= 1) ||
        (r >= frameRows - 2 && c >= frameCols - 2);
      const isCornerStep =
        (r === 1 && (c === 1 || c === frameCols - 2)) ||
        (r === frameRows - 2 && (c === 1 || c === frameCols - 2));

      const isEdge =
        (!inCornerCut && (isTop || isBottom || isLeft || isRight)) || isCornerStep;

      if (!isEdge) continue;

      const fx = c * frameStep - frameHalfW;
      const fy = frameCenterY + (frameHalfH - r * frameStep);
      const fz = -0.34;

      const voxel = new THREE.Mesh(
        frameVoxelGeo,
        (r + c) % 4 === 0 ? titaniumMat : frameTubeMat,
      );
      voxel.position.set(fx, fy, fz);
      signGroup.add(voxel);

      if ((r + c) % 2 === 0) {
        dissolveSamples.push({
          position: new THREE.Vector3(fx, fy - frameCenterY, fz),
          isPrimary: c % 2 === 0,
        });
      }
    }
  }

  // Rear dark titanium pixel support beams
  const railGeo = track(new THREE.BoxGeometry(6.8, 0.1, 0.1));
  const upperRail = new THREE.Mesh(railGeo, titaniumMat);
  upperRail.position.set(0, 1.02, -0.34);
  signGroup.add(upperRail);

  const lowerRail = new THREE.Mesh(railGeo, titaniumMat);
  lowerRail.position.set(0, -0.96, -0.34);
  signGroup.add(lowerRail);

  // --- Invisible Hit-Test Proxy Plane for Click-to-Surge ---
  const hitProxyGeo = track(new THREE.PlaneGeometry(8.4, 5.4));
  const hitProxyMat = track(
    new THREE.MeshBasicMaterial({
      visible: false,
      side: THREE.DoubleSide,
    }),
  );
  const hitProxy = new THREE.Mesh(hitProxyGeo, hitProxyMat);
  hitProxy.position.set(0, frameCenterY, 0.12);
  signGroup.add(hitProxy);
  clickableMeshes.push(hitProxy);

  // --- Two Orbiting 3D Voxel Rings (Pixel Satellites) ---
  const outerRing = new THREE.Group();
  outerRing.rotation.set(Math.PI * 0.42, Math.PI * 0.12, 0);
  const outerBlockGeo = track(new THREE.BoxGeometry(0.14, 0.14, 0.14));
  const outerCount = 44;
  for (let i = 0; i < outerCount; i++) {
    const angle = (i / outerCount) * Math.PI * 2;
    const cube = new THREE.Mesh(outerBlockGeo, ringOuterMat);
    cube.position.set(Math.cos(angle) * 5.25, Math.sin(angle) * 5.25, 0);
    outerRing.add(cube);
  }
  root.add(outerRing);

  const innerRing = new THREE.Group();
  innerRing.rotation.set(-Math.PI * 0.38, -Math.PI * 0.16, 0);
  const innerBlockGeo = track(new THREE.BoxGeometry(0.11, 0.11, 0.11));
  const innerCount = 36;
  for (let i = 0; i < innerCount; i++) {
    const angle = (i / innerCount) * Math.PI * 2;
    const cube = new THREE.Mesh(innerBlockGeo, ringInnerMat);
    cube.position.set(Math.cos(angle) * 4.65, Math.sin(angle) * 4.65, 0);
    innerRing.add(cube);
  }
  root.add(innerRing);

  // --- Stepped Pixel Atmospheric Glow Halos ---
  const haloTex = track(createPixelHaloTexture());
  haloTex.anisotropy = maxAnisotropy;

  const primaryHaloMat = track(
    new THREE.SpriteMaterial({
      map: haloTex,
      color: new THREE.Color('#22D3EE'),
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const primaryHalo = new THREE.Sprite(primaryHaloMat);
  primaryHalo.position.set(0, 1.0, -0.52);
  primaryHalo.scale.set(9.2, 4.0, 1);
  signGroup.add(primaryHalo);

  const secondaryHaloMat = track(
    new THREE.SpriteMaterial({
      map: haloTex,
      color: new THREE.Color('#EC4899'),
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const secondaryHalo = new THREE.Sprite(secondaryHaloMat);
  secondaryHalo.position.set(0, -1.0, -0.48);
  secondaryHalo.scale.set(7.6, 2.8, 1);
  signGroup.add(secondaryHalo);

  signGroup.position.y = -frameCenterY;

  const setVisibilityFade = (fade: number) => {
    const clamped = THREE.MathUtils.clamp(fade, 0, 1);
    primaryCoreMat.opacity = clamped;
    primaryTubeMat.opacity = 0.48 * clamped;
    secondaryCoreMat.opacity = clamped;
    secondaryTubeMat.opacity = 0.48 * clamped;
    frameTubeMat.opacity = clamped;
    ringOuterMat.opacity = clamped;
    ringInnerMat.opacity = clamped;
    titaniumMat.opacity = clamped;
    root.visible = clamped > 0.01;
  };

  return {
    root,
    signGroup,
    primaryTubeMat,
    primaryCoreMat,
    secondaryTubeMat,
    secondaryCoreMat,
    frameTubeMat,
    ringOuterMat,
    ringInnerMat,
    primaryHaloMat,
    secondaryHaloMat,
    outerRing,
    innerRing,
    letterGroups,
    clickableMeshes,
    dissolveSamples,
    setVisibilityFade,
    dispose: () => {
      for (const item of disposables) {
        item.dispose();
      }
    },
  };
}
