import React, { useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  Box,
  Calendar,
  Check,
  CheckCircle2,
  Download,
  Edit3,
  ExternalLink,
  Inbox,
  LogOut,
  MessageCircle,
  Minus,
  Package,
  Pin,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShoppingBag,
  Trash2,
  Wrench,
} from 'lucide-react';
import {
  AdminLeadStatus,
  AdminOrderStatus,
  AdminTestRideStatus,
  ShowroomSettings,
  formatWhatsappHref,
} from '../data/adminSettings';
import {
  BRANDS,
  BikeStockStatus,
  BrandName,
  CATEGORIES,
  CategoryName,
  CurrencyCode,
  Motorcycle,
  formatMoney,
} from '../data/motorcycles';
import {
  PART_CATEGORIES,
  PartCategory,
  PartStockStatus,
  SparePart,
} from '../data/spareParts';
import { AdminBikeFormModal } from './AdminBikeFormModal';
import { AdminPartFormModal } from './AdminPartFormModal';
import { OrderRecord, TestRideRecord, TradeInRecord } from './ModalsAndDrawers';

interface AdminDashboardProps {
  motorcycles: Motorcycle[];
  spareParts: SparePart[];
  orders: OrderRecord[];
  testRides: TestRideRecord[];
  tradeIns: TradeInRecord[];
  settings: ShowroomSettings;
  onSaveBike: (bike: Motorcycle) => void;
  onDeleteBike: (bikeId: string) => void;
  onUpdateBikeStockStatus: (bikeId: string, status: BikeStockStatus) => void;
  onFeatureFirstBike: (bikeId: string) => void;
  onSavePart: (part: SparePart) => void;
  onDeletePart: (partId: string) => void;
  onAdjustPartStock: (partId: string, delta: number) => void;
  onUpdatePartPrice: (partId: string, priceNGN: number) => void;
  onUpdatePartStatus: (partId: string, status: PartStockStatus) => void;
  onUpdateOrderStatus: (orderId: string, status: AdminOrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onUpdateTestRideStatus: (rideId: string, status: AdminTestRideStatus) => void;
  onDeleteTestRide: (rideId: string) => void;
  onUpdateTradeInStatus: (leadId: string, status: AdminLeadStatus) => void;
  onDeleteTradeIn: (leadId: string) => void;
  onSaveSettings: (next: ShowroomSettings) => void;
  onResetDemoData: () => void;
  onExitAdmin: () => void;
}

type AdminTab = 'motorcycles' | 'parts' | 'inbox' | 'settings';
type InboxSubTab = 'orders' | 'test-rides' | 'leads';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  motorcycles,
  spareParts,
  orders,
  testRides,
  tradeIns,
  settings,
  onSaveBike,
  onDeleteBike,
  onUpdateBikeStockStatus,
  onFeatureFirstBike,
  onSavePart,
  onDeletePart,
  onAdjustPartStock,
  onUpdatePartPrice,
  onUpdatePartStatus,
  onUpdateOrderStatus,
  onDeleteOrder,
  onUpdateTestRideStatus,
  onDeleteTestRide,
  onUpdateTradeInStatus,
  onDeleteTradeIn,
  onSaveSettings,
  onResetDemoData,
  onExitAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('motorcycles');
  const [inboxSubTab, setInboxSubTab] = useState<InboxSubTab>('orders');

  // Bike Filters & Modal State
  const [bikeSearch, setBikeSearch] = useState('');
  const [bikeBrandFilter, setBikeBrandFilter] = useState<'All' | BrandName>(
    'All'
  );
  const [bikeCatFilter, setBikeCatFilter] = useState<'All' | CategoryName>(
    'All'
  );
  const [bikeFormOpen, setBikeFormOpen] = useState(false);
  const [editingBike, setEditingBike] = useState<Motorcycle | null>(null);
  const [confirmDeleteBikeId, setConfirmDeleteBikeId] = useState<string | null>(
    null
  );

  // Part Filters & Modal State
  const [partSearch, setPartSearch] = useState('');
  const [partCatFilter, setPartCatFilter] = useState<'All Parts' | PartCategory>(
    'All Parts'
  );
  const [partFormOpen, setPartFormOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [confirmDeletePartId, setConfirmDeletePartId] = useState<string | null>(
    null
  );
  const [editingPartPriceId, setEditingPartPriceId] = useState<string | null>(
    null
  );
  const [draftPartPrice, setDraftPartPrice] = useState('');

  // Inbox Filters
  const [inboxSearch, setInboxSearch] = useState('');

  // Reset Demo Confirmation
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Settings Local State
  const [draftSettings, setDraftSettings] =
    useState<ShowroomSettings>(settings);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // KPI Metrics
  const kpis = useMemo(() => {
    const bikesInStock = motorcycles.filter(
      (b) => (b.stockStatus ?? (b.inStock ? 'In Stock' : 'Out of Stock')) === 'In Stock'
    );
    const totalPartUnits = spareParts.reduce(
      (sum, p) => sum + (p.stockQuantity ?? (p.inStock ? 15 : 0)),
      0
    );
    const pendingOrders = orders.filter(
      (o) => o.status === 'Pending' || o.status === 'Order Confirmed'
    ).length;
    const upcomingRides = testRides.filter(
      (r) => r.status === 'Scheduled' || r.status === 'Test Ride Confirmed'
    ).length;
    const bikeValue = bikesInStock.reduce((sum, b) => sum + b.priceNGN, 0);
    const partsValue = spareParts.reduce(
      (sum, p) =>
        sum + p.priceNGN * (p.stockQuantity ?? (p.inStock ? 15 : 0)),
      0
    );

    return {
      bikesInStockCount: bikesInStock.length,
      totalBikesCount: motorcycles.length,
      totalPartsCount: spareParts.length,
      totalPartUnits,
      pendingOrders,
      upcomingRides,
      inventoryValueNGN: bikeValue + partsValue,
    };
  }, [motorcycles, spareParts, orders, testRides]);

  const filteredBikes = useMemo(() => {
    const q = bikeSearch.trim().toLowerCase();
    return motorcycles.filter((b) => {
      if (bikeBrandFilter !== 'All' && b.brand !== bikeBrandFilter) {
        return false;
      }
      if (bikeCatFilter !== 'All' && b.category !== bikeCatFilter) {
        return false;
      }
      if (q) {
        const hay =
          `${b.brand} ${b.model} ${b.category} ${b.condition} ${b.specs.engine}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [motorcycles, bikeSearch, bikeBrandFilter, bikeCatFilter]);

  const filteredParts = useMemo(() => {
    const q = partSearch.trim().toLowerCase();
    return spareParts.filter((p) => {
      if (partCatFilter !== 'All Parts' && p.category !== partCatFilter) {
        return false;
      }
      if (q) {
        const hay =
          `${p.name} ${p.sku} ${p.category} ${p.fitsSummary} ${p.compatibleModels.join(' ')}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [spareParts, partSearch, partCatFilter]);

  const filteredOrders = useMemo(() => {
    const q = inboxSearch.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) =>
      `${o.id} ${o.title} ${o.detail} ${o.customerName ?? ''} ${o.whatsapp ?? ''} ${o.deliveryLocation ?? ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [orders, inboxSearch]);

  const filteredRides = useMemo(() => {
    const q = inboxSearch.trim().toLowerCase();
    if (!q) return testRides;
    return testRides.filter((r) =>
      `${r.id} ${r.riderName} ${r.bikeTitle} ${r.showroom} ${r.whatsapp}`
        .toLowerCase()
        .includes(q)
    );
  }, [testRides, inboxSearch]);

  const filteredLeads = useMemo(() => {
    const q = inboxSearch.trim().toLowerCase();
    if (!q) return tradeIns;
    return tradeIns.filter((l) =>
      `${l.id} ${l.brand} ${l.model} ${l.targetBike} ${l.whatsapp} ${l.notes ?? ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [tradeIns, inboxSearch]);

  const handleExportJson = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      motorcycles,
      spareParts,
      orders,
      testRides,
      tradeIns,
      settings,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osas-motorcycle-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...draftSettings,
      exchangeRateNGN: Math.max(100, Number(draftSettings.exchangeRateNGN) || 1520),
      financingInterestRate: Math.max(
        0,
        Number(draftSettings.financingInterestRate) || 6.5
      ),
      defaultDownPaymentPercent: Math.min(
        80,
        Math.max(10, Number(draftSettings.defaultDownPaymentPercent) || 30)
      ),
      adminPin: draftSettings.adminPin.trim() || '1234',
    });
    setSettingsSavedToast(true);
    window.setTimeout(() => setSettingsSavedToast(false), 2600);
  };

  return (
    <div className="min-h-screen studio-page-backdrop py-4 sm:py-6 px-3 sm:px-6 overflow-x-hidden">
      <div className="max-w-[1360px] mx-auto space-y-4 sm:space-y-5">
        {/* Top Admin Control Bar */}
        <header className="bg-white rounded-3xl p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-black/[0.05] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#F3F3F5] border border-black/[0.04] shrink-0">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z"
                  fill="#DC2626"
                />
                <path
                  d="M12 5.4L17.7 8.7V15.3L12 18.6L6.3 15.3V8.7L12 5.4Z"
                  stroke="#FFFFFF"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-50 text-[#DC2626]">
                  Dealer Admin Mode
                </span>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Auto-Synced to Browser
                </span>
              </div>
              <h1 className="text-[20px] sm:text-[22px] font-bold text-[#18181B] mt-1">
                Osas <span className="text-[#DC2626]">Motorcycle</span> Control
                Center
              </h1>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingBike(null);
                setBikeFormOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0 px-3.5 sm:px-4 py-2.5 rounded-full bg-[#DC2626] hover:bg-red-700 text-white text-[12.5px] font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Add Motorcycle</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingPart(null);
                setPartFormOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0 px-3.5 sm:px-4 py-2.5 rounded-full bg-[#18181B] hover:bg-zinc-800 text-white text-[12.5px] font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Add Spare Part</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0 px-3.5 sm:px-4 py-2.5 rounded-full bg-[#F3F3F5] hover:bg-zinc-200 text-[#18181B] text-[12.5px] font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Export Backup</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0 px-3.5 sm:px-4 py-2.5 rounded-full bg-[#F3F3F5] hover:bg-zinc-200 text-zinc-700 text-[12.5px] font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Restore Catalog</span>
            </button>

            <button
              type="button"
              onClick={onExitAdmin}
              className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0 px-4 py-2.5 rounded-full bg-white border border-zinc-200 hover:bg-zinc-50 text-[#18181B] text-[12.5px] font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
              <span>Exit to Storefront</span>
            </button>
          </div>
        </header>

        {/* Inline Restore Default Catalog Confirmation */}
        {confirmResetOpen && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[14px] font-bold text-amber-950">
                Restore default Osas Motorcycle showroom catalog &amp; settings?
              </p>
              <p className="text-[12.5px] text-amber-800 mt-0.5">
                This will revert any custom motorcycles, spare parts, orders, and
                settings back to factory defaults.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 rounded-full bg-white text-zinc-700 text-[12px] font-semibold border border-amber-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDemoData();
                  setConfirmResetOpen(false);
                }}
                className="px-4 py-2 rounded-full bg-[#DC2626] text-white text-[12px] font-semibold cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        )}

        {/* 5 Live Overview KPI Bento Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-3.5">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/[0.04] shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
            <div className="text-[11px] sm:text-[11.5px] font-semibold text-zinc-500 uppercase tracking-wider">
              Bikes in Stock
            </div>
            <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[24px] sm:text-[28px] font-bold text-[#18181B] tabular-nums">
                {kpis.bikesInStockCount}
              </span>
              <span className="text-[12px] text-zinc-400 tabular-nums">
                / {kpis.totalBikesCount} listed
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/[0.04] shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
            <div className="text-[11px] sm:text-[11.5px] font-semibold text-zinc-500 uppercase tracking-wider">
              Spare Parts
            </div>
            <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[24px] sm:text-[28px] font-bold text-[#18181B] tabular-nums">
                {kpis.totalPartsCount}
              </span>
              <span className="text-[12px] text-zinc-400 tabular-nums">
                ({kpis.totalPartUnits} units)
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/[0.04] shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
            <div className="text-[11px] sm:text-[11.5px] font-semibold text-zinc-500 uppercase tracking-wider">
              Pending Orders
            </div>
            <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[24px] sm:text-[28px] font-bold text-[#DC2626] tabular-nums">
                {kpis.pendingOrders}
              </span>
              <span className="text-[12px] text-zinc-400 tabular-nums">
                / {orders.length} total
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-black/[0.04] shadow-[0_2px_14px_rgba(0,0,0,0.03)]">
            <div className="text-[11px] sm:text-[11.5px] font-semibold text-zinc-500 uppercase tracking-wider">
              Test Rides
            </div>
            <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[24px] sm:text-[28px] font-bold text-[#18181B] tabular-nums">
                {kpis.upcomingRides}
              </span>
              <span className="text-[12px] text-zinc-400 tabular-nums">
                / {testRides.length} total
              </span>
            </div>
          </div>

          <div className="bg-[#18181B] text-white rounded-3xl p-4 sm:p-5 shadow-[0_8px_24px_rgba(24,24,27,0.16)] col-span-2 lg:col-span-1">
            <div className="text-[11px] sm:text-[11.5px] font-semibold text-zinc-400 uppercase tracking-wider">
              Showroom Stock Value
            </div>
            <div className="mt-2 text-[22px] sm:text-[24px] font-bold tabular-nums text-white truncate">
              ₦{Math.round(kpis.inventoryValueNGN).toLocaleString('en-US')}
            </div>
          </div>
        </section>

        {/* Main Section Pill Tabs */}
        <nav
          aria-label="Admin Dashboard Sections"
          className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto no-scrollbar pb-1"
        >
          {[
            {
              id: 'motorcycles' as AdminTab,
              label: `Motorcycle Inventory (${motorcycles.length})`,
              Icon: ShoppingBag,
            },
            {
              id: 'parts' as AdminTab,
              label: `Spare Parts Manager (${spareParts.length})`,
              Icon: Wrench,
            },
            {
              id: 'inbox' as AdminTab,
              label: `Customer Inbox (${orders.length + testRides.length + tradeIns.length})`,
              Icon: Inbox,
            },
            {
              id: 'settings' as AdminTab,
              label: 'Showroom Settings',
              Icon: Settings,
            },
          ].map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-2 whitespace-nowrap shrink-0 min-h-[44px] px-4 sm:px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#18181B] text-white shadow-[0_6px_18px_rgba(24,24,27,0.18)]'
                    : 'bg-white text-[#18181B] hover:bg-zinc-50 border border-black/[0.05]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* TAB 1: MOTORCYCLE INVENTORY MANAGER */}
        {activeTab === 'motorcycles' && (
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bikeSearch}
                  onChange={(e) => setBikeSearch(e.target.value)}
                  placeholder="Search bikes by brand, model, or cc..."
                  className="w-full h-10 pl-10 pr-4 rounded-full bg-[#F3F3F5] text-[13px] text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={bikeBrandFilter}
                  onChange={(e) =>
                    setBikeBrandFilter(e.target.value as 'All' | BrandName)
                  }
                  className="h-10 px-4 rounded-full bg-[#F3F3F5] text-[12.5px] font-semibold text-[#18181B] cursor-pointer"
                >
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b === 'All' ? 'All Brands' : b}
                    </option>
                  ))}
                </select>
                <select
                  value={bikeCatFilter}
                  onChange={(e) =>
                    setBikeCatFilter(e.target.value as 'All' | CategoryName)
                  }
                  className="h-10 px-4 rounded-full bg-[#F3F3F5] text-[12.5px] font-semibold text-[#18181B] cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c === 'All' ? 'All Categories' : c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredBikes.map((bike, idx) => {
                const status: BikeStockStatus =
                  bike.stockStatus ?? (bike.inStock ? 'In Stock' : 'Out of Stock');
                const isFeaturedFirst = motorcycles[0]?.id === bike.id;

                return (
                  <div
                    key={bike.id}
                    className="p-4 rounded-2xl bg-[#F3F3F5]/70 border border-black/[0.04] flex flex-col xl:flex-row xl:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-24 h-16 rounded-xl bg-white border border-black/[0.04] flex items-center justify-center p-1.5 shrink-0">
                        <img
                          src={bike.image}
                          alt={`${bike.brand} ${bike.model}`}
                          className={`w-full h-full object-contain ${
                            bike.flipProfile ? '-scale-x-100' : ''
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-50 text-[#DC2626]">
                            {bike.brand}
                          </span>
                          <h3 className="text-[15.5px] font-bold text-[#18181B] truncate">
                            {bike.model}
                          </h3>
                          {isFeaturedFirst && idx === 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#18181B] text-white text-[10.5px] font-semibold">
                              <Pin className="w-3 h-3 text-[#DC2626]" />
                              Hero Centerpiece #1
                            </span>
                          )}
                          {bike.model3dUrl && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-black/[0.08] text-[10.5px] font-semibold text-[#18181B]">
                              <Box className="w-3 h-3 text-[#DC2626]" />
                              3D .glb Attached
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-zinc-500">
                          <span>{bike.category}</span>
                          <span>·</span>
                          <span>{bike.condition}</span>
                          <span>·</span>
                          <span className="font-medium text-zinc-700">
                            {bike.specs.engine}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/[0.05]">
                      <div className="text-left sm:text-right mr-auto sm:mr-2">
                        <div className="text-[15px] font-bold text-[#18181B] tabular-nums">
                          ₦{bike.priceNGN.toLocaleString('en-US')}
                        </div>
                        <div className="text-[11px] text-zinc-400 tabular-nums">
                          ~${bike.priceUSD.toLocaleString('en-US')}
                        </div>
                      </div>

                      <select
                        value={status}
                        onChange={(e) =>
                          onUpdateBikeStockStatus(
                            bike.id,
                            e.target.value as BikeStockStatus
                          )
                        }
                        aria-label={`Stock status for ${bike.brand} ${bike.model}`}
                        className={`min-h-[44px] sm:min-h-0 px-3 py-1.5 rounded-full text-[12px] font-semibold border cursor-pointer ${
                          status === 'In Stock'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : status === 'SOLD'
                            ? 'bg-red-50 text-[#DC2626] border-red-200'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                        }`}
                      >
                        <option value="In Stock">In Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                        <option value="SOLD">SOLD</option>
                      </select>

                      {!isFeaturedFirst && (
                        <button
                          type="button"
                          onClick={() => onFeatureFirstBike(bike.id)}
                          className="inline-flex items-center gap-1 min-h-[44px] sm:min-h-0 px-3 py-1.5 rounded-full bg-white hover:bg-zinc-100 text-[#18181B] text-[12px] font-semibold border border-black/[0.06] cursor-pointer"
                        >
                          <Pin className="w-3.5 h-3.5 text-[#DC2626]" />
                          <span>Feature First</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setEditingBike(bike);
                          setBikeFormOpen(true);
                        }}
                        className="inline-flex items-center gap-1 min-h-[44px] sm:min-h-0 px-4 sm:px-3.5 py-1.5 rounded-full bg-[#18181B] hover:bg-zinc-800 text-white text-[12px] font-semibold cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {confirmDeleteBikeId === bike.id ? (
                        <div className="inline-flex items-center gap-2 bg-red-50 min-h-[44px] sm:min-h-0 px-3 py-1 rounded-full border border-red-200">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteBike(bike.id);
                              setConfirmDeleteBikeId(null);
                            }}
                            className="text-[11.5px] font-bold text-[#DC2626] cursor-pointer"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteBikeId(null)}
                            className="text-[11.5px] font-medium text-zinc-600 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteBikeId(bike.id)}
                          aria-label={`Delete ${bike.brand} ${bike.model}`}
                          className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-red-50 text-zinc-500 hover:text-[#DC2626] border border-black/[0.06] inline-flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredBikes.length === 0 && (
                <p className="py-10 text-center text-[13.5px] text-zinc-500">
                  No motorcycles match your current filter.
                </p>
              )}
            </div>
          </section>
        )}

        {/* TAB 2: SPARE PARTS & GEAR MANAGER */}
        {activeTab === 'parts' && (
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={partSearch}
                  onChange={(e) => setPartSearch(e.target.value)}
                  placeholder="Search parts by name, SKU, or bike model..."
                  className="w-full h-10 pl-10 pr-4 rounded-full bg-[#F3F3F5] text-[13px] text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
              </div>

              <select
                value={partCatFilter}
                onChange={(e) =>
                  setPartCatFilter(
                    e.target.value as 'All Parts' | PartCategory
                  )
                }
                className="h-10 px-4 rounded-full bg-[#F3F3F5] text-[12.5px] font-semibold text-[#18181B] cursor-pointer"
              >
                {PART_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {filteredParts.map((part) => {
                const qty = part.stockQuantity ?? (part.inStock ? 15 : 0);
                const status: PartStockStatus =
                  part.stockStatus ??
                  (qty === 0
                    ? 'Out of Stock'
                    : qty <= 5
                    ? 'Low Stock'
                    : 'In Stock');

                return (
                  <div
                    key={part.id}
                    className="p-4 rounded-2xl bg-[#F3F3F5]/70 border border-black/[0.04] flex flex-col xl:flex-row xl:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-16 h-14 rounded-xl bg-white border border-black/[0.04] flex items-center justify-center p-1.5 shrink-0">
                        <img
                          src={part.image}
                          alt={part.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10.5px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white border border-black/[0.06] text-zinc-600">
                            {part.sku}
                          </span>
                          <h3 className="text-[14.5px] font-bold text-[#18181B] truncate">
                            {part.name}
                          </h3>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-zinc-500">
                          <span className="font-medium text-zinc-700">
                            {part.category}
                          </span>
                          <span>·</span>
                          <span>Fits {part.fitsSummary}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/[0.05]">
                      {/* Quick Price Edit */}
                      {editingPartPriceId === part.id ? (
                        <div className="inline-flex items-center gap-1 bg-white min-h-[44px] sm:min-h-0 px-3 py-1 rounded-full border border-[#18181B]">
                          <span className="text-[12px] font-semibold">₦</span>
                          <input
                            type="number"
                            min={0}
                            value={draftPartPrice}
                            onChange={(e) => setDraftPartPrice(e.target.value)}
                            className="w-24 text-[12.5px] font-bold text-[#18181B] focus:outline-none tabular-nums"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              onUpdatePartPrice(
                                part.id,
                                Math.max(0, Number(draftPartPrice) || 0)
                              );
                              setEditingPartPriceId(null);
                            }}
                            className="w-8 h-8 sm:w-6 sm:h-6 rounded-full bg-[#18181B] text-white inline-flex items-center justify-center cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPartPriceId(part.id);
                            setDraftPartPrice(String(part.priceNGN));
                          }}
                          title="Click to quick-edit price"
                          className="min-h-[44px] sm:min-h-0 px-3 py-1.5 rounded-full bg-white hover:bg-zinc-100 border border-black/[0.06] text-[13.5px] font-bold text-[#18181B] tabular-nums cursor-pointer"
                        >
                          ₦{part.priceNGN.toLocaleString('en-US')}
                        </button>
                      )}

                      {/* Inline Stock Quantity - / + */}
                      <div className="inline-flex items-center rounded-full bg-white border border-black/[0.06] p-0.5">
                        <button
                          type="button"
                          onClick={() => onAdjustPartStock(part.id, -1)}
                          aria-label={`Decrease stock for ${part.name}`}
                          className="w-9 h-9 sm:w-7 sm:h-7 rounded-full hover:bg-zinc-100 inline-flex items-center justify-center text-[#18181B] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-[12px] font-bold text-[#18181B] tabular-nums">
                          {qty} qty
                        </span>
                        <button
                          type="button"
                          onClick={() => onAdjustPartStock(part.id, 1)}
                          aria-label={`Increase stock for ${part.name}`}
                          className="w-9 h-9 sm:w-7 sm:h-7 rounded-full hover:bg-zinc-100 inline-flex items-center justify-center text-[#18181B] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Status Toggle */}
                      <select
                        value={status}
                        onChange={(e) =>
                          onUpdatePartStatus(
                            part.id,
                            e.target.value as PartStockStatus
                          )
                        }
                        aria-label={`Status for ${part.name}`}
                        className={`min-h-[44px] sm:min-h-0 px-3 py-1.5 rounded-full text-[12px] font-semibold border cursor-pointer ${
                          status === 'In Stock'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : status === 'Low Stock'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-red-50 text-[#DC2626] border-red-200'
                        }`}
                      >
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingPart(part);
                          setPartFormOpen(true);
                        }}
                        className="inline-flex items-center gap-1 min-h-[44px] sm:min-h-0 px-4 sm:px-3.5 py-1.5 rounded-full bg-[#18181B] hover:bg-zinc-800 text-white text-[12px] font-semibold cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {confirmDeletePartId === part.id ? (
                        <div className="inline-flex items-center gap-2 bg-red-50 min-h-[44px] sm:min-h-0 px-3 py-1 rounded-full border border-red-200">
                          <button
                            type="button"
                            onClick={() => {
                              onDeletePart(part.id);
                              setConfirmDeletePartId(null);
                            }}
                            className="text-[11.5px] font-bold text-[#DC2626] cursor-pointer"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeletePartId(null)}
                            className="text-[11.5px] font-medium text-zinc-600 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeletePartId(part.id)}
                          aria-label={`Delete ${part.name}`}
                          className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-red-50 text-zinc-500 hover:text-[#DC2626] border border-black/[0.06] inline-flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredParts.length === 0 && (
                <p className="py-10 text-center text-[13.5px] text-zinc-500">
                  No spare parts match your search.
                </p>
              )}
            </div>
          </section>
        )}

        {/* TAB 3: CUSTOMER ORDERS, TEST RIDES & LEADS INBOX */}
        {activeTab === 'inbox' && (
          <section className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex flex-nowrap sm:flex-wrap gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                  {
                    id: 'orders' as InboxSubTab,
                    label: `Orders & Reservations (${orders.length})`,
                    Icon: Package,
                  },
                  {
                    id: 'test-rides' as InboxSubTab,
                    label: `Test Ride Bookings (${testRides.length})`,
                    Icon: Calendar,
                  },
                  {
                    id: 'leads' as InboxSubTab,
                    label: `Trade-In & Part Leads (${tradeIns.length})`,
                    Icon: ArrowRightLeft,
                  },
                ].map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setInboxSubTab(id)}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 min-h-[44px] sm:min-h-0 px-4 py-2 rounded-full text-[12.5px] font-semibold cursor-pointer transition-colors ${
                      inboxSubTab === id
                        ? 'bg-[#18181B] text-white'
                        : 'bg-[#F3F3F5] text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:w-72">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inboxSearch}
                  onChange={(e) => setInboxSearch(e.target.value)}
                  placeholder="Search customer, ref #, phone..."
                  className="w-full h-10 pl-10 pr-4 rounded-full bg-[#F3F3F5] text-[13px] text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
              </div>
            </div>

            {/* Sub-Tab: Orders */}
            {inboxSubTab === 'orders' && (
              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="py-12 text-center text-[13.5px] text-zinc-500">
                    No customer orders recorded yet. Orders placed via the
                    showroom Order button or Shopping Bag appear here
                    automatically.
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                    const waTarget = order.whatsapp || settings.whatsappNumber;
                    const waHref = formatWhatsappHref(
                      waTarget,
                      `Hello ${order.customerName || 'Valued Rider'}, this is Osas Motorcycle regarding Order #${order.id} (${order.title} — ${order.totalFormatted}). Current status: ${order.status}.`
                    );
                    const normalizedStatus: AdminOrderStatus =
                      order.status === 'Order Confirmed' ||
                      order.status === 'Confirmed — Preparing Dispatch'
                        ? 'Pending'
                        : ((order.status as AdminOrderStatus) || 'Pending');

                    return (
                      <div
                        key={order.id}
                        className="p-4 rounded-2xl bg-[#F3F3F5]/75 border border-black/[0.04] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#18181B] text-white">
                              #{order.id}
                            </span>
                            <span className="text-[12px] text-zinc-500">
                              {order.date}
                            </span>
                            {order.orderType && (
                              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white text-zinc-700 border border-black/[0.05]">
                                {order.orderType}
                              </span>
                            )}
                          </div>
                          <h3 className="text-[15px] font-bold text-[#18181B]">
                            {order.title}
                          </h3>
                          <p className="text-[12.5px] text-zinc-600">
                            {order.detail}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-[12px] text-zinc-500 pt-0.5">
                            {order.customerName && (
                              <span>
                                Customer:{' '}
                                <strong className="text-[#18181B]">
                                  {order.customerName}
                                </strong>
                              </span>
                            )}
                            {order.whatsapp && (
                              <span>
                                WhatsApp:{' '}
                                <strong className="text-[#18181B]">
                                  {order.whatsapp}
                                </strong>
                              </span>
                            )}
                            {order.deliveryLocation && (
                              <span>Location: {order.deliveryLocation}</span>
                            )}
                            {order.paymentMethod && (
                              <span>Payment: {order.paymentMethod}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/[0.05]">
                          <div className="text-left sm:text-right mr-auto sm:mr-2">
                            <div className="text-[11px] text-zinc-500">Total</div>
                            <div className="text-[15.5px] font-bold text-[#18181B] tabular-nums">
                              {order.totalFormatted}
                            </div>
                          </div>

                          <select
                            value={normalizedStatus}
                            onChange={(e) =>
                              onUpdateOrderStatus(
                                order.id,
                                e.target.value as AdminOrderStatus
                              )
                            }
                            aria-label={`Order status for ${order.id}`}
                            className="min-h-[44px] sm:min-h-0 px-3 py-2 rounded-full bg-white border border-black/[0.08] text-[12px] font-semibold text-[#18181B] cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Ready for Pickup">
                              Ready for Pickup
                            </option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="Delivered">Delivered</option>
                          </select>

                          <a
                            href={waHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-0 px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Message on WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => onDeleteOrder(order.id)}
                            aria-label={`Delete order ${order.id}`}
                            className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-red-50 text-zinc-500 hover:text-[#DC2626] border border-black/[0.06] inline-flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Sub-Tab: Test Rides */}
            {inboxSubTab === 'test-rides' && (
              <div className="space-y-3">
                {filteredRides.length === 0 ? (
                  <div className="py-12 text-center text-[13.5px] text-zinc-500">
                    No test ride bookings yet.
                  </div>
                ) : (
                  filteredRides.map((ride) => {
                    const waHref = formatWhatsappHref(
                      ride.whatsapp || settings.whatsappNumber,
                      `Hello ${ride.riderName}, Osas Motorcycle confirms your test ride for ${ride.bikeTitle} at ${ride.showroom} on ${ride.date} (${ride.timeSlot}). Ref: #${ride.id}.`
                    );
                    const normalizedRideStatus: AdminTestRideStatus =
                      ride.status === 'Test Ride Confirmed'
                        ? 'Scheduled'
                        : ((ride.status as AdminTestRideStatus) || 'Scheduled');

                    return (
                      <div
                        key={ride.id}
                        className="p-4 rounded-2xl bg-[#F3F3F5]/75 border border-black/[0.04] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#18181B] text-white">
                              #{ride.id}
                            </span>
                            <span className="text-[12.5px] font-semibold text-[#DC2626]">
                              {ride.date} · {ride.timeSlot}
                            </span>
                          </div>
                          <h3 className="text-[15px] font-bold text-[#18181B]">
                            {ride.bikeTitle}
                          </h3>
                          <p className="text-[12.5px] text-zinc-600">
                            Rider: <strong>{ride.riderName}</strong> · WhatsApp:{' '}
                            <strong>{ride.whatsapp}</strong> · {ride.showroom}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/[0.05]">
                          <select
                            value={normalizedRideStatus}
                            onChange={(e) =>
                              onUpdateTestRideStatus(
                                ride.id,
                                e.target.value as AdminTestRideStatus
                              )
                            }
                            className="min-h-[44px] sm:min-h-0 px-3 py-2 rounded-full bg-white border border-black/[0.08] text-[12px] font-semibold text-[#18181B] cursor-pointer"
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          <a
                            href={waHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-0 px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Confirm</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => onDeleteTestRide(ride.id)}
                            aria-label={`Delete test ride ${ride.id}`}
                            className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-red-50 text-zinc-500 hover:text-[#DC2626] border border-black/[0.06] inline-flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Sub-Tab: Trade-In & Part Request Leads */}
            {inboxSubTab === 'leads' && (
              <div className="space-y-3">
                {filteredLeads.length === 0 ? (
                  <div className="py-12 text-center text-[13.5px] text-zinc-500">
                    No trade-in appraisals or custom part leads yet.
                  </div>
                ) : (
                  filteredLeads.map((lead) => {
                    const waHref = formatWhatsappHref(
                      lead.whatsapp || settings.whatsappNumber,
                      `Hello from Osas Motorcycle! Following up on your ${lead.type === 'Part Request' ? 'Part Request' : 'Trade-In Appraisal'} (#${lead.id}: ${lead.year} ${lead.brand} ${lead.model}).`
                    );
                    const normalizedLeadStatus: AdminLeadStatus =
                      lead.status === 'Pending Inspection'
                        ? 'New Lead'
                        : ((lead.status as AdminLeadStatus) || 'New Lead');

                    return (
                      <div
                        key={lead.id}
                        className="p-4 rounded-2xl bg-[#F3F3F5]/75 border border-black/[0.04] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-[#18181B] text-white">
                              #{lead.id}
                            </span>
                            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-[#DC2626]">
                              {lead.type ?? 'Trade-In'}
                            </span>
                            <span className="text-[12px] text-zinc-500">
                              {lead.submittedAt}
                            </span>
                          </div>
                          <h3 className="text-[15px] font-bold text-[#18181B]">
                            {lead.year} {lead.brand} {lead.model}
                          </h3>
                          <p className="text-[12.5px] text-zinc-600">
                            {lead.mileage} km · {lead.condition} → Target:{' '}
                            {lead.targetBike} · WhatsApp:{' '}
                            <strong>{lead.whatsapp}</strong>
                          </p>
                          <p className="text-[12.5px] font-bold text-[#DC2626] tabular-nums">
                            Est. Value: {lead.estimatedRange}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/[0.05]">
                          <select
                            value={normalizedLeadStatus}
                            onChange={(e) =>
                              onUpdateTradeInStatus(
                                lead.id,
                                e.target.value as AdminLeadStatus
                              )
                            }
                            className="min-h-[44px] sm:min-h-0 px-3 py-2 rounded-full bg-white border border-black/[0.08] text-[12px] font-semibold text-[#18181B] cursor-pointer"
                          >
                            <option value="New Lead">New Lead</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Inspected">Inspected</option>
                            <option value="Closed">Closed</option>
                          </select>

                          <a
                            href={waHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-0 px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>WhatsApp Reply</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => onDeleteTradeIn(lead.id)}
                            aria-label={`Delete lead ${lead.id}`}
                            className="w-11 h-11 sm:w-8 sm:h-8 rounded-full bg-white hover:bg-red-50 text-zinc-500 hover:text-[#DC2626] border border-black/[0.06] inline-flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </section>
        )}

        {/* TAB 4: SHOWROOM & BUSINESS SETTINGS */}
        {activeTab === 'settings' && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)] max-w-3xl">
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#DC2626]">
                Storefront Configuration
              </p>
              <h2 className="text-[22px] font-bold text-[#18181B] mt-0.5">
                Showroom &amp; Business Settings
              </h2>
              <p className="text-[13px] text-zinc-500 mt-1">
                Updates apply immediately across WhatsApp order buttons,
                financing estimator defaults, and showroom contact details.
              </p>
            </div>

            <form onSubmit={handleSaveSettingsSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[#18181B] mb-1.5">
                    Showroom WhatsApp Number
                  </label>
                  <input
                    type="text"
                    required
                    value={draftSettings.whatsappNumber}
                    onChange={(e) =>
                      setDraftSettings((prev) => ({
                        ...prev,
                        whatsappNumber: e.target.value,
                      }))
                    }
                    placeholder="2348000000000"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-medium text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#18181B] mb-1.5">
                    Admin Passcode PIN
                  </label>
                  <input
                    type="text"
                    required
                    value={draftSettings.adminPin}
                    onChange={(e) =>
                      setDraftSettings((prev) => ({
                        ...prev,
                        adminPin: e.target.value,
                      }))
                    }
                    placeholder="1234"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-mono font-semibold text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-semibold text-[#18181B] mb-1.5">
                    Showroom Address
                  </label>
                  <input
                    type="text"
                    required
                    value={draftSettings.showroomAddress}
                    onChange={(e) =>
                      setDraftSettings((prev) => ({
                        ...prev,
                        showroomAddress: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#18181B] mb-1.5">
                    Default Storefront Currency
                  </label>
                  <select
                    value={draftSettings.defaultCurrency}
                    onChange={(e) =>
                      setDraftSettings((prev) => ({
                        ...prev,
                        defaultCurrency: e.target.value as CurrencyCode,
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-semibold text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                  >
                    <option value="NGN">₦ NGN (Nigerian Naira)</option>
                    <option value="USD">$ USD (US Dollar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#18181B] mb-1.5">
                    Exchange Rate (₦ per $1 USD)
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={draftSettings.exchangeRateNGN}
                    onChange={(e) =>
                      setDraftSettings((prev) => ({
                        ...prev,
                        exchangeRateNGN: Number(e.target.value) || 1520,
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-semibold text-[#18181B] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#18181B] mb-1.5">
                    Financing Annual Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    required
                    value={draftSettings.financingInterestRate}
                    onChange={(e) =>
                      setDraftSettings((prev) => ({
                        ...prev,
                        financingInterestRate: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-semibold text-[#18181B] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#18181B] mb-1.5">
                    Default Financing Down Payment (%)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={80}
                    required
                    value={draftSettings.defaultDownPaymentPercent}
                    onChange={(e) =>
                      setDraftSettings((prev) => ({
                        ...prev,
                        defaultDownPaymentPercent: Number(e.target.value) || 30,
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-semibold text-[#18181B] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-100">
                {settingsSavedToast ? (
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    Settings saved &amp; applied to storefront!
                  </span>
                ) : (
                  <span className="text-[12px] text-zinc-400">
                    Changes persist in browser storage automatically.
                  </span>
                )}

                <button
                  type="submit"
                  className="px-7 py-3 rounded-full bg-[#18181B] hover:bg-[#DC2626] text-white text-[13.5px] font-semibold transition-colors cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </section>
        )}
      </div>

      {/* Add / Edit Motorcycle Modal */}
      <AdminBikeFormModal
        open={bikeFormOpen}
        initialBike={editingBike}
        exchangeRateNGN={settings.exchangeRateNGN}
        onClose={() => {
          setBikeFormOpen(false);
          setEditingBike(null);
        }}
        onSave={(bike) => {
          onSaveBike(bike);
          setBikeFormOpen(false);
          setEditingBike(null);
        }}
      />

      {/* Add / Edit Spare Part Modal */}
      <AdminPartFormModal
        open={partFormOpen}
        initialPart={editingPart}
        onClose={() => {
          setPartFormOpen(false);
          setEditingPart(null);
        }}
        onSave={(part) => {
          onSavePart(part);
          setPartFormOpen(false);
          setEditingPart(null);
        }}
      />
    </div>
  );
};
