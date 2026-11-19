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
  outerRing: THREE.Mesh;
  innerRing: THREE.Mesh;
  letterGroups: THREE.Group[];
  clickableMeshes: THREE.Object3D[];
  dissolveSamples: DissolveSample[];
  setVisibilityFade: (fade: number) => void;
  dispose: () => void;
}

interface GlyphStroke {
  curve: THREE.Curve<THREE.Vector3>;
  closed: boolean;
  segments: number;
}

interface GlyphSpec {
  width: number;
  strokes: GlyphStroke[];
}

function createRoundedPolylinePath(
  points: THREE.Vector2[],
  cornerRadius: number,
  z = 0,
): THREE.CurvePath<THREE.Vector3> {
  const path = new THREE.CurvePath<THREE.Vector3>();
  if (points.length < 2) return path;

  let prevEnd = new THREE.Vector3(points[0].x, points[0].y, z);

  for (let i = 1; i < points.length - 1; i++) {
    const pPrev = points[i - 1];
    const pCurr = points[i];
    const pNext = points[i + 1];

    const vIn = new THREE.Vector2().subVectors(pCurr, pPrev);
    const vOut = new THREE.Vector2().subVectors(pNext, pCurr);
    const lenIn = vIn.length();
    const lenOut = vOut.length();
    const r = Math.min(cornerRadius, lenIn * 0.42, lenOut * 0.42);

    vIn.normalize();
    vOut.normalize();

    const cornerStart = new THREE.Vector3(
      pCurr.x - vIn.x * r,
      pCurr.y - vIn.y * r,
      z,
    );
    const cornerMid = new THREE.Vector3(pCurr.x, pCurr.y, z);
    const cornerEnd = new THREE.Vector3(
      pCurr.x + vOut.x * r,
      pCurr.y + vOut.y * r,
      z,
    );

    if (prevEnd.distanceTo(cornerStart) > 0.001) {
      path.add(new THREE.LineCurve3(prevEnd, cornerStart));
    }
    path.add(new THREE.QuadraticBezierCurve3(cornerStart, cornerMid, cornerEnd));
    prevEnd = cornerEnd;
  }

  const last = new THREE.Vector3(
    points[points.length - 1].x,
    points[points.length - 1].y,
    z,
  );
  if (prevEnd.distanceTo(last) > 0.001) {
    path.add(new THREE.LineCurve3(prevEnd, last));
  }

  return path;
}

function createSmoothSpline(
  coords: Array<[number, number]>,
  closed = false,
  z = 0,
): THREE.CatmullRomCurve3 {
  const pts = coords.map(([x, y]) => new THREE.Vector3(x, y, z));
  return new THREE.CatmullRomCurve3(pts, closed, 'centripetal', 0.5);
}

function createCapsuleLoopCurve(
  width: number,
  height: number,
  radius: number,
  z = 0,
): THREE.CurvePath<THREE.Vector3> {
  const hw = width / 2;
  const hh = height / 2;
  const r = Math.min(radius, hw * 0.9, hh * 0.9);
  const path = new THREE.CurvePath<THREE.Vector3>();

  const p0 = new THREE.Vector3(-hw + r, hh, z);
  const p1 = new THREE.Vector3(hw - r, hh, z);
  const p2 = new THREE.Vector3(hw, hh - r, z);
  const p3 = new THREE.Vector3(hw, -hh + r, z);
  const p4 = new THREE.Vector3(hw - r, -hh, z);
  const p5 = new THREE.Vector3(-hw + r, -hh, z);
  const p6 = new THREE.Vector3(-hw, -hh + r, z);
  const p7 = new THREE.Vector3(-hw, hh - r, z);

  path.add(new THREE.LineCurve3(p0, p1));
  path.add(new THREE.QuadraticBezierCurve3(p1, new THREE.Vector3(hw, hh, z), p2));
  path.add(new THREE.LineCurve3(p2, p3));
  path.add(new THREE.QuadraticBezierCurve3(p3, new THREE.Vector3(hw, -hh, z), p4));
  path.add(new THREE.LineCurve3(p4, p5));
  path.add(new THREE.QuadraticBezierCurve3(p5, new THREE.Vector3(-hw, -hh, z), p6));
  path.add(new THREE.LineCurve3(p6, p7));
  path.add(new THREE.QuadraticBezierCurve3(p7, new THREE.Vector3(-hw, hh, z), p0));

  return path;
}

function getUpperGlyphSpec(char: string, scaleX: number, scaleY: number): GlyphSpec {
  if (char === 'L') {
    const pts = [
      new THREE.Vector2(0.14 * scaleX, 1.0 * scaleY),
      new THREE.Vector2(0.14 * scaleX, 0.0 * scaleY),
      new THREE.Vector2(0.88 * scaleX, 0.0 * scaleY),
    ];
    return {
      width: 0.96 * scaleX,
      strokes: [
        {
          curve: createRoundedPolylinePath(pts, 0.14 * scaleX, 0),
          closed: false,
          segments: 44,
        },
      ],
    };
  }

  // Uppercase 'S'
  const sPts: Array<[number, number]> = [
    [0.86 * scaleX, 0.83 * scaleY],
    [0.68 * scaleX, 0.98 * scaleY],
    [0.34 * scaleX, 0.98 * scaleY],
    [0.14 * scaleX, 0.80 * scaleY],
    [0.20 * scaleX, 0.58 * scaleY],
    [0.50 * scaleX, 0.50 * scaleY],
    [0.82 * scaleX, 0.40 * scaleY],
    [0.88 * scaleX, 0.19 * scaleY],
    [0.68 * scaleX, 0.01 * scaleY],
    [0.32 * scaleX, 0.01 * scaleY],
    [0.12 * scaleX, 0.16 * scaleY],
  ];

  return {
    width: 1.0 * scaleX,
    strokes: [
      {
        curve: createSmoothSpline(sPts, false, 0),
        closed: false,
        segments: 72,
      },
    ],
  };
}

function getLowerGlyphSpec(char: string, scale: number): GlyphSpec {
  const s = scale;
  switch (char) {
    case 'S': {
      const pts: Array<[number, number]> = [
        [0.78 * s, 0.84 * s],
        [0.60 * s, 0.98 * s],
        [0.32 * s, 0.98 * s],
        [0.14 * s, 0.80 * s],
        [0.20 * s, 0.58 * s],
        [0.46 * s, 0.50 * s],
        [0.74 * s, 0.39 * s],
        [0.80 * s, 0.18 * s],
        [0.60 * s, 0.01 * s],
        [0.28 * s, 0.01 * s],
        [0.10 * s, 0.16 * s],
      ];
      return {
        width: 0.90 * s,
        strokes: [{ curve: createSmoothSpline(pts, false, 0), closed: false, segments: 64 }],
      };
    }
    case 'c': {
      const pts: Array<[number, number]> = [
        [0.64 * s, 0.56 * s],
        [0.46 * s, 0.70 * s],
        [0.20 * s, 0.64 * s],
        [0.10 * s, 0.35 * s],
        [0.20 * s, 0.06 * s],
        [0.46 * s, 0.00 * s],
        [0.64 * s, 0.14 * s],
      ];
      return {
        width: 0.74 * s,
        strokes: [{ curve: createSmoothSpline(pts, false, 0), closed: false, segments: 48 }],
      };
    }
    case 'h': {
      const stem = createRoundedPolylinePath(
        [new THREE.Vector2(0.14 * s, 1.0 * s), new THREE.Vector2(0.14 * s, 0.0 * s)],
        0.05 * s,
        0,
      );
      const archPts: Array<[number, number]> = [
        [0.14 * s, 0.38 * s],
        [0.26 * s, 0.63 * s],
        [0.48 * s, 0.70 * s],
        [0.66 * s, 0.55 * s],
        [0.70 * s, 0.30 * s],
        [0.70 * s, 0.00 * s],
      ];
      return {
        width: 0.82 * s,
        strokes: [
          { curve: stem, closed: false, segments: 20 },
          { curve: createSmoothSpline(archPts, false, 0), closed: false, segments: 48 },
        ],
      };
    }
    case 'o': {
      const cx = 0.38 * s;
      const cy = 0.35 * s;
      const rx = 0.29 * s;
      const ry = 0.35 * s;
      const pts: Array<[number, number]> = [];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
      }
      return {
        width: 0.76 * s,
        strokes: [{ curve: createSmoothSpline(pts, true, 0), closed: true, segments: 56 }],
      };
    }
    case 'l':
    default: {
      const stem = createRoundedPolylinePath(
        [
          new THREE.Vector2(0.18 * s, 1.0 * s),
          new THREE.Vector2(0.18 * s, 0.04 * s),
          new THREE.Vector2(0.36 * s, 0.0 * s),
        ],
        0.10 * s,
        0,
      );
      return {
        width: 0.44 * s,
        strokes: [{ curve: stem, closed: false, segments: 32 }],
      };
    }
  }
}

function createSoftHaloTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.72)');
    grad.addColorStop(0.28, 'rgba(255, 255, 255, 0.32)');
    grad.addColorStop(0.62, 'rgba(255, 255, 255, 0.08)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
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

  // Materials
  const primaryCoreMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ffffff'),
      emissive: new THREE.Color('#22D3EE'),
      emissiveIntensity: 2.6,
      roughness: 0.15,
      metalness: 0.05,
      transparent: true,
      opacity: 1,
    }),
  );

  const primaryTubeMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#22D3EE'),
      emissive: new THREE.Color('#22D3EE'),
      emissiveIntensity: 1.5,
      roughness: 0.12,
      metalness: 0.1,
      transparent: true,
      opacity: 0.42,
    }),
  );

  const secondaryCoreMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#ffffff'),
      emissive: new THREE.Color('#EC4899'),
      emissiveIntensity: 2.5,
      roughness: 0.15,
      metalness: 0.05,
      transparent: true,
      opacity: 1,
    }),
  );

  const secondaryTubeMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#EC4899'),
      emissive: new THREE.Color('#EC4899'),
      emissiveIntensity: 1.45,
      roughness: 0.12,
      metalness: 0.1,
      transparent: true,
      opacity: 0.42,
    }),
  );

  const frameTubeMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#38BDF8'),
      emissive: new THREE.Color('#22D3EE'),
      emissiveIntensity: 1.35,
      roughness: 0.18,
      metalness: 0.2,
      transparent: true,
      opacity: 1,
    }),
  );

  const ringOuterMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#22D3EE'),
      emissive: new THREE.Color('#22D3EE'),
      emissiveIntensity: 1.2,
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
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 1,
    }),
  );

  // Dark anodized brushed titanium for frame housing & standoffs (contrasting roughness/metalness)
  const titaniumMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1a2234'),
      roughness: 0.28,
      metalness: 0.88,
      transparent: true,
      opacity: 1,
    }),
  );

  // Matte silicone electrode collars at neon tube terminations
  const siliconeCapMat = track(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0c0f17'),
      roughness: 0.88,
      metalness: 0.06,
      transparent: true,
      opacity: 1,
    }),
  );

  const capGeo = track(new THREE.CylinderGeometry(0.052, 0.058, 0.11, 12));
  const smallCapGeo = track(new THREE.CylinderGeometry(0.036, 0.042, 0.08, 12));
  const standoffGeo = track(new THREE.CylinderGeometry(0.024, 0.024, 0.32, 10));
  const tipSphereGeo = track(new THREE.SphereGeometry(0.046, 12, 12));
  const smallTipSphereGeo = track(new THREE.SphereGeometry(0.032, 12, 12));

  const letterGroups: THREE.Group[] = [];
  const clickableMeshes: THREE.Object3D[] = [];
  const dissolveSamples: DissolveSample[] = [];

  const addStrokeAssembly = (
    parent: THREE.Group,
    stroke: GlyphStroke,
    coreRadius: number,
    sheathRadius: number,
    coreMat: THREE.MeshStandardMaterial,
    sheathMat: THREE.MeshStandardMaterial,
    isLarge: boolean,
  ) => {
    const coreGeo = track(
      new THREE.TubeGeometry(stroke.curve, stroke.segments, coreRadius, 14, stroke.closed),
    );
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    parent.add(coreMesh);
    clickableMeshes.push(coreMesh);

    const sheathGeo = track(
      new THREE.TubeGeometry(stroke.curve, stroke.segments, sheathRadius, 14, stroke.closed),
    );
    const sheathMesh = new THREE.Mesh(sheathGeo, sheathMat);
    parent.add(sheathMesh);

    // Endpoint electrode boots & standoffs for physical 3D authenticity
    if (!stroke.closed) {
      const startPt = stroke.curve.getPointAt(0);
      const startTan = stroke.curve.getTangentAt(0).normalize();
      const endPt = stroke.curve.getPointAt(1);
      const endTan = stroke.curve.getTangentAt(1).normalize();

      const up = new THREE.Vector3(0, 1, 0);
      const activeCapGeo = isLarge ? capGeo : smallCapGeo;
      const activeTipGeo = isLarge ? tipSphereGeo : smallTipSphereGeo;

      const capA = new THREE.Mesh(activeCapGeo, siliconeCapMat);
      capA.position.copy(startPt);
      capA.quaternion.setFromUnitVectors(up, startTan);
      parent.add(capA);

      const tipA = new THREE.Mesh(activeTipGeo, coreMat);
      tipA.position.copy(startPt);
      parent.add(tipA);

      const capB = new THREE.Mesh(activeCapGeo, siliconeCapMat);
      capB.position.copy(endPt);
      capB.quaternion.setFromUnitVectors(up, endTan);
      parent.add(capB);

      const tipB = new THREE.Mesh(activeTipGeo, coreMat);
      tipB.position.copy(endPt);
      parent.add(tipB);
    }

    // Add 2 brushed titanium standoff pins anchoring stroke toward the rear chassis plane
    const anchorPositions = [0.22, 0.78];
    for (const t of anchorPositions) {
      const pt = stroke.curve.getPointAt(t);
      const pin = new THREE.Mesh(standoffGeo, titaniumMat);
      pin.rotation.x = Math.PI / 2;
      pin.position.set(pt.x, pt.y, -0.17);
      parent.add(pin);
    }
  };

  // --- Build Upper Row: "LSL" ---
  const upperChars = ['L', 'S', 'L'];
  const upperSpecs = upperChars.map((ch) => getUpperGlyphSpec(ch, 1.55, 2.05));
  const upperGap = 0.48;
  const totalUpperWidth =
    upperSpecs.reduce((sum, spec) => sum + spec.width, 0) +
    upperGap * (upperSpecs.length - 1);

  let cursorX = -totalUpperWidth / 2;
  const upperY = -0.04;
  const frameCenterY = 0.24;

  upperSpecs.forEach((spec, idx) => {
    const letterGroup = new THREE.Group();
    letterGroup.position.set(cursorX, upperY, 0);
    letterGroup.userData = { baseY: upperY, phase: idx * 0.85, tier: 'primary' };
    spec.strokes.forEach((stroke) => {
      addStrokeAssembly(
        letterGroup,
        stroke,
        0.068,
        0.105,
        primaryCoreMat,
        primaryTubeMat,
        true,
      );
      const sampleCount = 72;
      for (let i = 0; i < sampleCount; i++) {
        const pt = stroke.curve.getPointAt(i / (sampleCount - 1));
        dissolveSamples.push({
          position: new THREE.Vector3(
            cursorX + pt.x,
            upperY - frameCenterY + pt.y,
            pt.z,
          ),
          isPrimary: true,
        });
      }
    });
    signGroup.add(letterGroup);
    letterGroups.push(letterGroup);
    cursorX += spec.width + upperGap;
  });

  // --- Build Lower Row: "School" ---
  const lowerChars = ['S', 'c', 'h', 'o', 'o', 'l'];
  const lowerScale = 1.12;
  const lowerSpecs = lowerChars.map((ch) => getLowerGlyphSpec(ch, lowerScale));
  const lowerGap = 0.22;
  const totalLowerWidth =
    lowerSpecs.reduce((sum, spec) => sum + spec.width, 0) +
    lowerGap * (lowerSpecs.length - 1);

  cursorX = -totalLowerWidth / 2;
  const lowerY = -1.52;

  lowerSpecs.forEach((spec, idx) => {
    const letterGroup = new THREE.Group();
    letterGroup.position.set(cursorX, lowerY, 0.04);
    letterGroup.userData = { baseY: lowerY, phase: 2.4 + idx * 0.55, tier: 'secondary' };
    spec.strokes.forEach((stroke) => {
      addStrokeAssembly(
        letterGroup,
        stroke,
        0.045,
        0.072,
        secondaryCoreMat,
        secondaryTubeMat,
        false,
      );
      const sampleCount = 46;
      for (let i = 0; i < sampleCount; i++) {
        const pt = stroke.curve.getPointAt(i / (sampleCount - 1));
        dissolveSamples.push({
          position: new THREE.Vector3(
            cursorX + pt.x,
            lowerY - frameCenterY + pt.y,
            0.04 + pt.z,
          ),
          isPrimary: false,
        });
      }
    });
    signGroup.add(letterGroup);
    letterGroups.push(letterGroup);
    cursorX += spec.width + lowerGap;
  });

  // --- Sleek Floating Rear Chassis Rails & Capsule Neon Frame ---
  const frameWidth = 7.8;
  const frameHeight = 5.05;
  const frameCurve = createCapsuleLoopCurve(frameWidth, frameHeight, 0.78, -0.34);
  const frameTubeGeo = track(new THREE.TubeGeometry(frameCurve, 128, 0.038, 12, true));
  const frameTubeMesh = new THREE.Mesh(frameTubeGeo, frameTubeMat);
  frameTubeMesh.position.y = frameCenterY;
  signGroup.add(frameTubeMesh);

  for (let i = 0; i < 120; i++) {
    const pt = frameCurve.getPointAt(i / 120);
    dissolveSamples.push({
      position: new THREE.Vector3(pt.x, pt.y, pt.z),
      isPrimary: i % 2 === 0,
    });
  }

  // Dark anodized structural cross-bars behind letters for 3D depth
  const railGeo = track(new THREE.BoxGeometry(6.4, 0.07, 0.07));
  const upperRail = new THREE.Mesh(railGeo, titaniumMat);
  upperRail.position.set(0, 1.0, -0.34);
  signGroup.add(upperRail);

  const lowerRail = new THREE.Mesh(railGeo, titaniumMat);
  lowerRail.position.set(0, -1.02, -0.34);
  signGroup.add(lowerRail);

  // Corner titanium clamp brackets on the outer neon capsule
  const clampGeo = track(new THREE.BoxGeometry(0.18, 0.18, 0.14));
  const clampCoords: Array<[number, number]> = [
    [-3.88, frameCenterY + 1.65],
    [3.88, frameCenterY + 1.65],
    [-3.88, frameCenterY - 1.65],
    [3.88, frameCenterY - 1.65],
  ];
  for (const [cx, cy] of clampCoords) {
    const clamp = new THREE.Mesh(clampGeo, titaniumMat);
    clamp.position.set(cx, cy, -0.34);
    signGroup.add(clamp);
  }

  // --- Invisible Hit-Test Proxy Plane for effortless Click-to-Surge Raycasting ---
  const hitProxyGeo = track(new THREE.PlaneGeometry(8.0, 5.2));
  const hitProxyMat = track(
    new THREE.MeshBasicMaterial({
      visible: false,
      side: THREE.DoubleSide,
    }),
  );
  const hitProxy = new THREE.Mesh(hitProxyGeo, hitProxyMat);
  hitProxy.position.set(0, frameCenterY, 0.1);
  signGroup.add(hitProxy);
  clickableMeshes.push(hitProxy);

  // --- Two Orbiting 3D Neon Energy Rings ---
  const outerRingGeo = track(new THREE.TorusGeometry(5.15, 0.022, 12, 128));
  const outerRing = new THREE.Mesh(outerRingGeo, ringOuterMat);
  outerRing.rotation.set(Math.PI * 0.42, Math.PI * 0.12, 0);
  root.add(outerRing);

  const innerRingGeo = track(new THREE.TorusGeometry(4.62, 0.018, 12, 128));
  const innerRing = new THREE.Mesh(innerRingGeo, ringInnerMat);
  innerRing.rotation.set(-Math.PI * 0.38, -Math.PI * 0.16, 0);
  root.add(innerRing);

  // --- Soft Additive Atmospheric Glow Halos (ensures luminous neon aura on GPU & Software WebGL) ---
  const haloTex = track(createSoftHaloTexture());
  haloTex.anisotropy = maxAnisotropy;

  const primaryHaloMat = track(
    new THREE.SpriteMaterial({
      map: haloTex,
      color: new THREE.Color('#22D3EE'),
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const primaryHalo = new THREE.Sprite(primaryHaloMat);
  primaryHalo.position.set(0, 0.96, -0.52);
  primaryHalo.scale.set(9.4, 4.2, 1);
  signGroup.add(primaryHalo);

  const secondaryHaloMat = track(
    new THREE.SpriteMaterial({
      map: haloTex,
      color: new THREE.Color('#EC4899'),
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const secondaryHalo = new THREE.Sprite(secondaryHaloMat);
  secondaryHalo.position.set(0, -1.04, -0.48);
  secondaryHalo.scale.set(7.8, 2.8, 1);
  signGroup.add(secondaryHalo);

  // Center the vertical composition gracefully around world origin
  signGroup.position.y = -frameCenterY;

  const setVisibilityFade = (fade: number) => {
    const clamped = THREE.MathUtils.clamp(fade, 0, 1);
    primaryCoreMat.opacity = clamped;
    primaryTubeMat.opacity = 0.42 * clamped;
    secondaryCoreMat.opacity = clamped;
    secondaryTubeMat.opacity = 0.42 * clamped;
    frameTubeMat.opacity = clamped;
    ringOuterMat.opacity = clamped;
    ringInnerMat.opacity = clamped;
    titaniumMat.opacity = clamped;
    siliconeCapMat.opacity = clamped;
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
