import * as THREE from 'three';

export interface MotorcycleMaterialSet {
  paint: THREE.MeshPhysicalMaterial;
  paintAccent: THREE.MeshStandardMaterial;
  chrome: THREE.MeshPhysicalMaterial;
  titanium: THREE.MeshStandardMaterial;
  engineBlock: THREE.MeshStandardMaterial;
  frameDark: THREE.MeshStandardMaterial;
  rubber: THREE.MeshStandardMaterial;
  seatLeather: THREE.MeshStandardMaterial;
  darkGlass: THREE.MeshPhysicalMaterial;
  headlightGlow: THREE.MeshStandardMaterial;
  taillightGlow: THREE.MeshStandardMaterial;
  amberSignal: THREE.MeshStandardMaterial;
  goldAnodized: THREE.MeshStandardMaterial;
  basketWire: THREE.MeshStandardMaterial;
  dispose: () => void;
}

export function createMotorcycleMaterialSet(
  initialPaintHex: string
): MotorcycleMaterialSet {
  const paint = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(initialPaintHex),
    metalness: 0.72,
    roughness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.25,
  });

  const paintAccent = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x1f2024),
    metalness: 0.35,
    roughness: 0.42,
    envMapIntensity: 0.9,
  });

  const chrome = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xeef0f4),
    metalness: 0.96,
    roughness: 0.11,
    clearcoat: 0.35,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.4,
  });

  const titanium = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x9ca3af),
    metalness: 0.88,
    roughness: 0.24,
    envMapIntensity: 1.15,
  });

  const engineBlock = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x232429),
    metalness: 0.55,
    roughness: 0.54,
    envMapIntensity: 0.85,
  });

  const frameDark = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x18181b),
    metalness: 0.45,
    roughness: 0.48,
    envMapIntensity: 0.8,
  });

  const rubber = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x16161a),
    metalness: 0.04,
    roughness: 0.88,
    envMapIntensity: 0.4,
  });

  const seatLeather = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x1d1d22),
    metalness: 0.05,
    roughness: 0.74,
    envMapIntensity: 0.55,
  });

  const darkGlass = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x111318),
    metalness: 0.1,
    roughness: 0.08,
    transparent: true,
    opacity: 0.68,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    depthWrite: false,
    envMapIntensity: 1.35,
  });

  const headlightGlow = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xffffff),
    emissive: new THREE.Color(0xfff4dc),
    emissiveIntensity: 1.75,
    roughness: 0.1,
    metalness: 0.1,
  });

  const taillightGlow = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xdc2626),
    emissive: new THREE.Color(0xdc2626),
    emissiveIntensity: 1.65,
    roughness: 0.2,
    metalness: 0.1,
  });

  const amberSignal = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xf59e0b),
    emissive: new THREE.Color(0xd97706),
    emissiveIntensity: 0.75,
    roughness: 0.25,
    metalness: 0.15,
  });

  const goldAnodized = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xd4a44a),
    metalness: 0.9,
    roughness: 0.2,
    envMapIntensity: 1.25,
  });

  const basketWire = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x27272a),
    metalness: 0.7,
    roughness: 0.35,
    envMapIntensity: 0.95,
  });

  const allMaterials: THREE.Material[] = [
    paint,
    paintAccent,
    chrome,
    titanium,
    engineBlock,
    frameDark,
    rubber,
    seatLeather,
    darkGlass,
    headlightGlow,
    taillightGlow,
    amberSignal,
    goldAnodized,
    basketWire,
  ];

  return {
    paint,
    paintAccent,
    chrome,
    titanium,
    engineBlock,
    frameDark,
    rubber,
    seatLeather,
    darkGlass,
    headlightGlow,
    taillightGlow,
    amberSignal,
    goldAnodized,
    basketWire,
    dispose: () => {
      allMaterials.forEach((m) => m.dispose());
    },
  };
}

export function createStudioShadowTexture(
  maxAnisotropy: number
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, size, size);
    // Elongated motorcycle footprint shadow along X axis
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.scale(1.35, 0.72);
    const grad = ctx.createRadialGradient(0, 0, 14, 0, 0, size * 0.34);
    grad.addColorStop(0, 'rgba(18, 18, 22, 0.34)');
    grad.addColorStop(0.45, 'rgba(18, 18, 22, 0.16)');
    grad.addColorStop(0.8, 'rgba(18, 18, 22, 0.04)');
    grad.addColorStop(1, 'rgba(18, 18, 22, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export function createPedestalRingTexture(
  maxAnisotropy: number
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2;
    const cy = size / 2;

    // Soft studio turntable base fill
    const fillGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, size * 0.47);
    fillGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    fillGrad.addColorStop(0.72, 'rgba(235, 235, 240, 0.35)');
    fillGrad.addColorStop(1, 'rgba(228, 228, 234, 0)');
    ctx.fillStyle = fillGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.48, 0, Math.PI * 2);
    ctx.fill();

    // Subtle concentric showroom turntable ring lines
    ctx.strokeStyle = 'rgba(24, 24, 27, 0.09)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.43, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(220, 38, 38, 0.16)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 10]);
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.415, 0, Math.PI * 2);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}
