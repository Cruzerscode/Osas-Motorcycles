import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Wrench,
  X,
} from 'lucide-react';
import { CurrencyCode, formatMoney } from '../data/motorcycles';
import { PartVariant, SparePart } from '../data/spareParts';
import { StudioImage } from './StudioImage';

interface PartDetailModalProps {
  open: boolean;
  part: SparePart | null;
  currency: CurrencyCode;
  onClose: () => void;
  onAddToBag: (
    part: SparePart,
    quantity: number,
    variant?: PartVariant
  ) => void;
}

export const PartDetailModal: React.FC<PartDetailModalProps> = ({
  open,
  part,
  currency,
  onClose,
  onAddToBag,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (open && part) {
      setQuantity(1);
      setSelectedVariantId(part.variants?.[0]?.id ?? null);
      setJustAdded(false);
    }
  }, [open, part]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open || !part) return null;

  const activeVariant =
    part.variants?.find((v) => v.id === selectedVariantId) ??
    part.variants?.[0];
  const unitPriceNGN = activeVariant?.priceNGN ?? part.priceNGN;
  const unitPriceUSD = Math.round(unitPriceNGN / 1520);

  const handleAdd = () => {
    onAddToBag(part, quantity, activeVariant);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/45 backdrop-blur-[3px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${part.name} details`}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl border border-black/[0.05] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Bottom-Sheet Handle */}
        <div className="w-10 h-1 rounded-full bg-zinc-300 mx-auto mb-3 sm:hidden" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close spare part detail modal"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-10 h-10 rounded-full bg-[#F3F3F5] hover:bg-zinc-200 inline-flex items-center justify-center text-[#18181B] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Studio Image + Compatible Models */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl bg-[#F3F3F5] p-4 aspect-[4/3] flex items-center justify-center overflow-hidden">
              <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-[#18181B] text-white text-[10.5px] font-semibold">
                In Stock
              </span>
              <StudioImage
                src={part.image}
                alt={part.name}
                loading="eager"
                fallbackType="part"
                fallbackLabel={part.sku}
                className="w-full h-full"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#F3F3F5]">
              <div className="text-[11.5px] font-semibold text-[#71717A]">
                Compatible Motorcycle Models
              </div>
              <ul className="mt-2 space-y-1.5">
                {part.compatibleModels.map((model) => (
                  <li
                    key={model}
                    className="flex items-center gap-2 text-[12.5px] font-medium text-[#18181B]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                    <span>{model}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: SKU, Specs, Variant Selector, Quantity & Add to Bag */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full">
            <div>
              <div className="pr-10">
                <div className="flex flex-wrap items-center gap-2 text-[12px]">
                  <span className="font-bold text-[#DC2626]">
                    {part.category}
                  </span>
                  <span aria-hidden="true" className="text-zinc-300">
                    ·
                  </span>
                  <span className="font-mono-tabular font-semibold text-[#71717A]">
                    SKU: {part.sku}
                  </span>
                </div>

                <h2 className="mt-1.5 text-[22px] sm:text-[26px] font-bold tracking-tight text-[#18181B] leading-snug">
                  {part.name}
                </h2>
                <p className="mt-2 text-[14px] leading-relaxed text-[#52525B]">
                  {part.details}
                </p>

                <div className="mt-4 text-[28px] font-bold tracking-tight text-[#18181B] tabular-nums">
                  {formatMoney(
                    unitPriceUSD * quantity,
                    unitPriceNGN * quantity,
                    currency
                  )}
                  {quantity > 1 && (
                    <span className="ml-2 text-[13px] font-medium text-[#71717A]">
                      ({formatMoney(unitPriceUSD, unitPriceNGN, currency)} each)
                    </span>
                  )}
                </div>
              </div>

              {/* Variant Selector (if applicable) */}
              {part.variants && part.variants.length > 0 && (
                <div className="mt-4">
                  <div className="text-[11.5px] font-semibold text-[#71717A] mb-1.5">
                    Select Specification / Option
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {part.variants.map((variant) => {
                      const active = variant.id === activeVariant?.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={`px-4 py-2 rounded-full text-[12.5px] font-medium transition-colors cursor-pointer tabular-nums ${
                            active
                              ? 'bg-[#18181B] text-white'
                              : 'bg-[#F3F3F5] text-[#18181B] hover:bg-zinc-200/80'
                          }`}
                        >
                          {variant.label} —{' '}
                          {formatMoney(
                            Math.round(variant.priceNGN / 1520),
                            variant.priceNGN,
                            currency
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Technical Specifications 2-Column Grid */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {part.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="p-3 rounded-2xl bg-[#F3F3F5] border border-black/[0.03]"
                  >
                    <div className="text-[11px] font-medium text-[#71717A]">
                      {spec.label}
                    </div>
                    <div className="mt-0.5 text-[13px] font-bold text-[#18181B]">
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Installation Notes */}
              <div className="mt-4 p-3.5 rounded-2xl bg-[#F3F3F5] flex items-start gap-2.5">
                <Wrench className="w-4 h-4 text-[#DC2626] mt-0.5 shrink-0" />
                <div>
                  <div className="text-[11.5px] font-semibold text-[#18181B]">
                    Workshop Installation Note
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-[#52525B] leading-snug">
                    {part.installationNotes}
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity & Add to Shopping Bag */}
            <div className="mt-6 pt-5 border-t border-zinc-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="inline-flex items-center justify-between sm:justify-center gap-3 px-4 py-2.5 rounded-full bg-[#F3F3F5]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-7 h-7 rounded-full bg-white inline-flex items-center justify-center text-[#18181B] hover:bg-zinc-200 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-[14px] font-bold text-[#18181B] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-7 h-7 rounded-full bg-white inline-flex items-center justify-center text-[#18181B] hover:bg-zinc-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className={`flex-1 py-3 px-6 rounded-full text-[13.5px] font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  justAdded
                    ? 'bg-[#DC2626] text-white'
                    : 'bg-[#18181B] text-white hover:bg-zinc-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {justAdded ? 'Added to Shopping Bag' : 'Add to Shopping Bag'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
