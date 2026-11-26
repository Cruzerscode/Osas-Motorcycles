import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  MessageCircle,
  Package,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { formatWhatsappHref } from '../data/adminSettings';
import {
  CurrencyCode,
  MOTORCYCLES,
  Motorcycle,
  formatMoney,
} from '../data/motorcycles';
import { PartVariant, SPARE_PARTS, SparePart } from '../data/spareParts';

const POPULAR_SEARCHES = [
  'Bajaj Boxer',
  'TVS HLX',
  '600cc',
  'Carburetor',
  'Chain & Sprocket',
  'Engine Oil',
];

const NGN_PER_USD = 1520;

interface GlobalSearchProps {
  currency: CurrencyCode;
  motorcycles?: Motorcycle[];
  spareParts?: SparePart[];
  whatsappNumber?: string;
  onSelectMotorcycle: (bike: Motorcycle) => void;
  onSelectPart: (part: SparePart) => void;
  onAddPartToBag: (
    part: SparePart,
    quantity: number,
    variant?: PartVariant
  ) => void;
  mobileExpanded: boolean;
  onCloseMobile: () => void;
}

function extractEngineCc(engineSpec: string): string {
  const match = engineSpec.match(/\b\d{2,4}\s*cc\b/i);
  if (match) {
    return match[0].replace(/\s+/g, '').toLowerCase();
  }
  return engineSpec.split('•')[0].trim();
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  currency,
  motorcycles = MOTORCYCLES,
  spareParts = SPARE_PARTS,
  whatsappNumber = '2348000000000',
  onSelectMotorcycle,
  onSelectPart,
  onAddPartToBag,
  mobileExpanded,
  onCloseMobile,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [addedPartIds, setAddedPartIds] = useState<Record<string, boolean>>({});
  const [bikeImgErrors, setBikeImgErrors] = useState<Record<string, boolean>>(
    {}
  );
  const [partImgErrors, setPartImgErrors] = useState<Record<string, boolean>>(
    {}
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Focus active input when mobile search expands
  useEffect(() => {
    if (mobileExpanded) {
      setIsOpen(true);
      const timer = window.setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 40);
      return () => window.clearTimeout(timer);
    }
  }, [mobileExpanded]);

  // Global keyboard shortcuts: `/` or `Ctrl+K` / `Cmd+K` focuses search; `Escape` closes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen(true);
        if (window.scrollY > 140) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (window.innerWidth < 1024) {
          mobileInputRef.current?.focus();
          if (!mobileExpanded) {
            window.dispatchEvent(new CustomEvent('osas-open-mobile-search'));
          }
        } else {
          desktopInputRef.current?.focus();
        }
        return;
      }

      if (event.key === '/' && !isEditable && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setIsOpen(true);
        if (window.scrollY > 140) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (window.innerWidth < 1024) {
          mobileInputRef.current?.focus();
          if (!mobileExpanded) {
            window.dispatchEvent(new CustomEvent('osas-open-mobile-search'));
          }
        } else {
          desktopInputRef.current?.focus();
        }
        return;
      }

      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        desktopInputRef.current?.blur();
        mobileInputRef.current?.blur();
        if (mobileExpanded) {
          onCloseMobile();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mobileExpanded, onCloseMobile]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const trimmedQuery = query.trim();

  const { matchedBikes, matchedParts } = useMemo(() => {
    if (!trimmedQuery) {
      return { matchedBikes: [] as Motorcycle[], matchedParts: [] as SparePart[] };
    }
    const tokens = trimmedQuery.toLowerCase().split(/\s+/).filter(Boolean);

    const bikes = motorcycles.filter((bike) => {
      const haystack = [
        bike.brand,
        ...(bike.brandTags ?? []),
        bike.model,
        bike.category,
        bike.condition,
        bike.subtitle,
        bike.specs.engine,
        bike.specs.transmission,
      ]
        .join(' ')
        .toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });

    const parts = spareParts.filter((part) => {
      const haystack = [
        part.name,
        part.sku,
        part.category,
        part.fitsSummary,
        ...part.compatibleBrands,
        ...part.compatibleModels,
        part.details,
      ]
        .join(' ')
        .toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });

    return { matchedBikes: bikes, matchedParts: parts };
  }, [trimmedQuery, motorcycles, spareParts]);

  const totalMatches = matchedBikes.length + matchedParts.length;

  const handleClear = () => {
    setQuery('');
    if (window.innerWidth < 1024) {
      mobileInputRef.current?.focus();
    } else {
      desktopInputRef.current?.focus();
    }
    setIsOpen(true);
  };

  const handleQuickAddPart = (
    event: React.MouseEvent,
    part: SparePart
  ) => {
    event.stopPropagation();
    const defaultVariant = part.variants?.[0];
    onAddPartToBag(part, 1, defaultVariant);
    setAddedPartIds((prev) => ({ ...prev, [part.id]: true }));
    window.setTimeout(() => {
      setAddedPartIds((prev) => ({ ...prev, [part.id]: false }));
    }, 1500);
  };

  const handlePickBike = (bike: Motorcycle) => {
    setIsOpen(false);
    if (mobileExpanded) onCloseMobile();
    onSelectMotorcycle(bike);
  };

  const handlePickPart = (part: SparePart) => {
    setIsOpen(false);
    if (mobileExpanded) onCloseMobile();
    onSelectPart(part);
  };

  const handleSuggestionClick = (term: string) => {
    setQuery(term);
    setIsOpen(true);
    if (window.innerWidth < 1024) {
      mobileInputRef.current?.focus();
    } else {
      desktopInputRef.current?.focus();
    }
  };

  const whatsappHref = formatWhatsappHref(
    whatsappNumber,
    `Hello Osas Motorcycle, I searched for "${trimmedQuery}" on your website and would like to check availability or order it.`
  );

  const renderDropdown = () => {
    if (!isOpen) return null;

    return (
      <div
        role="region"
        aria-label="Global search results"
        className="absolute left-0 right-0 lg:left-auto lg:right-0 top-full mt-2.5 lg:w-[560px] xl:w-[620px] max-w-[calc(100vw-1.5rem)] bg-white rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.14)] border border-black/[0.06] overflow-hidden z-50"
      >
        <div className="max-h-[72vh] overflow-y-auto p-4 sm:p-5 space-y-5">
          {trimmedQuery.length === 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  <Sparkles className="w-3.5 h-3.5 text-[#DC2626]" />
                  Popular Searches
                </span>
                <span className="text-[11px] text-zinc-400 hidden sm:inline">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono text-[10px]">/</kbd> or{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-mono text-[10px]">Ctrl+K</kbd> anytime
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSuggestionClick(term)}
                    className="px-3.5 py-1.5 rounded-full bg-[#F3F3F5] hover:bg-[#18181B] text-[#18181B] hover:text-white text-[12px] font-medium transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : totalMatches === 0 ? (
            <div className="py-6 px-3 text-center space-y-3.5">
              <div className="w-11 h-11 rounded-full bg-[#F3F3F5] text-zinc-500 flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[14px] font-semibold text-[#18181B]">
                  No matching bikes or parts found — try searching by brand or cc
                </p>
                <p className="text-[12px] text-zinc-500">
                  Can&apos;t find &ldquo;{trimmedQuery}&rdquo;? Our Benin City &amp; Lagos parts desk can source it for you.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#18181B] hover:bg-[#DC2626] text-white text-[12px] font-semibold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Request via WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2 rounded-full bg-[#F3F3F5] hover:bg-zinc-200/80 text-[#18181B] text-[12px] font-medium transition-colors cursor-pointer"
                >
                  Clear search
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Motorcycles Group */}
              {matchedBikes.length > 0 && (
                <section className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Motorcycles
                    </h3>
                    <span className="text-[11px] font-semibold text-zinc-500 tabular-nums">
                      {matchedBikes.length}{' '}
                      {matchedBikes.length === 1 ? 'model' : 'models'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedBikes.slice(0, 6).map((bike) => {
                      const isBrandNew = bike.condition === 'Brand New';
                      const ccLabel = extractEngineCc(bike.specs.engine);
                      const priceStr = formatMoney(
                        bike.priceUSD,
                        bike.priceNGN,
                        currency
                      );
                      const hasImgError = bikeImgErrors[bike.id];

                      return (
                        <button
                          key={bike.id}
                          type="button"
                          onClick={() => handlePickBike(bike)}
                          className="w-full text-left flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#F3F3F5] transition-colors group cursor-pointer"
                        >
                          <div className="w-16 h-12 rounded-xl bg-[#F3F3F5] group-hover:bg-white border border-black/[0.04] flex items-center justify-center shrink-0 overflow-hidden p-1">
                            {hasImgError ? (
                              <span className="text-[10px] font-bold text-zinc-400">
                                {bike.brand}
                              </span>
                            ) : (
                              <img
                                src={bike.image}
                                alt={`${bike.brand} ${bike.model}`}
                                onError={() =>
                                  setBikeImgErrors((prev) => ({
                                    ...prev,
                                    [bike.id]: true,
                                  }))
                                }
                                className={`w-full h-full object-contain ${
                                  bike.flipProfile ? '-scale-x-100' : ''
                                }`}
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-[#DC2626]">
                                {bike.brand}
                              </span>
                              <span className="text-[13.5px] font-semibold text-[#18181B] truncate">
                                {bike.model}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="text-[11px] font-medium text-zinc-500 tabular-nums">
                                {ccLabel}
                              </span>
                              <span className="text-zinc-300">•</span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  isBrandNew
                                    ? 'bg-[#18181B] text-white'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200/80'
                                }`}
                              >
                                {isBrandNew
                                  ? 'Brand New'
                                  : 'Foreign Used / Tokunbo'}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 pl-2">
                            <div className="text-[13.5px] font-bold text-[#18181B] tabular-nums">
                              {priceStr}
                            </div>
                            <div className="text-[10px] font-medium text-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity">
                              View bike →
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Spare Parts & Accessories Group */}
              {matchedParts.length > 0 && (
                <section
                  className={`space-y-2 ${
                    matchedBikes.length > 0
                      ? 'pt-3 border-t border-zinc-100'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Spare Parts &amp; Accessories
                    </h3>
                    <span className="text-[11px] font-semibold text-zinc-500 tabular-nums">
                      {matchedParts.length}{' '}
                      {matchedParts.length === 1 ? 'part' : 'parts'}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {matchedParts.slice(0, 6).map((part) => {
                      const defaultVariant = part.variants?.[0];
                      const displayNGN =
                        defaultVariant?.priceNGN ?? part.priceNGN;
                      const displayUSD = Math.max(
                        1,
                        Math.round(displayNGN / NGN_PER_USD)
                      );
                      const priceStr = formatMoney(
                        displayUSD,
                        displayNGN,
                        currency
                      );
                      const isAdded = Boolean(addedPartIds[part.id]);
                      const hasImgError = partImgErrors[part.id];

                      return (
                        <div
                          key={part.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handlePickPart(part)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handlePickPart(part);
                            }
                          }}
                          className="w-full text-left flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#F3F3F5] transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
                        >
                          <div className="w-14 h-12 rounded-xl bg-[#F3F3F5] group-hover:bg-white border border-black/[0.04] flex items-center justify-center shrink-0 overflow-hidden p-1">
                            {hasImgError ? (
                              <Package className="w-5 h-5 text-zinc-400" />
                            ) : (
                              <img
                                src={part.image}
                                alt={part.name}
                                onError={() =>
                                  setPartImgErrors((prev) => ({
                                    ...prev,
                                    [part.id]: true,
                                  }))
                                }
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-semibold text-[#18181B] truncate">
                              {part.name}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] text-zinc-500 truncate max-w-[230px]">
                                Fits {part.fitsSummary}
                              </span>
                              <span className="text-zinc-300">•</span>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {part.sku}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0 pl-1">
                            <span className="text-[13px] font-bold text-[#18181B] tabular-nums">
                              {part.variants ? `From ${priceStr}` : priceStr}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleQuickAddPart(e, part)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                                isAdded
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#18181B] hover:bg-[#DC2626] text-white'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3 h-3" />
                                  <span>Bag</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${
        mobileExpanded
          ? 'block order-last w-full lg:order-none lg:w-auto'
          : 'hidden lg:block'
      }`}
    >
      {/* Desktop Inline Pill Search Input */}
      <div className="hidden lg:flex items-center relative w-[180px] xl:w-[245px] 2xl:w-[285px]">
        <Search
          className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none"
          strokeWidth={1.85}
        />
        <input
          ref={desktopInputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search bikes, cc, or spare parts..."
          aria-label="Search bikes, cc, or spare parts"
          className="w-full h-10 pl-9 pr-8 rounded-full bg-white border border-zinc-200 text-[12.5px] text-[#18181B] placeholder:text-zinc-400 shadow-[0_2px_10px_rgba(0,0,0,0.03)] focus:outline-none focus:border-[#18181B] focus:ring-2 focus:ring-[#18181B]/10 transition-all"
        />
        {query ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2.5 w-5 h-5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 inline-flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        ) : (
          <kbd className="hidden 2xl:inline-flex items-center justify-center absolute right-3 px-1.5 py-0.5 rounded bg-[#F3F3F5] border border-zinc-200 text-[10px] font-mono text-zinc-400 pointer-events-none">
            /
          </kbd>
        )}
      </div>

      {/* Mobile / Tablet Expanded Search Input */}
      {mobileExpanded && (
        <div className="lg:hidden flex items-center relative w-full pt-1">
          <Search
            className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 mt-0.5 pointer-events-none"
            strokeWidth={1.85}
          />
          <input
            ref={mobileInputRef}
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            placeholder="Search bikes, cc, or spare parts..."
            aria-label="Search bikes, cc, or spare parts"
            className="w-full h-11 pl-10 pr-10 rounded-full bg-white border border-zinc-200 text-[13.5px] text-[#18181B] placeholder:text-zinc-400 shadow-[0_6px_20px_rgba(0,0,0,0.05)] focus:outline-none focus:border-[#18181B] focus:ring-2 focus:ring-[#18181B]/10"
          />
          <button
            type="button"
            onClick={() => {
              if (query) {
                handleClear();
              } else {
                setIsOpen(false);
                onCloseMobile();
              }
            }}
            aria-label={query ? 'Clear search' : 'Close search'}
            className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 w-6 h-6 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 inline-flex items-center justify-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Dropdown Overlay */}
      {renderDropdown()}
    </div>
  );
};
