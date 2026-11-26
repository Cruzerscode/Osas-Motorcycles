import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Box, RotateCw, RefreshCw } from 'lucide-react';
import { ColorOption } from '../data/motorcycles';

interface GlbModelViewerProps {
  url: string;
  fileName?: string;
  heightClass?: string;
  selectedColor?: ColorOption;
}

interface PaintTargetMaterial {
  material: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
  originalColor: THREE.Color;
  originalMetalness: number;
  originalRoughness: number;
  isUnifiedFallback: boolean;
}

const EXCLUDE_MATERIAL_REGEX =
  /tire|tyre|rubber|glass|windscreen|visor|lens|headlight|taillight|lamp|chrome|exhaust|muffler|pipe|disc|brake|rotor|chain|sprocket|seat|saddle|leather|grip|handlebar|fork|engine|motor|caliper|mirror|carbon|stand|kickstand|pedal|peg|rim_spoke/i;

const BODY_MATERIAL_REGEX =
  /body|tank|fuel|fairing|cowl|fender|mudguard|paint|chassis|cover|panel|shroud|tail|nose|hood|shell|wing|carapace/i;

export const GlbModelViewer: React.FC<GlbModelViewerProps> = ({
  url,
  fileName,
  heightClass = 'h-64 sm:h-80',
  selectedColor,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const paintTargetsRef = useRef<PaintTargetMaterial[]>([]);
  const defaultCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(2.8, 1.5, 3.2));

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !url) return;

    setStatus('loading');
    setProgress(0);
    setErrorMsg('');

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f3f5);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.05, 100);
    camera.position.copy(defaultCamPosRef.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.8;
    controls.minDistance = 0.8;
    controls.maxDistance = 12;
    controlsRef.current = controls;

    // Studio lighting rig
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd4d4d8, 1.35);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xfef2f2, 0.9);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xe4e4e7, 0.75);
    fillLight.position.set(0, -2, 4);
    scene.add(fillLight);

    // Subtle studio pedestal disc
    const floorGeo = new THREE.CircleGeometry(2.4, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xe7e7eb,
      roughness: 0.9,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    let loadedRoot: THREE.Object3D | null = null;
    let disposed = false;

    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        if (disposed) return;
        loadedRoot = gltf.scene;

        const box = new THREE.Box3().setFromObject(loadedRoot);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 2.6 / maxDim;
        loadedRoot.scale.setScalar(scale);

        // Recompute bounding box after scaling so model rests cleanly on y = 0
        const scaledBox = new THREE.Box3().setFromObject(loadedRoot);
        const scaledCenter = new THREE.Vector3();
        scaledBox.getCenter(scaledCenter);

        loadedRoot.position.x -= scaledCenter.x;
        loadedRoot.position.z -= scaledCenter.z;
        loadedRoot.position.y -= scaledBox.min.y;

        const namedTargets = new Map<THREE.Material, PaintTargetMaterial>();
        const candidateMeshes: Array<{
          volume: number;
          material: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
        }> = [];
        const allStandardMaterials = new Set<
          THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial
        >();

        loadedRoot.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          const meshBox = new THREE.Box3().setFromObject(mesh);
          const meshSize = new THREE.Vector3();
          meshBox.getSize(meshSize);
          const volume = meshSize.x * meshSize.y * meshSize.z;

          const mats = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];

          mats.forEach((rawMat) => {
            if (
              !(rawMat instanceof THREE.MeshStandardMaterial) &&
              !(rawMat instanceof THREE.MeshPhysicalMaterial)
            ) {
              return;
            }
            allStandardMaterials.add(rawMat);
            const combinedName = `${mesh.name || ''} ${rawMat.name || ''}`;
            const hsl = { h: 0, s: 0, l: 0 };
            rawMat.color.getHSL(hsl);
            const isPureChrome =
              rawMat.metalness >= 0.85 &&
              rawMat.roughness <= 0.25 &&
              hsl.s < 0.12;

            if (EXCLUDE_MATERIAL_REGEX.test(combinedName) || isPureChrome) {
              return;
            }

            if (BODY_MATERIAL_REGEX.test(combinedName)) {
              if (!namedTargets.has(rawMat)) {
                namedTargets.set(rawMat, {
                  material: rawMat,
                  originalColor: rawMat.color.clone(),
                  originalMetalness: rawMat.metalness,
                  originalRoughness: rawMat.roughness,
                  isUnifiedFallback: false,
                });
              }
            } else {
              candidateMeshes.push({ volume, material: rawMat });
            }
          });
        });

        if (namedTargets.size > 0) {
          paintTargetsRef.current = Array.from(namedTargets.values());
        } else if (candidateMeshes.length > 0) {
          // Pick largest non-excluded body mesh materials (or unified single material)
          candidateMeshes.sort((a, b) => b.volume - a.volume);
          const topVolume = candidateMeshes[0].volume;
          const fallbackMap = new Map<THREE.Material, PaintTargetMaterial>();
          candidateMeshes.forEach(({ volume, material }) => {
            if (volume >= topVolume * 0.25 || allStandardMaterials.size === 1) {
              if (!fallbackMap.has(material)) {
                fallbackMap.set(material, {
                  material,
                  originalColor: material.color.clone(),
                  originalMetalness: material.metalness,
                  originalRoughness: material.roughness,
                  isUnifiedFallback: allStandardMaterials.size <= 2,
                });
              }
            }
          });
          paintTargetsRef.current = Array.from(fallbackMap.values());
        } else if (allStandardMaterials.size === 1) {
          const [onlyMat] = Array.from(allStandardMaterials);
          paintTargetsRef.current = [
            {
              material: onlyMat,
              originalColor: onlyMat.color.clone(),
              originalMetalness: onlyMat.metalness,
              originalRoughness: onlyMat.roughness,
              isUnifiedFallback: true,
            },
          ];
        } else {
          paintTargetsRef.current = [];
        }

        scene.add(loadedRoot);

        const finalBox = new THREE.Box3().setFromObject(loadedRoot);
        const finalCenter = new THREE.Vector3();
        finalBox.getCenter(finalCenter);
        controls.target.copy(finalCenter);
        defaultCamPosRef.current.set(2.8, finalCenter.y + 0.9, 3.1);
        camera.position.copy(defaultCamPosRef.current);
        controls.update();

        setStatus('ready');
      },
      (xhr) => {
        if (xhr.total > 0) {
          setProgress(Math.min(99, Math.round((xhr.loaded / xhr.total) * 100)));
        }
      },
      () => {
        if (disposed) return;
        setStatus('error');
        setErrorMsg(
          'Unable to load this 3D file. Verify the .glb/.gltf URL allows CORS or upload a local .glb file.'
        );
      }
    );

    let animId = 0;
    const animate = () => {
      animId = window.requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 300;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      if (loadedRoot) {
        loadedRoot.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            const mats = Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material];
            mats.forEach((m) => m.dispose());
          }
        });
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      paintTargetsRef.current = [];
    };
  }, [url]);

  // Live 3D body paint update without reloading the .glb scene
  useEffect(() => {
    if (status !== 'ready' || paintTargetsRef.current.length === 0) return;

    if (!selectedColor) {
      paintTargetsRef.current.forEach((entry) => {
        entry.material.color.copy(entry.originalColor);
        entry.material.metalness = entry.originalMetalness;
        entry.material.roughness = entry.originalRoughness;
        entry.material.needsUpdate = true;
      });
      return;
    }

    const targetColor = new THREE.Color(selectedColor.hex);
    const isMatteFinish = /matte/i.test(selectedColor.name);

    paintTargetsRef.current.forEach((entry) => {
      entry.material.color.copy(targetColor);
      if (entry.isUnifiedFallback || !entry.material.map) {
        entry.material.metalness = isMatteFinish ? 0.25 : 0.6;
        entry.material.roughness = isMatteFinish ? 0.52 : 0.25;
      } else {
        entry.material.metalness = Math.max(entry.originalMetalness, 0.45);
        entry.material.roughness = Math.min(entry.originalRoughness, 0.35);
      }
      entry.material.needsUpdate = true;
    });
  }, [status, selectedColor]);

  const handleResetView = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.copy(defaultCamPosRef.current);
      controlsRef.current.update();
    }
  };

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl bg-[#F3F3F5] border border-black/[0.05] overflow-hidden`}
    >
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left 3D + Active Paint Pill Badge */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-black/[0.06] text-[11px] font-semibold text-[#18181B] shadow-xs">
          <Box className="w-3.5 h-3.5 text-[#DC2626]" />
          <span>Interactive 3D{fileName ? ` · ${fileName}` : ' (.glb)'}</span>
        </div>
        {selectedColor && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 border border-black/[0.06] text-[11px] font-semibold text-[#18181B] shadow-xs">
            <span
              className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
              style={{ backgroundColor: selectedColor.hex }}
            />
            <span>{selectedColor.name}</span>
          </div>
        )}
      </div>

      {/* Top Right Controls */}
      {status === 'ready' && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            title="Toggle auto-rotate"
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer inline-flex items-center gap-1 ${
              autoRotate
                ? 'bg-[#18181B] text-white border-[#18181B]'
                : 'bg-white text-[#18181B] border-black/[0.08]'
            }`}
          >
            <RotateCw className="w-3 h-3" />
            <span>Spin</span>
          </button>
          <button
            type="button"
            onClick={handleResetView}
            title="Reset camera angle"
            className="w-7 h-7 rounded-full bg-white text-[#18181B] border border-black/[0.08] inline-flex items-center justify-center hover:bg-zinc-100 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      )}

      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F3F3F5]/90 text-center p-4">
          <div className="w-9 h-9 rounded-full border-2 border-[#18181B]/20 border-t-[#DC2626] animate-spin mb-2.5" />
          <p className="text-[12.5px] font-semibold text-[#18181B] tabular-nums">
            Loading 3D Studio Scan... {progress > 0 ? `${progress}%` : ''}
          </p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Drag to rotate · Scroll to zoom
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F3F3F5] text-center p-5">
          <Box className="w-8 h-8 text-[#DC2626] mb-2" />
          <p className="text-[13px] font-semibold text-[#18181B]">
            3D Preview Unavailable
          </p>
          <p className="text-[11.5px] text-zinc-500 max-w-xs mt-1">
            {errorMsg}
          </p>
        </div>
      )}

      {status === 'ready' && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/85 backdrop-blur-xs text-[10.5px] font-medium text-zinc-600 pointer-events-none">
          Drag to orbit 360° · Scroll to zoom
        </div>
      )}
    </div>
  );
};
