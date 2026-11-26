import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ColorOption, Motorcycle } from '../data/motorcycles';
import {
  BodyStyleKey,
  BuiltMotorcycleCollection,
  buildAllMotorcycleStyles,
  getBodyStyleForBike,
} from '../three/motorcycleBuilder';
import {
  MotorcycleMaterialSet,
  createMotorcycleMaterialSet,
  createPedestalRingTexture,
  createStudioShadowTexture,
} from '../three/motorcycleMaterials';

export type CameraPresetKey = 'hero' | 'side' | 'front' | 'rear' | 'cockpit';

export const CAMERA_PRESETS: Record<
  CameraPresetKey,
  {
    label: string;
    shortLabel: string;
    position: [number, number, number];
    target: [number, number, number];
  }
> = {
  hero: {
    label: '3/4 Hero Angle',
    shortLabel: '3/4 Hero',
    position: [2.25, 1.05, 2.35],
    target: [0, 0.54, 0],
  },
  side: {
    label: 'Side Profile',
    shortLabel: 'Side Profile',
    position: [0.02, 0.68, 3.05],
    target: [0, 0.54, 0],
  },
  front: {
    label: 'Front View',
    shortLabel: 'Front View',
    position: [2.95, 0.82, 0.04],
    target: [0, 0.56, 0],
  },
  rear: {
    label: 'Rear / Exhaust View',
    shortLabel: 'Rear / Exhaust',
    position: [-2.6, 0.92, 1.35],
    target: [-0.08, 0.54, 0],
  },
  cockpit: {
    label: 'Cockpit / Top View',
    shortLabel: 'Cockpit / Top',
    position: [-0.95, 2.22, 0.78],
    target: [0.16, 0.64, 0],
  },
};

// Reusable module-scope scratch vectors (Zero GC inside render loop)
const _presetPos = new THREE.Vector3();
const _presetTarget = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

interface Showroom3DCanvasProps {
  bike: Motorcycle;
  selectedColor: ColorOption;
  cameraPreset: CameraPresetKey;
  presetVersion: number;
  autoSpin: boolean;
  onAutoSpinChange?: (next: boolean) => void;
  className?: string;
}

export const Showroom3DCanvas: React.FC<Showroom3DCanvasProps> = ({
  bike,
  selectedColor,
  cameraPreset,
  presetVersion,
  autoSpin,
  onAutoSpinChange,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Mutable refs for instant zero-unmount updates inside the live WebGL scene
  const autoSpinRef = useRef(autoSpin);
  autoSpinRef.current = autoSpin;

  const onAutoSpinChangeRef = useRef(onAutoSpinChange);
  onAutoSpinChangeRef.current = onAutoSpinChange;

  const sceneRefs = useRef<{
    materials: MotorcycleMaterialSet;
    collection: BuiltMotorcycleCollection;
    controls: OrbitControls;
    camera: THREE.PerspectiveCamera;
    requestRender: () => void;
    triggerPreset: (preset: CameraPresetKey) => void;
    setAutoSpinState: (spin: boolean) => void;
    isSoftwareGl: boolean;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const initialWidth = Math.max(container.clientWidth, 300);
    const initialHeight = Math.max(container.clientHeight, 240);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.setSize(initialWidth, initialHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      34,
      initialWidth / initialHeight,
      0.1,
      50
    );
    const initialPreset = CAMERA_PRESETS[cameraPreset];
    camera.position.set(...initialPreset.position);

    // Studio Environment Reflection Map (RoomEnvironment on every device)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Balanced 3-Point Studio Lighting Rig + Softboxes
    const hemiLight = new THREE.HemisphereLight(0xf4f7ff, 0xe4e0da, 0.95);
    hemiLight.position.set(0, 8, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffaf2, 2.1);
    keyLight.position.set(3.5, 5.2, 3.8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 14;
    keyLight.shadow.camera.left = -2.4;
    keyLight.shadow.camera.right = 2.4;
    keyLight.shadow.camera.top = 2.4;
    keyLight.shadow.camera.bottom = -2.4;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xeef4ff, 0.85);
    fillLight.position.set(-4.0, 2.5, 3.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.15);
    rimLight.position.set(-2.5, 3.4, -4.2);
    scene.add(rimLight);

    const rectLights: THREE.RectAreaLight[] = [];
    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const topSoftbox = new THREE.RectAreaLight(0xffffff, 2.6, 3.8, 1.6);
      topSoftbox.position.set(0, 3.6, 0.5);
      topSoftbox.lookAt(0, 0.5, 0);
      scene.add(topSoftbox);
      rectLights.push(topSoftbox);

      const frontSoftbox = new THREE.RectAreaLight(0xfff8f0, 1.6, 2.4, 1.4);
      frontSoftbox.position.set(2.8, 1.6, 2.6);
      frontSoftbox.lookAt(0, 0.5, 0);
      scene.add(frontSoftbox);
      rectLights.push(frontSoftbox);
    }

    // Studio Pedestal & Radial Contact Shadow Grounding
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const pedestalTex = createPedestalRingTexture(maxAnisotropy);
    const pedestalGeo = new THREE.PlaneGeometry(3.4, 3.4);
    pedestalGeo.rotateX(-Math.PI / 2);
    const pedestalMat = new THREE.MeshBasicMaterial({
      map: pedestalTex,
      transparent: true,
      depthWrite: false,
    });
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestalMesh.position.y = 0.0;
    scene.add(pedestalMesh);

    const contactTex = createStudioShadowTexture(maxAnisotropy);
    const contactGeo = new THREE.PlaneGeometry(2.8, 2.8);
    contactGeo.rotateX(-Math.PI / 2);
    const contactMat = new THREE.MeshBasicMaterial({
      map: contactTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.78,
    });
    const contactMesh = new THREE.Mesh(contactGeo, contactMat);
    contactMesh.position.y = 0.002;
    scene.add(contactMesh);

    const shadowPlaneGeo = new THREE.PlaneGeometry(5, 5);
    shadowPlaneGeo.rotateX(-Math.PI / 2);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.14 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.position.y = 0.004;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Build all 4 procedural motorcycle styles once with shared PBR materials
    const materials = createMotorcycleMaterialSet(selectedColor.hex);
    const collection = buildAllMotorcycleStyles(materials);
    const initialStyle = getBodyStyleForBike(bike);
    (Object.keys(collection.models) as BodyStyleKey[]).forEach((key) => {
      collection.models[key].visible = key === initialStyle;
    });
    scene.add(collection.root);

    // OrbitControls configured for studio showroom inspection
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...initialPreset.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.065;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minDistance = 1.65;
    controls.maxDistance = 5.4;
    controls.minPolarAngle = 0.22;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.autoRotate = autoSpinRef.current && !isSoftwareGl;
    controls.autoRotateSpeed = 1.35;
    controls.update();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Smooth camera preset transition state
    let transitionActive = false;
    let isPointerDragging = false;
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let disposed = false;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (disposed) return;
        renderDirty = false;

        const now = performance.now();
        const delta = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        if (transitionActive) {
          if (isSoftwareGl) {
            camera.position.copy(_presetPos);
            controls.target.copy(_presetTarget);
            transitionActive = false;
          } else {
            const lambda = 7.5;
            camera.position.x = THREE.MathUtils.damp(
              camera.position.x,
              _presetPos.x,
              lambda,
              delta
            );
            camera.position.y = THREE.MathUtils.damp(
              camera.position.y,
              _presetPos.y,
              lambda,
              delta
            );
            camera.position.z = THREE.MathUtils.damp(
              camera.position.z,
              _presetPos.z,
              lambda,
              delta
            );
            controls.target.x = THREE.MathUtils.damp(
              controls.target.x,
              _presetTarget.x,
              lambda,
              delta
            );
            controls.target.y = THREE.MathUtils.damp(
              controls.target.y,
              _presetTarget.y,
              lambda,
              delta
            );
            controls.target.z = THREE.MathUtils.damp(
              controls.target.z,
              _presetTarget.z,
              lambda,
              delta
            );
            if (
              camera.position.distanceTo(_presetPos) < 0.008 &&
              controls.target.distanceTo(_presetTarget) < 0.008
            ) {
              camera.position.copy(_presetPos);
              controls.target.copy(_presetTarget);
              transitionActive = false;
            }
          }
        }

        const controlsChanged = controls.update();
        renderer.render(scene, camera);

        const shouldContinue =
          transitionActive ||
          isPointerDragging ||
          (controls.autoRotate && !isSoftwareGl) ||
          Boolean(controlsChanged && controls.enableDamping);

        const done = () => {
          renderBusy = false;
          if (disposed) return;
          if (renderDirty || shouldContinue) {
            requestRender();
          }
        };

        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    const handleControlStart = () => {
      isPointerDragging = true;
      transitionActive = false;
      if (autoSpinRef.current) {
        controls.autoRotate = false;
        onAutoSpinChangeRef.current?.(false);
      }
      requestRender();
    };

    const handleControlChange = () => {
      requestRender();
    };

    const handleControlEnd = () => {
      isPointerDragging = false;
      requestRender();
    };

    controls.addEventListener('start', handleControlStart);
    controls.addEventListener('change', handleControlChange);
    controls.addEventListener('end', handleControlEnd);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(Math.round(entry.contentRect.width), 100);
        const h = Math.max(Math.round(entry.contentRect.height), 100);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        requestRender();
      }
    });
    resizeObserver.observe(container);

    sceneRefs.current = {
      materials,
      collection,
      controls,
      camera,
      requestRender,
      isSoftwareGl,
      triggerPreset: (preset: CameraPresetKey) => {
        const cfg = CAMERA_PRESETS[preset];
        _presetPos.set(...cfg.position);
        _presetTarget.set(...cfg.target);
        transitionActive = true;
        requestRender();
      },
      setAutoSpinState: (spin: boolean) => {
        controls.autoRotate = spin && !isSoftwareGl;
        requestRender();
      },
    };

    // Initial draw
    requestRender();

    return () => {
      disposed = true;
      sceneRefs.current = null;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', handleControlStart);
      controls.removeEventListener('change', handleControlChange);
      controls.removeEventListener('end', handleControlEnd);
      controls.dispose();
      collection.dispose();
      materials.dispose();
      pedestalGeo.dispose();
      pedestalMat.dispose();
      pedestalTex.dispose();
      contactGeo.dispose();
      contactMat.dispose();
      contactTex.dispose();
      shadowPlaneGeo.dispose();
      shadowPlaneMat.dispose();
      envTarget.dispose();
      rectLights.length = 0;
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Instant 0ms color swatch synchronization
  useEffect(() => {
    const refs = sceneRefs.current;
    if (!refs) return;
    refs.materials.paint.color.set(selectedColor.hex);
    refs.requestRender();
  }, [selectedColor.hex]);

  // Instant 0ms body-style switching across all 21 motorcycles
  useEffect(() => {
    const refs = sceneRefs.current;
    if (!refs) return;
    const targetStyle = getBodyStyleForBike(bike);
    (Object.keys(refs.collection.models) as BodyStyleKey[]).forEach((key) => {
      refs.collection.models[key].visible = key === targetStyle;
    });
    refs.requestRender();
  }, [bike.id, bike.category]);

  // Camera angle preset transitions
  useEffect(() => {
    const refs = sceneRefs.current;
    if (!refs || presetVersion === 0) return;
    refs.triggerPreset(cameraPreset);
  }, [cameraPreset, presetVersion]);

  // Auto-spin toggle synchronization
  useEffect(() => {
    const refs = sceneRefs.current;
    if (!refs) return;
    refs.setAutoSpinState(autoSpin);
  }, [autoSpin]);

  return (
    <div
      ref={mountRef}
      className={`w-full h-full select-none cursor-grab active:cursor-grabbing ${className}`}
      aria-label={`Interactive 360 degree 3D model of ${bike.brand} ${bike.model}`}
    />
  );
};
