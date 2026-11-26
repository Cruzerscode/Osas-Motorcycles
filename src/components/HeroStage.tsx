import React, { Suspense, lazy, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bike, Box, Check } from 'lucide-react';
import {
  COLOR_OPTIONS,
  ColorOption,
  CurrencyCode,
  FRONT_CUSTOMIZER_IMAGE,
  Motorcycle,
  formatMoney,
} from '../data/motorcycles';
import { PaintedBikeImage } from './PaintedBikeImage';

const GlbModelViewer = lazy(() =>
  import('./GlbModelViewer').then((m) => ({ default: m.GlbModelViewer }))
);

type HeroCameraAngle = 'hero-34' | 'side' | 'front' | 'rear' | '3d';

interface HeroStageProps {
  bikes: Motorcycle[];
  activeBike: Motorcycle;
  activeIndex: number;
  selectedColor: ColorOption;
  onSelectColor: (color: ColorOption) => void;
  currency: CurrencyCode;
  onToggleCurrency: (currency: CurrencyCode) => void;
  onPrev: () => void;
  onNext: () => void;
  onOpenDetail: (bike: Motorcycle) => void;
  onExploreByPrice: () => void;
}

export const HeroStage: React.FC<HeroStageProps> = ({
  bikes,
  activeBike,
  activeIndex,
  selectedColor,
  onSelectColor,
  currency,
  onToggleCurrency,
  onPrev,
  onNext,
  onOpenDetail,
  onExploreByPrice,
}) => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [cameraAngle, setCameraAngle] = useState<HeroCameraAngle>('hero-34');
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const total = bikes.length;
  const prevBike = total > 1 ? bikes[(activeIndex - 1 + total) % total] : null;
  const nextBike = total > 1 ? bikes[(activeIndex + 1) % total] : null;

  const totalPriceUSD = activeBike.priceUSD + selectedColor.surchargeUSD;
  const totalPriceNGN = activeBike.priceNGN + selectedColor.surchargeNGN;

  const markImgError = (id: string) => {
    setImgErrors((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  };

  const isBrandNew = activeBike.condition === 'Brand New';
  const availableColors =
    activeBike.colorOptions && activeBike.colorOptions.length > 0
      ? activeBike.colorOptions
      : COLOR_OPTIONS;

  const effectiveAngle: HeroCameraAngle =
    cameraAngle === '3d' && !activeBike.model3dUrl ? 'hero-34' : cameraAngle;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (effectiveAngle === '3d') return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (effectiveAngle === '3d' || !touchStartRef.current || total <= 1) {
      touchStartRef.current = null;
      return;
    }
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) {
        onNext();
      } else {
        onPrev();
      }
    }
  };

  const angleButtons: Array<{ id: HeroCameraAngle; label: string }> = [
    { id: 'hero-34', label: '3/4 Hero' },
    { id: 'side', label: 'Side' },
    { id: 'front', label: 'Front' },
    { id: 'rear', label: 'Rear' },
    ...(activeBike.model3dUrl
      ? [{ id: '3d' as HeroCameraAngle, label: '3D .glb' }]
      : []),
  ];

  return (
    <section className="relative px-4 sm:px-6 xl:px-8 pt-4 sm:pt-3 pb-6 sm:pb-4 space-y-5 sm:space-y-2">
      {/* Mobile Single-Column Spacious Header (< md) */}
      <div className="md:hidden flex flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-tight ${
              isBrandNew
                ? 'bg-[#18181B] text-white'
                : 'bg-[#DC2626] text-white'
            }`}
          >
            {isBrandNew ? 'Brand New' : 'Foreign Used / Tokunbo'}
          </span>
          <span className="text-[13px] font-bold tracking-wide text-[#DC2626]">
            {activeBike.brand}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight text-[#18181B]">
          {activeBike.model}
        </h1>

        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-extrabold tracking-tight text-zinc-900 tabular-nums">
            {formatMoney(totalPriceUSD, totalPriceNGN, currency)}
          </span>
          <button
            type="button"
            onClick={onExploreByPrice}
            className="text-[13px] font-medium text-[#DC2626] underline underline-offset-4 cursor-pointer"
          >
            View Financing
          </button>
        </div>
      </div>

      {/* Desktop & Tablet Hero Header (>= md) */}
      <div className="hidden md:flex md:items-start justify-between gap-4">
        {/* Model & Brand Title + Condition Badge */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-[11.5px] font-semibold tracking-tight ${
                isBrandNew
                  ? 'bg-[#18181B] text-white'
                  : 'bg-[#DC2626] text-white'
              }`}
            >
              {isBrandNew ? 'Brand New • 0 km' : 'Foreign Used (Tokunbo)'}
            </span>
            {activeBike.stockStatus && activeBike.stockStatus !== 'In Stock' && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-[#DC2626] border border-red-200">
                {activeBike.stockStatus}
              </span>
            )}
            {activeBike.model3dUrl && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-[#18181B] border border-black/[0.06]">
                3D .glb Ready
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-[#18181B] border border-black/[0.06] tabular-nums transition-all duration-300">
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                style={{ backgroundColor: selectedColor.hex }}
              />
              <span>
                Color: {selectedColor.name} •{' '}
                {selectedColor.surchargeNGN === 0
                  ? 'Included'
                  : formatMoney(
                      selectedColor.surchargeUSD,
                      selectedColor.surchargeNGN,
                      currency,
                      true
                    )}
              </span>
            </span>
            <span className="text-[12.5px] font-medium text-[#71717A]">
              {activeBike.category}
            </span>
          </div>

          <h1 className="text-[clamp(2rem,3.5vw,3.15rem)] font-bold tracking-tight leading-[1.08] text-[#18181B]">
            {activeBike.model}{' '}
            <span className="text-[#DC2626]">{activeBike.brand}</span>
          </h1>
          <p className="mt-1 text-[14px] text-[#71717A] font-normal">
            {activeBike.subtitle}
          </p>
        </div>

        {/* Price Display + Currency Toggle */}
        <div className="flex flex-col items-end justify-start gap-2 shrink-0">
          <div className="inline-flex items-center gap-1 rounded-full bg-white/90 p-1 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-black/[0.05] mb-1.5">
            <button
              type="button"
              onClick={() => onToggleCurrency('NGN')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                currency === 'NGN'
                  ? 'bg-[#18181B] text-white'
                  : 'text-zinc-600 hover:text-[#18181B]'
              }`}
            >
              ₦ NGN
            </button>
            <button
              type="button"
              onClick={() => onToggleCurrency('USD')}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                currency === 'USD'
                  ? 'bg-[#18181B] text-white'
                  : 'text-zinc-600 hover:text-[#18181B]'
              }`}
            >
              $ USD
            </button>
          </div>

          <div className="text-right">
            <div className="text-[clamp(1.9rem,3.3vw,2.85rem)] font-bold tracking-tight leading-none text-[#18181B] tabular-nums">
              {formatMoney(totalPriceUSD, totalPriceNGN, currency)}
            </div>
            <div className="mt-1 text-[11.5px] text-[#71717A] tabular-nums">
              Market: {activeBike.marketRangeNGN}
            </div>
          </div>

          <button
            type="button"
            onClick={onExploreByPrice}
            className="mt-1 text-[13px] text-[#71717A] hover:text-[#18181B] underline decoration-zinc-300 underline-offset-4 transition-colors cursor-pointer"
          >
            Explore bikes by price
          </button>
        </div>
      </div>

      {/* Center Motorcycle Stage — Open, Spacious Pedestal with Touch Swipe */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative flex flex-col items-center justify-center"
      >
        {/* Side Preview Silhouettes (Hidden on mobile < md) */}
        {prevBike && (
          <button
            type="button"
            onClick={onPrev}
            aria-label={`Select previous motorcycle: ${prevBike.brand} ${prevBike.model}`}
            className="hidden md:flex flex-col items-center group absolute -left-8 lg:-left-6 top-[44%] -translate-y-1/2 w-[150px] lg:w-[200px] opacity-80 hover:opacity-100 transition-all duration-300 ease-out hover:translate-x-1.5 cursor-pointer z-10 focus-visible:outline-none transform-gpu"
          >
            <div className="w-full aspect-[16/10] overflow-hidden flex items-center justify-center">
              {!imgErrors[prevBike.id] ? (
                <img
                  src={prevBike.image}
                  alt={`${prevBike.brand} ${prevBike.model}`}
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => markImgError(prevBike.id)}
                  className={`w-full h-full object-contain mix-blend-multiply scale-110 -translate-x-6 transition-transform duration-300 ease-out ${
                    prevBike.flipProfile ? '-scale-x-100' : ''
                  }`}
                />
              ) : (
                <div className="w-24 h-16 rounded-2xl bg-zinc-200/70 flex items-center justify-center text-zinc-500">
                  <Bike className="w-6 h-6" />
                </div>
              )}
            </div>
            <span className="mt-1 text-[11px] font-medium text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-full">
              {prevBike.brand} {prevBike.model}
            </span>
          </button>
        )}

        {nextBike && (
          <button
            type="button"
            onClick={onNext}
            aria-label={`Select next motorcycle: ${nextBike.brand} ${nextBike.model}`}
            className="hidden md:flex flex-col items-center group absolute -right-8 lg:-right-6 top-[44%] -translate-y-1/2 w-[150px] lg:w-[200px] opacity-80 hover:opacity-100 transition-all duration-300 ease-out hover:-translate-x-1.5 cursor-pointer z-10 focus-visible:outline-none transform-gpu"
          >
            <div className="w-full aspect-[16/10] overflow-hidden flex items-center justify-center">
              {!imgErrors[nextBike.id] ? (
                <img
                  src={nextBike.image}
                  alt={`${nextBike.brand} ${nextBike.model}`}
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => markImgError(nextBike.id)}
                  className={`w-full h-full object-contain mix-blend-multiply scale-110 translate-x-6 transition-transform duration-300 ease-out ${
                    nextBike.flipProfile ? '-scale-x-100' : ''
                  }`}
                />
              ) : (
                <div className="w-24 h-16 rounded-2xl bg-zinc-200/70 flex items-center justify-center text-zinc-500">
                  <Bike className="w-6 h-6" />
                </div>
              )}
            </div>
            <span className="mt-1 text-[11px] font-medium text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-full">
              {nextBike.brand} {nextBike.model}
            </span>
          </button>
        )}

        {/* Active Centerpiece Motorcycle Stage (100% Width on Mobile) */}
        <div className="relative w-full max-w-[680px] mx-auto flex flex-col items-center">
          {/* Subtle Studio Pedestal Ring & Soft Shadow */}
          {effectiveAngle !== '3d' && (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 w-[82%] h-10 sm:h-12 rounded-[100%] border border-black/[0.06] bg-gradient-to-b from-black/[0.03] to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 w-[66%] h-6 sm:h-7 rounded-[100%] bg-black/[0.10] blur-xl"
              />
            </>
          )}

          {effectiveAngle === '3d' && activeBike.model3dUrl ? (
            <div className="w-full h-[270px] sm:h-[340px] md:h-[400px]">
              <Suspense
                fallback={
                  <div className="w-full h-full rounded-2xl bg-[#F3F3F5] border border-black/[0.05] flex flex-col items-center justify-center text-center p-4">
                    <div className="w-9 h-9 rounded-full border-2 border-[#18181B]/20 border-t-[#DC2626] animate-spin mb-2.5" />
                    <p className="text-[12.5px] font-semibold text-[#18181B]">
                      Initializing 3D Studio Viewer...
                    </p>
                  </div>
                }
              >
                <GlbModelViewer
                  url={activeBike.model3dUrl}
                  fileName={activeBike.model3dName}
                  heightClass="h-full"
                  selectedColor={selectedColor}
                />
              </Suspense>
            </div>
          ) : effectiveAngle === 'front' ? (
            <div
              role="button"
              tabIndex={0}
              aria-label={`View full details for ${activeBike.brand} ${activeBike.model}`}
              onClick={() => onOpenDetail(activeBike)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenDetail(activeBike);
                }
              }}
              className="group relative w-full h-[270px] sm:h-[340px] md:h-[400px] py-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B] rounded-3xl flex items-center justify-center"
            >
              <PaintedBikeImage
                src={FRONT_CUSTOMIZER_IMAGE}
                colorImages={activeBike.colorImages}
                selectedColor={selectedColor}
                alt={`${activeBike.brand} ${activeBike.model} front view in ${selectedColor.name}`}
                className="w-full h-full"
                imgClassName="group-hover:scale-[1.03]"
              />
              <div className="hidden md:block pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#18181B]/90 text-white text-[12px] font-medium shadow-md whitespace-nowrap">
                  View Full Details
                </span>
              </div>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              aria-label={`View full details for ${activeBike.brand} ${activeBike.model}`}
              onClick={() => onOpenDetail(activeBike)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenDetail(activeBike);
                }
              }}
              className="group relative w-full h-[270px] sm:h-[340px] md:h-[400px] py-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B] rounded-3xl"
            >
              {bikes.map((bike, idx) => {
                const isActive = bike.id === activeBike.id;
                const isAdjacent =
                  idx === (activeIndex - 1 + total) % total ||
                  idx === (activeIndex + 1) % total;
                const isBefore = idx < activeIndex;
                const shouldMirror =
                  effectiveAngle === 'rear'
                    ? !bike.flipProfile
                    : Boolean(bike.flipProfile);

                return (
                  <div
                    key={bike.id}
                    aria-hidden={!isActive}
                    className={`absolute inset-2 sm:inset-0 flex items-center justify-center transition-all duration-300 ease-out transform-gpu ${
                      isActive
                        ? 'opacity-100 translate-x-0 scale-100 z-10'
                        : `opacity-0 scale-[0.97] pointer-events-none z-0 ${
                            isBefore ? '-translate-x-6' : 'translate-x-6'
                          }`
                    }`}
                  >
                    {!imgErrors[bike.id] ? (
                      <PaintedBikeImage
                        src={bike.image}
                        colorImages={bike.colorImages}
                        selectedColor={
                          isActive
                            ? selectedColor
                            : availableColors.find(
                                (c) => c.id === bike.defaultColorId
                              ) ?? selectedColor
                        }
                        loading={isActive || isAdjacent ? 'eager' : 'lazy'}
                        alt={`${bike.brand} ${bike.model} studio view in ${selectedColor.name}`}
                        onError={() => markImgError(bike.id)}
                        className="w-full h-full"
                        imgClassName={`${
                          effectiveAngle === 'hero-34'
                            ? 'scale-[1.03]'
                            : effectiveAngle === 'rear'
                            ? 'scale-[0.97]'
                            : 'scale-100'
                        } ${isActive ? 'group-hover:scale-[1.05]' : ''} ${
                          shouldMirror ? '-scale-x-100' : ''
                        }`}
                      />
                    ) : (
                      <div className="w-full h-56 rounded-3xl bg-gradient-to-br from-zinc-200 to-zinc-100 flex flex-col items-center justify-center gap-2 text-zinc-500">
                        <Bike className="w-12 h-12" strokeWidth={1.3} />
                        <span className="text-sm font-medium">
                          {bike.brand} {bike.model}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Hover Cue Pill (Desktop) */}
              <div className="hidden md:block pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#18181B]/90 text-white text-[12px] font-medium shadow-md backdrop-blur-xs whitespace-nowrap">
                  View Full Details
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Single Centered Minimalist Control Bar Below Bike */}
        <div className="relative z-20 mt-3 w-full flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={onPrev}
              disabled={total <= 1}
              aria-label="Previous motorcycle"
              className="w-11 h-11 rounded-full bg-white text-[#18181B] hover:bg-zinc-100 disabled:opacity-35 shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/[0.05] inline-flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.85} />
            </button>
            <span className="px-4 py-2 rounded-full bg-white shadow-[0_4px_14px_rgba(0,0,0,0.05)] border border-black/[0.04] text-[12.5px] font-semibold text-[#18181B] tabular-nums select-none">
              {activeIndex + 1} <span className="text-zinc-400">/ {total}</span>
            </span>
            <button
              type="button"
              onClick={onNext}
              disabled={total <= 1}
              aria-label="Next motorcycle"
              className="w-11 h-11 rounded-full bg-white text-[#18181B] hover:bg-zinc-100 disabled:opacity-35 shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-black/[0.05] inline-flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
            >
              <ArrowRight className="w-4 h-4" strokeWidth={1.85} />
            </button>
          </div>

          {/* Single Horizontal Swipe Camera Angle Strip */}
          <div
            role="tablist"
            aria-label="Camera angle view"
            className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar py-1 px-2 max-w-full bg-white/80 backdrop-blur-xs rounded-full border border-black/[0.04]"
          >
            {angleButtons.map((angle) => {
              const active = effectiveAngle === angle.id;
              return (
                <button
                  key={angle.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCameraAngle(angle.id)}
                  className={`inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#18181B] text-white shadow-xs'
                      : 'text-zinc-600 hover:text-[#18181B]'
                  }`}
                >
                  {angle.id === '3d' && (
                    <Box className="w-3 h-3 text-[#DC2626]" />
                  )}
                  <span>{angle.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Spacious Mobile Inline Paint Color Pill Row (< md) */}
        <div className="md:hidden w-full bg-white px-4 py-3 rounded-2xl shadow-[0_2px_14px_rgba(0,0,0,0.03)] border border-black/[0.04] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[13px] font-semibold text-[#18181B] block leading-tight">
              Paint Color
            </span>
            <span className="text-[11px] font-medium text-[#71717A] block truncate mt-0.5 tabular-nums">
              {selectedColor.name} ·{' '}
              {selectedColor.surchargeNGN === 0
                ? 'Included'
                : formatMoney(
                    selectedColor.surchargeUSD,
                    selectedColor.surchargeNGN,
                    currency,
                    true
                  )}
            </span>
          </div>

          <div
            role="radiogroup"
            aria-label="Select motorcycle paint color"
            className="flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 shrink-0"
          >
            {availableColors.map((color) => {
              const isSelected = color.id === selectedColor.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={color.name}
                  onClick={() => onSelectColor(color)}
                  style={{ backgroundColor: color.hex }}
                  className={`w-7 h-7 rounded-full inline-flex items-center justify-center transition-transform duration-150 cursor-pointer ${
                    color.isLightSwatch ? 'border border-zinc-300' : ''
                  } ${
                    isSelected
                      ? 'scale-110 ring-2 ring-offset-2 ring-[#18181B]'
                      : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  {isSelected && (
                    <Check
                      className={`w-3.5 h-3.5 ${
                        color.isLightSwatch ? 'text-[#18181B]' : 'text-white'
                      }`}
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
