import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import {
  IMG_PART_BODYWORK,
  IMG_PART_BRAKES,
  IMG_PART_ELECTRICAL,
  IMG_PART_ENGINE,
  IMG_PART_SERVICE,
  IMG_PART_TIRES,
  PART_BRAND_FILTERS,
  PART_CATEGORIES,
  PartCategory,
  PartCompatibilityBrand,
  PartStockStatus,
  SparePart,
} from '../data/spareParts';

interface AdminPartFormModalProps {
  open: boolean;
  initialPart: SparePart | null;
  onClose: () => void;
  onSave: (part: SparePart) => void;
}

const PART_CATEGORY_LIST = PART_CATEGORIES.filter(
  (c): c is PartCategory => c !== 'All Parts'
);
const PART_BRAND_LIST = PART_BRAND_FILTERS.filter(
  (b): b is PartCompatibilityBrand => b !== 'All Brands'
);

const PRESET_PART_IMAGES = [
  { label: 'Engine', url: IMG_PART_ENGINE },
  { label: 'Brakes', url: IMG_PART_BRAKES },
  { label: 'Electrical', url: IMG_PART_ELECTRICAL },
  { label: 'Tires', url: IMG_PART_TIRES },
  { label: 'Bodywork', url: IMG_PART_BODYWORK },
  { label: 'Service/Oil', url: IMG_PART_SERVICE },
];

export const AdminPartFormModal: React.FC<AdminPartFormModalProps> = ({
  open,
  initialPart,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<PartCategory>('Engine & Transmission');
  const [fitsSummary, setFitsSummary] = useState('');
  const [compatibleModelsText, setCompatibleModelsText] = useState('');
  const [compatibleBrands, setCompatibleBrands] = useState<
    PartCompatibilityBrand[]
  >(['Bajaj Boxer']);
  const [priceNGN, setPriceNGN] = useState('12500');
  const [stockQuantity, setStockQuantity] = useState('15');
  const [stockStatus, setStockStatus] = useState<PartStockStatus>('In Stock');
  const [image, setImage] = useState(IMG_PART_ENGINE);
  const [details, setDetails] = useState('');
  const [installationNotes, setInstallationNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    if (initialPart) {
      setName(initialPart.name);
      setSku(initialPart.sku);
      setCategory(initialPart.category);
      setFitsSummary(initialPart.fitsSummary);
      setCompatibleModelsText(initialPart.compatibleModels.join(', '));
      setCompatibleBrands(initialPart.compatibleBrands);
      setPriceNGN(String(initialPart.priceNGN));
      const qty = initialPart.stockQuantity ?? (initialPart.inStock ? 15 : 0);
      setStockQuantity(String(qty));
      setStockStatus(
        initialPart.stockStatus ??
          (qty === 0 ? 'Out of Stock' : qty <= 5 ? 'Low Stock' : 'In Stock')
      );
      setImage(initialPart.image);
      setDetails(initialPart.details);
      setInstallationNotes(initialPart.installationNotes);
    } else {
      setName('');
      setSku(`OS-PRT-${Math.floor(100 + Math.random() * 900)}`);
      setCategory('Engine & Transmission');
      setFitsSummary('Bajaj Boxer BM100/150, TVS HLX 125');
      setCompatibleModelsText(
        'Bajaj Boxer BM100, Bajaj Boxer BM150, TVS HLX 125'
      );
      setCompatibleBrands(['Bajaj Boxer', 'TVS HLX / Neo']);
      setPriceNGN('14500');
      setStockQuantity('18');
      setStockStatus('In Stock');
      setImage(IMG_PART_ENGINE);
      setDetails(
        'Genuine OEM-grade replacement component engineered for Nigerian road and fleet durability.'
      );
      setInstallationNotes(
        'Inspect mating surfaces and torque fasteners to factory specification during installation.'
      );
    }
  }, [open, initialPart]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const toggleBrand = (brand: PartCompatibilityBrand) => {
    setCompatibleBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Math.max(0, Number(priceNGN) || 0);
    const numericQty = Math.max(0, Number(stockQuantity) || 0);
    const models = compatibleModelsText
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const payload: SparePart = {
      id:
        initialPart?.id ??
        `part-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`,
      sku: sku.trim() || 'OS-PRT-001',
      name: name.trim() || 'Genuine Spare Part',
      category,
      fitsSummary:
        fitsSummary.trim() ||
        (models.slice(0, 2).join(', ') || 'Universal Motorcycle Fitment'),
      compatibleBrands:
        compatibleBrands.length > 0 ? compatibleBrands : ['Bajaj Boxer'],
      compatibleModels: models.length > 0 ? models : ['Bajaj Boxer BM100/150'],
      priceNGN: numericPrice,
      variants: initialPart?.variants,
      details: details.trim(),
      specs: initialPart?.specs ?? [
        { label: 'SKU / Part Code', value: sku.trim() || 'OS-PRT-001' },
        { label: 'Category', value: category },
        { label: 'Grade', value: 'Genuine Osas OEM Spec' },
        { label: 'Warranty', value: 'Showroom Fitment Guarantee' },
      ],
      installationNotes: installationNotes.trim(),
      image: image.trim() || IMG_PART_ENGINE,
      inStock: stockStatus !== 'Out of Stock' && numericQty > 0,
      stockQuantity: numericQty,
      stockStatus,
    };

    onSave(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={initialPart ? 'Edit Spare Part' : 'Add New Spare Part'}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-black/[0.06] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-10 h-1 bg-zinc-300 rounded-full mx-auto mt-3 sm:hidden shrink-0"
          aria-hidden="true"
        />
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#DC2626]">
              Spare Parts &amp; Gear Manager
            </p>
            <h2 className="text-[20px] font-bold text-[#18181B]">
              {initialPart ? `Edit ${initialPart.name}` : 'Add New Spare Part'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close spare part form"
            className="w-9 h-9 rounded-full bg-[#F3F3F5] hover:bg-zinc-200 inline-flex items-center justify-center text-[#18181B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                Part Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Heavy-Duty Drive Chain & Sprocket Kit"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                SKU / Part Code *
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. OS-ENG-204"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] font-mono text-[13px] text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PartCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-medium text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              >
                {PART_CATEGORY_LIST.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                Price (₦ NGN) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={priceNGN}
                onChange={(e) => setPriceNGN(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-semibold text-[#18181B] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                  Stock Qty *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={stockQuantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStockQuantity(val);
                    const n = Number(val) || 0;
                    if (n === 0) setStockStatus('Out of Stock');
                    else if (n <= 5) setStockStatus('Low Stock');
                    else setStockStatus('In Stock');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-semibold text-[#18181B] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                  Status *
                </label>
                <select
                  value={stockStatus}
                  onChange={(e) =>
                    setStockStatus(e.target.value as PartStockStatus)
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F3F3F5] text-[13px] font-medium text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                Short Compatibility Tag (Card Subtitle)
              </label>
              <input
                type="text"
                value={fitsSummary}
                onChange={(e) => setFitsSummary(e.target.value)}
                placeholder="e.g. Bajaj Boxer BM100/150, TVS HLX 125"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                Compatible Models (Comma-separated)
              </label>
              <input
                type="text"
                value={compatibleModelsText}
                onChange={(e) => setCompatibleModelsText(e.target.value)}
                placeholder="Bajaj Boxer BM100, Bajaj Boxer BM150, TVS HLX 125"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
            </div>
          </div>

          {/* Compatible Brand Filters */}
          <div>
            <span className="block text-[12px] font-semibold text-[#18181B] mb-2">
              Compatible Brand Filter Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {PART_BRAND_LIST.map((b) => {
                const active = compatibleBrands.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBrand(b)}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium cursor-pointer transition-colors ${
                      active
                        ? 'bg-[#18181B] text-white'
                        : 'bg-[#F3F3F5] text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image URL / Upload */}
          <div className="p-4 rounded-2xl bg-[#F3F3F5]/75 border border-black/[0.04] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#18181B] inline-flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#DC2626]" />
                <span>Product Image URL or Upload</span>
              </span>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/[0.08] text-[11.5px] font-semibold text-[#18181B] cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex items-center gap-3">
              <img
                src={image}
                alt="Part preview"
                className="w-16 h-16 rounded-xl bg-white object-contain p-1 border border-black/[0.05] shrink-0"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white text-[12.5px] text-[#18181B] border border-black/[0.05]"
                />
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_PART_IMAGES.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setImage(p.url)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer ${
                        image === p.url
                          ? 'bg-[#18181B] text-white'
                          : 'bg-white text-zinc-600'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details & Installation Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                Technical Details
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13px] text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                Installation Notes
              </label>
              <textarea
                rows={3}
                value={installationNotes}
                onChange={(e) => setInstallationNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13px] text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-[#F3F3F5] hover:bg-zinc-200 text-[#18181B] text-[13px] font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#18181B] hover:bg-[#DC2626] text-white text-[13px] font-semibold transition-colors cursor-pointer"
            >
              {initialPart ? 'Save Part Changes' : 'Publish Spare Part'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
