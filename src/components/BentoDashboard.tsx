import React, { useEffect, useState } from 'react';
import {
  BadgeCheck,
  Bike,
  Check,
  Cog,
  Fuel,
  Gauge,
  Scale,
  Settings2,
} from 'lucide-react';
import {
  COLOR_OPTIONS,
  ColorOption,
  CurrencyCode,
  FRONT_CUSTOMIZER_IMAGE,
  Motorcycle,
  NIGERIAN_RIDER_GEAR,
  RidingGearItem,
  formatMoney,
} from '../data/motorcycles';
import { PaintedBikeImage } from './PaintedBikeImage';
import { StudioImage } from './StudioImage';

interface BentoDashboardProps {
  activeBike: Motorcycle;
  selectedColor: ColorOption;
  onSelectColor: (color: ColorOption) => void;
  currency: CurrencyCode;
  onBuyGear: (gear: RidingGearItem) => void;
  onBrowseSpareParts: () => void;
}

export const BentoDashboard: React.FC<BentoDashboardProps> = ({
  activeBike,
  selectedColor,
  onSelectColor,
  currency,
  onBuyGear,
  onBrowseSpareParts,
}) => {
  const [selectedGearId, setSelectedGearId] = useState<string>(
    activeBike.defaultGearId
  );
  const [frontError, setFrontError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setSelectedGearId(activeBike.defaultGearId);
  }, [activeBike.id, activeBike.defaultGearId]);

  const activeGear =
    NIGERIAN_RIDER_GEAR.find((g) => g.id === selectedGearId) ??
    NIGERIAN_RIDER_GEAR[0];

  const handleBuyGearClick = () => {
    onBuyGear(activeGear);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  const specBoxes = [
    {
      label: 'Engine',
      value: activeBike.specs.engine,
      Icon: Cog,
    },
    {
      label: 'Power',
      value: activeBike.specs.powerTorque,
      Icon: Gauge,
    },
    {
      label: 'Gearbox',
      value: activeBike.specs.transmission,
      Icon: Settings2,
    },
    {
      label: 'Fuel Tank',
      value: activeBike.specs.fuelTank,
      Icon: Fuel,
    },
    {
      label: 'Weight',
      value: activeBike.specs.weightSeat,
      Icon: Scale,
    },
    {
      label: 'Condition',
      value: activeBike.specs.conditionLabel,
      Icon: BadgeCheck,
    },
  ];

  const colorList =
    activeBike.colorOptions && activeBike.colorOptions.length > 0
      ? activeBike.colorOptions
      : COLOR_OPTIONS;

  return (
    <section
      aria-label="Motorcycle Specifications and Configuration"
      className="px-4 sm:px-6 xl:px-8 pb-6 sm:pb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
        {/* Center 6-Box Spec Matrix (2x3 on Mobile, 3x2 on Tablet/Desktop) */}
        <div className="order-1 lg:order-2 md:col-span-2 lg:col-span-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          {specBoxes.map(({ label, value, Icon }) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-3.5 shadow-[0_2px_14px_rgba(0,0,0,0.025)] border border-black/[0.03] flex flex-col items-start md:items-center justify-center text-left md:text-center"
            >
              <Icon
                className="hidden md:block w-4 h-4 text-[#52525B] mb-1 shrink-0"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <div className="text-xs md:order-3 md:mt-0.5 text-zinc-500 leading-tight">
                {label}
              </div>
              <div
                title={value}
                className="mt-1 md:mt-0 text-sm md:text-[12.5px] font-bold text-zinc-900 leading-snug tabular-nums line-clamp-2"
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Left Card: Riding Gear Cross-Sell (Hidden in hero on mobile; moved into Spare Parts & Accessories section below) */}
        <div className="hidden md:flex order-2 lg:order-1 lg:col-span-4 bg-white rounded-3xl p-5 shadow-[0_2px_18px_rgba(0,0,0,0.03)] border border-black/[0.03] flex-col justify-between gap-3">
          {/* Quick Gear Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {NIGERIAN_RIDER_GEAR.map((gear) => {
              const active = gear.id === activeGear.id;
              return (
                <button
                  key={gear.id}
                  type="button"
                  onClick={() => setSelectedGearId(gear.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#18181B] text-white'
                      : 'bg-[#F3F3F5] text-zinc-600 hover:text-[#18181B]'
                  }`}
                >
                  {gear.shortLabel}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 md:gap-4 flex-1">
            <div className="flex items-center md:items-start md:flex-col justify-between gap-3 flex-1 min-w-0">
              <div className="min-w-0">
                <p className="text-[13px] md:text-[13.5px] font-semibold leading-snug text-[#18181B] truncate md:whitespace-normal md:max-w-[185px]">
                  {activeGear.title}
                </p>
                <p className="hidden md:block mt-0.5 text-[11.5px] text-[#71717A] truncate max-w-[185px]">
                  {activeGear.subtitle}
                </p>
                <div className="mt-0.5 md:mt-2 text-[17px] md:text-[22px] font-bold tracking-tight text-[#18181B] tabular-nums">
                  {formatMoney(
                    activeGear.priceUSD,
                    activeGear.priceNGN,
                    currency
                  )}
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-start gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleBuyGearClick}
                  className={`px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[12px] md:text-[13px] font-medium transition-all duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] ${
                    justAdded
                      ? 'bg-[#DC2626] text-white'
                      : 'bg-[#18181B] text-white hover:bg-zinc-800'
                  }`}
                >
                  {justAdded ? 'Added' : 'Buy Now'}
                </button>
                <button
                  type="button"
                  onClick={onBrowseSpareParts}
                  className="hidden md:inline-block text-[11.5px] font-semibold text-[#71717A] hover:text-[#DC2626] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Browse All Spare Parts →
                </button>
              </div>
            </div>

            <div className="w-[56px] h-[56px] md:w-[132px] md:h-[118px] shrink-0 flex items-center justify-center order-first md:order-last">
              <StudioImage
                src={activeGear.image}
                alt={activeGear.title}
                loading="eager"
                fallbackType="gear"
                style={{ filter: activeGear.filterStyle ?? 'none' }}
                className="w-full h-full"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onBrowseSpareParts}
            className="md:hidden text-left text-[11.5px] font-semibold text-[#DC2626] pt-1 border-t border-zinc-100 cursor-pointer"
          >
            Browse All Genuine Spare Parts →
          </button>
        </div>

        {/* Right Card: Interactive Color & Trim Customizer (Desktop & Tablet >= md; mobile uses inline stage swatches) */}
        <div className="hidden md:flex order-3 lg:col-span-4 bg-white rounded-3xl p-5 shadow-[0_2px_18px_rgba(0,0,0,0.03)] border border-black/[0.03] items-stretch justify-between gap-2.5">
          {/* Left Copy & Surcharge */}
          <div className="flex flex-col justify-between min-w-0 flex-1">
            <div>
              <p className="text-[12.5px] leading-[1.45] text-[#52525B]">
                <strong className="font-semibold text-[#18181B]">
                  Your bike, your style
                </strong>{' '}
                — choose the factory colors that define your ride across Nigeria.
              </p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F3F3F5] text-[11px] font-semibold text-[#18181B] max-w-full">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <span className="truncate">
                  Color: {selectedColor.name}
                </span>
              </div>
            </div>

            <div className="mt-3 text-[21px] sm:text-[23px] font-bold tracking-tight text-[#18181B] tabular-nums">
              {selectedColor.surchargeNGN === 0
                ? 'Included'
                : formatMoney(
                    selectedColor.surchargeUSD,
                    selectedColor.surchargeNGN,
                    currency,
                    true
                  )}
            </div>
          </div>

          {/* Center Front-Angle Preview Thumbnail */}
          <div className="w-[100px] sm:w-[114px] h-[142px] shrink-0 flex items-center justify-center overflow-hidden">
            {!frontError ? (
              <PaintedBikeImage
                src={FRONT_CUSTOMIZER_IMAGE}
                colorImages={activeBike.colorImages}
                selectedColor={selectedColor}
                alt={`${activeBike.brand} ${activeBike.model} in ${selectedColor.name}`}
                onError={() => setFrontError(true)}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-[140px] rounded-2xl bg-zinc-100 flex flex-col items-center justify-center text-zinc-400">
                <Bike className="w-8 h-8" />
                <span className="mt-1 text-[10px] font-medium">
                  {selectedColor.name}
                </span>
              </div>
            )}
          </div>

          {/* Far Right Edge: Vertical Color Swatch Dots */}
          <div
            role="radiogroup"
            aria-label="Select motorcycle color trim"
            className="flex flex-col items-center justify-center gap-2 shrink-0 pl-1"
          >
            {colorList.map((color) => {
              const isSelected = color.id === selectedColor.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`${color.name}${
                    color.surchargeNGN > 0
                      ? ` (${formatMoney(
                          color.surchargeUSD,
                          color.surchargeNGN,
                          currency,
                          true
                        )})`
                      : ' (Included)'
                  }`}
                  title={color.name}
                  onClick={() => onSelectColor(color)}
                  style={{ backgroundColor: color.hex }}
                  className={`w-[22px] h-[22px] rounded-full inline-flex items-center justify-center transition-transform duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#18181B] ${
                    color.isLightSwatch ? 'border border-zinc-300' : ''
                  } ${
                    isSelected
                      ? 'scale-110 ring-2 ring-offset-2 ring-[#18181B]/20'
                      : 'hover:scale-105 opacity-90 hover:opacity-100'
                  }`}
                >
                  {isSelected && (
                    <Check
                      className={`w-3 h-3 ${
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
