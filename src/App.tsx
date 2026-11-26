import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { BentoDashboard } from './components/BentoDashboard';
import { HeroStage } from './components/HeroStage';
import { InventoryAndAtelier } from './components/InventoryAndAtelier';
import type {
  CartItem,
  FinancingPlanSummary,
  OrderRecord,
  TestRideRecord,
  TradeInRecord,
} from './components/ModalsAndDrawers';
import { NavSection, TopNavBar } from './components/TopNavBar';
import {
  AdminLeadStatus,
  AdminOrderStatus,
  AdminTestRideStatus,
  DEFAULT_SHOWROOM_SETTINGS,
  ShowroomSettings,
} from './data/adminSettings';
import {
  BikeStockStatus,
  BrandName,
  COLOR_OPTIONS,
  ColorOption,
  CategoryName,
  CurrencyCode,
  FRONT_CUSTOMIZER_IMAGE,
  MOTORCYCLES,
  Motorcycle,
  NIGERIAN_RIDER_GEAR,
  RidingGearItem,
  VehicleSegmentFilter,
  formatMoney,
  isTricycle,
  matchesBrandFilter,
} from './data/motorcycles';
import {
  PartStockStatus,
  PartVariant,
  SPARE_PARTS,
  SparePart,
} from './data/spareParts';
import { auth, db, signInWithGoogle, signOutFirebase } from './firebase';
import {
  checkIsCloudAdmin,
  deleteMotorcycleFromDb,
  deleteOrderFromDb,
  deleteSparePartFromDb,
  deleteTestRideFromDb,
  deleteTradeInFromDb,
  saveMotorcycleToDb,
  saveOrderToDb,
  saveShowroomPublicToDb,
  saveSparePartToDb,
  saveTestRideToDb,
  saveTradeInToDb,
  seedCatalogToDb,
  subscribeAuthenticatedUserData,
  subscribePublicCatalog,
  syncUserGarageToDb,
  updateOrderStatusInDb,
  updateTestRideStatusInDb,
  updateTradeInStatusInDb,
} from './services/firestoreStore';

const AdminAuthModal = lazy(() =>
  import('./components/AdminAuthModal').then((m) => ({
    default: m.AdminAuthModal,
  }))
);
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then((m) => ({
    default: m.AdminDashboard,
  }))
);
const MotorcycleDetailModal = lazy(() =>
  import('./components/MotorcycleDetailModal').then((m) => ({
    default: m.MotorcycleDetailModal,
  }))
);
const PartDetailModal = lazy(() =>
  import('./components/PartDetailModal').then((m) => ({
    default: m.PartDetailModal,
  }))
);
const CartDrawer = lazy(() =>
  import('./components/ModalsAndDrawers').then((m) => ({
    default: m.CartDrawer,
  }))
);
const OrderModal = lazy(() =>
  import('./components/ModalsAndDrawers').then((m) => ({
    default: m.OrderModal,
  }))
);
const FinancingEstimatorModal = lazy(() =>
  import('./components/ModalsAndDrawers').then((m) => ({
    default: m.FinancingEstimatorModal,
  }))
);
const AccountDrawer = lazy(() =>
  import('./components/ModalsAndDrawers').then((m) => ({
    default: m.AccountDrawer,
  }))
);
const InquiryModal = lazy(() =>
  import('./components/ModalsAndDrawers').then((m) => ({
    default: m.InquiryModal,
  }))
);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

export default function App() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>(() => {
    const stored = loadFromStorage<Motorcycle[]>('osas_motorcycles', MOTORCYCLES);
    try {
      const migrated = window.localStorage.getItem('osas_catalog_v2_tricycles_merged');
      if (!migrated) {
        const existingIds = new Set(stored.map((b) => b.id));
        const missing = MOTORCYCLES.filter((b) => !existingIds.has(b.id));
        window.localStorage.setItem('osas_catalog_v2_tricycles_merged', '1');
        if (missing.length > 0) {
          return [...stored, ...missing];
        }
      }
    } catch {
      // ignore storage access issues
    }
    return stored;
  });
  const [spareParts, setSpareParts] = useState<SparePart[]>(() =>
    loadFromStorage<SparePart[]>('osas_spare_parts', SPARE_PARTS)
  );
  const [settings, setSettings] = useState<ShowroomSettings>(() =>
    loadFromStorage<ShowroomSettings>(
      'osas_showroom_settings',
      DEFAULT_SHOWROOM_SETTINGS
    )
  );

  const [activeSection, setActiveSection] = useState<NavSection>('models');
  const [vehicleSegment, setVehicleSegment] =
    useState<VehicleSegmentFilter>('all');
  const [selectedBrand, setSelectedBrand] = useState<'All' | BrandName>('All');
  const [selectedCategory, setSelectedCategory] = useState<
    'All' | CategoryName
  >('All');
  const [activeBikeId, setActiveBikeId] = useState<string>(
    () => motorcycles[0]?.id ?? MOTORCYCLES[0].id
  );
  const [selectedColorByBike, setSelectedColorByBike] = useState<
    Record<string, ColorOption>
  >({});
  const [currency, setCurrency] = useState<CurrencyCode>(() =>
    loadFromStorage<CurrencyCode>(
      'osas_currency',
      DEFAULT_SHOWROOM_SETTINGS.defaultCurrency
    )
  );
  const [sortOption, setSortOption] = useState<
    'featured' | 'price-asc' | 'price-desc'
  >('featured');

  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    loadFromStorage<CartItem[]>('osas_cart_items', [])
  );
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    loadFromStorage<string[]>('osas_saved_ids', ['bajaj-boxer-bm100'])
  );
  const [orders, setOrders] = useState<OrderRecord[]>(() =>
    loadFromStorage<OrderRecord[]>('osas_orders', [])
  );
  const [testRides, setTestRides] = useState<TestRideRecord[]>(() =>
    loadFromStorage<TestRideRecord[]>('osas_test_rides', [])
  );
  const [tradeIns, setTradeIns] = useState<TradeInRecord[]>(() =>
    loadFromStorage<TradeInRecord[]>('osas_trade_ins', [])
  );

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isCloudAdmin, setIsCloudAdmin] = useState(false);
  const [isBootstrappedAdmin, setIsBootstrappedAdmin] = useState(false);
  const [adminAuthOpen, setAdminAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [financingOpen, setFinancingOpen] = useState(false);
  const [detailBike, setDetailBike] = useState<Motorcycle | null>(null);
  const [detailPart, setDetailPart] = useState<SparePart | null>(null);
  const [orderBike, setOrderBike] = useState<Motorcycle | null>(null);
  const [orderInitialTab, setOrderInitialTab] = useState<
    'purchase' | 'test-ride'
  >('purchase');
  const [appliedPlan, setAppliedPlan] = useState<FinancingPlanSummary | null>(
    null
  );
  const [inquiryState, setInquiryState] = useState<{
    open: boolean;
    topic: 'service' | 'experience';
    title: string;
  }>({
    open: false,
    topic: 'service',
    title: '',
  });

  // Track Firebase Auth state and verify cloud admin privileges
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        const status = await checkIsCloudAdmin(
          user.uid,
          user.email,
          user.emailVerified
        );
        setIsCloudAdmin(status.isAdmin);
        setIsBootstrappedAdmin(status.isBootstrapped);
      } else {
        setIsCloudAdmin(false);
        setIsBootstrappedAdmin(false);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to public showroom catalog (motorcycles, spare parts, showroom/public)
  useEffect(() => {
    const unsubscribe = subscribePublicCatalog({
      onMotorcycles: (cloudBikes) => {
        setMotorcycles((prev) => {
          if (cloudBikes.length === 0) return prev;
          const existingIds = new Set(cloudBikes.map((b) => b.id));
          const missingDefaultTricycles = MOTORCYCLES.filter(
            (b) => isTricycle(b) && !existingIds.has(b.id)
          );
          if (missingDefaultTricycles.length > 0) {
            return [...cloudBikes, ...missingDefaultTricycles];
          }
          return cloudBikes;
        });
      },
      onSpareParts: (cloudParts) => {
        setSpareParts(cloudParts);
      },
      onShowroomPublic: (publicCfg) => {
        setSettings((prev) => ({
          ...prev,
          whatsappNumber: publicCfg.whatsappNumber ?? prev.whatsappNumber,
          showroomAddress: publicCfg.showroomAddress ?? prev.showroomAddress,
          defaultCurrency: publicCfg.defaultCurrency ?? prev.defaultCurrency,
          exchangeRateNGN: publicCfg.exchangeRateNGN ?? prev.exchangeRateNGN,
          financingInterestRate:
            publicCfg.financingInterestRate ?? prev.financingInterestRate,
          defaultDownPaymentPercent:
            publicCfg.defaultDownPaymentPercent ??
            prev.defaultDownPaymentPercent,
        }));
      },
    });
    return () => unsubscribe();
  }, []);

  // Only attach user/admin private Firestore listeners when auth is ready & signed in
  useEffect(() => {
    if (!authReady || !authUser) return;

    const unsubscribe = subscribeAuthenticatedUserData(
      authUser.uid,
      isBootstrappedAdmin,
      {
        onSavedIds: (cloudSavedIds) => {
          setSavedIds(cloudSavedIds);
        },
        onOrders: (cloudOrders) => {
          setOrders(cloudOrders);
        },
        onTestRides: (cloudRides) => {
          setTestRides(cloudRides);
        },
        onTradeIns: (cloudLeads) => {
          setTradeIns(cloudLeads);
        },
      }
    );

    return () => unsubscribe();
  }, [authReady, authUser, isBootstrappedAdmin]);

  // Seed initial showroom catalog (and merge any newly added default tricycles) to Firestore when a cloud admin connects
  useEffect(() => {
    if (!authReady || !isCloudAdmin) return;
    let active = true;
    const ensureInitialSeed = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'motorcycles'), limit(1))
        );
        if (active && snap.empty) {
          await seedCatalogToDb(motorcycles, spareParts, settings);
          try {
            window.localStorage.setItem('osas_firestore_tricycles_seeded', '1');
          } catch {
            // ignore
          }
        } else if (
          active &&
          !window.localStorage.getItem('osas_firestore_tricycles_seeded')
        ) {
          const allSnap = await getDocs(collection(db, 'motorcycles'));
          const existingIds = new Set(allSnap.docs.map((d) => d.id));
          const missingTricycles = MOTORCYCLES.filter(
            (b) => isTricycle(b) && !existingIds.has(b.id)
          );
          if (missingTricycles.length > 0) {
            await Promise.all(
              missingTricycles.map((bike, offset) =>
                saveMotorcycleToDb(bike, allSnap.size + offset)
              )
            );
          }
          try {
            window.localStorage.setItem('osas_firestore_tricycles_seeded', '1');
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore if offline; rules/ErrorBoundary handle persistent errors
      }
    };
    void ensureInitialSeed();
    return () => {
      active = false;
    };
  }, [authReady, isCloudAdmin]);

  // Defer non-critical carousel image preloading until browser idle after first paint
  useEffect(() => {
    let cancelled = false;
    const preloadCarouselAssets = () => {
      if (cancelled) return;
      const urls = new Set<string>([FRONT_CUSTOMIZER_IMAGE]);
      motorcycles.forEach((bike) => urls.add(bike.image));
      urls.forEach((src) => {
        if (!src || src.startsWith('data:')) return;
        const img = new Image();
        img.decoding = 'async';
        img.src = src;
      });
    };

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === 'function') {
      const idleId = win.requestIdleCallback(preloadCarouselAssets, {
        timeout: 1800,
      });
      return () => {
        cancelled = true;
        win.cancelIdleCallback?.(idleId);
      };
    }

    const timer = window.setTimeout(preloadCarouselAssets, 900);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  // Persist user & dealer state to localStorage
  useEffect(() => {
    saveToStorage('osas_motorcycles', motorcycles);
  }, [motorcycles]);

  useEffect(() => {
    saveToStorage('osas_spare_parts', spareParts);
  }, [spareParts]);

  useEffect(() => {
    saveToStorage('osas_showroom_settings', settings);
  }, [settings]);

  useEffect(() => {
    saveToStorage('osas_currency', currency);
  }, [currency]);

  useEffect(() => {
    saveToStorage('osas_cart_items', cartItems);
  }, [cartItems]);

  useEffect(() => {
    saveToStorage('osas_saved_ids', savedIds);
  }, [savedIds]);

  useEffect(() => {
    saveToStorage('osas_orders', orders);
  }, [orders]);

  useEffect(() => {
    saveToStorage('osas_test_rides', testRides);
  }, [testRides]);

  useEffect(() => {
    saveToStorage('osas_trade_ins', tradeIns);
  }, [tradeIns]);

  const stageBikes = useMemo(() => {
    const base = motorcycles.length > 0 ? motorcycles : MOTORCYCLES;
    const matched = base.filter((bike) => {
      const segOk =
        vehicleSegment === 'all'
          ? true
          : vehicleSegment === 'tricycle'
          ? isTricycle(bike)
          : !isTricycle(bike);
      const brandOk = matchesBrandFilter(bike, selectedBrand);
      const categoryOk =
        selectedCategory === 'All' || bike.category === selectedCategory;
      return segOk && brandOk && categoryOk;
    });
    if (matched.length > 0) return matched;
    const segmentOnly = base.filter((bike) =>
      vehicleSegment === 'all'
        ? true
        : vehicleSegment === 'tricycle'
        ? isTricycle(bike)
        : !isTricycle(bike)
    );
    return segmentOnly.length > 0 ? segmentOnly : base;
  }, [motorcycles, vehicleSegment, selectedBrand, selectedCategory]);

  const activeIndex = useMemo(() => {
    const idx = stageBikes.findIndex((b) => b.id === activeBikeId);
    return idx >= 0 ? idx : 0;
  }, [stageBikes, activeBikeId]);

  const activeBike = stageBikes[activeIndex] ?? stageBikes[0] ?? MOTORCYCLES[0];

  const getSelectedColorForBike = (bike: Motorcycle) => {
    const availableSwatches =
      bike.colorOptions && bike.colorOptions.length > 0
        ? bike.colorOptions
        : COLOR_OPTIONS;
    const savedColor = selectedColorByBike[bike.id];
    if (savedColor) {
      const matchingSwatch = availableSwatches.find(
        (c) => c.id === savedColor.id
      );
      if (matchingSwatch) return matchingSwatch;
    }
    return (
      availableSwatches.find((c) => c.id === bike.defaultColorId) ??
      availableSwatches[0]
    );
  };

  const activeColor = useMemo(
    () => getSelectedColorForBike(activeBike),
    [activeBike, selectedColorByBike]
  );

  const handleSelectSection = (section: NavSection) => {
    setActiveSection(section);
    if (section === 'models') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'spare-parts') {
      document
        .getElementById('spare-parts')
        ?.scrollIntoView({ behavior: 'smooth' });
    } else if (section === 'services') {
      setFinancingOpen(true);
    } else if (section === 'experience') {
      document
        .getElementById('trade-in')
        ?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBrowseSpareParts = () => {
    setActiveSection('spare-parts');
    document
      .getElementById('spare-parts')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleChangeVehicleSegment = (segment: VehicleSegmentFilter) => {
    setVehicleSegment(segment);
    setSelectedCategory('All');
    const pool = motorcycles.length > 0 ? motorcycles : MOTORCYCLES;
    const matchInSegment = pool.find((b) => {
      const segOk =
        segment === 'all'
          ? true
          : segment === 'tricycle'
          ? isTricycle(b)
          : !isTricycle(b);
      return segOk && matchesBrandFilter(b, selectedBrand);
    });
    if (matchInSegment) {
      setActiveBikeId(matchInSegment.id);
    } else {
      setSelectedBrand('All');
      const fallbackSeg = pool.find((b) =>
        segment === 'all'
          ? true
          : segment === 'tricycle'
          ? isTricycle(b)
          : !isTricycle(b)
      );
      if (fallbackSeg) setActiveBikeId(fallbackSeg.id);
    }
  };

  const handleSelectBrand = (brand: 'All' | BrandName) => {
    setSelectedBrand(brand);
    if (brand !== 'All') {
      const firstMatch = motorcycles.find((b) => {
        const segOk =
          vehicleSegment === 'all'
            ? true
            : vehicleSegment === 'tricycle'
            ? isTricycle(b)
            : !isTricycle(b);
        return (
          segOk &&
          matchesBrandFilter(b, brand) &&
          (selectedCategory === 'All' || b.category === selectedCategory)
        );
      });
      if (firstMatch) {
        setActiveBikeId(firstMatch.id);
      } else {
        setSelectedCategory('All');
        const anyBrand = motorcycles.find((b) => matchesBrandFilter(b, brand));
        if (anyBrand) {
          if (vehicleSegment === 'tricycle' && !isTricycle(anyBrand)) {
            setVehicleSegment('all');
          } else if (vehicleSegment === 'motorcycle' && isTricycle(anyBrand)) {
            setVehicleSegment('all');
          }
          setActiveBikeId(anyBrand.id);
        }
      }
    }
  };

  const handleSelectCategory = (category: 'All' | CategoryName) => {
    setSelectedCategory(category);
    if (category !== 'All') {
      const catIsTricycle =
        category === 'Tricycles (Passenger)' ||
        category === 'Tricycles (Heavy-Duty / Cargo)';
      if (catIsTricycle && vehicleSegment === 'motorcycle') {
        setVehicleSegment('tricycle');
      } else if (!catIsTricycle && vehicleSegment === 'tricycle') {
        setVehicleSegment('motorcycle');
      }
      const firstMatch = motorcycles.find(
        (b) =>
          b.category === category && matchesBrandFilter(b, selectedBrand)
      );
      if (firstMatch) {
        setActiveBikeId(firstMatch.id);
      } else {
        setSelectedBrand('All');
        const anyCategory = motorcycles.find((b) => b.category === category);
        if (anyCategory) setActiveBikeId(anyCategory.id);
      }
    }
  };

  const handlePrevBike = () => {
    const prevIdx = (activeIndex - 1 + stageBikes.length) % stageBikes.length;
    setActiveBikeId(stageBikes[prevIdx].id);
  };

  const handleNextBike = () => {
    const nextIdx = (activeIndex + 1) % stageBikes.length;
    setActiveBikeId(stageBikes[nextIdx].id);
  };

  const handleSelectColorForBike = (bikeId: string, color: ColorOption) => {
    setSelectedColorByBike((prev) => ({
      ...prev,
      [bikeId]: color,
    }));
  };

  const handleBuyGear = (gear: RidingGearItem) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === gear.id);
      if (existing) {
        return prev.map((item) =>
          item.id === gear.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: gear.id,
          title: gear.title,
          subtitle: gear.subtitle,
          priceUSD: gear.priceUSD,
          priceNGN: gear.priceNGN,
          image: gear.image,
          filterStyle: gear.filterStyle,
          quantity: 1,
        },
      ];
    });
  };

  const handleAddPartToBag = (
    part: SparePart,
    quantity: number,
    variant?: PartVariant
  ) => {
    const unitNGN = variant?.priceNGN ?? part.priceNGN;
    const rate = settings.exchangeRateNGN || 1520;
    const unitUSD = Math.max(1, Math.round(unitNGN / rate));
    const cartItemId = `${part.id}-${variant?.id ?? 'default'}`;
    const subtitle = `SKU: ${part.sku}${variant ? ` · ${variant.label}` : ''}`;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          title: part.name,
          subtitle,
          priceUSD: unitUSD,
          priceNGN: unitNGN,
          image: part.image,
          quantity,
        },
      ];
    });
  };

  const handleUpdateCartQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleSave = (bikeId: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(bikeId)
        ? prev.filter((id) => id !== bikeId)
        : [...prev, bikeId];
      if (authUser && authUser.emailVerified) {
        void syncUserGarageToDb(next);
      }
      return next;
    });
  };

  const handleLoadOnStage = (bikeId: string) => {
    const target = motorcycles.find((b) => b.id === bikeId);
    if (!target) return;
    if (
      (vehicleSegment === 'tricycle' && !isTricycle(target)) ||
      (vehicleSegment === 'motorcycle' && isTricycle(target))
    ) {
      setVehicleSegment('all');
    }
    if (selectedBrand !== 'All' && !matchesBrandFilter(target, selectedBrand)) {
      setSelectedBrand('All');
    }
    if (selectedCategory !== 'All' && target.category !== selectedCategory) {
      setSelectedCategory('All');
    }
    setActiveBikeId(bikeId);
    setActiveSection('models');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreByPrice = () => {
    setFinancingOpen(true);
  };

  const handleBrowseStockByPrice = () => {
    setSortOption('price-asc');
    document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleApplyFinancingPlan = (
    bike: Motorcycle,
    plan: FinancingPlanSummary
  ) => {
    setFinancingOpen(false);
    setAppliedPlan(plan);
    setActiveBikeId(bike.id);
    setOrderInitialTab('purchase');
    setOrderBike(bike);
  };

  // --- ADMIN CRUD HANDLERS ---
  const handleSaveBike = (bike: Motorcycle) => {
    setMotorcycles((prev) => {
      const exists = prev.some((b) => b.id === bike.id);
      if (exists) {
        return prev.map((b) => (b.id === bike.id ? bike : b));
      }
      return [bike, ...prev];
    });
    setActiveBikeId(bike.id);
    if (isCloudAdmin) {
      const idx = motorcycles.findIndex((b) => b.id === bike.id);
      void saveMotorcycleToDb(bike, idx >= 0 ? idx : 0);
    }
  };

  const handleDeleteBike = (bikeId: string) => {
    setMotorcycles((prev) => {
      const next = prev.filter((b) => b.id !== bikeId);
      if (activeBikeId === bikeId && next.length > 0) {
        setActiveBikeId(next[0].id);
      }
      return next;
    });
    setSavedIds((prev) => prev.filter((id) => id !== bikeId));
    if (isCloudAdmin) {
      void deleteMotorcycleFromDb(bikeId);
    }
  };

  const handleUpdateBikeStockStatus = (
    bikeId: string,
    status: BikeStockStatus
  ) => {
    setMotorcycles((prev) =>
      prev.map((b) => {
        if (b.id !== bikeId) return b;
        const updated = {
          ...b,
          stockStatus: status,
          inStock: status === 'In Stock',
        };
        if (isCloudAdmin) {
          void saveMotorcycleToDb(updated);
        }
        return updated;
      })
    );
  };

  const handleFeatureFirstBike = (bikeId: string) => {
    setMotorcycles((prev) => {
      const target = prev.find((b) => b.id === bikeId);
      if (!target) return prev;
      const reordered = [target, ...prev.filter((b) => b.id !== bikeId)];
      if (isCloudAdmin) {
        reordered.forEach((b, idx) => {
          void saveMotorcycleToDb(b, idx);
        });
      }
      return reordered;
    });
    setSelectedBrand('All');
    setSelectedCategory('All');
    setActiveBikeId(bikeId);
  };

  const handleSavePart = (part: SparePart) => {
    setSpareParts((prev) => {
      const exists = prev.some((p) => p.id === part.id);
      if (exists) {
        return prev.map((p) => (p.id === part.id ? part : p));
      }
      return [part, ...prev];
    });
    if (isCloudAdmin) {
      void saveSparePartToDb(part);
    }
  };

  const handleDeletePart = (partId: string) => {
    setSpareParts((prev) => prev.filter((p) => p.id !== partId));
    if (isCloudAdmin) {
      void deleteSparePartFromDb(partId);
    }
  };

  const handleAdjustPartStock = (partId: string, delta: number) => {
    setSpareParts((prev) =>
      prev.map((p) => {
        if (p.id !== partId) return p;
        const currentQty = p.stockQuantity ?? (p.inStock ? 15 : 0);
        const nextQty = Math.max(0, currentQty + delta);
        const nextStatus: PartStockStatus =
          nextQty === 0
            ? 'Out of Stock'
            : nextQty <= 5
            ? 'Low Stock'
            : 'In Stock';
        const updated: SparePart = {
          ...p,
          stockQuantity: nextQty,
          stockStatus: nextStatus,
          inStock: nextQty > 0,
        };
        if (isCloudAdmin) {
          void saveSparePartToDb(updated);
        }
        return updated;
      })
    );
  };

  const handleUpdatePartPrice = (partId: string, priceNGN: number) => {
    setSpareParts((prev) =>
      prev.map((p) => {
        if (p.id !== partId) return p;
        const updated = { ...p, priceNGN };
        if (isCloudAdmin) {
          void saveSparePartToDb(updated);
        }
        return updated;
      })
    );
  };

  const handleUpdatePartStatus = (partId: string, status: PartStockStatus) => {
    setSpareParts((prev) =>
      prev.map((p) => {
        if (p.id !== partId) return p;
        const updated: SparePart = {
          ...p,
          stockStatus: status,
          inStock: status !== 'Out of Stock',
          stockQuantity:
            status === 'Out of Stock'
              ? 0
              : p.stockQuantity && p.stockQuantity > 0
              ? p.stockQuantity
              : status === 'Low Stock'
              ? 3
              : 15,
        };
        if (isCloudAdmin) {
          void saveSparePartToDb(updated);
        }
        return updated;
      })
    );
  };

  const handleUpdateOrderStatus = (
    orderId: string,
    status: AdminOrderStatus
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    if (isCloudAdmin) {
      void updateOrderStatusInDb(orderId, status);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (isCloudAdmin) {
      void deleteOrderFromDb(orderId);
    }
  };

  const handleUpdateTestRideStatus = (
    rideId: string,
    status: AdminTestRideStatus
  ) => {
    setTestRides((prev) =>
      prev.map((r) => (r.id === rideId ? { ...r, status } : r))
    );
    if (isCloudAdmin) {
      void updateTestRideStatusInDb(rideId, status);
    }
  };

  const handleDeleteTestRide = (rideId: string) => {
    setTestRides((prev) => prev.filter((r) => r.id !== rideId));
    if (isCloudAdmin) {
      void deleteTestRideFromDb(rideId);
    }
  };

  const handleUpdateTradeInStatus = (
    leadId: string,
    status: AdminLeadStatus
  ) => {
    setTradeIns((prev) =>
      prev.map((t) => (t.id === leadId ? { ...t, status } : t))
    );
    if (isCloudAdmin) {
      void updateTradeInStatusInDb(leadId, status);
    }
  };

  const handleDeleteTradeIn = (leadId: string) => {
    setTradeIns((prev) => prev.filter((t) => t.id !== leadId));
    if (isCloudAdmin) {
      void deleteTradeInFromDb(leadId);
    }
  };

  const handleSaveSettings = (next: ShowroomSettings) => {
    setSettings(next);
    setCurrency(next.defaultCurrency);
    const rate = next.exchangeRateNGN || 1520;
    setMotorcycles((prev) =>
      prev.map((b) => ({
        ...b,
        priceUSD: Math.max(1, Math.round(b.priceNGN / rate)),
      }))
    );
    if (isCloudAdmin) {
      void saveShowroomPublicToDb(next);
    }
  };

  const handleResetDemoData = () => {
    setMotorcycles(MOTORCYCLES);
    setSpareParts(SPARE_PARTS);
    setSettings(DEFAULT_SHOWROOM_SETTINGS);
    setCurrency(DEFAULT_SHOWROOM_SETTINGS.defaultCurrency);
    setOrders([]);
    setTestRides([]);
    setTradeIns([]);
    setSavedIds(['bajaj-boxer-bm100']);
    setActiveBikeId(MOTORCYCLES[0].id);
    setSelectedBrand('All');
    setSelectedCategory('All');
    if (isCloudAdmin) {
      void seedCatalogToDb(MOTORCYCLES, SPARE_PARTS, DEFAULT_SHOWROOM_SETTINGS);
    }
  };

  const handleGoogleAdminSignIn = async (): Promise<{
    ok: boolean;
    error?: string;
  }> => {
    try {
      const cred = await signInWithGoogle();
      const status = await checkIsCloudAdmin(
        cred.user.uid,
        cred.user.email,
        cred.user.emailVerified
      );
      if (status.isAdmin) {
        setIsCloudAdmin(true);
        setIsBootstrappedAdmin(status.isBootstrapped);
        return { ok: true };
      }
      return {
        ok: false,
        error: `Signed in as ${cred.user.email || 'user'}, which does not have Dealer Admin permissions.`,
      };
    } catch (err) {
      return {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : 'Google Sign-In was cancelled or blocked.',
      };
    }
  };

  const handleCustomerGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch {
      // ignore cancelled popup
    }
  };

  const totalCartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const savedBikes = useMemo(
    () => motorcycles.filter((b) => savedIds.includes(b.id)),
    [motorcycles, savedIds]
  );

  const modalColorForOrderBike = useMemo(() => {
    if (!orderBike) return activeColor;
    return getSelectedColorForBike(orderBike);
  }, [orderBike, activeColor, selectedColorByBike]);

  const detailBikeColor = useMemo(() => {
    if (!detailBike) return activeColor;
    return getSelectedColorForBike(detailBike);
  }, [detailBike, activeColor, selectedColorByBike]);

  if (isAdminMode) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen studio-page-backdrop flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl px-8 py-6 shadow-lg border border-black/[0.04] flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-[#18181B]/20 border-t-[#DC2626] animate-spin" />
              <span className="text-[14px] font-semibold text-[#18181B]">
                Loading Dealer Admin Portal...
              </span>
            </div>
          </div>
        }
      >
        <AdminDashboard
          motorcycles={motorcycles}
          spareParts={spareParts}
          orders={orders}
          testRides={testRides}
          tradeIns={tradeIns}
          settings={settings}
          onSaveBike={handleSaveBike}
          onDeleteBike={handleDeleteBike}
          onUpdateBikeStockStatus={handleUpdateBikeStockStatus}
          onFeatureFirstBike={handleFeatureFirstBike}
          onSavePart={handleSavePart}
          onDeletePart={handleDeletePart}
          onAdjustPartStock={handleAdjustPartStock}
          onUpdatePartPrice={handleUpdatePartPrice}
          onUpdatePartStatus={handleUpdatePartStatus}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onDeleteOrder={handleDeleteOrder}
          onUpdateTestRideStatus={handleUpdateTestRideStatus}
          onDeleteTestRide={handleDeleteTestRide}
          onUpdateTradeInStatus={handleUpdateTradeInStatus}
          onDeleteTradeIn={handleDeleteTradeIn}
          onSaveSettings={handleSaveSettings}
          onResetDemoData={handleResetDemoData}
          onExitAdmin={() => {
            setIsAdminMode(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </Suspense>
    );
  }

  const hasOpenOverlay =
    cartOpen ||
    accountOpen ||
    financingOpen ||
    Boolean(detailBike) ||
    Boolean(detailPart) ||
    Boolean(orderBike) ||
    adminAuthOpen ||
    inquiryState.open;

  return (
    <div id="top" className="min-h-screen studio-page-backdrop py-3 sm:py-6 pb-24 md:pb-6">
      {/* Main Showroom Stage Container */}
      <main className="max-w-[1360px] mx-auto px-2 sm:px-4">
        <div className="studio-stage-gradient rounded-[28px] sm:rounded-[34px] shadow-[0_24px_70px_rgba(0,0,0,0.08)] border border-white/80 overflow-hidden">
          <TopNavBar
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
            selectedBrand={selectedBrand}
            onSelectBrand={handleSelectBrand}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            cartCount={totalCartCount}
            onOpenCart={() => setCartOpen(true)}
            onOpenAccount={() => setAdminAuthOpen(true)}
            onOpenOrder={() => {
              setAppliedPlan(null);
              setOrderInitialTab('purchase');
              setOrderBike(activeBike);
            }}
            currency={currency}
            onToggleCurrency={setCurrency}
            motorcycles={motorcycles}
            spareParts={spareParts}
            whatsappNumber={settings.whatsappNumber}
            onSelectMotorcycleSearch={(bike) => {
              handleLoadOnStage(bike.id);
              setDetailBike(bike);
            }}
            onSelectPartSearch={(part) => setDetailPart(part)}
            onAddPartToBag={handleAddPartToBag}
            activeBikeIsTricycle={isTricycle(activeBike)}
          />

          <HeroStage
            bikes={stageBikes}
            activeBike={activeBike}
            activeIndex={activeIndex}
            selectedColor={activeColor}
            onSelectColor={(color) =>
              handleSelectColorForBike(activeBike.id, color)
            }
            currency={currency}
            onToggleCurrency={setCurrency}
            onPrev={handlePrevBike}
            onNext={handleNextBike}
            onOpenDetail={(bike) => setDetailBike(bike)}
            onExploreByPrice={handleExploreByPrice}
            vehicleSegment={vehicleSegment}
            onChangeVehicleSegment={handleChangeVehicleSegment}
          />

          <BentoDashboard
            activeBike={activeBike}
            selectedColor={activeColor}
            onSelectColor={(color) =>
              handleSelectColorForBike(activeBike.id, color)
            }
            currency={currency}
            onBuyGear={handleBuyGear}
            onBrowseSpareParts={handleBrowseSpareParts}
          />
        </div>
      </main>

      {/* Scrollable Full Inventory, Spare Parts, Services, Trade-In & Experience Below the Fold */}
      <InventoryAndAtelier
        motorcycles={motorcycles}
        spareParts={spareParts}
        activeBike={activeBike}
        vehicleSegment={vehicleSegment}
        onChangeVehicleSegment={handleChangeVehicleSegment}
        selectedBrand={selectedBrand}
        onSelectBrand={handleSelectBrand}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        currency={currency}
        sortOption={sortOption}
        onChangeSortOption={setSortOption}
        savedIds={savedIds}
        onToggleSave={handleToggleSave}
        onLoadOnStage={handleLoadOnStage}
        onOpenDetail={(bike) => setDetailBike(bike)}
        onOrderBike={(bike) => {
          setAppliedPlan(null);
          setOrderInitialTab('purchase');
          setOrderBike(bike);
        }}
        onViewPart={(part) => setDetailPart(part)}
        onAddPartToBag={handleAddPartToBag}
        onOpenFinancing={() => setFinancingOpen(true)}
        onOpenInquiry={(topic, title) =>
          setInquiryState({ open: true, topic, title })
        }
        onSubmitTradeIn={(record) => {
          setTradeIns((prev) => [record, ...prev]);
          if (authUser && authUser.emailVerified) {
            void saveTradeInToDb(record);
          }
        }}
        tradeIns={tradeIns}
        showroomAddress={settings.showroomAddress}
        whatsappNumber={settings.whatsappNumber}
        onOpenDealerPortal={() => setAdminAuthOpen(true)}
        selectedColorByBike={selectedColorByBike}
        onBuyGear={handleBuyGear}
      />

      {/* Lazy-Mounted Interactive Modals & Drawers */}
      {adminAuthOpen && (
        <Suspense fallback={null}>
          <AdminAuthModal
            open={adminAuthOpen}
            expectedPin={settings.adminPin}
            cloudUserEmail={authUser?.email}
            isCloudAdmin={isCloudAdmin}
            onGoogleSignIn={handleGoogleAdminSignIn}
            onClose={() => setAdminAuthOpen(false)}
            onSuccess={() => {
              setAdminAuthOpen(false);
              setIsAdminMode(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenCustomerGarage={() => setAccountOpen(true)}
          />
        </Suspense>
      )}

      {Boolean(detailBike) && (
        <Suspense fallback={null}>
          <MotorcycleDetailModal
            open={Boolean(detailBike)}
            bike={detailBike}
            selectedColor={detailBikeColor}
            onSelectColor={(color) => {
              if (detailBike) {
                handleSelectColorForBike(detailBike.id, color);
              }
            }}
            currency={currency}
            whatsappNumber={settings.whatsappNumber}
            onClose={() => setDetailBike(null)}
            onOrderBike={(bike) => {
              setDetailBike(null);
              setAppliedPlan(null);
              setOrderInitialTab('purchase');
              setOrderBike(bike);
            }}
            onBookTestRide={(bike) => {
              setDetailBike(null);
              setAppliedPlan(null);
              setOrderInitialTab('test-ride');
              setOrderBike(bike);
            }}
          />
        </Suspense>
      )}

      {Boolean(detailPart) && (
        <Suspense fallback={null}>
          <PartDetailModal
            open={Boolean(detailPart)}
            part={detailPart}
            currency={currency}
            onClose={() => setDetailPart(null)}
            onAddToBag={handleAddPartToBag}
          />
        </Suspense>
      )}

      {cartOpen && (
        <Suspense fallback={null}>
          <CartDrawer
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            items={cartItems}
            currency={currency}
            onUpdateQty={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            onCheckoutSuccess={(order) => {
              setOrders((prev) => [order, ...prev]);
              setCartItems([]);
              if (authUser && authUser.emailVerified) {
                void saveOrderToDb(order);
              }
            }}
          />
        </Suspense>
      )}

      {Boolean(orderBike) && (
        <Suspense fallback={null}>
          <OrderModal
            open={Boolean(orderBike)}
            bike={orderBike}
            selectedColor={modalColorForOrderBike}
            currency={currency}
            initialTab={orderInitialTab}
            appliedPlan={appliedPlan}
            onClose={() => {
              setOrderBike(null);
              setAppliedPlan(null);
            }}
            onConfirmOrder={(order) => {
              setOrders((prev) => [order, ...prev]);
              if (authUser && authUser.emailVerified) {
                void saveOrderToDb(order);
              }
            }}
            onConfirmTestRide={(ride) => {
              setTestRides((prev) => [ride, ...prev]);
              if (authUser && authUser.emailVerified) {
                void saveTestRideToDb(ride);
              }
            }}
          />
        </Suspense>
      )}

      {financingOpen && (
        <Suspense fallback={null}>
          <FinancingEstimatorModal
            open={financingOpen}
            motorcycles={motorcycles}
            activeBike={activeBike}
            selectedColor={activeColor}
            currency={currency}
            interestRatePercent={settings.financingInterestRate}
            defaultDownPaymentPercent={settings.defaultDownPaymentPercent}
            onToggleCurrency={setCurrency}
            onClose={() => setFinancingOpen(false)}
            onApplyPlan={handleApplyFinancingPlan}
            onBrowseStockByPrice={handleBrowseStockByPrice}
          />
        </Suspense>
      )}

      {accountOpen && (
        <Suspense fallback={null}>
          <AccountDrawer
            open={accountOpen}
            onClose={() => setAccountOpen(false)}
            savedBikes={savedBikes}
            orders={orders}
            testRides={testRides}
            tradeIns={tradeIns}
            currency={currency}
            onToggleCurrency={setCurrency}
            onSelectSavedBike={handleLoadOnStage}
            authUser={
              authUser
                ? {
                    uid: authUser.uid,
                    email: authUser.email,
                    displayName: authUser.displayName,
                  }
                : null
            }
            onSignInGoogle={handleCustomerGoogleSignIn}
            onSignOut={() => void signOutFirebase()}
          />
        </Suspense>
      )}

      {inquiryState.open && (
        <Suspense fallback={null}>
          <InquiryModal
            open={inquiryState.open}
            topic={inquiryState.topic}
            title={inquiryState.title}
            onClose={() => setInquiryState((prev) => ({ ...prev, open: false }))}
          />
        </Suspense>
      )}

      {/* Sticky Mobile Bottom Action Bar */}
      {!hasOpenOverlay && (
        <div className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-black/[0.06] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
          <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4">
            <div className="text-xl font-extrabold tracking-tight text-[#18181B] tabular-nums leading-none">
              {formatMoney(
                activeBike.priceUSD + activeColor.surchargeUSD,
                activeBike.priceNGN + activeColor.surchargeNGN,
                currency
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setAppliedPlan(null);
                setOrderInitialTab('purchase');
                setOrderBike(activeBike);
              }}
              className="shrink-0 px-6 py-3 rounded-full bg-[#18181B] hover:bg-[#DC2626] text-white text-[13.5px] font-semibold transition-colors shadow-[0_6px_16px_rgba(24,24,27,0.18)] cursor-pointer"
            >
              {isTricycle(activeBike) ? 'Order Tricycle' : 'Order Bike'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
