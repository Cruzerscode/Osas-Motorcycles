import * as THREE from 'three';
import { CategoryName, Motorcycle } from '../data/motorcycles';
import { MotorcycleMaterialSet } from './motorcycleMaterials';

export type BodyStyleKey = 'commuter' | 'dispatch' | 'supersport' | 'cub';

export function getBodyStyleForBike(bike: Motorcycle): BodyStyleKey {
  const cat: CategoryName = bike.category;
  if (cat === 'Dispatch / Off-Road') return 'dispatch';
  if (cat === '600cc Power Bikes') return 'supersport';
  if (cat === "Ladies' Cubs & Scooters") return 'cub';
  return 'commuter';
}

class GeometryTracker {
  private list: THREE.BufferGeometry[] = [];
  track<T extends THREE.BufferGeometry>(geo: T): T {
    this.list.push(geo);
    return geo;
  }
  disposeAll() {
    this.list.forEach((g) => g.dispose());
    this.list = [];
  }
}

function enableShadows(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

function createWheel(
  tracker: GeometryTracker,
  mats: MotorcycleMaterialSet,
  opts: {
    torusRadius: number;
    tubeRadius: number;
    wheelStyle: 'spoked' | 'alloy-sport' | 'alloy-cub';
    knobby?: boolean;
    dualDisc?: boolean;
    discRadius?: number;
  }
): THREE.Group {
  const wheel = new THREE.Group();
  const {
    torusRadius,
    tubeRadius,
    wheelStyle,
    knobby = false,
    dualDisc = false,
    discRadius = opts.torusRadius * 0.52,
  } = opts;

  // Main rubber tire (Torus lies in XY plane by default — exact wheel alignment!)
  const tireGeo = tracker.track(
    new THREE.TorusGeometry(torusRadius, tubeRadius, 18, 42)
  );
  const tire = new THREE.Mesh(tireGeo, mats.rubber);
  wheel.add(tire);

  // Knobby dual-sport lugs around perimeter
  if (knobby) {
    const lugCount = 24;
    const lugGeo = tracker.track(
      new THREE.BoxGeometry(0.028, 0.022, tubeRadius * 1.35)
    );
    const lugMesh = new THREE.InstancedMesh(lugGeo, mats.rubber, lugCount);
    const dummy = new THREE.Object3D();
    const outerR = torusRadius + tubeRadius - 0.002;
    for (let i = 0; i < lugCount; i++) {
      const angle = (i / lugCount) * Math.PI * 2;
      dummy.position.set(Math.cos(angle) * outerR, Math.sin(angle) * outerR, 0);
      dummy.rotation.set(0, 0, angle);
      dummy.updateMatrix();
      lugMesh.setMatrixAt(i, dummy.matrix);
    }
    lugMesh.instanceMatrix.needsUpdate = true;
    lugMesh.computeBoundingSphere();
    wheel.add(lugMesh);
  }

  // Rim ring
  const rimInnerR = torusRadius - tubeRadius * 0.65;
  const rimGeo = tracker.track(
    new THREE.TorusGeometry(rimInnerR, 0.017, 10, 36)
  );
  const rimMat = wheelStyle === 'spoked' ? mats.chrome : mats.frameDark;
  const rim = new THREE.Mesh(rimGeo, rimMat);
  wheel.add(rim);

  // Center Hub
  const hubRadius = wheelStyle === 'spoked' ? 0.048 : 0.056;
  const hubGeo = tracker.track(
    new THREE.CylinderGeometry(hubRadius, hubRadius, tubeRadius * 1.4, 20)
  );
  hubGeo.rotateX(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeo, mats.titanium);
  wheel.add(hub);

  // Spokes / Alloy Y-Spokes
  if (wheelStyle === 'spoked') {
    const spokeCount = 20;
    const spokeLen = rimInnerR - hubRadius + 0.01;
    const spokeGeo = tracker.track(
      new THREE.CylinderGeometry(0.004, 0.004, spokeLen, 6)
    );
    const spokes = new THREE.InstancedMesh(spokeGeo, mats.chrome, spokeCount);
    const dummy = new THREE.Object3D();
    const midR = (rimInnerR + hubRadius) * 0.5;
    for (let i = 0; i < spokeCount; i++) {
      const a = (i / spokeCount) * Math.PI * 2;
      const zOff = i % 2 === 0 ? 0.018 : -0.018;
      dummy.position.set(Math.cos(a) * midR, Math.sin(a) * midR, zOff);
      dummy.rotation.set(0, 0, a - Math.PI / 2);
      dummy.updateMatrix();
      spokes.setMatrixAt(i, dummy.matrix);
    }
    spokes.instanceMatrix.needsUpdate = true;
    spokes.computeBoundingSphere();
    wheel.add(spokes);
  } else {
    const spokeCount = wheelStyle === 'alloy-sport' ? 5 : 5;
    const spokeLen = rimInnerR - hubRadius + 0.012;
    const armGeo = tracker.track(
      new THREE.BoxGeometry(
        wheelStyle === 'alloy-sport' ? 0.018 : 0.026,
        spokeLen,
        0.028
      )
    );
    const midR = (rimInnerR + hubRadius) * 0.5;
    for (let i = 0; i < spokeCount; i++) {
      const a = (i / spokeCount) * Math.PI * 2;
      if (wheelStyle === 'alloy-sport') {
        for (const split of [-0.12, 0.12]) {
          const arm = new THREE.Mesh(armGeo, mats.frameDark);
          arm.position.set(
            Math.cos(a + split * 0.4) * midR,
            Math.sin(a + split * 0.4) * midR,
            0
          );
          arm.rotation.z = a + split - Math.PI / 2;
          wheel.add(arm);
        }
      } else {
        const arm = new THREE.Mesh(armGeo, mats.titanium);
        arm.position.set(Math.cos(a) * midR, Math.sin(a) * midR, 0);
        arm.rotation.z = a - Math.PI / 2;
        wheel.add(arm);
      }
    }
  }

  // Brake Disc Rotor(s)
  const rotorSides = dualDisc ? [-1, 1] : [1];
  const rotorGeo = tracker.track(
    new THREE.RingGeometry(discRadius * 0.52, discRadius, 28)
  );
  const caliperGeo = tracker.track(new THREE.BoxGeometry(0.052, 0.075, 0.036));
  const rotorOffsetZ = tubeRadius * 0.72 + 0.012;

  rotorSides.forEach((side) => {
    const rotorFront = new THREE.Mesh(rotorGeo, mats.titanium);
    rotorFront.position.z = side * rotorOffsetZ;
    wheel.add(rotorFront);

    const rotorBack = new THREE.Mesh(rotorGeo, mats.titanium);
    rotorBack.rotation.y = Math.PI;
    rotorBack.position.z = side * (rotorOffsetZ - 0.004);
    wheel.add(rotorBack);

    const caliper = new THREE.Mesh(
      caliperGeo,
      dualDisc ? mats.goldAnodized : mats.engineBlock
    );
    caliper.position.set(-discRadius * 0.78, -discRadius * 0.25, side * rotorOffsetZ);
    caliper.rotation.z = 0.35;
    wheel.add(caliper);
  });

  return wheel;
}

function createTube(
  tracker: GeometryTracker,
  points: Array<[number, number, number]>,
  radius: number,
  mat: THREE.Material,
  tubularSegments = 24
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
  );
  const geo = tracker.track(
    new THREE.TubeGeometry(curve, tubularSegments, radius, 10, false)
  );
  return new THREE.Mesh(geo, mat);
}

function createMirrorsAndHandlebar(
  tracker: GeometryTracker,
  mats: MotorcycleMaterialSet,
  opts: {
    stemX: number;
    stemY: number;
    width: number;
    rise: number;
    clipOn?: boolean;
    roundMirrors?: boolean;
    handguards?: boolean;
  }
): THREE.Group {
  const group = new THREE.Group();
  const {
    stemX,
    stemY,
    width,
    rise,
    clipOn = false,
    roundMirrors = true,
    handguards = false,
  } = opts;

  const barRadius = 0.014;
  if (clipOn) {
    // Low angled sport clip-ons
    [-1, 1].forEach((side) => {
      const bar = createTube(
        tracker,
        [
          [stemX, stemY, side * 0.06],
          [stemX - 0.05, stemY - 0.025, side * (width * 0.5)],
        ],
        barRadius,
        mats.frameDark,
        8
      );
      group.add(bar);

      const gripGeo = tracker.track(
        new THREE.CylinderGeometry(0.019, 0.019, 0.11, 12)
      );
      gripGeo.rotateX(Math.PI / 2);
      const grip = new THREE.Mesh(gripGeo, mats.rubber);
      grip.position.set(stemX - 0.04, stemY - 0.022, side * (width * 0.44));
      grip.rotation.y = side * -0.25;
      group.add(grip);
    });
  } else {
    const bar = createTube(
      tracker,
      [
        [stemX - 0.03, stemY + rise, -width * 0.5],
        [stemX + 0.01, stemY + rise * 0.7, -width * 0.2],
        [stemX + 0.02, stemY, 0],
        [stemX + 0.01, stemY + rise * 0.7, width * 0.2],
        [stemX - 0.03, stemY + rise, width * 0.5],
      ],
      barRadius,
      mats.chrome,
      20
    );
    group.add(bar);

    [-1, 1].forEach((side) => {
      const gripGeo = tracker.track(
        new THREE.CylinderGeometry(0.019, 0.019, 0.12, 12)
      );
      gripGeo.rotateX(Math.PI / 2);
      const grip = new THREE.Mesh(gripGeo, mats.rubber);
      grip.position.set(stemX - 0.025, stemY + rise, side * (width * 0.44));
      grip.rotation.y = side * -0.15;
      group.add(grip);

      // Brake / Clutch levers
      const leverGeo = tracker.track(
        new THREE.BoxGeometry(0.016, 0.008, 0.11)
      );
      const lever = new THREE.Mesh(leverGeo, mats.titanium);
      lever.position.set(
        stemX + 0.015,
        stemY + rise - 0.01,
        side * (width * 0.36)
      );
      lever.rotation.y = side * 0.28;
      group.add(lever);

      if (handguards) {
        const guardGeo = tracker.track(
          new THREE.BoxGeometry(0.05, 0.06, 0.14)
        );
        const guard = new THREE.Mesh(guardGeo, mats.paintAccent);
        guard.position.set(
          stemX + 0.045,
          stemY + rise + 0.005,
          side * (width * 0.44)
        );
        guard.rotation.y = side * -0.18;
        group.add(guard);
      }

      if (roundMirrors) {
        const stalk = createTube(
          tracker,
          [
            [stemX - 0.01, stemY + rise + 0.01, side * (width * 0.34)],
            [stemX, stemY + rise + 0.12, side * (width * 0.42)],
            [stemX - 0.01, stemY + rise + 0.15, side * (width * 0.49)],
          ],
          0.006,
          mats.frameDark,
          10
        );
        group.add(stalk);

        const mirrorHousingGeo = tracker.track(
          new THREE.CylinderGeometry(0.046, 0.046, 0.016, 18)
        );
        mirrorHousingGeo.rotateZ(Math.PI / 2);
        const housing = new THREE.Mesh(mirrorHousingGeo, mats.frameDark);
        housing.position.set(
          stemX - 0.015,
          stemY + rise + 0.155,
          side * (width * 0.51)
        );
        housing.rotation.y = side * 0.25;
        group.add(housing);
      }
    });
  }

  return group;
}

function createExtrudedProfile(
  tracker: GeometryTracker,
  pts: Array<[number, number]>,
  depth: number,
  bevelSize = 0.018
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    shape.lineTo(pts[i][0], pts[i][1]);
  }
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    steps: 2,
    depth,
    bevelEnabled: true,
    bevelThickness: bevelSize,
    bevelSize,
    bevelSegments: 4,
  });
  geo.translate(0, 0, -depth * 0.5);
  return tracker.track(geo);
}

// ============================================================================
// 1. COMMUTER / COMMERCIAL (Boxer, TVS HLX, Honda CG125, Hero Hunter, Suzuki)
// ============================================================================
function buildCommuterBike(
  tracker: GeometryTracker,
  mats: MotorcycleMaterialSet
): THREE.Group {
  const bike = new THREE.Group();
  const frontX = 0.67;
  const rearX = -0.67;
  const wheelR = 0.25;
  const tireTube = 0.058;
  const axleY = wheelR + tireTube; // 0.308m -> bottom touches y = 0

  // Wheels
  const frontWheel = createWheel(tracker, mats, {
    torusRadius: wheelR,
    tubeRadius: tireTube,
    wheelStyle: 'spoked',
    discRadius: 0.135,
  });
  frontWheel.position.set(frontX, axleY, 0);
  bike.add(frontWheel);

  const rearWheel = createWheel(tracker, mats, {
    torusRadius: wheelR,
    tubeRadius: tireTube,
    wheelStyle: 'spoked',
    discRadius: 0.12,
  });
  rearWheel.position.set(rearX, axleY, 0);
  bike.add(rearWheel);

  // Classic tubular diamond frame
  bike.add(
    createTube(
      tracker,
      [
        [0.44, 0.82, 0],
        [0.12, 0.72, 0],
        [-0.22, 0.68, 0],
        [-0.58, 0.69, 0],
      ],
      0.02,
      mats.frameDark
    )
  );
  bike.add(
    createTube(
      tracker,
      [
        [0.44, 0.82, 0],
        [0.24, 0.44, 0],
        [-0.08, 0.36, 0],
        [-0.22, 0.68, 0],
      ],
      0.018,
      mats.frameDark
    )
  );

  // Twin swingarm & twin coiled rear shock absorbers
  [-1, 1].forEach((side) => {
    const z = side * 0.115;
    bike.add(
      createTube(
        tracker,
        [
          [-0.14, 0.36, z * 0.8],
          [rearX, axleY, z],
        ],
        0.017,
        mats.frameDark,
        8
      )
    );
    // Shock cylinder + coil rings
    const shock = createTube(
      tracker,
      [
        [rearX + 0.06, axleY + 0.03, z + side * 0.02],
        [-0.36, 0.66, z + side * 0.01],
      ],
      0.014,
      mats.chrome,
      6
    );
    bike.add(shock);

    for (let s = 0; s < 6; s++) {
      const t = 0.22 + s * 0.1;
      const coilGeo = tracker.track(
        new THREE.TorusGeometry(0.025, 0.0045, 6, 14)
      );
      const coil = new THREE.Mesh(coilGeo, mats.chrome);
      coil.position.set(
        THREE.MathUtils.lerp(rearX + 0.06, -0.36, t),
        THREE.MathUtils.lerp(axleY + 0.03, 0.66, t),
        THREE.MathUtils.lerp(z + side * 0.02, z + side * 0.01, t)
      );
      coil.rotation.x = Math.PI / 2;
      coil.rotation.y = -0.58;
      bike.add(coil);
    }
  });

  // Air-cooled single cylinder engine + cooling fins
  const crankGeo = tracker.track(new THREE.BoxGeometry(0.24, 0.16, 0.2));
  const crank = new THREE.Mesh(crankGeo, mats.engineBlock);
  crank.position.set(0.02, 0.41, 0);
  bike.add(crank);

  const sideCoverGeo = tracker.track(
    new THREE.CylinderGeometry(0.075, 0.075, 0.23, 18)
  );
  sideCoverGeo.rotateX(Math.PI / 2);
  const sideCover = new THREE.Mesh(sideCoverGeo, mats.titanium);
  sideCover.position.set(-0.02, 0.4, 0);
  bike.add(sideCover);

  for (let f = 0; f < 6; f++) {
    const finGeo = tracker.track(new THREE.BoxGeometry(0.135, 0.01, 0.14));
    const fin = new THREE.Mesh(finGeo, mats.engineBlock);
    fin.position.set(0.08, 0.51 + f * 0.024, 0);
    fin.rotation.z = -0.18;
    bike.add(fin);
  }

  // Chrome exhaust pipe & muffler on +Z
  bike.add(
    createTube(
      tracker,
      [
        [0.14, 0.56, 0.04],
        [0.24, 0.4, 0.14],
        [-0.08, 0.24, 0.155],
        [-0.52, 0.28, 0.16],
      ],
      0.019,
      mats.chrome,
      24
    )
  );
  const mufflerGeo = tracker.track(
    new THREE.CylinderGeometry(0.042, 0.036, 0.44, 18)
  );
  mufflerGeo.rotateZ(Math.PI / 2 - 0.12);
  const muffler = new THREE.Mesh(mufflerGeo, mats.chrome);
  muffler.position.set(-0.46, 0.3, 0.165);
  bike.add(muffler);

  // Sculpted teardrop commuter fuel tank (painted)
  const tankGeo = createExtrudedProfile(
    tracker,
    [
      [-0.04, 0.7],
      [0.36, 0.72],
      [0.41, 0.84],
      [0.26, 0.92],
      [0.02, 0.85],
    ],
    0.18,
    0.04
  );
  const tank = new THREE.Mesh(tankGeo, mats.paint);
  bike.add(tank);

  // Tank chrome fuel cap & side knee badges
  const capGeo = tracker.track(new THREE.CylinderGeometry(0.032, 0.035, 0.018, 16));
  const cap = new THREE.Mesh(capGeo, mats.chrome);
  cap.position.set(0.24, 0.945, 0);
  bike.add(cap);

  // Side battery cover panels (painted)
  const sidePanelGeo = createExtrudedProfile(
    tracker,
    [
      [-0.28, 0.54],
      [-0.06, 0.54],
      [-0.04, 0.7],
      [-0.26, 0.7],
    ],
    0.15,
    0.02
  );
  bike.add(new THREE.Mesh(sidePanelGeo, mats.paint));

  // Long flat ribbed bench seat
  const seatGeo = createExtrudedProfile(
    tracker,
    [
      [-0.56, 0.71],
      [-0.03, 0.7],
      [-0.02, 0.785],
      [-0.54, 0.8],
    ],
    0.18,
    0.028
  );
  bike.add(new THREE.Mesh(seatGeo, mats.seatLeather));

  // Heavy-duty rear tubular steel carrier rack
  [-1, 1].forEach((side) => {
    bike.add(
      createTube(
        tracker,
        [
          [-0.54, 0.73, side * 0.1],
          [-0.86, 0.74, side * 0.1],
          [-0.86, 0.74, 0],
        ],
        0.011,
        mats.chrome,
        10
      )
    );
    bike.add(
      createTube(
        tracker,
        [
          [-0.64, 0.68, side * 0.1],
          [-0.82, 0.74, side * 0.1],
        ],
        0.009,
        mats.chrome,
        6
      )
    );
  });

  // Telescopic front forks & triple clamps
  [-1, 1].forEach((side) => {
    const fork = createTube(
      tracker,
      [
        [0.42, 0.9, side * 0.095],
        [frontX, axleY, side * 0.095],
      ],
      0.018,
      mats.chrome,
      8
    );
    bike.add(fork);

    const slider = createTube(
      tracker,
      [
        [0.54, 0.61, side * 0.095],
        [frontX, axleY, side * 0.095],
      ],
      0.024,
      mats.engineBlock,
      6
    );
    bike.add(slider);
  });

  // Front & Rear Fenders (painted)
  const frontFenderGeo = tracker.track(
    new THREE.TorusGeometry(0.325, 0.045, 8, 22, Math.PI * 0.45)
  );
  frontFenderGeo.rotateZ(Math.PI * 0.28);
  const frontFender = new THREE.Mesh(frontFenderGeo, mats.paint);
  frontFender.position.set(frontX, axleY + 0.02, 0);
  frontFender.scale.set(1, 1, 1.45);
  bike.add(frontFender);

  const rearFenderGeo = tracker.track(
    new THREE.TorusGeometry(0.33, 0.048, 8, 22, Math.PI * 0.48)
  );
  rearFenderGeo.rotateZ(Math.PI * 0.46);
  const rearFender = new THREE.Mesh(rearFenderGeo, mats.chrome);
  rearFender.position.set(rearX, axleY + 0.03, 0);
  rearFender.scale.set(1, 1, 1.5);
  bike.add(rearFender);

  // Classic round chrome-bezel headlight + gauge pods + taillight
  const hlBucketGeo = tracker.track(
    new THREE.SphereGeometry(0.082, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.65)
  );
  hlBucketGeo.rotateZ(Math.PI / 2);
  const hlBucket = new THREE.Mesh(hlBucketGeo, mats.frameDark);
  hlBucket.position.set(0.56, 0.85, 0);
  bike.add(hlBucket);

  const hlLensGeo = tracker.track(
    new THREE.CylinderGeometry(0.072, 0.072, 0.02, 18)
  );
  hlLensGeo.rotateZ(Math.PI / 2);
  const hlLens = new THREE.Mesh(hlLensGeo, mats.headlightGlow);
  hlLens.position.set(0.585, 0.85, 0);
  bike.add(hlLens);

  // Twin speedometer dials
  [-0.045, 0.045].forEach((zOff) => {
    const podGeo = tracker.track(
      new THREE.CylinderGeometry(0.034, 0.03, 0.038, 16)
    );
    const pod = new THREE.Mesh(podGeo, mats.chrome);
    pod.position.set(0.49, 0.94, zOff);
    pod.rotation.z = -0.55;
    bike.add(pod);
  });

  // Taillight
  const tailGeo = tracker.track(new THREE.BoxGeometry(0.05, 0.048, 0.095));
  const tail = new THREE.Mesh(tailGeo, mats.taillightGlow);
  tail.position.set(-0.88, 0.66, 0);
  bike.add(tail);

  // Upright handlebars & mirrors
  bike.add(
    createMirrorsAndHandlebar(tracker, mats, {
      stemX: 0.43,
      stemY: 0.93,
      width: 0.66,
      rise: 0.1,
      roundMirrors: true,
    })
  );

  enableShadows(bike);
  return bike;
}

// ============================================================================
// 2. DISPATCH / OFF-ROAD (Qlink XP 200, XF 200, Daylong DL200-30)
// ============================================================================
function buildDispatchBike(
  tracker: GeometryTracker,
  mats: MotorcycleMaterialSet
): THREE.Group {
  const bike = new THREE.Group();
  const frontX = 0.72;
  const rearX = -0.69;
  const frontR = 0.27;
  const rearR = 0.255;
  const tube = 0.062;
  const frontAxleY = frontR + tube + 0.012; // knobby clearance
  const rearAxleY = rearR + tube + 0.012;

  const frontWheel = createWheel(tracker, mats, {
    torusRadius: frontR,
    tubeRadius: tube,
    wheelStyle: 'spoked',
    knobby: true,
    discRadius: 0.145,
  });
  frontWheel.position.set(frontX, frontAxleY, 0);
  bike.add(frontWheel);

  const rearWheel = createWheel(tracker, mats, {
    torusRadius: rearR,
    tubeRadius: tube,
    wheelStyle: 'spoked',
    knobby: true,
    discRadius: 0.125,
  });
  rearWheel.position.set(rearX, rearAxleY, 0);
  bike.add(rearWheel);

  // High-clearance perimeter dual-sport chassis
  bike.add(
    createTube(
      tracker,
      [
        [0.42, 0.96, 0],
        [0.08, 0.84, 0],
        [-0.25, 0.78, 0],
        [-0.64, 0.86, 0],
      ],
      0.022,
      mats.frameDark
    )
  );
  bike.add(
    createTube(
      tracker,
      [
        [0.42, 0.96, 0],
        [0.24, 0.48, 0],
        [-0.08, 0.42, 0],
        [-0.25, 0.78, 0],
      ],
      0.019,
      mats.frameDark
    )
  );

  // Steep swingarm + central monoshock
  [-1, 1].forEach((side) => {
    bike.add(
      createTube(
        tracker,
        [
          [-0.14, 0.45, side * 0.095],
          [rearX, rearAxleY, side * 0.115],
        ],
        0.02,
        mats.titanium,
        8
      )
    );
  });
  const mono = createTube(
    tracker,
    [
      [-0.26, 0.43, 0],
      [-0.12, 0.74, 0],
    ],
    0.032,
    mats.goldAnodized,
    6
  );
  bike.add(mono);

  // Rugged aluminum bash / skid plate
  const bashGeo = createExtrudedProfile(
    tracker,
    [
      [-0.12, 0.35],
      [0.21, 0.36],
      [0.29, 0.47],
      [0.24, 0.49],
      [-0.1, 0.39],
    ],
    0.16,
    0.01
  );
  bike.add(new THREE.Mesh(bashGeo, mats.titanium));

  // Engine block
  const engineGeo = tracker.track(new THREE.BoxGeometry(0.24, 0.22, 0.2));
  const engine = new THREE.Mesh(engineGeo, mats.engineBlock);
  engine.position.set(0.04, 0.54, 0);
  bike.add(engine);

  // Upswept high-mounted scrambler exhaust
  bike.add(
    createTube(
      tracker,
      [
        [0.14, 0.62, 0.04],
        [0.24, 0.5, 0.13],
        [-0.05, 0.56, 0.145],
        [-0.58, 0.78, 0.155],
      ],
      0.018,
      mats.titanium,
      20
    )
  );
  const canGeo = tracker.track(
    new THREE.CylinderGeometry(0.044, 0.04, 0.34, 16)
  );
  canGeo.rotateZ(Math.PI / 2 - 0.3);
  const can = new THREE.Mesh(canGeo, mats.frameDark);
  can.position.set(-0.52, 0.76, 0.16);
  bike.add(can);

  // Angular dual-sport tank + radiator shrouds (painted)
  const tankGeo = createExtrudedProfile(
    tracker,
    [
      [-0.02, 0.8],
      [0.36, 0.84],
      [0.42, 0.96],
      [0.22, 1.03],
      [-0.02, 0.91],
    ],
    0.19,
    0.032
  );
  bike.add(new THREE.Mesh(tankGeo, mats.paint));

  // High trail seat
  const seatGeo = createExtrudedProfile(
    tracker,
    [
      [-0.56, 0.84],
      [-0.02, 0.8],
      [-0.01, 0.885],
      [-0.54, 0.91],
    ],
    0.16,
    0.022
  );
  bike.add(new THREE.Mesh(seatGeo, mats.seatLeather));

  // Rear tail fairing + dispatch utility rack
  const tailFenderGeo = createExtrudedProfile(
    tracker,
    [
      [-0.86, 0.86],
      [-0.48, 0.8],
      [-0.5, 0.86],
      [-0.85, 0.91],
    ],
    0.13,
    0.015
  );
  bike.add(new THREE.Mesh(tailFenderGeo, mats.paint));

  [-1, 1].forEach((side) => {
    bike.add(
      createTube(
        tracker,
        [
          [-0.55, 0.85, side * 0.095],
          [-0.84, 0.88, side * 0.095],
          [-0.84, 0.88, 0],
        ],
        0.011,
        mats.frameDark,
        8
      )
    );
  });

  // Long-travel telescopic forks with rubber gaiters
  [-1, 1].forEach((side) => {
    bike.add(
      createTube(
        tracker,
        [
          [0.4, 1.04, side * 0.1],
          [frontX, frontAxleY, side * 0.1],
        ],
        0.021,
        mats.chrome,
        8
      )
    );
    for (let g = 0; g < 6; g++) {
      const t = 0.35 + g * 0.055;
      const pleatGeo = tracker.track(
        new THREE.TorusGeometry(0.028, 0.008, 6, 14)
      );
      const pleat = new THREE.Mesh(pleatGeo, mats.rubber);
      pleat.position.set(
        THREE.MathUtils.lerp(0.4, frontX, t),
        THREE.MathUtils.lerp(1.04, frontAxleY, t),
        side * 0.1
      );
      pleat.rotation.x = Math.PI / 2;
      pleat.rotation.y = 0.41;
      bike.add(pleat);
    }
  });

  // High-mounted motocross front beak fender (painted)
  const beakGeo = createExtrudedProfile(
    tracker,
    [
      [0.46, 0.83],
      [0.82, 0.79],
      [0.85, 0.82],
      [0.48, 0.88],
    ],
    0.13,
    0.014
  );
  bike.add(new THREE.Mesh(beakGeo, mats.paint));

  // Rally headlight cowl & LED face
  const cowlGeo = createExtrudedProfile(
    tracker,
    [
      [0.45, 0.89],
      [0.57, 0.91],
      [0.53, 1.08],
      [0.44, 1.05],
    ],
    0.15,
    0.016
  );
  bike.add(new THREE.Mesh(cowlGeo, mats.paint));

  const hlGeo = tracker.track(new THREE.BoxGeometry(0.02, 0.08, 0.12));
  const hl = new THREE.Mesh(hlGeo, mats.headlightGlow);
  hl.position.set(0.56, 0.98, 0);
  hl.rotation.z = -0.25;
  bike.add(hl);

  const tailGeo = tracker.track(new THREE.BoxGeometry(0.04, 0.036, 0.085));
  const tail = new THREE.Mesh(tailGeo, mats.taillightGlow);
  tail.position.set(-0.86, 0.86, 0);
  bike.add(tail);

  // Wide motocross handlebars with handguards
  bike.add(
    createMirrorsAndHandlebar(tracker, mats, {
      stemX: 0.41,
      stemY: 1.07,
      width: 0.74,
      rise: 0.11,
      roundMirrors: true,
      handguards: true,
    })
  );

  enableShadows(bike);
  return bike;
}

// ============================================================================
// 3. 600cc SUPERSPORT (GSX-R600, Yamaha YZF-R6, Honda CBR600RR)
// ============================================================================
function buildSupersportBike(
  tracker: GeometryTracker,
  mats: MotorcycleMaterialSet
): THREE.Group {
  const bike = new THREE.Group();
  const frontX = 0.71;
  const rearX = -0.7;
  const tireR = 0.225;
  const tireTube = 0.072;
  const axleY = tireR + tireTube; // wide low-profile 17" sport wheels

  const frontWheel = createWheel(tracker, mats, {
    torusRadius: tireR,
    tubeRadius: tireTube,
    wheelStyle: 'alloy-sport',
    dualDisc: true,
    discRadius: 0.155,
  });
  frontWheel.position.set(frontX, axleY, 0);
  bike.add(frontWheel);

  const rearWheel = createWheel(tracker, mats, {
    torusRadius: tireR,
    tubeRadius: tireTube * 1.15,
    wheelStyle: 'alloy-sport',
    dualDisc: false,
    discRadius: 0.125,
  });
  rearWheel.position.set(rearX, axleY + 0.008, 0);
  bike.add(rearWheel);

  // Aluminum twin-spar frame + braced sport swingarm
  [-1, 1].forEach((side) => {
    bike.add(
      createTube(
        tracker,
        [
          [0.36, 0.82, side * 0.09],
          [0.06, 0.68, side * 0.15],
          [-0.18, 0.48, side * 0.13],
        ],
        0.028,
        mats.frameDark,
        12
      )
    );
    bike.add(
      createTube(
        tracker,
        [
          [-0.18, 0.44, side * 0.12],
          [rearX, axleY + 0.01, side * 0.135],
        ],
        0.025,
        mats.titanium,
        8
      )
    );
  });

  // Inline-4 engine + 4-into-1 chrome header pipes + titanium race canister
  const engineGeo = tracker.track(new THREE.BoxGeometry(0.32, 0.24, 0.28));
  const engine = new THREE.Mesh(engineGeo, mats.engineBlock);
  engine.position.set(0.06, 0.45, 0);
  bike.add(engine);

  for (let p = 0; p < 4; p++) {
    const zOff = -0.09 + p * 0.06;
    bike.add(
      createTube(
        tracker,
        [
          [0.2, 0.52, zOff],
          [0.27, 0.34, zOff * 0.85],
          [0.04, 0.21, 0.04 + p * 0.02],
          [-0.25, 0.25, 0.15],
        ],
        0.013,
        mats.chrome,
        14
      )
    );
  }

  // Upswept titanium MotoGP canister
  const canGeo = tracker.track(
    new THREE.CylinderGeometry(0.052, 0.042, 0.38, 18)
  );
  canGeo.rotateZ(Math.PI / 2 - 0.48);
  const can = new THREE.Mesh(canGeo, mats.titanium);
  can.position.set(-0.46, 0.44, 0.185);
  bike.add(can);

  // Sculpted race fuel tank (painted)
  const tankGeo = createExtrudedProfile(
    tracker,
    [
      [-0.08, 0.72],
      [0.34, 0.74],
      [0.38, 0.91],
      [0.14, 0.96],
      [-0.06, 0.84],
    ],
    0.26,
    0.04
  );
  bike.add(new THREE.Mesh(tankGeo, mats.paint));

  // Aerodynamic full front fairing & side cowls (painted)
  const noseGeo = createExtrudedProfile(
    tracker,
    [
      [0.24, 0.5],
      [0.64, 0.56],
      [0.74, 0.75],
      [0.54, 0.92],
      [0.3, 0.85],
      [0.18, 0.6],
    ],
    0.27,
    0.032
  );
  bike.add(new THREE.Mesh(noseGeo, mats.paint));

  // Lower belly pan (dark carbon accent)
  const bellyGeo = createExtrudedProfile(
    tracker,
    [
      [-0.2, 0.24],
      [0.32, 0.24],
      [0.42, 0.48],
      [0.18, 0.52],
      [-0.16, 0.42],
    ],
    0.23,
    0.02
  );
  bike.add(new THREE.Mesh(bellyGeo, mats.paintAccent));

  // Tinted bubble windscreen (optical dark glass)
  const screenGeo = createExtrudedProfile(
    tracker,
    [
      [0.48, 0.89],
      [0.59, 0.92],
      [0.43, 1.07],
      [0.36, 1.03],
    ],
    0.2,
    0.012
  );
  bike.add(new THREE.Mesh(screenGeo, mats.darkGlass));

  // Twin angled projector headlights
  [-0.075, 0.075].forEach((zOff) => {
    const hlGeo = tracker.track(new THREE.BoxGeometry(0.03, 0.045, 0.085));
    const hl = new THREE.Mesh(hlGeo, mats.headlightGlow);
    hl.position.set(0.695, 0.74, zOff);
    hl.rotation.y = zOff > 0 ? -0.25 : 0.25;
    hl.rotation.z = -0.35;
    bike.add(hl);
  });

  // Two-piece stepped racing saddle + sharp upswept tail cowl (painted)
  const riderSeatGeo = createExtrudedProfile(
    tracker,
    [
      [-0.36, 0.73],
      [-0.05, 0.72],
      [-0.04, 0.79],
      [-0.34, 0.81],
    ],
    0.2,
    0.018
  );
  bike.add(new THREE.Mesh(riderSeatGeo, mats.seatLeather));

  const tailCowlGeo = createExtrudedProfile(
    tracker,
    [
      [-0.84, 0.89],
      [-0.36, 0.74],
      [-0.34, 0.85],
      [-0.81, 0.97],
    ],
    0.19,
    0.024
  );
  bike.add(new THREE.Mesh(tailCowlGeo, mats.paint));

  const tailLightGeo = tracker.track(new THREE.BoxGeometry(0.035, 0.035, 0.11));
  const tailLight = new THREE.Mesh(tailLightGeo, mats.taillightGlow);
  tailLight.position.set(-0.84, 0.92, 0);
  tailLight.rotation.z = 0.25;
  bike.add(tailLight);

  // Gold USD (upside-down) front forks
  [-1, 1].forEach((side) => {
    bike.add(
      createTube(
        tracker,
        [
          [0.44, 0.86, side * 0.1],
          [0.57, 0.56, side * 0.1],
        ],
        0.025,
        mats.goldAnodized,
        6
      )
    );
    bike.add(
      createTube(
        tracker,
        [
          [0.57, 0.56, side * 0.1],
          [frontX, axleY, side * 0.1],
        ],
        0.019,
        mats.chrome,
        6
      )
    );
  });

  // Sport front fender
  const fenderGeo = tracker.track(
    new THREE.TorusGeometry(0.315, 0.048, 8, 20, Math.PI * 0.42)
  );
  fenderGeo.rotateZ(Math.PI * 0.28);
  const fender = new THREE.Mesh(fenderGeo, mats.paint);
  fender.position.set(frontX, axleY, 0);
  fender.scale.set(1, 1, 1.75);
  bike.add(fender);

  // Low clip-on handlebars + aerodynamic fairing mirrors
  bike.add(
    createMirrorsAndHandlebar(tracker, mats, {
      stemX: 0.42,
      stemY: 0.86,
      width: 0.62,
      rise: 0,
      clipOn: true,
      roundMirrors: false,
    })
  );

  [-1, 1].forEach((side) => {
    bike.add(
      createTube(
        tracker,
        [
          [0.52, 0.9, side * 0.13],
          [0.55, 1.0, side * 0.26],
        ],
        0.008,
        mats.frameDark,
        6
      )
    );
    const aeroMirrorGeo = tracker.track(
      new THREE.BoxGeometry(0.055, 0.038, 0.095)
    );
    const aeroMirror = new THREE.Mesh(aeroMirrorGeo, mats.frameDark);
    aeroMirror.position.set(0.55, 1.01, side * 0.29);
    aeroMirror.rotation.y = side * -0.25;
    bike.add(aeroMirror);
  });

  enableShadows(bike);
  return bike;
}

// ============================================================================
// 4. STEP-THROUGH CUB / SCOOTER (Haojue HJ110, Daylong Dilo, TVS Neo/Ntorq)
// ============================================================================
function buildCubBike(
  tracker: GeometryTracker,
  mats: MotorcycleMaterialSet
): THREE.Group {
  const bike = new THREE.Group();
  const frontX = 0.61;
  const rearX = -0.61;
  const tireR = 0.205;
  const tireTube = 0.052;
  const axleY = tireR + tireTube; // 0.257m compact city alloy wheels

  const frontWheel = createWheel(tracker, mats, {
    torusRadius: tireR,
    tubeRadius: tireTube,
    wheelStyle: 'alloy-cub',
    discRadius: 0.115,
  });
  frontWheel.position.set(frontX, axleY, 0);
  bike.add(frontWheel);

  const rearWheel = createWheel(tracker, mats, {
    torusRadius: tireR,
    tubeRadius: tireTube,
    wheelStyle: 'alloy-cub',
    discRadius: 0.1,
  });
  rearWheel.position.set(rearX, axleY, 0);
  bike.add(rearWheel);

  // Low step-through underbone chassis
  bike.add(
    createTube(
      tracker,
      [
        [0.39, 0.78, 0],
        [0.24, 0.42, 0],
        [-0.08, 0.4, 0],
        [-0.24, 0.62, 0],
        [-0.58, 0.66, 0],
      ],
      0.024,
      mats.frameDark
    )
  );

  // Enclosed chain case & horizontal underbone engine
  const engineGeo = tracker.track(new THREE.BoxGeometry(0.24, 0.14, 0.17));
  const engine = new THREE.Mesh(engineGeo, mats.engineBlock);
  engine.position.set(0.06, 0.32, 0);
  bike.add(engine);

  const chainGuardGeo = tracker.track(
    new THREE.BoxGeometry(0.46, 0.09, 0.045)
  );
  const chainGuard = new THREE.Mesh(chainGuardGeo, mats.titanium);
  chainGuard.position.set(-0.36, 0.28, -0.095);
  chainGuard.rotation.z = 0.06;
  bike.add(chainGuard);

  // Compact chrome-shielded exhaust
  bike.add(
    createTube(
      tracker,
      [
        [0.14, 0.26, 0.04],
        [0.08, 0.2, 0.135],
        [-0.5, 0.25, 0.14],
      ],
      0.017,
      mats.chrome,
      16
    )
  );
  const mufflerGeo = tracker.track(
    new THREE.CylinderGeometry(0.038, 0.034, 0.36, 16)
  );
  mufflerGeo.rotateZ(Math.PI / 2 - 0.1);
  const muffler = new THREE.Mesh(mufflerGeo, mats.frameDark);
  muffler.position.set(-0.44, 0.27, 0.145);
  bike.add(muffler);

  // Front leg-shield fairing (painted)
  const shieldGeo = createExtrudedProfile(
    tracker,
    [
      [0.24, 0.36],
      [0.39, 0.39],
      [0.45, 0.8],
      [0.34, 0.82],
      [0.26, 0.48],
    ],
    0.26,
    0.025
  );
  bike.add(new THREE.Mesh(shieldGeo, mats.paint));

  // Rear side bodywork shroud (painted)
  const rearBodyGeo = createExtrudedProfile(
    tracker,
    [
      [-0.64, 0.5],
      [-0.14, 0.42],
      [-0.12, 0.67],
      [-0.6, 0.69],
    ],
    0.22,
    0.026
  );
  bike.add(new THREE.Mesh(rearBodyGeo, mats.paint));

  // Contoured step-through saddle + rear passenger grab rail
  const seatGeo = createExtrudedProfile(
    tracker,
    [
      [-0.54, 0.69],
      [-0.12, 0.67],
      [-0.11, 0.76],
      [-0.52, 0.77],
    ],
    0.19,
    0.025
  );
  bike.add(new THREE.Mesh(seatGeo, mats.seatLeather));

  bike.add(
    createTube(
      tracker,
      [
        [-0.52, 0.72, -0.1],
        [-0.68, 0.75, -0.09],
        [-0.68, 0.75, 0.09],
        [-0.52, 0.72, 0.1],
      ],
      0.012,
      mats.chrome,
      12
    )
  );

  // Front steel utility basket
  const basketBaseGeo = tracker.track(
    new THREE.BoxGeometry(0.16, 0.015, 0.21)
  );
  const basketBase = new THREE.Mesh(basketBaseGeo, mats.basketWire);
  basketBase.position.set(0.56, 0.67, 0);
  bike.add(basketBase);

  const basketRim = createTube(
    tracker,
    [
      [0.48, 0.81, -0.11],
      [0.66, 0.81, -0.11],
      [0.66, 0.81, 0.11],
      [0.48, 0.81, 0.11],
      [0.48, 0.81, -0.11],
    ],
    0.008,
    mats.basketWire,
    16
  );
  bike.add(basketRim);

  // Front fork + painted front fender + twin rear coil shocks
  [-1, 1].forEach((side) => {
    bike.add(
      createTube(
        tracker,
        [
          [0.39, 0.84, side * 0.08],
          [frontX, axleY, side * 0.08],
        ],
        0.018,
        mats.titanium,
        6
      )
    );
    bike.add(
      createTube(
        tracker,
        [
          [rearX + 0.04, axleY + 0.02, side * 0.115],
          [-0.36, 0.62, side * 0.11],
        ],
        0.016,
        mats.chrome,
        6
      )
    );
  });

  const frontFenderGeo = tracker.track(
    new THREE.TorusGeometry(0.27, 0.042, 8, 18, Math.PI * 0.44)
  );
  frontFenderGeo.rotateZ(Math.PI * 0.28);
  const frontFender = new THREE.Mesh(frontFenderGeo, mats.paint);
  frontFender.position.set(frontX, axleY, 0);
  frontFender.scale.set(1, 1, 1.35);
  bike.add(frontFender);

  // Integrated handlebar cowl + nose headlight + taillight
  const headCowlGeo = createExtrudedProfile(
    tracker,
    [
      [0.34, 0.88],
      [0.47, 0.89],
      [0.44, 0.99],
      [0.32, 0.97],
    ],
    0.2,
    0.02
  );
  bike.add(new THREE.Mesh(headCowlGeo, mats.paint));

  const hlGeo = tracker.track(new THREE.BoxGeometry(0.024, 0.065, 0.13));
  const hl = new THREE.Mesh(hlGeo, mats.headlightGlow);
  hl.position.set(0.475, 0.94, 0);
  hl.rotation.z = -0.2;
  bike.add(hl);

  const tailGeo = tracker.track(new THREE.BoxGeometry(0.036, 0.05, 0.11));
  const tail = new THREE.Mesh(tailGeo, mats.taillightGlow);
  tail.position.set(-0.66, 0.64, 0);
  bike.add(tail);

  bike.add(
    createMirrorsAndHandlebar(tracker, mats, {
      stemX: 0.37,
      stemY: 0.91,
      width: 0.6,
      rise: 0.05,
      roundMirrors: true,
    })
  );

  enableShadows(bike);
  return bike;
}

export interface BuiltMotorcycleCollection {
  root: THREE.Group;
  models: Record<BodyStyleKey, THREE.Group>;
  dispose: () => void;
}

export function buildAllMotorcycleStyles(
  mats: MotorcycleMaterialSet
): BuiltMotorcycleCollection {
  const tracker = new GeometryTracker();
  const root = new THREE.Group();

  const commuter = buildCommuterBike(tracker, mats);
  const dispatch = buildDispatchBike(tracker, mats);
  const supersport = buildSupersportBike(tracker, mats);
  const cub = buildCubBike(tracker, mats);

  dispatch.visible = false;
  supersport.visible = false;
  cub.visible = false;

  root.add(commuter, dispatch, supersport, cub);

  return {
    root,
    models: {
      commuter,
      dispatch,
      supersport,
      cub,
    },
    dispose: () => {
      tracker.disposeAll();
    },
  };
}
