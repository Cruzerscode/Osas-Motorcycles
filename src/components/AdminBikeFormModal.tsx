import React, { useEffect, useState } from 'react';
import {
  Box,
  Check,
  Image as ImageIcon,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  BRANDS,
  BikeStockStatus,
  BrandName,
  CATEGORIES,
  COLOR_OPTIONS,
  CategoryName,
  ColorOption,
  ConditionType,
  IMG_COMMUTER_BOXER,
  IMG_COMMUTER_CLASSIC,
  IMG_DISPATCH_DUAL,
  IMG_HONDA_CBR600,
  IMG_LADIES_CUB,
  IMG_SUZUKI_GSXR,
  IMG_YAMAHA_R6,
  Motorcycle,
} from '../data/motorcycles';
import { GlbModelViewer } from './GlbModelViewer';

interface AdminBikeFormModalProps {
  open: boolean;
  initialBike: Motorcycle | null;
  exchangeRateNGN: number;
  onClose: () => void;
  onSave: (bike: Motorcycle) => void;
}

const STUDIO_PRESET_IMAGES = [
  { label: 'Commuter', url: IMG_COMMUTER_BOXER },
  { label: 'Classic CG', url: IMG_COMMUTER_CLASSIC },
  { label: 'Dispatch', url: IMG_DISPATCH_DUAL },
  { label: 'Ladies Cub', url: IMG_LADIES_CUB },
  { label: 'Suzuki 600', url: IMG_SUZUKI_GSXR },
  { label: 'Yamaha R6', url: IMG_YAMAHA_R6 },
  { label: 'Honda CBR', url: IMG_HONDA_CBR600 },
];

const BRAND_LIST = BRANDS.filter((b): b is BrandName => b !== 'All');
const CATEGORY_LIST = CATEGORIES.filter((c): c is CategoryName => c !== 'All');

export const AdminBikeFormModal: React.FC<AdminBikeFormModalProps> = ({
  open,
  initialBike,
  exchangeRateNGN,
  onClose,
  onSave,
}) => {
  const [brand, setBrand] = useState<BrandName>('Bajaj');
  const [model, setModel] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<CategoryName>('Commuter / Commercial');
  const [condition, setCondition] = useState<ConditionType>('Brand New');
  const [stockStatus, setStockStatus] = useState<BikeStockStatus>('In Stock');
  const [priceNGN, setPriceNGN] = useState<string>('1250000');
  const [marketRangeNGN, setMarketRangeNGN] = useState('');
  const [image, setImage] = useState(IMG_COMMUTER_BOXER);
  const [flipProfile, setFlipProfile] = useState(false);

  // 6 Bento Specs
  const [specEngine, setSpecEngine] = useState('102cc • 4-Stroke Air-Cooled');
  const [specPowerTorque, setSpecPowerTorque] = useState('7.7 hp • 8.2 Nm');
  const [specTransmission, setSpecTransmission] = useState(
    '4-Speed Manual • Kick/ES'
  );
  const [specFuelTank, setSpecFuelTank] = useState('11.0 L');
  const [specWeightSeat, setSpecWeightSeat] = useState('109 kg • 785 mm');
  const [specConditionLabel, setSpecConditionLabel] = useState(
    'Brand New • 0 km'
  );

  // 3D GLB / GLTF
  const [model3dUrl, setModel3dUrl] = useState('');
  const [model3dName, setModel3dName] = useState('');
  const [glbHint, setGlbHint] = useState('');

  // Color Swatches & Per-Color Variants
  const [colorOptions, setColorOptions] = useState<ColorOption[]>(COLOR_OPTIONS);
  const [defaultColorId, setDefaultColorId] = useState('crimson-red');
  const [colorImages, setColorImages] = useState<Record<string, string>>({});
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#18181B');
  const [newColorSurcharge, setNewColorSurcharge] = useState('0');

  useEffect(() => {
    if (!open) return;
    setGlbHint('');
    if (initialBike) {
      setBrand(initialBike.brand);
      setModel(initialBike.model);
      setSubtitle(initialBike.subtitle);
      setCategory(initialBike.category);
      setCondition(initialBike.condition);
      setStockStatus(
        initialBike.stockStatus ?? (initialBike.inStock ? 'In Stock' : 'Out of Stock')
      );
      setPriceNGN(String(initialBike.priceNGN));
      setMarketRangeNGN(initialBike.marketRangeNGN);
      setImage(initialBike.image);
      setFlipProfile(Boolean(initialBike.flipProfile));
      setSpecEngine(initialBike.specs.engine);
      setSpecPowerTorque(initialBike.specs.powerTorque);
      setSpecTransmission(initialBike.specs.transmission);
      setSpecFuelTank(initialBike.specs.fuelTank);
      setSpecWeightSeat(initialBike.specs.weightSeat);
      setSpecConditionLabel(initialBike.specs.conditionLabel);
      setModel3dUrl(initialBike.model3dUrl ?? '');
      setModel3dName(initialBike.model3dName ?? '');
      const colors =
        initialBike.colorOptions && initialBike.colorOptions.length > 0
          ? initialBike.colorOptions
          : COLOR_OPTIONS;
      setColorOptions(colors);
      setDefaultColorId(initialBike.defaultColorId || colors[0].id);
      setColorImages(initialBike.colorImages ?? {});
    } else {
      setBrand('Bajaj');
      setModel('');
      setSubtitle('Fuel-efficient Nigerian commuter dynamics');
      setCategory('Commuter / Commercial');
      setCondition('Brand New');
      setStockStatus('In Stock');
      setPriceNGN('1250000');
      setMarketRangeNGN('₦1.18M – ₦1.32M');
      setImage(IMG_COMMUTER_BOXER);
      setFlipProfile(false);
      setSpecEngine('102cc • 4-Stroke Air-Cooled');
      setSpecPowerTorque('7.7 hp • 8.2 Nm');
      setSpecTransmission('4-Speed Manual • Kick/ES');
      setSpecFuelTank('11.0 L');
      setSpecWeightSeat('109 kg • 785 mm');
      setSpecConditionLabel('Brand New • 0 km');
      setModel3dUrl('');
      setModel3dName('');
      setColorOptions(COLOR_OPTIONS);
      setDefaultColorId(COLOR_OPTIONS[0].id);
      setColorImages({});
    }
  }, [open, initialBike]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

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

  const handleGlbUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setModel3dName(file.name);
    if (file.size <= 3.5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setModel3dUrl(reader.result);
          setGlbHint('Saved inside browser storage for refresh persistence.');
        }
      };
      reader.readAsDataURL(file);
    } else {
      const blobUrl = URL.createObjectURL(file);
      setModel3dUrl(blobUrl);
      setGlbHint(
        'Large .glb loaded for this session. For permanent persistence across refreshes, host the .glb URL or use a file under 3.5 MB.'
      );
    }
  };

  const handleUpdateColor = (
    id: string,
    patch: Partial<ColorOption>
  ) => {
    setColorOptions((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextNGN =
          patch.surchargeNGN !== undefined ? patch.surchargeNGN : c.surchargeNGN;
        return {
          ...c,
          ...patch,
          surchargeUSD: Math.round(nextNGN / (exchangeRateNGN || 1520)),
        };
      })
    );
  };

  const handleAddSwatch = () => {
    const cleanName = newColorName.trim();
    if (!cleanName) return;
    const surcharge = Math.max(0, Number(newColorSurcharge) || 0);
    const id = `${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newSwatch: ColorOption = {
      id,
      name: cleanName,
      hex: newColorHex,
      surchargeNGN: surcharge,
      surchargeUSD: Math.round(surcharge / (exchangeRateNGN || 1520)),
      frontFilter: 'none',
      isLightSwatch: newColorHex.toLowerCase() === '#ffffff' || newColorHex.toLowerCase() === '#f4f4f5',
    };
    setColorOptions((prev) => [...prev, newSwatch]);
    setNewColorName('');
    setNewColorSurcharge('0');
  };

  const handleRemoveSwatch = (id: string) => {
    if (colorOptions.length <= 1) return;
    const filtered = colorOptions.filter((c) => c.id !== id);
    setColorOptions(filtered);
    if (defaultColorId === id) {
      setDefaultColorId(filtered[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericNGN = Math.max(0, Number(priceNGN) || 0);
    const rate = exchangeRateNGN || 1520;
    const id =
      initialBike?.id ??
      `${brand.toLowerCase()}-${model.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const cleanedColorImages: Record<string, string> = {};
    Object.entries(colorImages).forEach(([cid, url]) => {
      if (url && url.trim()) cleanedColorImages[cid] = url.trim();
    });

    const bikePayload: Motorcycle = {
      id,
      brand,
      brandTags: initialBike?.brandTags,
      model: model.trim() || 'New Showroom Model',
      subtitle: subtitle.trim() || `${brand} certified machine`,
      category,
      condition,
      priceNGN: numericNGN,
      priceUSD: Math.max(1, Math.round(numericNGN / rate)),
      marketRangeNGN:
        marketRangeNGN.trim() || `₦${numericNGN.toLocaleString('en-US')}`,
      image: image.trim() || IMG_COMMUTER_BOXER,
      flipProfile,
      defaultColorId:
        colorOptions.find((c) => c.id === defaultColorId)?.id ??
        colorOptions[0].id,
      specs: {
        engine: specEngine.trim(),
        powerTorque: specPowerTorque.trim(),
        transmission: specTransmission.trim(),
        fuelTank: specFuelTank.trim(),
        weightSeat: specWeightSeat.trim(),
        conditionLabel:
          specConditionLabel.trim() ||
          (condition === 'Brand New'
            ? 'Brand New • 0 km'
            : 'Foreign Used (Tokunbo)'),
      },
      defaultGearId: initialBike?.defaultGearId ?? 'gear-dot-helmet',
      inStock: stockStatus === 'In Stock',
      stockStatus,
      model3dUrl: model3dUrl.trim() || undefined,
      model3dName: model3dName.trim() || undefined,
      colorOptions,
      colorImages:
        Object.keys(cleanedColorImages).length > 0
          ? cleanedColorImages
          : undefined,
    };

    onSave(bikePayload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={initialBike ? 'Edit Motorcycle' : 'Add New Motorcycle'}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-black/[0.06] max-h-[90vh] flex flex-col overflow-hidden"
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
              Motorcycle Inventory Manager
            </p>
            <h2 className="text-[20px] font-bold text-[#18181B]">
              {initialBike
                ? `Edit ${initialBike.brand} ${initialBike.model}`
                : 'Add New Motorcycle'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close motorcycle form"
            className="w-9 h-9 rounded-full bg-[#F3F3F5] hover:bg-zinc-200 inline-flex items-center justify-center text-[#18181B] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto p-6 space-y-6"
        >
          {/* Basic Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                Brand *
              </label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value as BrandName)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-medium text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              >
                {BRAND_LIST.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                Model Name *
              </label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Boxer BM150"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryName)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-medium text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              >
                {CATEGORY_LIST.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                Condition Badge *
              </label>
              <select
                value={condition}
                onChange={(e) => {
                  const next = e.target.value as ConditionType;
                  setCondition(next);
                  setSpecConditionLabel(
                    next === 'Brand New'
                      ? 'Brand New • 0 km'
                      : 'Foreign Used (Tokunbo)'
                  );
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-medium text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              >
                <option value="Brand New">Brand New</option>
                <option value="Foreign Used (Tokunbo)">
                  Foreign Used (Tokunbo)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                Stock Status *
              </label>
              <select
                value={stockStatus}
                onChange={(e) =>
                  setStockStatus(e.target.value as BikeStockStatus)
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] font-medium text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="SOLD">SOLD</option>
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

            <div className="sm:col-span-2">
              <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                Showroom Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Heavy-duty Nigerian commuter dynamics"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#18181B] mb-1">
                Market Price Range
              </label>
              <input
                type="text"
                value={marketRangeNGN}
                onChange={(e) => setMarketRangeNGN(e.target.value)}
                placeholder="e.g. ₦1.18M – ₦1.32M"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3F3F5] text-[13.5px] text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />
            </div>
          </div>

          {/* 6 Bento Specs */}
          <div className="p-4 rounded-2xl bg-[#F3F3F5]/75 border border-black/[0.04] space-y-3">
            <h3 className="text-[13px] font-bold text-[#18181B]">
              6-Box Bento Technical Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  1. Engine (CC &amp; Cooling)
                </label>
                <input
                  type="text"
                  required
                  value={specEngine}
                  onChange={(e) => setSpecEngine(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white text-[13px] text-[#18181B] border border-black/[0.05] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  2. Power &amp; Torque
                </label>
                <input
                  type="text"
                  required
                  value={specPowerTorque}
                  onChange={(e) => setSpecPowerTorque(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white text-[13px] text-[#18181B] border border-black/[0.05] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  3. Transmission
                </label>
                <input
                  type="text"
                  required
                  value={specTransmission}
                  onChange={(e) => setSpecTransmission(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white text-[13px] text-[#18181B] border border-black/[0.05] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  4. Fuel Tank
                </label>
                <input
                  type="text"
                  required
                  value={specFuelTank}
                  onChange={(e) => setSpecFuelTank(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white text-[13px] text-[#18181B] border border-black/[0.05] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  5. Weight / Seat
                </label>
                <input
                  type="text"
                  required
                  value={specWeightSeat}
                  onChange={(e) => setSpecWeightSeat(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white text-[13px] text-[#18181B] border border-black/[0.05] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                  6. Condition Label
                </label>
                <input
                  type="text"
                  required
                  value={specConditionLabel}
                  onChange={(e) => setSpecConditionLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white text-[13px] text-[#18181B] border border-black/[0.05] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
              </div>
            </div>
          </div>

          {/* Studio Photo & 3D GLB Model Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Photo URL / Upload */}
            <div className="p-4 rounded-2xl bg-[#F3F3F5]/75 border border-black/[0.04] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-[#18181B] inline-flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#DC2626]" />
                  <span>Studio Photo URL or Upload</span>
                </h3>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-black/[0.08] text-[11.5px] font-semibold text-[#18181B] hover:bg-zinc-50 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/src/assets/images/... or https://..."
                className="w-full px-3 py-2 rounded-xl bg-white text-[12.5px] text-[#18181B] border border-black/[0.05] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
              />

              <div className="flex flex-wrap gap-1.5">
                {STUDIO_PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImage(preset.url)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
                      image === preset.url
                        ? 'bg-[#18181B] text-white'
                        : 'bg-white text-zinc-600 hover:text-[#18181B]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-black/[0.04]">
                <img
                  src={image}
                  alt="Preview"
                  className={`h-24 w-40 object-contain ${
                    flipProfile ? '-scale-x-100' : ''
                  }`}
                />
                <label className="inline-flex items-center gap-2 text-[12px] font-medium text-[#18181B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flipProfile}
                    onChange={(e) => setFlipProfile(e.target.checked)}
                    className="rounded accent-[#18181B]"
                  />
                  <span>Mirror Profile</span>
                </label>
              </div>
            </div>

            {/* 3D GLB / GLTF URL or Local Loader */}
            <div className="p-4 rounded-2xl bg-[#F3F3F5]/75 border border-black/[0.04] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-[#18181B] inline-flex items-center gap-1.5">
                  <Box className="w-4 h-4 text-[#DC2626]" />
                  <span>3D .glb / .gltf Model</span>
                </h3>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18181B] text-white text-[11.5px] font-semibold hover:bg-[#DC2626] transition-colors cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Load .glb File</span>
                  <input
                    type="file"
                    accept=".glb,.gltf"
                    onChange={handleGlbUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={model3dUrl}
                  onChange={(e) => {
                    setModel3dUrl(e.target.value);
                    setModel3dName('');
                  }}
                  placeholder="https://.../bike-scan.glb (optional)"
                  className="flex-1 px-3 py-2 rounded-xl bg-white text-[12.5px] text-[#18181B] border border-black/[0.05] focus:outline-none focus:ring-2 focus:ring-[#18181B]"
                />
                {model3dUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setModel3dUrl('');
                      setModel3dName('');
                      setGlbHint('');
                    }}
                    className="px-3 py-2 rounded-xl bg-white text-zinc-600 hover:text-[#DC2626] border border-black/[0.05] text-[12px] font-semibold cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {glbHint && (
                <p className="text-[11px] text-zinc-600">{glbHint}</p>
              )}

              {model3dUrl ? (
                <GlbModelViewer
                  url={model3dUrl}
                  fileName={model3dName || undefined}
                  heightClass="h-44"
                  selectedColor={
                    colorOptions.find((c) => c.id === defaultColorId) ??
                    colorOptions[0]
                  }
                />
              ) : (
                <div className="h-36 rounded-xl bg-white border border-dashed border-zinc-300 flex flex-col items-center justify-center text-center p-4">
                  <Box className="w-6 h-6 text-zinc-400 mb-1.5" />
                  <p className="text-[12px] font-semibold text-zinc-600">
                    No 3D .glb scan attached yet
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Paste a .glb / .gltf URL or load a local .glb file to enable 360° showroom inspection.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customizable Color Swatches + Trim Surcharge */}
          <div className="p-4 rounded-2xl bg-[#F3F3F5]/75 border border-black/[0.04] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[13px] font-bold text-[#18181B]">
                Color Swatches &amp; Trim Surcharge (₦)
              </h3>
              <span className="text-[11px] text-zinc-500">
                Select default swatch &amp; customize surcharge per finish
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {colorOptions.map((c) => {
                const isDefault = defaultColorId === c.id;
                return (
                  <div
                    key={c.id}
                    className={`p-2.5 rounded-xl bg-white border space-y-2 ${
                      isDefault ? 'border-[#18181B]' : 'border-black/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setDefaultColorId(c.id)}
                        title="Set as default color"
                        className={`w-6 h-6 rounded-full shrink-0 inline-flex items-center justify-center border cursor-pointer ${
                          isDefault ? 'ring-2 ring-[#DC2626] ring-offset-1' : 'border-black/15'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {isDefault && (
                          <Check
                            className={`w-3.5 h-3.5 ${
                              c.isLightSwatch ? 'text-[#18181B]' : 'text-white'
                            }`}
                          />
                        )}
                      </button>
                      <input
                        type="color"
                        value={c.hex}
                        onChange={(e) =>
                          handleUpdateColor(c.id, {
                            hex: e.target.value,
                            isLightSwatch:
                              e.target.value.toLowerCase() === '#ffffff',
                          })
                        }
                        aria-label={`Color picker for ${c.name}`}
                        className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
                      />
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) =>
                          handleUpdateColor(c.id, { name: e.target.value })
                        }
                        className="min-w-0 flex-1 px-2 py-1 rounded-lg bg-[#F3F3F5] text-[12px] font-medium text-[#18181B]"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[11px] text-zinc-500">+₦</span>
                        <input
                          type="number"
                          min={0}
                          value={c.surchargeNGN}
                          onChange={(e) =>
                            handleUpdateColor(c.id, {
                              surchargeNGN: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                          className="w-20 px-2 py-1 rounded-lg bg-[#F3F3F5] text-[12px] font-semibold text-[#18181B] tabular-nums"
                        />
                      </div>
                      {colorOptions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSwatch(c.id)}
                          aria-label={`Remove ${c.name}`}
                          className="p-1 text-zinc-400 hover:text-[#DC2626] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={colorImages[c.id] ?? ''}
                      onChange={(e) =>
                        setColorImages((prev) => ({
                          ...prev,
                          [c.id]: e.target.value,
                        }))
                      }
                      placeholder={`Optional ${c.name} photo URL (overrides tint layer)`}
                      className="w-full px-2.5 py-1 rounded-lg bg-[#F3F3F5]/75 text-[11px] text-[#18181B] placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#18181B]"
                    />
                  </div>
                );
              })}
            </div>

            {/* Add custom swatch */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-200/70">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
              />
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="New finish name (e.g. Emerald Green)"
                className="flex-1 min-w-[160px] px-3 py-1.5 rounded-xl bg-white text-[12.5px] text-[#18181B] border border-black/[0.06]"
              />
              <input
                type="number"
                min={0}
                value={newColorSurcharge}
                onChange={(e) => setNewColorSurcharge(e.target.value)}
                placeholder="Surcharge ₦"
                className="w-28 px-3 py-1.5 rounded-xl bg-white text-[12.5px] text-[#18181B] border border-black/[0.06] tabular-nums"
              />
              <button
                type="button"
                onClick={handleAddSwatch}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#18181B] text-white text-[12px] font-semibold hover:bg-zinc-800 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Swatch</span>
              </button>
            </div>
          </div>

          {/* Sticky Footer */}
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
              {initialBike ? 'Save Motorcycle Changes' : 'Publish Motorcycle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
