import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import type {
  OrderRecord,
  TestRideRecord,
  TradeInRecord,
} from '../components/ModalsAndDrawers';
import {
  AdminLeadStatus,
  AdminOrderStatus,
  AdminTestRideStatus,
  DEFAULT_SHOWROOM_SETTINGS,
  ShowroomSettings,
} from '../data/adminSettings';
import { MOTORCYCLES, Motorcycle } from '../data/motorcycles';
import { SPARE_PARTS, SparePart } from '../data/spareParts';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  OperationType,
  auth,
  db,
  handleFirestoreError,
} from '../firebase';

export function sanitizeDocId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  return cleaned || `doc-${Date.now()}`;
}

function clampStr(val: unknown, maxLen: number, fallback = ''): string {
  const str = typeof val === 'string' ? val : String(val ?? fallback);
  return str.trim().slice(0, maxLen);
}

function clampStrArray(
  arr: unknown,
  maxItems: number,
  maxItemLen: number
): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .slice(0, maxItems)
    .map((item) => clampStr(item, maxItemLen))
    .filter(Boolean);
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      out[k] = v;
    }
  }
  return out as T;
}

export function buildMotorcyclePayload(
  bike: Motorcycle,
  sortOrder?: number
): Record<string, unknown> {
  const id = sanitizeDocId(bike.id);
  const payload: Record<string, unknown> = {
    id,
    model: clampStr(bike.model, 120, 'Motorcycle'),
    brand: bike.brand,
    category: bike.category,
    vehicleType: bike.vehicleType ?? 'motorcycle',
    condition: bike.condition,
    subtitle: clampStr(bike.subtitle, 200),
    priceNGN: Math.max(0, Number(bike.priceNGN) || 0),
    priceUSD: Math.max(0, Number(bike.priceUSD) || 0),
    marketRangeNGN: clampStr(bike.marketRangeNGN, 80),
    image: clampStr(bike.image, 1000),
    defaultColorId: clampStr(bike.defaultColorId || 'matte-black', 64),
    specs: stripUndefined({
      engine: clampStr(bike.specs?.engine, 160),
      powerTorque: clampStr(bike.specs?.powerTorque, 160),
      transmission: clampStr(bike.specs?.transmission, 160),
      fuelTank: clampStr(bike.specs?.fuelTank, 160),
      weightSeat: clampStr(bike.specs?.weightSeat, 160),
      conditionLabel: clampStr(bike.specs?.conditionLabel, 160),
      fuelSystem: bike.specs?.fuelSystem
        ? clampStr(bike.specs.fuelSystem, 160)
        : undefined,
      capacityPayload: bike.specs?.capacityPayload
        ? clampStr(bike.specs.capacityPayload, 160)
        : undefined,
      weightSpeed: bike.specs?.weightSpeed
        ? clampStr(bike.specs.weightSpeed, 160)
        : undefined,
    }),
    defaultGearId: clampStr(bike.defaultGearId || 'gear-dot-helmet', 64),
    inStock: Boolean(bike.inStock),
    stockStatus: bike.stockStatus ?? (bike.inStock ? 'In Stock' : 'Out of Stock'),
    flipProfile: Boolean(bike.flipProfile),
    updatedAt: serverTimestamp(),
  };

  if (bike.fuelType) {
    payload.fuelType = bike.fuelType;
  }
  if (typeof sortOrder === 'number') {
    payload.sortOrder = sortOrder;
  }
  if (bike.brandTags && bike.brandTags.length > 0) {
    payload.brandTags = clampStrArray(bike.brandTags, 10, 40);
  }
  if (bike.model3dUrl) {
    payload.model3dUrl = clampStr(bike.model3dUrl, 1000);
  }
  if (bike.model3dName) {
    payload.model3dName = clampStr(bike.model3dName, 160);
  }
  if (bike.colorOptions && bike.colorOptions.length > 0) {
    payload.colorOptions = bike.colorOptions.slice(0, 12);
  }
  if (bike.colorImages && Object.keys(bike.colorImages).length > 0) {
    payload.colorImages = bike.colorImages;
  }

  return stripUndefined(payload);
}

export function buildSparePartPayload(
  part: SparePart
): Record<string, unknown> {
  const id = sanitizeDocId(part.id);
  const payload: Record<string, unknown> = {
    id,
    sku: clampStr(part.sku, 64, 'OS-PART'),
    name: clampStr(part.name, 160, 'Spare Part'),
    category: part.category,
    fitsSummary: clampStr(part.fitsSummary, 240),
    compatibleBrands: clampStrArray(part.compatibleBrands, 10, 64),
    compatibleModels: clampStrArray(part.compatibleModels, 20, 100),
    priceNGN: Math.max(0, Number(part.priceNGN) || 0),
    details: clampStr(part.details, 600),
    specs: (part.specs ?? []).slice(0, 16).map((s) => ({
      label: clampStr(s.label, 80),
      value: clampStr(s.value, 160),
    })),
    installationNotes: clampStr(part.installationNotes, 500),
    image: clampStr(part.image, 1000),
    inStock: Boolean(part.inStock),
    stockQuantity: Math.max(0, Number(part.stockQuantity ?? 10)),
    stockStatus:
      part.stockStatus ?? (part.inStock ? 'In Stock' : 'Out of Stock'),
    updatedAt: serverTimestamp(),
  };

  if (part.variants && part.variants.length > 0) {
    payload.variants = part.variants.slice(0, 10).map((v) => ({
      id: sanitizeDocId(v.id),
      label: clampStr(v.label, 80),
      priceNGN: Math.max(0, Number(v.priceNGN) || 0),
    }));
  }

  return stripUndefined(payload);
}

export function buildShowroomPublicPayload(
  settings: ShowroomSettings
): Record<string, unknown> {
  return {
    whatsappNumber: clampStr(
      settings.whatsappNumber || DEFAULT_SHOWROOM_SETTINGS.whatsappNumber,
      32,
      '2348000000000'
    ),
    showroomAddress: clampStr(
      settings.showroomAddress || DEFAULT_SHOWROOM_SETTINGS.showroomAddress,
      240,
      'Benin City Flagship, Edo State'
    ),
    defaultCurrency: settings.defaultCurrency === 'USD' ? 'USD' : 'NGN',
    exchangeRateNGN: Math.max(1, Number(settings.exchangeRateNGN) || 1520),
    financingInterestRate: Math.min(
      100,
      Math.max(0, Number(settings.financingInterestRate) || 6.5)
    ),
    defaultDownPaymentPercent: Math.min(
      100,
      Math.max(0, Number(settings.defaultDownPaymentPercent) || 30)
    ),
    updatedAt: serverTimestamp(),
  };
}

export async function checkIsCloudAdmin(
  uid: string,
  email?: string | null,
  emailVerified?: boolean
): Promise<{ isAdmin: boolean; isBootstrapped: boolean }> {
  const isBootstrapped =
    Boolean(emailVerified) && email === BOOTSTRAPPED_ADMIN_EMAIL;
  if (isBootstrapped) {
    return { isAdmin: true, isBootstrapped: true };
  }
  try {
    const adminSnap = await getDoc(doc(db, 'admins', sanitizeDocId(uid)));
    return { isAdmin: adminSnap.exists(), isBootstrapped: false };
  } catch {
    return { isAdmin: false, isBootstrapped: false };
  }
}

export function subscribePublicCatalog(callbacks: {
  onMotorcycles: (bikes: Motorcycle[]) => void;
  onSpareParts: (parts: SparePart[]) => void;
  onShowroomPublic: (publicSettings: Partial<ShowroomSettings>) => void;
}) {
  const unsubBikes = onSnapshot(
    collection(db, 'motorcycles'),
    (snapshot) => {
      if (snapshot.empty) return;
      const list = snapshot.docs
        .map((d) => {
          const data = d.data() as Motorcycle & { sortOrder?: number };
          return data;
        })
        .sort(
          (a, b) =>
            ((a as Motorcycle & { sortOrder?: number }).sortOrder ?? 999) -
            ((b as Motorcycle & { sortOrder?: number }).sortOrder ?? 999)
        );
      callbacks.onMotorcycles(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'motorcycles');
    }
  );

  const unsubParts = onSnapshot(
    collection(db, 'spareParts'),
    (snapshot) => {
      if (snapshot.empty) return;
      const list = snapshot.docs.map((d) => d.data() as SparePart);
      callbacks.onSpareParts(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'spareParts');
    }
  );

  const unsubShowroom = onSnapshot(
    doc(db, 'showroom', 'public'),
    (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data() as Partial<ShowroomSettings>;
      callbacks.onShowroomPublic(data);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'showroom/public');
    }
  );

  return () => {
    unsubBikes();
    unsubParts();
    unsubShowroom();
  };
}

export function subscribeAuthenticatedUserData(
  uid: string,
  isBootstrappedAdmin: boolean,
  callbacks: {
    onSavedIds: (savedIds: string[]) => void;
    onOrders: (orders: OrderRecord[]) => void;
    onTestRides: (rides: TestRideRecord[]) => void;
    onTradeIns: (leads: TradeInRecord[]) => void;
  }
) {
  const safeUid = sanitizeDocId(uid);

  const unsubUser = onSnapshot(
    doc(db, 'users', safeUid),
    (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data() as { savedIds?: string[] };
      if (Array.isArray(data.savedIds)) {
        callbacks.onSavedIds(data.savedIds);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${safeUid}`);
    }
  );

  const ordersRef = isBootstrappedAdmin
    ? collection(db, 'orders')
    : query(collection(db, 'orders'), where('userId', '==', safeUid));

  const unsubOrders = onSnapshot(
    ordersRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as OrderRecord);
      callbacks.onOrders(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    }
  );

  const ridesRef = isBootstrappedAdmin
    ? collection(db, 'testRides')
    : query(collection(db, 'testRides'), where('userId', '==', safeUid));

  const unsubRides = onSnapshot(
    ridesRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as TestRideRecord);
      callbacks.onTestRides(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'testRides');
    }
  );

  const tradeInsRef = isBootstrappedAdmin
    ? collection(db, 'tradeIns')
    : query(collection(db, 'tradeIns'), where('userId', '==', safeUid));

  const unsubTradeIns = onSnapshot(
    tradeInsRef,
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as TradeInRecord);
      callbacks.onTradeIns(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tradeIns');
    }
  );

  return () => {
    unsubUser();
    unsubOrders();
    unsubRides();
    unsubTradeIns();
  };
}

export async function seedCatalogToDb(
  bikes: Motorcycle[] = MOTORCYCLES,
  parts: SparePart[] = SPARE_PARTS,
  settings: ShowroomSettings = DEFAULT_SHOWROOM_SETTINGS
): Promise<void> {
  const batch = writeBatch(db);

  bikes.forEach((bike, index) => {
    const id = sanitizeDocId(bike.id);
    batch.set(doc(db, 'motorcycles', id), buildMotorcyclePayload(bike, index));
  });

  parts.forEach((part) => {
    const id = sanitizeDocId(part.id);
    batch.set(doc(db, 'spareParts', id), buildSparePartPayload(part));
  });

  batch.set(doc(db, 'showroom', 'public'), buildShowroomPublicPayload(settings));

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'catalog-seed');
  }
}

export async function saveMotorcycleToDb(
  bike: Motorcycle,
  sortOrder?: number
): Promise<void> {
  const id = sanitizeDocId(bike.id);
  const path = `motorcycles/${id}`;
  try {
    await setDoc(doc(db, 'motorcycles', id), buildMotorcyclePayload(bike, sortOrder), {
      merge: true,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMotorcycleFromDb(bikeId: string): Promise<void> {
  const id = sanitizeDocId(bikeId);
  const path = `motorcycles/${id}`;
  try {
    await deleteDoc(doc(db, 'motorcycles', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSparePartToDb(part: SparePart): Promise<void> {
  const id = sanitizeDocId(part.id);
  const path = `spareParts/${id}`;
  try {
    await setDoc(doc(db, 'spareParts', id), buildSparePartPayload(part), {
      merge: true,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSparePartFromDb(partId: string): Promise<void> {
  const id = sanitizeDocId(partId);
  const path = `spareParts/${id}`;
  try {
    await deleteDoc(doc(db, 'spareParts', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveShowroomPublicToDb(
  settings: ShowroomSettings
): Promise<void> {
  const path = 'showroom/public';
  try {
    await setDoc(
      doc(db, 'showroom', 'public'),
      buildShowroomPublicPayload(settings),
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncUserGarageToDb(savedIds: string[]): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;
  const uid = sanitizeDocId(user.uid);
  const path = `users/${uid}`;
  const ref = doc(db, 'users', uid);

  try {
    const snap = await getDoc(ref);
    const cleanIds = clampStrArray(savedIds, 50, 128).map(sanitizeDocId);
    if (!snap.exists()) {
      await setDoc(ref, {
        userId: uid,
        displayName: clampStr(user.displayName || 'Customer', 120),
        email: clampStr(user.email || '', 180),
        savedIds: cleanIds,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        displayName: clampStr(user.displayName || 'Customer', 120),
        email: clampStr(user.email || '', 180),
        savedIds: cleanIds,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveOrderToDb(order: OrderRecord): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;
  const id = sanitizeDocId(order.id);
  const uid = sanitizeDocId(user.uid);
  const path = `orders/${id}`;
  try {
    await setDoc(
      doc(db, 'orders', id),
      stripUndefined({
        id,
        userId: uid,
        date: clampStr(order.date, 40),
        title: clampStr(order.title, 160, 'Motorcycle Order'),
        detail: clampStr(order.detail, 400),
        totalFormatted: clampStr(order.totalFormatted, 64),
        status: 'Pending',
        customerName: clampStr(order.customerName || user.displayName || 'Customer', 120),
        whatsapp: clampStr(order.whatsapp || 'N/A', 40),
        deliveryLocation: order.deliveryLocation
          ? clampStr(order.deliveryLocation, 240)
          : undefined,
        paymentMethod: order.paymentMethod
          ? clampStr(order.paymentMethod, 80)
          : undefined,
        colorName: order.colorName ? clampStr(order.colorName, 64) : undefined,
        quantity:
          typeof order.quantity === 'number'
            ? Math.min(100, Math.max(1, order.quantity))
            : undefined,
        totalNGN:
          typeof order.totalNGN === 'number'
            ? Math.max(0, order.totalNGN)
            : undefined,
        orderType: order.orderType ?? 'Motorcycle',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateOrderStatusInDb(
  orderId: string,
  status: AdminOrderStatus
): Promise<void> {
  const id = sanitizeDocId(orderId);
  const path = `orders/${id}`;
  try {
    await updateDoc(doc(db, 'orders', id), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteOrderFromDb(orderId: string): Promise<void> {
  const id = sanitizeDocId(orderId);
  const path = `orders/${id}`;
  try {
    await deleteDoc(doc(db, 'orders', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveTestRideToDb(ride: TestRideRecord): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;
  const id = sanitizeDocId(ride.id);
  const uid = sanitizeDocId(user.uid);
  const path = `testRides/${id}`;
  try {
    await setDoc(doc(db, 'testRides', id), {
      id,
      userId: uid,
      date: clampStr(ride.date, 40),
      timeSlot: clampStr(ride.timeSlot, 40),
      showroom: clampStr(ride.showroom, 120),
      bikeTitle: clampStr(ride.bikeTitle, 160),
      riderName: clampStr(ride.riderName || user.displayName || 'Rider', 120),
      whatsapp: clampStr(ride.whatsapp || 'N/A', 40),
      status: 'Scheduled',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTestRideStatusInDb(
  rideId: string,
  status: AdminTestRideStatus
): Promise<void> {
  const id = sanitizeDocId(rideId);
  const path = `testRides/${id}`;
  try {
    await updateDoc(doc(db, 'testRides', id), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTestRideFromDb(rideId: string): Promise<void> {
  const id = sanitizeDocId(rideId);
  const path = `testRides/${id}`;
  try {
    await deleteDoc(doc(db, 'testRides', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveTradeInToDb(lead: TradeInRecord): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return;
  const id = sanitizeDocId(lead.id);
  const uid = sanitizeDocId(user.uid);
  const path = `tradeIns/${id}`;
  try {
    await setDoc(
      doc(db, 'tradeIns', id),
      stripUndefined({
        id,
        userId: uid,
        submittedAt: clampStr(lead.submittedAt, 40),
        brand: clampStr(lead.brand, 64),
        model: clampStr(lead.model, 120),
        year: clampStr(lead.year, 16),
        mileage: clampStr(lead.mileage, 32),
        condition: clampStr(lead.condition, 64),
        whatsapp: clampStr(lead.whatsapp || 'N/A', 40),
        targetBike: clampStr(lead.targetBike, 160),
        estimatedRange: clampStr(lead.estimatedRange, 120),
        status: 'New Lead',
        type: lead.type,
        notes: lead.notes ? clampStr(lead.notes, 400) : undefined,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTradeInStatusInDb(
  leadId: string,
  status: AdminLeadStatus
): Promise<void> {
  const id = sanitizeDocId(leadId);
  const path = `tradeIns/${id}`;
  try {
    await updateDoc(doc(db, 'tradeIns', id), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTradeInFromDb(leadId: string): Promise<void> {
  const id = sanitizeDocId(leadId);
  const path = `tradeIns/${id}`;
  try {
    await deleteDoc(doc(db, 'tradeIns', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
