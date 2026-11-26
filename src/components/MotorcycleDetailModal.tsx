import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  Bike,
  Box,
  Calendar,
  Check,
  Cog,
  Fuel,
  Gauge,
  MessageCircle,
  Package,
  Scale,
  Settings2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { formatWhatsappHref } from '../data/adminSettings';
import {
  COLOR_OPTIONS,
  ColorOption,
  CurrencyCode,
  FRONT_CUSTOMIZER_IMAGE,
  Motorcycle,
  formatMoney,
  isTricycle,
} from '../data/motorcycles';
import { PaintedBikeImage } from './PaintedBikeImage';

const GlbModelViewer = lazy(() =>
  import('./GlbModelViewer').then((m) => ({ default: m.GlbModelViewer }))
);

type ViewAngle = 'side' | 'front' | 'cockpit' | '3d';

interface MotorcycleDetailModalProps {
  open: boolean;
  bike: Motorcycle | null;
  selectedColor: ColorOption;
  onSelectColor: (color: ColorOption) => void;
  currency: CurrencyCode;
  whatsappNumber?: string;
  onClose: () => void;
  onOrderBike: (bike: Motorcycle) => void;
  onBookTestRide: (bike: Motorcycle) => void;
}

export const MotorcycleDetailModal: React.FC<MotorcycleDetailModalProps> = ({
  open,
  bike,
  selectedColor,
  onSelectColor,
  currency,
  whatsappNumber = '2348000000000',
  onClose,
  onOrderBike,
  onBookTestRide,
}) => {
  const [viewAngle, setViewAngle] = useState<ViewAngle>('side');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (open) {
      setViewAngle('side');
      setImgError(false);
    }
  }, [open, bike?.id]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !bike) return null;

  const isBrandNew = bike.condition === 'Brand New';
  const bikeIsTricycle = isTricycle(bike);
  const isCngFuel = bike.fuelType === 'CNG + Petrol Bi-Fuel';
  const totalUSD = bike.priceUSD + selectedColor.surchargeUSD;
  const totalNGN = bike.priceNGN + selectedColor.surchargeNGN;
  const formattedTotal = formatMoney(totalUSD, totalNGN, currency);

  const whatsappHref = formatWhatsappHref(
    whatsappNumber,
    `Hello Osas Motorcycle, I am interested in the ${
      isBrandNew ? 'Brand New' : 'Foreign Used (Tokunbo)'
    } ${bike.brand} ${bike.model} in ${selectedColor.name} (${formattedTotal}). Is it available for pickup or delivery?`
  );

  const specItems = bikeIsTricycle
    ? [
        {
          label: 'Engine Displacement & Cooling',
          value: bike.specs.engine,
          Icon: Cog,
        },
        {
          label: 'Power & Torque',
          value: bike.specs.powerTorque,
          Icon: Gauge,
        },
        {
          label: 'Fuel System',
          value:
            bike.specs.fuelSystem ?? bike.fuelType ?? bike.specs.fuelTank,
          Icon: Fuel,
        },
        {
          label: 'Transmission',
          value: bike.specs.transmission,
          Icon: Settings2,
        },
        {
          label: 'Capacity / Payload',
          value: bike.specs.capacityPayload ?? bike.specs.weightSeat,
          Icon: Package,
        },
        {
          label: 'Weight / Speed & Status',
          value: `${bike.specs.weightSpeed ?? bike.specs.weightSeat} · 12-Month OEM Warranty`,
          Icon: ShieldCheck,
        },
      ]
    : [
        {
          label: 'Engine Displacement & Type',
          value: bike.specs.engine,
          Icon: Cog,
        },
        {
          label: 'Power & Torque',
          value: bike.specs.powerTorque,
          Icon: Gauge,
        },
        {
          label: 'Transmission & Start System',
          value: bike.specs.transmission,
          Icon: Settings2,
        },
        {
          label: 'Fuel Tank Capacity & Reserve',
          value: bike.specs.fuelTank,
          Icon: Fuel,
        },
        {
          label: 'Kerb Weight / Seat / Clearance',
          value: bike.specs.weightSeat,
          Icon: Scale,
        },
        {
          label: 'Warranty & Showroom Status',
          value: isBrandNew
            ? 'In Stock — 12-Month OEM Warranty · Ready for Pickup or Delivery'
            : 'In Stock — Verified Customs Cleared · 30-Day Engine Guarantee',
          Icon: ShieldCheck,
        },
      ];

  const activeImageSrc =
    viewAngle === 'front' && !bikeIsTricycle
      ? FRONT_CUSTOMIZER_IMAGE
      : bike.image;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/45 backdrop-blur-[3px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${bike.brand} ${bike.model} full specifications`}
    >
      <div
        className="relative w-full max-w-5xl bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border border-black/[0.05] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Bottom-Sheet Handle */}
        <div className="w-10 h-1 rounded-full bg-zinc-300 mx-auto mb-3 sm:hidden" />

        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close motorcycle detail modal"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-10 h-10 rounded-full bg-[#F3F3F5] hover:bg-zinc-200 inline-flex items-center justify-center text-[#18181B] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Visual Stage, Angle Switcher & Color Customizer */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative bg-[#F3F3F5] rounded-2xl p-4 sm:p-6 aspect-[4/3] overflow-hidden flex items-center justify-center">
              {/* Condition, Fuel & Active Color Badges */}
              <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center gap-1.5 pointer-events-none">
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-tight ${
                    isBrandNew
                      ? 'bg-[#18181B] text-white'
                      : 'bg-[#DC2626] text-white'
                  }`}
                >
                  {isBrandNew ? 'Brand New • 0 km' : 'Foreign Used (Tokunbo)'}
                </span>
                {bike.fuelType && (
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      isCngFuel
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-white/95 text-[#18181B] border border-black/[0.06]'
                    }`}
                  >
                    {bike.fuelType}
                  </span>
                )}
                {viewAngle !== '3d' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 border border-black/[0.06] text-[11px] font-semibold text-[#18181B] shadow-xs tabular-nums">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                    <span>
                      {bikeIsTricycle ? 'Canopy / Body' : 'Color'}:{' '}
                      {selectedColor.name} •{' '}
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
                )}
              </div>

              {viewAngle === '3d' && bike.model3dUrl ? (
                <div className="w-full h-full">
                  <Suspense
                    fallback={
                      <div className="w-full h-full rounded-2xl bg-[#F3F3F5] flex flex-col items-center justify-center text-center p-4">
                        <div className="w-9 h-9 rounded-full border-2 border-[#18181B]/20 border-t-[#DC2626] animate-spin mb-2.5" />
                        <p className="text-[12.5px] font-semibold text-[#18181B]">
                          Initializing 3D Studio Viewer...
                        </p>
                      </div>
                    }
                  >
                    <GlbModelViewer
                      url={bike.model3dUrl}
                      fileName={bike.model3dName}
                      heightClass="h-full"
                      selectedColor={selectedColor}
                    />
                  </Suspense>
                </div>
              ) : !imgError ? (
                <PaintedBikeImage
                  src={activeImageSrc}
                  colorImages={viewAngle === 'front' ? undefined : bike.colorImages}
                  selectedColor={selectedColor}
                  alt={`${bike.brand} ${bike.model} ${viewAngle} view in ${selectedColor.name}`}
                  onError={() => setImgError(true)}
                  className="w-full h-full"
                  imgClassName={`${
                    viewAngle === 'cockpit'
                      ? 'scale-[1.75] translate-y-2'
                      : 'scale-100'
                  } ${
                    viewAngle !== 'front' && bike.flipProfile
                      ? '-scale-x-100'
                      : ''
                  }`}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-400">
                  <Bike className="w-14 h-14" strokeWidth={1.3} />
                  <span className="mt-2 text-sm font-medium">
                    {bike.brand} {bike.model}
                  </span>
                </div>
              )}
            </div>

            {/* Angle / View Switcher Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-full bg-[#F3F3F5]">
                {(
                  [
                    { id: 'side', label: 'Side Profile' },
                    { id: 'front', label: 'Front View' },
                    { id: 'cockpit', label: 'Cockpit / Engine' },
                    ...(bike.model3dUrl
                      ? [{ id: '3d' as ViewAngle, label: '3D Model (.glb)' }]
                      : []),
                  ] as Array<{ id: ViewAngle; label: string }>
                ).map((angle) => {
                  const active = viewAngle === angle.id;
                  return (
                    <button
                      key={angle.id}
                      type="button"
                      onClick={() => {
                        setImgError(false);
                        setViewAngle(angle.id);
                      }}
                      className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
                        active
                          ? 'bg-[#18181B] text-white shadow-xs'
                          : 'text-zinc-600 hover:text-[#18181B]'
                      }`}
                    >
                      {angle.id === '3d' && (
                        <Box className="w-3.5 h-3.5 text-[#DC2626]" />
                      )}
                      <span>{angle.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Color Swatches */}
            <div className="p-4 rounded-2xl bg-[#F3F3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[11.5px] font-semibold text-[#71717A]">
                  {bikeIsTricycle
                    ? 'Selected Canopy / Body Color'
                    : 'Selected Trim Color'}
                </div>
                <div className="text-[14px] font-bold text-[#18181B] flex items-center gap-2">
                  <span>{selectedColor.name}</span>
                  <span className="text-[12px] font-semibold text-[#DC2626] tabular-nums">
                    {selectedColor.surchargeNGN === 0
                      ? '(Included)'
                      : `(${formatMoney(
                          selectedColor.surchargeUSD,
                          selectedColor.surchargeNGN,
                          currency,
                          true
                        )})`}
                  </span>
                </div>
              </div>

              <div
                role="radiogroup"
                aria-label="Select motorcycle color trim"
                className="flex items-center gap-2"
              >
                {(bike.colorOptions && bike.colorOptions.length > 0
                  ? bike.colorOptions
                  : COLOR_OPTIONS
                ).map((color) => {
                  const isSelected = color.id === selectedColor.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={color.name}
                      title={color.name}
                      onClick={() => onSelectColor(color)}
                      style={{ backgroundColor: color.hex }}
                      className={`w-7 h-7 rounded-full inline-flex items-center justify-center transition-transform duration-150 cursor-pointer ${
                        color.isLightSwatch ? 'border border-zinc-300' : ''
                      } ${
                        isSelected
                          ? 'scale-110 ring-2 ring-offset-2 ring-[#18181B]'
                          : 'hover:scale-105 opacity-85 hover:opacity-100'
                      }`}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            color.isLightSwatch
                              ? 'text-[#18181B]'
                              : 'text-white'
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

          {/* Right Column: Complete Specs, Pricing & Direct Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between h-full pt-1">
            <div>
              {/* Header */}
              <div className="pr-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[12.5px] font-bold tracking-wide text-[#DC2626]">
                    {bike.brand}
                  </span>
                  <span aria-hidden="true" className="text-zinc-300">
                    ·
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F3F3F5] text-[11px] font-semibold text-[#52525B]">
                    {bike.category}
                  </span>
                </div>

                <h2 className="mt-1.5 text-[26px] sm:text-[32px] font-bold tracking-tight text-[#18181B] leading-tight">
                  {bike.model}
                </h2>
                <p className="mt-1 text-[13.5px] text-[#71717A]">
                  {bike.subtitle}
                </p>

                <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[#18181B] tabular-nums leading-none">
                    {formattedTotal}
                  </span>
                  <span className="text-[12px] text-[#71717A] tabular-nums">
                    Market Range: {bike.marketRangeNGN}
                  </span>
                </div>
              </div>

              {/* Complete 2-Column Specifications Grid */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specItems.map(({ label, value, Icon }) => (
                  <div
                    key={label}
                    className="p-3.5 rounded-2xl bg-[#F3F3F5] border border-black/[0.03]"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#71717A]">
                      <Icon className="w-3.5 h-3.5 text-[#52525B] shrink-0" />
                      <span>{label}</span>
                    </div>
                    <div className="mt-1 text-[13px] font-bold text-[#18181B] leading-snug tabular-nums">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Action Buttons at Bottom */}
            <div className="mt-6 pt-5 border-t border-zinc-100 space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => onOrderBike(bike)}
                  className="flex-1 py-3 px-5 rounded-full bg-[#18181B] text-white text-[13.5px] font-semibold hover:bg-zinc-800 transition-colors cursor-pointer text-center"
                >
                  {bikeIsTricycle ? 'Order Tricycle' : 'Order This Bike'}
                </button>
                <button
                  type="button"
                  onClick={() => onBookTestRide(bike)}
                  className="flex-1 py-3 px-5 rounded-full bg-white text-[#18181B] text-[13.5px] font-semibold border border-[#18181B]/20 hover:bg-zinc-50 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{bikeIsTricycle ? 'Inspect in Showroom' : 'Book Test Ride'}</span>
                </button>
              </div>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-5 rounded-full bg-[#F3F3F5] hover:bg-zinc-200/80 text-[#18181B] text-[13px] font-medium transition-colors inline-flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#DC2626]" />
                <span>Ask on WhatsApp about {bike.brand} {bike.model}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
