import React, { useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  ArrowUpRight,
  Bike,
  Calculator,
  CheckCircle2,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
} from 'lucide-react';
import {
  formatWhatsappHref,
  sanitizeWhatsappNumber,
} from '../data/adminSettings';
import {
  BRANDS,
  BrandName,
  CATEGORIES,
  COLOR_OPTIONS,
  CategoryName,
  ColorOption,
  CurrencyCode,
  Motorcycle,
  RidingGearItem,
  formatMoney,
  matchesBrandFilter,
} from '../data/motorcycles';
import { PartVariant, SparePart } from '../data/spareParts';
import { TradeInRecord } from './ModalsAndDrawers';
import { PaintedBikeImage } from './PaintedBikeImage';
import { SparePartsSection } from './SparePartsSection';

type PriceRangeFilter = 'all' | 'under-1.3m' | '1.3m-2.5m' | 'over-2.5m';
type SortOption = 'featured' | 'price-asc' | 'price-desc';

interface InventoryAndAtelierProps {
  motorcycles: Motorcycle[];
  spareParts: SparePart[];
  activeBike: Motorcycle;
  selectedBrand: 'All' | BrandName;
  onSelectBrand: (brand: 'All' | BrandName) => void;
  selectedCategory: 'All' | CategoryName;
  onSelectCategory: (category: 'All' | CategoryName) => void;
  currency: CurrencyCode;
  sortOption: SortOption;
  onChangeSortOption: (sort: SortOption) => void;
  savedIds: string[];
  onToggleSave: (bikeId: string) => void;
  onLoadOnStage: (bikeId: string) => void;
  onOpenDetail: (bike: Motorcycle) => void;
  onOrderBike: (bike: Motorcycle) => void;
  onViewPart: (part: SparePart) => void;
  onAddPartToBag: (
    part: SparePart,
    quantity: number,
    variant?: PartVariant
  ) => void;
  onOpenFinancing: () => void;
  onOpenInquiry: (topic: 'service' | 'experience', title: string) => void;
  onSubmitTradeIn: (record: TradeInRecord) => void;
  tradeIns: TradeInRecord[];
  showroomAddress?: string;
  whatsappNumber?: string;
  onOpenDealerPortal: () => void;
  selectedColorByBike?: Record<string, ColorOption>;
  onBuyGear?: (gear: RidingGearItem) => void;
}

export const InventoryAndAtelier: React.FC<InventoryAndAtelierProps> = ({
  motorcycles,
  spareParts,
  activeBike,
  selectedBrand,
  onSelectBrand,
  selectedCategory,
  onSelectCategory,
  currency,
  sortOption,
  onChangeSortOption,
  savedIds,
  onToggleSave,
  onLoadOnStage,
  onOpenDetail,
  onOrderBike,
  onViewPart,
  onAddPartToBag,
  onOpenFinancing,
  onOpenInquiry,
  onSubmitTradeIn,
  tradeIns,
  showroomAddress = 'Benin City Flagship, Edo State · Lagos & Abuja',
  whatsappNumber = '2348000000000',
  onOpenDealerPortal,
  selectedColorByBike,
  onBuyGear,
}) => {
  const [priceRange, setPriceRange] = useState<PriceRangeFilter>('all');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Trade-In Valuation Form state
  const [tradeBrand, setTradeBrand] = useState('Bajaj');
  const [tradeModel, setTradeModel] = useState('');
  const [tradeYear, setTradeYear] = useState('2023');
  const [tradeMileage, setTradeMileage] = useState('');
  const [tradeCondition, setTradeCondition] = useState('Excellent');
  const [tradeWhatsapp, setTradeWhatsapp] = useState('');
  const [tradeTargetBike, setTradeTargetBike] = useState(
    `${activeBike.brand} ${activeBike.model}`
  );
  const [lastSubmittedTradeIn, setLastSubmittedTradeIn] =
    useState<TradeInRecord | null>(null);

  const filteredBikes = useMemo(() => {
    let list = motorcycles.filter((bike) => {
      if (!matchesBrandFilter(bike, selectedBrand)) {
        return false;
      }
      if (selectedCategory !== 'All' && bike.category !== selectedCategory) {
        return false;
      }
      if (priceRange === 'under-1.3m') return bike.priceNGN < 1300000;
      if (priceRange === '1.3m-2.5m')
        return bike.priceNGN >= 1300000 && bike.priceNGN <= 2500000;
      if (priceRange === 'over-2.5m') return bike.priceNGN > 2500000;
      return true;
    });

    if (sortOption === 'price-asc') {
      list = [...list].sort((a, b) => a.priceNGN - b.priceNGN);
    } else if (sortOption === 'price-desc') {
      list = [...list].sort((a, b) => b.priceNGN - a.priceNGN);
    }

    return list;
  }, [motorcycles, selectedBrand, selectedCategory, priceRange, sortOption]);

  const priceRanges: Array<{ id: PriceRangeFilter; label: string }> = [
    { id: 'all', label: 'All Prices' },
    {
      id: 'under-1.3m',
      label: currency === 'NGN' ? 'Under ₦1,300,000' : 'Under $855',
    },
    {
      id: '1.3m-2.5m',
      label: currency === 'NGN' ? '₦1.3M – ₦2.5M' : '$855 – $1,650',
    },
    {
      id: 'over-2.5m',
      label:
        currency === 'NGN'
          ? 'Above ₦2.5M (600cc Power)'
          : 'Above $1,650 (600cc)',
    },
  ];

  const services = [
    {
      title: 'Factory Diagnostics & Fleet Maintenance',
      description:
        'Certified technicians equipped for Bajaj, TVS, Honda, Hero, Suzuki, Qlink, Daylong, Haojue, and 600cc Yamaha/Honda/Suzuki power bikes.',
      meta: 'Same-Day Express · Genuine OEM Parts',
      Icon: Wrench,
    },
    {
      title: 'Nationwide Enclosed & Fleet Delivery',
      description:
        'Insured showroom dispatch from Benin City, Lagos & Abuja directly to your doorstep or corporate logistics hub.',
      meta: 'Benin City · Lagos · Abuja · Nationwide',
      Icon: Truck,
    },
    {
      title: 'Dispatch Rack & Rider Gear Fitting',
      description:
        'Pre-delivery installation of heavy-duty dispatch boxes, reinforced rear carriers, crash guards, and DOT-certified rider safety kits.',
      meta: 'Fleet & Individual Outfitting',
      Icon: Sparkles,
    },
  ];

  const handleTradeInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericYear = Math.min(
      2026,
      Math.max(2005, Number(tradeYear) || 2022)
    );
    const ageFactor = Math.max(0.45, 1 - (2026 - numericYear) * 0.08);
    const conditionFactor =
      tradeCondition === 'Mint / Showroom'
        ? 1.12
        : tradeCondition === 'Excellent'
        ? 1.0
        : tradeCondition === 'Good'
        ? 0.86
        : 0.7;

    const isPowerBrand = tradeBrand === 'Yamaha' || tradeBrand === 'Honda';
    const baseNGN = Math.round(
      (isPowerBrand ? 1450000 : 720000) * ageFactor * conditionFactor
    );
    const highNGN = Math.round(baseNGN * 1.18);
    const baseUSD = Math.round(baseNGN / 1520);
    const highUSD = Math.round(highNGN / 1520);

    const estimatedRange = `${formatMoney(
      baseUSD,
      baseNGN,
      currency
    )} – ${formatMoney(highUSD, highNGN, currency)}`;

    const record: TradeInRecord = {
      id: `TI-${Math.floor(100000 + Math.random() * 900000)}`,
      submittedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      brand: tradeBrand,
      model: tradeModel,
      year: tradeYear,
      mileage: tradeMileage,
      condition: tradeCondition,
      whatsapp: tradeWhatsapp,
      targetBike: tradeTargetBike,
      estimatedRange,
      status: 'Appraisal Queued',
    };

    onSubmitTradeIn(record);
    setLastSubmittedTradeIn(record);
    setTradeModel('');
    setTradeMileage('');
    setTradeWhatsapp('');
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 mt-14 space-y-16 pb-16">
      {/* Section 4: All Available Motorcycles */}
      <section id="inventory" className="scroll-mt-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-7">
          <div>
            <p className="text-[12px] font-semibold tracking-wide text-[#DC2626]">
              Brand New & Verified Tokunbo Stock ({filteredBikes.length} Models)
            </p>
            <h2 className="mt-1 text-[28px] sm:text-[34px] font-bold tracking-tight text-[#18181B]">
              All Available Motorcycles
            </h2>
            <p className="mt-1.5 text-[15px] text-[#71717A] max-w-2xl">
              Every commuter, dispatch unit, step-through cub, and 600cc power
              bike on the Osas Motorcycle floor is either Brand New (0 km) or
              verified Foreign Used (Tokunbo).
            </p>
          </div>

          {/* Sort & Price Range Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Filter by price range"
              value={priceRange}
              onChange={(e) =>
                setPriceRange(e.target.value as PriceRangeFilter)
              }
              className="px-4 py-2 rounded-full bg-white text-[13px] font-medium text-[#18181B] border border-black/[0.06] shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
            >
              {priceRanges.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>

            <select
              aria-label="Sort motorcycles"
              value={sortOption}
              onChange={(e) => onChangeSortOption(e.target.value as SortOption)}
              className="px-4 py-2 rounded-full bg-white text-[13px] font-medium text-[#18181B] border border-black/[0.06] shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills (Scrollable strip on mobile) */}
        <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto no-scrollbar pb-1 mb-3">
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#DC2626] text-white shadow-sm'
                    : 'bg-white text-[#18181B] hover:bg-zinc-50 border border-black/[0.05]'
                }`}
              >
                {category === 'All' ? 'All Categories' : category}
              </button>
            );
          })}
        </div>

        {/* Brand Filter Pills (Scrollable strip on mobile) */}
        <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto no-scrollbar pb-1 mb-7">
          {BRANDS.map((brand) => {
            const active = selectedBrand === brand;
            return (
              <button
                key={brand}
                type="button"
                onClick={() => onSelectBrand(brand)}
                className={`px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#18181B] text-white shadow-sm'
                    : 'bg-white text-zinc-600 hover:text-[#18181B] border border-black/[0.05]'
                }`}
              >
                {brand === 'All' ? 'All Brands' : brand}
              </button>
            );
          })}
        </div>

        {/* Inventory Grid */}
        {filteredBikes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-black/[0.04]">
            <p className="text-[16px] font-semibold text-[#18181B]">
              No motorcycles match the selected brand, category, and price
              range.
            </p>
            <p className="mt-1 text-[14px] text-[#71717A]">
              Reset filters to explore all available Osas Motorcycle models.
            </p>
            <button
              type="button"
              onClick={() => {
                onSelectBrand('All');
                onSelectCategory('All');
                setPriceRange('all');
              }}
              className="mt-5 px-6 py-2.5 rounded-full bg-[#18181B] text-white text-[13px] font-medium hover:bg-zinc-800 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBikes.map((bike) => {
              const isStageActive = bike.id === activeBike.id;
              const isSaved = savedIds.includes(bike.id);
              const isBrandNew = bike.condition === 'Brand New';
              const bikeColors =
                bike.colorOptions && bike.colorOptions.length > 0
                  ? bike.colorOptions
                  : COLOR_OPTIONS;
              const bikeSelectedColor =
                (selectedColorByBike?.[bike.id] &&
                  bikeColors.find(
                    (c) => c.id === selectedColorByBike[bike.id]?.id
                  )) ||
                bikeColors.find((c) => c.id === bike.defaultColorId) ||
                bikeColors[0];

              return (
                <article
                  key={bike.id}
                  className={`group bg-white rounded-3xl p-5 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(0,0,0,0.06)] flex flex-col justify-between ${
                    isStageActive
                      ? 'border-[#18181B]/30 shadow-[0_10px_28px_rgba(0,0,0,0.05)]'
                      : 'border-black/[0.04] shadow-[0_2px_14px_rgba(0,0,0,0.03)]'
                  }`}
                >
                  <div>
                    {/* Studio Photo Box */}
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`View full details for ${bike.brand} ${bike.model}`}
                      onClick={() => onOpenDetail(bike)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onOpenDetail(bike);
                        }
                      }}
                      className="group/img relative rounded-2xl bg-[#F3F3F5] aspect-[16/10] overflow-hidden flex items-center justify-center p-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
                    >
                      {!imgErrors[bike.id] ? (
                        <PaintedBikeImage
                          src={bike.image}
                          colorImages={bike.colorImages}
                          selectedColor={bikeSelectedColor}
                          loading="lazy"
                          alt={`${bike.brand} ${bike.model} in ${bikeSelectedColor.name}`}
                          onError={() =>
                            setImgErrors((prev) => ({
                              ...prev,
                              [bike.id]: true,
                            }))
                          }
                          className="w-full h-full"
                          imgClassName={`group-hover/img:scale-[1.04] ${
                            bike.flipProfile ? '-scale-x-100' : ''
                          }`}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-zinc-400">
                          <Bike className="w-10 h-10" strokeWidth={1.3} />
                          <span className="mt-1 text-xs font-medium">
                            {bike.brand} {bike.model}
                          </span>
                        </div>
                      )}

                      {/* Condition & Stock Status Badges Top-Left */}
                      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold tracking-tight ${
                            isBrandNew
                              ? 'bg-[#18181B] text-white'
                              : 'bg-[#DC2626] text-white'
                          }`}
                        >
                          {isBrandNew
                            ? 'Brand New • 0 km'
                            : 'Foreign Used (Tokunbo)'}
                        </span>
                        {bike.stockStatus && bike.stockStatus !== 'In Stock' && (
                          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-red-50 text-[#DC2626] border border-red-200">
                            {bike.stockStatus}
                          </span>
                        )}
                        {bike.model3dUrl && (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-white/95 text-[#18181B] shadow-xs">
                            3D .glb
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(bike.id);
                        }}
                        aria-label={
                          isSaved
                            ? `Remove ${bike.brand} ${bike.model} from saved garage`
                            : `Save ${bike.brand} ${bike.model} to garage`
                        }
                        className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 shadow-xs flex items-center justify-center transition-colors cursor-pointer ${
                          isSaved
                            ? 'text-[#DC2626]'
                            : 'text-zinc-400 hover:text-[#18181B]'
                        }`}
                      >
                        <Heart
                          className="w-4 h-4"
                          fill={isSaved ? 'currentColor' : 'none'}
                        />
                      </button>

                      {/* Hover Cue Pill */}
                      <div className="pointer-events-none absolute bottom-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover/img:opacity-100 group-focus-visible/img:opacity-100 transition-all duration-200 translate-y-1 group-hover/img:translate-y-0">
                        <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#18181B]/90 text-white text-[11px] font-medium shadow-md whitespace-nowrap">
                          View Full Details
                        </span>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11.5px] text-[#71717A] font-medium truncate">
                          {bike.category}
                        </div>
                        <h3 className="mt-0.5 text-[18px] font-bold tracking-tight text-[#18181B] leading-snug">
                          {bike.model}{' '}
                          <span className="text-[#DC2626]">{bike.brand}</span>
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[17px] font-bold text-[#18181B] tabular-nums">
                          {formatMoney(bike.priceUSD, bike.priceNGN, currency)}
                        </div>
                        <div className="text-[10.5px] text-[#71717A] tabular-nums">
                          {bike.specs.fuelTank}
                        </div>
                      </div>
                    </div>

                    {/* Unboxed Technical Row */}
                    <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2 text-[11.5px] text-zinc-600 tabular-nums">
                      <span className="truncate">{bike.specs.engine}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{bike.specs.powerTorque}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">
                        {bike.specs.transmission}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-5 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onLoadOnStage(bike.id)}
                      className={`py-2.5 px-4 rounded-full text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        isStageActive
                          ? 'bg-zinc-100 text-[#18181B] font-semibold'
                          : 'bg-[#F3F3F5] text-[#18181B] hover:bg-zinc-200/80'
                      }`}
                    >
                      {isStageActive ? 'On Stage' : 'View on Stage'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onOrderBike(bike)}
                      className="flex-1 py-2.5 px-4 rounded-full bg-[#18181B] text-white text-[13px] font-medium hover:bg-zinc-800 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Reserve This Bike
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Dedicated Genuine Spare Parts & Accessories Section */}
      <SparePartsSection
        currency={currency}
        spareParts={spareParts}
        onViewPart={onViewPart}
        onAddPartToBag={onAddPartToBag}
        onBuyGear={onBuyGear}
      />

      {/* Services Section */}
      <section id="services" className="scroll-mt-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <p className="text-[12px] font-semibold tracking-wide text-[#DC2626]">
              After-Sales, Financing & Fleet Outfitting
            </p>
            <h2 className="mt-1 text-[26px] sm:text-[32px] font-bold tracking-tight text-[#18181B]">
              Osas Atelier Services
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenFinancing}
              className="px-5 py-2.5 rounded-full bg-[#18181B] text-white text-[13px] font-medium hover:bg-zinc-800 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Financing Estimator</span>
            </button>
            <button
              type="button"
              onClick={() =>
                onOpenInquiry(
                  'service',
                  'Schedule Atelier Service Appointment'
                )
              }
              className="px-5 py-2.5 rounded-full bg-white text-[#18181B] text-[13px] font-medium border border-black/[0.06] shadow-xs hover:bg-zinc-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Book Service</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {services.map(({ title, description, meta, Icon }) => (
            <div
              key={title}
              className="bg-white rounded-3xl p-6 border border-black/[0.04] shadow-[0_2px_14px_rgba(0,0,0,0.03)] flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#F3F3F5] text-[#18181B] inline-flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" strokeWidth={1.6} />
                </div>
                <h3 className="text-[17px] font-bold text-[#18181B]">
                  {title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#71717A]">
                  {description}
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-zinc-100 text-[12px] font-medium text-zinc-500">
                {meta}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sell / Trade-In Your Bike Section */}
      <section
        id="trade-in"
        className="scroll-mt-8 bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Editorial Column */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#DC2626]">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Upgrade & Appraisal Desk</span>
            </div>
            <h2 className="mt-1.5 text-[26px] sm:text-[30px] font-bold tracking-tight text-[#18181B]">
              Sell or Trade-In Your Bike
            </h2>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#71717A]">
              Apply the equity of your current motorcycle toward any Brand New
              commuter, dispatch bike, cub, or verified Tokunbo 600cc power bike
              at Osas Motorcycle.
            </p>

            {tradeIns.length > 0 && (
              <div className="mt-5 p-4 rounded-2xl bg-[#F3F3F5]">
                <div className="text-[12px] font-semibold text-[#18181B]">
                  Saved Trade-In Appraisals ({tradeIns.length})
                </div>
                <div className="mt-2 space-y-2">
                  {tradeIns.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-[12px] text-[#52525B]"
                    >
                      <span className="truncate pr-2">
                        {item.year} {item.brand} {item.model}
                      </span>
                      <span className="font-semibold text-[#DC2626] tabular-nums shrink-0">
                        {item.estimatedRange}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7">
            {lastSubmittedTradeIn ? (
              <div className="rounded-2xl bg-[#F3F3F5] p-6 text-center">
                <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 inline-flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="mt-3 text-[12px] font-semibold text-[#DC2626] tabular-nums">
                  Appraisal Reference #{lastSubmittedTradeIn.id}
                </p>
                <h3 className="mt-1 text-[20px] font-bold text-[#18181B]">
                  Estimated Trade Credit:{' '}
                  <span className="tabular-nums">
                    {lastSubmittedTradeIn.estimatedRange}
                  </span>
                </h3>
                <p className="mt-2 text-[13.5px] text-[#71717A] max-w-md mx-auto">
                  Saved for your {lastSubmittedTradeIn.year}{' '}
                  {lastSubmittedTradeIn.brand} {lastSubmittedTradeIn.model} (
                  {lastSubmittedTradeIn.condition}). Our valuation specialist will
                  reach out via WhatsApp to arrange inspection.
                </p>
                <button
                  type="button"
                  onClick={() => setLastSubmittedTradeIn(null)}
                  className="mt-5 px-6 py-2.5 rounded-full bg-[#18181B] text-white text-[13px] font-medium hover:bg-zinc-800 cursor-pointer"
                >
                  Submit Another Motorcycle
                </button>
              </div>
            ) : (
              <form onSubmit={handleTradeInSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#71717A] mb-1">
                      Current Brand
                    </label>
                    <select
                      value={tradeBrand}
                      onChange={(e) => setTradeBrand(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-medium text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B] cursor-pointer"
                    >
                      <option value="Bajaj">Bajaj</option>
                      <option value="TVS">TVS</option>
                      <option value="Honda">Honda</option>
                      <option value="Hero">Hero</option>
                      <option value="Suzuki">Suzuki</option>
                      <option value="Qlink">Qlink</option>
                      <option value="Daylong">Daylong</option>
                      <option value="Haojue">Haojue</option>
                      <option value="Yamaha">Yamaha</option>
                      <option value="Other">Other Brand</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#71717A] mb-1">
                      Model Name
                    </label>
                    <input
                      type="text"
                      required
                      value={tradeModel}
                      onChange={(e) => setTradeModel(e.target.value)}
                      placeholder="e.g., Boxer BM150"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#71717A] mb-1">
                      Model Year
                    </label>
                    <input
                      type="number"
                      required
                      min={2000}
                      max={2026}
                      value={tradeYear}
                      onChange={(e) => setTradeYear(e.target.value)}
                      placeholder="2023"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#71717A] mb-1">
                      Mileage (km)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={tradeMileage}
                      onChange={(e) => setTradeMileage(e.target.value)}
                      placeholder="e.g., 8500"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] tabular-nums placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#71717A] mb-1">
                      Condition
                    </label>
                    <select
                      value={tradeCondition}
                      onChange={(e) => setTradeCondition(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-medium text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B] cursor-pointer"
                    >
                      <option value="Mint / Showroom">Mint / Showroom</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#71717A] mb-1">
                      WhatsApp Contact
                    </label>
                    <input
                      type="tel"
                      required
                      value={tradeWhatsapp}
                      onChange={(e) => setTradeWhatsapp(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
                  <div className="flex-1">
                    <label className="block text-[11.5px] font-semibold text-[#71717A] mb-1">
                      Trade Toward Osas Motorcycle Model
                    </label>
                    <select
                      value={tradeTargetBike}
                      onChange={(e) => setTradeTargetBike(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-medium text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B] cursor-pointer"
                    >
                      {motorcycles.map((b) => {
                        const label = `${b.brand} ${b.model}`;
                        return (
                          <option key={b.id} value={label}>
                            {label} ({b.condition})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-7 py-2.5 rounded-full bg-[#18181B] text-white text-[13.5px] font-semibold hover:bg-zinc-800 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Get Instant Valuation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section
        id="experience"
        className="scroll-mt-8 bg-[#18181B] text-white rounded-3xl p-7 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8"
      >
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-[#DC2626]">
            <ShieldCheck className="w-4 h-4" />
            <span>Certified Showrooms Across Nigeria</span>
          </div>
          <h2 className="mt-2 text-[26px] sm:text-[34px] font-bold tracking-tight leading-tight">
            Inspect Every Brand New & Tokunbo Machine In Person
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-300">
            Visit our Benin City flagship or Lagos & Abuja showrooms to inspect
            fleet commuter units, dispatch dual-sports, step-through cubs, or
            verified Foreign Used 600cc power bikes before delivery.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-[13px] text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#DC2626]" />
              {showroomAddress}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
          <button
            type="button"
            onClick={() =>
              onOpenInquiry(
                'experience',
                'Reserve Private Showroom Inspection'
              )
            }
            className="px-7 py-3.5 rounded-full bg-white text-[#18181B] text-[14px] font-semibold hover:bg-zinc-100 transition-colors whitespace-nowrap cursor-pointer"
          >
            Reserve Private Viewing
          </button>
        </div>
      </section>

      {/* Showroom & Nationwide Delivery Footer */}
      <footer className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.04] shadow-[0_2px_16px_rgba(0,0,0,0.03)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-7 border-b border-zinc-100">
          {/* Brand Summary */}
          <div className="md:col-span-5 space-y-2.5">
            <div className="text-[19px] font-extrabold tracking-tight text-[#18181B]">
              Osas <span className="text-[#DC2626]">Motorcycle</span>
            </div>
            <p className="text-[13.5px] leading-relaxed text-[#52525B] max-w-md">
              Authorized dealer of brand-new commercial, dispatch, commuter, and
              sport motorcycles plus genuine spare parts.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2 text-[11.5px] font-semibold text-zinc-600">
              <span className="px-3 py-1 rounded-full bg-[#F3F3F5]">
                Brand New • 0 km Units
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F3F3F5]">
                OEM Spare Parts
              </span>
            </div>
          </div>

          {/* Showroom Location & Nationwide Delivery */}
          <div className="md:col-span-4 space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Showroom &amp; Nationwide Delivery
            </div>
            <div className="flex items-start gap-2 text-[13.5px] font-semibold text-[#18181B]">
              <MapPin className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <span>{showroomAddress}</span>
            </div>
            <p className="text-[12.5px] leading-relaxed text-[#71717A]">
              Flagship pickup in <strong className="text-[#18181B]">Benin City, Edo State</strong>{' '}
              with insured nationwide delivery to{' '}
              <strong className="text-[#18181B]">
                Lagos, Abuja, Port Harcourt, Warri, Asaba
              </strong>
              , and all 36 states.
            </p>
          </div>

          {/* Direct Contact, WhatsApp CTA & Dealer Portal */}
          <div className="md:col-span-3 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Direct Showroom Desk
              </div>
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-[#18181B] tabular-nums">
                <Phone className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                <span>+{sanitizeWhatsappNumber(whatsappNumber)}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={formatWhatsappHref(
                  whatsappNumber,
                  'Hello Osas Motorcycle, I would like to inquire about brand-new motorcycles and spare parts delivery.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#18181B] hover:bg-[#DC2626] text-white text-[12.5px] font-semibold transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Sales</span>
              </a>
              <button
                type="button"
                onClick={onOpenDealerPortal}
                className="px-4 py-2.5 rounded-full bg-[#F3F3F5] hover:bg-zinc-200 text-[#18181B] text-[12px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                Dealer Portal
              </button>
            </div>
          </div>
        </div>

        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-[#71717A]">
          <span>
            © {new Date().getFullYear()} Osas Motorcycle Nigeria. All rights
            reserved.
          </span>
          <span>Benin City · Lagos · Abuja · Nationwide Dispatch</span>
        </div>
      </footer>
    </div>
  );
};
