import React, { useMemo, useState } from 'react';
import { Search, ShoppingBag, X } from 'lucide-react';
import {
  CurrencyCode,
  NIGERIAN_RIDER_GEAR,
  RidingGearItem,
  formatMoney,
} from '../data/motorcycles';
import {
  PART_BRAND_FILTERS,
  PART_CATEGORIES,
  PartCompatibilityBrand,
  PartCategory,
  PartVariant,
  SPARE_PARTS,
  SparePart,
} from '../data/spareParts';
import { StudioImage } from './StudioImage';

interface SparePartsSectionProps {
  currency: CurrencyCode;
  spareParts?: SparePart[];
  onViewPart: (part: SparePart) => void;
  onAddPartToBag: (
    part: SparePart,
    quantity: number,
    variant?: PartVariant
  ) => void;
  onBuyGear?: (gear: RidingGearItem) => void;
}

export const SparePartsSection: React.FC<SparePartsSectionProps> = ({
  currency,
  spareParts = SPARE_PARTS,
  onViewPart,
  onAddPartToBag,
  onBuyGear,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'All Parts' | PartCategory
  >('All Parts');
  const [selectedBrand, setSelectedBrand] = useState<
    'All Brands' | PartCompatibilityBrand
  >('All Brands');
  const [selectedVariantByPart, setSelectedVariantByPart] = useState<
    Record<string, string>
  >({});
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const filteredParts = useMemo(() => {
    const tokens = searchQuery
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return spareParts.filter((part) => {
      if (
        selectedCategory !== 'All Parts' &&
        part.category !== selectedCategory
      ) {
        return false;
      }
      if (
        selectedBrand !== 'All Brands' &&
        !part.compatibleBrands.includes(selectedBrand)
      ) {
        return false;
      }
      if (tokens.length > 0) {
        const haystack = [
          part.name,
          part.sku,
          part.category,
          part.fitsSummary,
          part.details,
          ...part.compatibleModels,
          ...part.compatibleBrands,
        ]
          .join(' ')
          .toLowerCase();
        return tokens.every((token) => haystack.includes(token));
      }
      return true;
    });
  }, [spareParts, searchQuery, selectedCategory, selectedBrand]);

  const handleQuickAdd = (part: SparePart, variant?: PartVariant) => {
    onAddPartToBag(part, 1, variant);
    setAddedIds((prev) => ({ ...prev, [part.id]: true }));
    window.setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [part.id]: false }));
    }, 1200);
  };

  return (
    <section id="spare-parts" className="scroll-mt-8">
      {/* Header & Live Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-7">
        <div>
          <p className="text-[12px] font-semibold tracking-wide text-[#DC2626]">
            OEM & Heavy-Duty Aftermarket ({filteredParts.length} Parts)
          </p>
          <h2 className="mt-1 text-[28px] sm:text-[34px] font-bold tracking-tight text-[#18181B]">
            Genuine Spare Parts & Accessories
          </h2>
          <p className="mt-1.5 text-[15px] text-[#71717A] max-w-2xl">
            Verified engine kits, brake sets, sealed gel batteries, 6-ply
            tires, and dispatch racks ready for same-day pickup or nationwide
            delivery.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full lg:w-[370px] shrink-0">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Boxer carburetor, HLX chain, brake pads..."
            aria-label="Search genuine spare parts by name, SKU, or bike model"
            className="w-full pl-11 pr-10 py-3 rounded-full bg-white text-[13.5px] text-[#18181B] placeholder:text-zinc-400 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03)] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear spare parts search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-zinc-100 hover:bg-zinc-200 inline-flex items-center justify-center text-zinc-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Riding Gear & Safety Kits Strip (Moved cleanly out of tight Hero area) */}
      {onBuyGear && (
        <div className="md:hidden mb-6 space-y-2.5">
          <div className="text-[12px] font-semibold uppercase tracking-wider text-zinc-500">
            Rider Safety &amp; Dispatch Gear
          </div>
          <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-1">
            {NIGERIAN_RIDER_GEAR.map((gear) => {
              const gearAdded = addedIds[gear.id];
              return (
                <div
                  key={gear.id}
                  className="w-[240px] shrink-0 bg-white rounded-2xl p-3.5 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-3"
                >
                  <StudioImage
                    src={gear.image}
                    alt={gear.title}
                    loading="lazy"
                    fallbackType="gear"
                    style={{ filter: gear.filterStyle ?? 'none' }}
                    className="w-14 h-14 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-bold text-[#18181B] truncate">
                      {gear.shortLabel}
                    </div>
                    <div className="text-[13px] font-bold text-[#18181B] tabular-nums mt-0.5">
                      {formatMoney(gear.priceUSD, gear.priceNGN, currency)}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onBuyGear(gear);
                        setAddedIds((prev) => ({ ...prev, [gear.id]: true }));
                        window.setTimeout(() => {
                          setAddedIds((prev) => ({ ...prev, [gear.id]: false }));
                        }, 1200);
                      }}
                      className={`mt-1.5 px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer transition-colors ${
                        gearAdded
                          ? 'bg-[#DC2626] text-white'
                          : 'bg-[#18181B] text-white'
                      }`}
                    >
                      {gearAdded ? 'Added' : 'Add to Bag'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Filter Pills (Scrollable strip on mobile) */}
      <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto no-scrollbar pb-1 mb-3">
        {PART_CATEGORIES.map((category) => {
          const active = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-[#DC2626] text-white shadow-sm'
                  : 'bg-white text-[#18181B] hover:bg-zinc-50 border border-black/[0.05]'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Compatible Brand Filter Pills (Scrollable strip on mobile) */}
      <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto no-scrollbar pb-1 mb-7">
        {PART_BRAND_FILTERS.map((brand) => {
          const active = selectedBrand === brand;
          return (
            <button
              key={brand}
              type="button"
              onClick={() => setSelectedBrand(brand)}
              className={`px-4 py-1.5 rounded-full text-[12.5px] font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-[#18181B] text-white shadow-sm'
                  : 'bg-white text-zinc-600 hover:text-[#18181B] border border-black/[0.05]'
              }`}
            >
              {brand}
            </button>
          );
        })}
      </div>

      {/* Parts Grid */}
      {filteredParts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-black/[0.04]">
          <p className="text-[16px] font-semibold text-[#18181B]">
            No spare parts match &ldquo;{searchQuery || selectedCategory}
            &rdquo;.
          </p>
          <p className="mt-1 text-[14px] text-[#71717A]">
            Reset search or filters to view all genuine Osas Motorcycle parts.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Parts');
              setSelectedBrand('All Brands');
            }}
            className="mt-5 px-6 py-2.5 rounded-full bg-[#18181B] text-white text-[13px] font-medium hover:bg-zinc-800 cursor-pointer"
          >
            Reset Parts Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredParts.map((part) => {
            const selectedVarId = selectedVariantByPart[part.id];
            const activeVariant =
              part.variants?.find((v) => v.id === selectedVarId) ??
              part.variants?.[0];
            const displayNGN = activeVariant?.priceNGN ?? part.priceNGN;
            const displayUSD = Math.round(displayNGN / 1520);
            const isAdded = Boolean(addedIds[part.id]);

            return (
              <article
                key={part.id}
                className="group bg-white rounded-3xl p-5 border border-black/[0.04] shadow-[0_2px_14px_rgba(0,0,0,0.03)] hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Clickable Product Image */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for ${part.name}`}
                    onClick={() => onViewPart(part)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onViewPart(part);
                      }
                    }}
                    className="group/partimg relative rounded-2xl bg-[#F3F3F5] aspect-[16/10] overflow-hidden flex items-center justify-center p-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
                  >
                    <StudioImage
                      src={part.image}
                      alt={part.name}
                      loading="lazy"
                      fallbackType="part"
                      fallbackLabel={part.sku}
                      className="w-full h-full"
                      imgClassName="transition-transform duration-300 group-hover/partimg:scale-[1.04]"
                    />

                    {/* SKU & Stock Status Top Badges */}
                    {(() => {
                      const status =
                        part.stockStatus ??
                        (part.inStock ? 'In Stock' : 'Out of Stock');
                      return (
                        <span
                          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10.5px] font-semibold ${
                            status === 'In Stock'
                              ? 'bg-[#18181B] text-white'
                              : status === 'Low Stock'
                              ? 'bg-amber-500 text-white'
                              : 'bg-[#DC2626] text-white'
                          }`}
                        >
                          {status}
                        </span>
                      );
                    })()}
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 text-[#52525B] text-[10.5px] font-mono-tabular font-semibold shadow-xs">
                      {part.sku}
                    </span>
                  </div>

                  {/* Card Header & Pricing */}
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11.5px] font-semibold text-[#DC2626] truncate">
                        {part.category}
                      </div>
                      <h3
                        onClick={() => onViewPart(part)}
                        className="mt-0.5 text-[16.5px] font-bold tracking-tight text-[#18181B] leading-snug cursor-pointer hover:text-[#DC2626] transition-colors"
                      >
                        {part.name}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[18px] font-bold text-[#18181B] tabular-nums">
                        {formatMoney(displayUSD, displayNGN, currency)}
                      </div>
                    </div>
                  </div>

                  {/* Fits Summary & Short Description */}
                  <p className="mt-2 text-[12px] font-medium text-[#18181B] leading-snug">
                    Fits: <span className="text-[#52525B]">{part.fitsSummary}</span>
                  </p>
                  <p className="mt-1.5 text-[12.5px] text-[#71717A] leading-relaxed line-clamp-2">
                    {part.details}
                  </p>

                  {/* Quick Variant Selector if part has options */}
                  {part.variants && part.variants.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {part.variants.map((variant) => {
                        const active = variant.id === activeVariant?.id;
                        return (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() =>
                              setSelectedVariantByPart((prev) => ({
                                ...prev,
                                [part.id]: variant.id,
                              }))
                            }
                            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#18181B] text-white'
                                : 'bg-[#F3F3F5] text-zinc-600 hover:text-[#18181B]'
                            }`}
                          >
                            {variant.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onViewPart(part)}
                    className="py-2.5 px-4 rounded-full bg-[#F3F3F5] text-[#18181B] text-[13px] font-medium hover:bg-zinc-200/80 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(part, activeVariant)}
                    className={`flex-1 py-2.5 px-4 rounded-full text-[13px] font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                      isAdded
                        ? 'bg-[#DC2626] text-white'
                        : 'bg-[#18181B] text-white hover:bg-zinc-800'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{isAdded ? 'Added' : 'Add to Bag'}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
