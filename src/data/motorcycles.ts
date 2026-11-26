export type CurrencyCode = 'NGN' | 'USD';

export type VehicleType = 'motorcycle' | 'tricycle';

export type VehicleSegmentFilter = 'all' | 'motorcycle' | 'tricycle';

export type FuelType = 'Petrol' | 'CNG + Petrol Bi-Fuel' | 'Diesel / CNG';

export type BrandName =
  | 'Bajaj'
  | 'TVS'
  | 'Honda'
  | 'Hero'
  | 'Suzuki'
  | 'Qlink'
  | 'Daylong'
  | 'Haojue'
  | 'Yamaha'
  | 'Piaggio';

export type CategoryName =
  | 'Commuter / Commercial'
  | 'Dispatch / Off-Road'
  | "Ladies' Cubs & Scooters"
  | '600cc Power Bikes'
  | 'Tricycles (Passenger)'
  | 'Tricycles (Heavy-Duty / Cargo)';

export type ConditionType = 'Brand New' | 'Foreign Used (Tokunbo)';

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  surchargeUSD: number;
  surchargeNGN: number;
  frontFilter: string;
  isLightSwatch?: boolean;
}

export interface RidingGearItem {
  id: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  priceUSD: number;
  priceNGN: number;
  image: string;
  filterStyle?: string;
}

export type BikeStockStatus = 'In Stock' | 'Out of Stock' | 'SOLD';

export interface Motorcycle {
  id: string;
  model: string;
  brand: BrandName;
  brandTags?: BrandName[];
  category: CategoryName;
  vehicleType?: VehicleType;
  fuelType?: FuelType;
  condition: ConditionType;
  subtitle: string;
  priceNGN: number;
  priceUSD: number;
  marketRangeNGN: string;
  image: string;
  flipProfile?: boolean;
  defaultColorId: string;
  specs: {
    engine: string;
    powerTorque: string;
    transmission: string;
    fuelTank: string;
    weightSeat: string;
    conditionLabel: string;
    fuelSystem?: string;
    capacityPayload?: string;
    weightSpeed?: string;
  };
  defaultGearId: string;
  inStock: boolean;
  stockStatus?: BikeStockStatus;
  model3dUrl?: string;
  model3dName?: string;
  colorOptions?: ColorOption[];
  colorImages?: Record<string, string>;
}

const NGN_PER_USD = 1520;
const toUSD = (ngn: number) => Math.round(ngn / NGN_PER_USD);

export const IMG_COMMUTER_BOXER =
  '/src/assets/images/bike_commuter_boxer_hlx_1795697079178.jpg';
export const IMG_COMMUTER_CLASSIC =
  '/src/assets/images/bike_commuter_classic_cg_1795697079229.jpg';
export const IMG_DISPATCH_DUAL =
  '/src/assets/images/bike_dispatch_dual_sport_1795697080981.jpg';
export const IMG_LADIES_CUB =
  '/src/assets/images/bike_ladies_cub_scooter_1795697080780.jpg';
export const IMG_SUZUKI_GSXR =
  '/src/assets/images/bike_suzuki_gsxr600_1795697081571.jpg';
export const IMG_YAMAHA_R6 =
  '/src/assets/images/bike_yamaha_yzf_r1_1795695275648.jpg';
export const IMG_HONDA_CBR600 =
  '/src/assets/images/bike_honda_cbr1000rrr_1795695278139.jpg';

export const IMG_TRICYCLE_TVS_KING =
  '/src/assets/images/tricycle_tvs_king_1795714298371.jpg';
export const IMG_TRICYCLE_BAJAJ_RE =
  '/src/assets/images/tricycle_bajaj_re_1795714299300.jpg';
export const IMG_TRICYCLE_PIAGGIO_CITY =
  '/src/assets/images/tricycle_piaggio_city_1795714300001.jpg';
export const IMG_TRICYCLE_PIAGGIO_CARGO =
  '/src/assets/images/tricycle_piaggio_cargo_1795714299500.jpg';
export const IMG_TRICYCLE_DAYLONG_CARGO =
  '/src/assets/images/tricycle_daylong_cargo_1795714300372.jpg';

export const FRONT_CUSTOMIZER_IMAGE =
  '/src/assets/images/bike_front_customizer_1795695279604.jpg';

const HELMET_IMAGE =
  '/src/assets/images/gear_racing_helmet_1795695279367.jpg';
const DISPATCH_BOX_GLOVES_IMAGE =
  '/src/assets/images/gear_dispatch_box_gloves_1795697079860.jpg';

export const NIGERIAN_RIDER_GEAR: RidingGearItem[] = [
  {
    id: 'gear-dot-helmet',
    shortLabel: 'DOT Helmet',
    title: 'DOT Full-Face Helmet',
    subtitle: 'Ventilated ABS Shell · Tinted Visor',
    priceNGN: 45000,
    priceUSD: toUSD(45000),
    image: HELMET_IMAGE,
  },
  {
    id: 'gear-dispatch-box',
    shortLabel: 'Dispatch Box',
    title: 'Heavy-Duty Dispatch Delivery Box',
    subtitle: 'Waterproof Lockable Carrier · 55L',
    priceNGN: 65000,
    priceUSD: toUSD(65000),
    image: DISPATCH_BOX_GLOVES_IMAGE,
  },
  {
    id: 'gear-armored-gloves',
    shortLabel: 'Riding Gloves',
    title: 'Armored Riding Gloves',
    subtitle: 'Carbon Knuckle Guard · Touchscreen',
    priceNGN: 18000,
    priceUSD: toUSD(18000),
    image: DISPATCH_BOX_GLOVES_IMAGE,
  },
];

export const COLOR_OPTIONS: ColorOption[] = [
  {
    id: 'crimson-red',
    name: 'Racing Red',
    hex: '#DC2626',
    surchargeNGN: 0,
    surchargeUSD: 0,
    frontFilter: 'hue-rotate(-42deg) saturate(1.35) brightness(0.92)',
  },
  {
    id: 'sunburst-yellow',
    name: 'Sport Yellow',
    hex: '#EAB308',
    surchargeNGN: 25000,
    surchargeUSD: toUSD(25000),
    frontFilter: 'hue-rotate(0deg) saturate(1.05) brightness(1)',
  },
  {
    id: 'navy-blue',
    name: 'Royal Blue',
    hex: '#1E3A8A',
    surchargeNGN: 35000,
    surchargeUSD: toUSD(35000),
    frontFilter: 'hue-rotate(175deg) saturate(1.15) brightness(0.84)',
  },
  {
    id: 'emerald-green',
    name: 'Emerald Green',
    hex: '#059669',
    surchargeNGN: 40000,
    surchargeUSD: toUSD(40000),
    frontFilter: 'hue-rotate(92deg) saturate(1.12) brightness(0.92)',
  },
  {
    id: 'matte-white',
    name: 'Pearl White',
    hex: '#E4E4E7',
    surchargeNGN: 45000,
    surchargeUSD: toUSD(45000),
    frontFilter: 'saturate(0.08) brightness(1.12) contrast(1.04)',
    isLightSwatch: true,
  },
  {
    id: 'obsidian-black',
    name: 'Matte Black',
    hex: '#18181B',
    surchargeNGN: 55000,
    surchargeUSD: toUSD(55000),
    frontFilter: 'saturate(0.15) brightness(0.68) contrast(1.18)',
  },
];

export const TRICYCLE_COLOR_OPTIONS: ColorOption[] = [
  {
    id: 'tricycle-yellow',
    name: 'Commercial Yellow',
    hex: '#EAB308',
    surchargeNGN: 0,
    surchargeUSD: 0,
    frontFilter: 'hue-rotate(0deg) saturate(1.05) brightness(1)',
  },
  {
    id: 'tricycle-blue',
    name: 'Royal Blue',
    hex: '#1E3A8A',
    surchargeNGN: 35000,
    surchargeUSD: toUSD(35000),
    frontFilter: 'hue-rotate(175deg) saturate(1.15) brightness(0.84)',
  },
  {
    id: 'tricycle-green',
    name: 'Emerald Green',
    hex: '#059669',
    surchargeNGN: 40000,
    surchargeUSD: toUSD(40000),
    frontFilter: 'hue-rotate(92deg) saturate(1.12) brightness(0.92)',
  },
  {
    id: 'tricycle-red',
    name: 'Racing Red',
    hex: '#DC2626',
    surchargeNGN: 25000,
    surchargeUSD: toUSD(25000),
    frontFilter: 'hue-rotate(-42deg) saturate(1.35) brightness(0.92)',
  },
  {
    id: 'tricycle-white',
    name: 'Pure White',
    hex: '#E4E4E7',
    surchargeNGN: 45000,
    surchargeUSD: toUSD(45000),
    frontFilter: 'saturate(0.08) brightness(1.12) contrast(1.04)',
    isLightSwatch: true,
  },
];

export const BRANDS: Array<'All' | BrandName> = [
  'All',
  'Bajaj',
  'TVS',
  'Piaggio',
  'Honda',
  'Hero',
  'Suzuki',
  'Qlink',
  'Daylong',
  'Haojue',
  'Yamaha',
];

export const CATEGORIES: Array<'All' | CategoryName> = [
  'All',
  'Commuter / Commercial',
  'Dispatch / Off-Road',
  "Ladies' Cubs & Scooters",
  '600cc Power Bikes',
  'Tricycles (Passenger)',
  'Tricycles (Heavy-Duty / Cargo)',
];

export const MOTORCYCLES: Motorcycle[] = [
  {
    id: 'bajaj-boxer-bm100',
    model: 'Boxer BM100',
    brand: 'Bajaj',
    category: 'Commuter / Commercial',
    condition: 'Brand New',
    subtitle: 'Rugged everyday Nigerian commercial & commuter workhorse',
    priceNGN: 1240000,
    priceUSD: toUSD(1240000),
    marketRangeNGN: '₦1,180,000 – ₦1,300,000',
    image: IMG_COMMUTER_BOXER,
    defaultColorId: 'crimson-red',
    specs: {
      engine: '99.27 cc 4-Stroke',
      powerTorque: '8.2 PS / 8.05 Nm',
      transmission: '4-Speed Manual (Kick/ES)',
      fuelTank: '9.3 L Tank',
      weightSeat: '109 kg',
      conditionLabel: 'Brand New',
    },
    defaultGearId: 'gear-dot-helmet',
    inStock: true,
  },
  {
    id: 'bajaj-boxer-bm150',
    model: 'Boxer BM150 / BM150 X',
    brand: 'Bajaj',
    category: 'Commuter / Commercial',
    condition: 'Brand New',
    subtitle: 'High-clearance heavy-duty commercial commuter',
    priceNGN: 1620000,
    priceUSD: toUSD(1620000),
    marketRangeNGN: '₦1,450,000 – ₦1,800,000',
    image: IMG_COMMUTER_BOXER,
    defaultColorId: 'crimson-red',
    specs: {
      engine: '144.8 cc 4-Stroke',
      powerTorque: '12 PS / 12.55 Nm',
      transmission: '5-Speed Manual (ES/Kick)',
      fuelTank: '11 L Tank',
      weightSeat: '125 kg (190mm clearance)',
      conditionLabel: 'Brand New',
    },
    defaultGearId: 'gear-dispatch-box',
    inStock: true,
  },
  {
    id: 'tvs-hlx-100-plus',
    model: 'HLX 100 Plus',
    brand: 'TVS',
    category: 'Commuter / Commercial',
    condition: 'Brand New',
    subtitle: 'Fuel-sipping commuter built for daily city mileage',
    priceNGN: 1275000,
    priceUSD: toUSD(1275000),
    marketRangeNGN: '₦1,200,000 – ₦1,350,000',
    image: IMG_COMMUTER_BOXER,
    defaultColorId: 'crimson-red',
    specs: {
      engine: '99.7 cc 4-Stroke',
      powerTorque: '5.53 kW / 8.2 Nm',
      transmission: '4-Speed Manual',
      fuelTank: '12 L Tank',
      weightSeat: '106 kg',
      conditionLabel: 'Brand New',
    },
    defaultGearId: 'gear-dot-helmet',
    inStock: true,
  },
  {
    id: 'tvs-hlx-125',
    model: 'HLX 125 (5G / ES)',
    brand: 'TVS',
    category: 'Commuter / Commercial',
    condition: 'Brand New',
    subtitle: '5-speed commercial durability with electric start',
    priceNGN: 1550000,
    priceUSD: toUSD(1550000),
    marketRangeNGN: '₦1,450,000 – ₦1,650,000',
    image: IMG_COMMUTER_BOXER,
    defaultColorId: 'obsidian-black',
    specs: {
      engine: '124.53 cc 4-Stroke',
      powerTorque: '8.1 kW / 10.8 Nm',
      transmission: '5-Speed Manual',
      fuelTank: '11.5 L Tank',
      weightSeat: '112 kg',
      conditionLabel: 'Brand New',
    },
    defaultGearId: 'gear-dispatch-box',
    inStock: true,
  },
  {
    id: 'tvs-hlx-150',
    model: 'HLX 150 (5G / X)',
    brand: 'TVS',
    category: 'Commuter / Commercial',
    condition: 'Brand New',
    subtitle: 'High-torque 150cc flagship commuter & fleet bike',
    priceNGN: 1680000,
    priceUSD: toUSD(1680000),
    marketRangeNGN: '₦1,600,000 – ₦1,750,000',
    image: IMG_COMMUTER_BOXER,
    defaultColorId: 'crimson-red',
    specs: {
      engine: '147.49 cc 4-Stroke',
      powerTorque: '12 hp / 12.3 Nm',
      transmission: '5-Speed Manual',
      fuelTank: '12 L Tank',
      weightSeat: 'Front Disc/Drum',
      conditionLabel: 'Brand New',
    },
    defaultGearId: 'gear-dispatch-box',
    inStock: true,
  },
  {
    id: 'honda-cg125',
    model: 'CG125',
    brand: 'Honda',
    category: 'Commuter / Commercial',
    condition: 'Brand New',
    subtitle: 'Iconic OHV Japanese reliability & chrome classic finish',
    priceNGN: 2100000,
    priceUSD: toUSD(2100000),
    marketRangeNGN: '₦1,700,000 – ₦2,500,000',
    image: IMG_COMMUTER_CLASSIC,
    defaultColorId: 'obsidian-black',
    specs: {
      engine: '124.1 cc OHV Air-Cooled',
      powerTorque: '11 hp',
      transmission: '5-Speed Manual (Kick/ES)',
      fuelTank: '9.2 L Tank',
      weightSeat: '100 kg',
      conditionLabel: 'Brand New',
    },
    defaultGearId: 'gear-dot-helmet',
    inStock: true,
  },
  {
    id: 'honda-ace-125',
    model: 'Ace 125',
    brand: 'Honda',
    category: 'Commuter / Commercial',
    condition: 'Brand New',
    subtitle: 'Purpose-built African road commuter with low seat height',
    priceNGN: 1850000,
    priceUSD: toUSD(1850000),
    marketRangeNGN: '₦1,750,000 – ₦1,950,000',
    image: IMG_COMMUTER_CLASSIC,
    defaultColorId: 'crimson-red',
    specs: {
      engine: '124.1 cc Single-Cylinder',
      powerTorque: '9.5 hp',
      transmission: '4-Speed Manual (Kick/ES)',
      fuelTank: '10 L Tank',
      weightSeat: '790mm Seat',
      conditionLabel: 'Brand New',
    },
    defaultGearId: 'gear-dot-helmet',
    inStock: true,
  },
  {
    id: 'hero-hunter-100',
    model: 'Hunter 100',
    brand: 'Hero',
    category: 'Commuter / Commercial',
    condition: 'Brand New',
    subtitle: 'Reinforced heavy rear carrier & ultra-low maintenance',
    priceNGN: 925000,
    priceUSD: toUSD(925000),
    marketRangeNGN: '₦850,000 – ₦1,000,000',
    image: IMG_COMMUTER_BOXER,
    defaultColorId: 'crimson-red',
    specs: {
      engine: '97.2 cc 4-Stroke OHC',
      powerTorque: '7.7 bhp / 8.04 Nm',
      transmission: '4-Speed Manual',
      fuelTank: '9.5 L Tank',
      weightSeat: 'Heavy Rear Carrier',
      conditionLabel: 'Brand New',
    },
    defaultGearId: 'gear-dispatch-box',
    inStock: true,
  },
  {
    id: 'hero-hunter-125',
    model: 'Hunter 125',
    brand: 'Hero',
    category: 'Commuter / Commercial',
    condition: 'Brand New',
    subtitle: 'Extended 12.5L range commuter for commercial riders',
    priceNGN: 1150000,
    priceUSD: toUSD(1150000),
    marketRangeNGN: '₦1,050,000 – ₦1,250,000',
    image: IMG_COMMUTER_BOXER,
    defaultColorId: 'obsidian-black',
    specs: {
      engine: '124.7 cc OHC',
      powerTorque: '9 bhp / 10.35 Nm',
      transmission: '4-Speed Manual',
      fuelTank: '12.5 L Tank',
      weightSeat: '119 kg',
      conditionLabel: 'Brand New',
    },
    defaultGearId: 'gear-armored-gloves',
    inStock: true,
  },
  {
    id: 'suzuki-ax100',
    model: 'AX100',
    brand: 'Suzuki',
    category: 'Commuter / Commercial',
    condition: 'Foreign Used (Tokunbo)',
    subtitle: 'Verified Foreign Used classic 2-stroke commuter',
    priceNGN: 450000,
    priceUSD: toUSD(450000),
    marketRangeNGN: '₦350,000 – ₦550,000',
    image: IMG_COMMUTER_CLASSIC,
    defaultColorId: 'obsidian-black',
    specs: {
      engine: '98 cc 2-Stroke Air-Cooled',
      powerTorque: '8 PS @ 5,500 rpm',
      transmission: '4-Speed Constant Mesh',
      fuelTank: '12 L Tank',
      weightSeat: '85 km/h Top Speed',
      conditionLabel: 'Foreign Used (Tokunbo)',
    },
    defaultGearId: 'gear-dot-helmet',
    inStock: true,
  },
  {
    id: 'suzuki-gn125',
    model: 'GN125',
    brand: 'Suzuki',
    category: 'Commuter / Commercial',
    condition: 'Foreign Used (Tokunbo)',
    subtitle: 'Verified Foreign Used classic OHC cruiser commuter',
    priceNGN: 900000,
    priceUSD: toUSD(900000),
    marketRangeNGN: '₦700,000 – ₦1,100,000',
    image: IMG_COMMUTER_CLASSIC,
    defaultColorId: 'obsidian-black',
    specs: {
      engine: '124 cc 4-Stroke OHC',
      powerTorque: '12.5 PS / 9.8 Nm',
      transmission: '5-Speed Manual (ES)',
      fuelTank: '10 L Tank',
      weightSeat: '107 kg',
      conditionLabel: 'Foreign Used (Tokunbo)',
    },
    defaultGearId: 'gear-dot-helmet',
    inStock: true,
  },
  {
    id: 'suzuki-ax4-gd110',
    model: 'AX4 / GD110',
    brand: 'Suzuki',
    category: 'Commuter / Commercial',
    condition: 'Brand New',
    subtitle: 'Japanese-engineered fuel economy & smooth shifting',
    priceNGN: 1480000,
    priceUSD: toUSD(1480000),
    marketRangeNGN: '₦1,300,000 – ₦1,650,000',
    image: IMG_COMMUTER_CLASSIC,
    defaultColorId: 'navy-blue',
    specs: {
      engine: '113–149.5 cc 4-Stroke',
      powerTorque: '8–11 hp / 11.5 Nm',
      transmission: '4/5-Speed Manual',
      fuelTank: '12.5 L Tank',
      weightSeat: '108 kg',
      conditionLabel: 'Brand New',
    },
    defaultGearId: 'gear-dot-helmet',
    inStock: true,
  },
  {
    id: 'qlink-xp200-legend250',
    model: 'XP 200 & Legend 250',
    brand: 'Qlink',
    category: 'Dispatch / Off-Road',
    condition: 'Brand New',
    subtitle: 'All-terrain logistics & corporate dispatch powerhouse',
    priceNGN: 1290000,
    priceUSD: toUSD(1290000),
    marketRangeNGN: '₦1,175,000 – ₦1,400,000',
    image: IMG_DISPATCH_DUAL,
    defaultColorId: 'crimson-red',
    specs: {
      engine: '200 cc 4-Stroke Single',
      powerTorque: '14.7 hp',
      transmission: '5-Speed Manual (ES/Kick)',
      fuelTank: '11 L Tank',
      weightSeat: 'Dispatch Chassis',
      conditionLabel: 'Brand New',
    },
    defaultGearId: 'gear-dispatch-box',
    inStock: true,
  },
  {
    id: 'qlink-xf200-commuter250',
    model: 'XF 200 & Commuter 250',
    brand: 'Qlink',
    category: 'Dispatch / Off-Road',
    condition: 'Brand New',
    subtitle: 'Dual-sport suspension for rough roads & express delivery',
    priceNGN: 1450000,
    priceUSD: toUSD(1450000),
    marketRangeNGN: '₦1,300,000 – ₦1,600,000',
    image: IMG_DISPATCH_DUAL,
    defaultColorId: 'obsidian-black',
    specs: {
      engine: '199–244 cc 4-Stroke',
      powerTorque: '15.4–18 hp',
      transmission: '5-Speed Manual',
      fuelTank: '12 L Tank',
      weightSeat: 'Dual-Sport',
      conditionLabel: 'Brand New',
    },
    defaultGearId: 'gear-dispatch-box',
    inStock: true,
  },
  {
    id: 'daylong-dl125-1',
    model: 'DL125-1',
    brand: 'Daylong',
    category: 'Commuter / Commercial',
    condition: 'Brand New',
    subtitle: 'Lightweight 130kg-payload urban commuter bike',
    priceNGN: 1050000,
    priceUSD: toUSD(1050000),
    marketRangeNGN: '₦950,000 – ₦1,150,000',
    image: IMG_COMMUTER_BOXER,
    defaultColorId: 'crimson-red',
    specs: {
      engine: '125 cc 4-Stroke',
      powerTorque: '10.5 hp / 9.0 Nm',
      transmission: '5-Speed Manual',
      fuelTank: '10 L Tank',
      weightSeat: '103 kg (130kg load)',
      conditionLabel: 'Brand New',
    },
    defaultGearId: 'gear-armored-gloves',
    inStock: true,
  },
  {
    id: 'daylong-dl200-30',
    model: 'DL200-30',
    brand: 'Daylong',
    category: 'Dispatch / Off-Road',
    condition: 'Brand New',
    subtitle: '200cc air-cooled dual-sport built for Nigerian terrain',
    priceNGN: 1225000,
    priceUSD: toUSD(1225000),
    marketRangeNGN: '₦1,150,000 – ₦1,300,000',
    image: IMG_DISPATCH_DUAL,
    defaultColorId: 'crimson-red',
    specs: {
      engine: '200 cc 4-Stroke Air-Cooled',
      powerTorque: '14.5 hp',
      transmission: '5-Speed Manual (ES/Kick)',
      fuelTank: '12 L Tank',
      weightSeat: '122 kg',
      conditionLabel: 'Brand New',
    },
    defaultGearId: 'gear-dispatch-box',
    inStock: true,
  },
  {
    id: 'suzuki-gsxr600',
    model: 'GSX-R600',
    brand: 'Suzuki',
    category: '600cc Power Bikes',
    condition: 'Foreign Used (Tokunbo)',
    subtitle: 'Imported Foreign Used 600cc inline-four supersport',
    priceNGN: 4000000,
    priceUSD: toUSD(4000000),
    marketRangeNGN: '₦2,500,000 – ₦5,500,000',
    image: IMG_SUZUKI_GSXR,
    defaultColorId: 'navy-blue',
    specs: {
      engine: '599 cc Liquid-Cooled Inline-4',
      powerTorque: '124 hp / 69.6 Nm',
      transmission: '6-Speed Chain Drive',
      fuelTank: '17 L Tank',
      weightSeat: '193 kg wet',
      conditionLabel: 'Foreign Used (Tokunbo)',
    },
    defaultGearId: 'gear-dot-helmet',
    inStock: true,
  },
  {
    id: 'yamaha-yzf-r6',
    model: 'YZF-R6',
    brand: 'Yamaha',
    category: '600cc Power Bikes',
    condition: 'Foreign Used (Tokunbo)',
    subtitle: 'Imported Foreign Used high-revving 600cc track machine',
    priceNGN: 4350000,
    priceUSD: toUSD(4350000),
    marketRangeNGN: '₦2,500,000 – ₦6,200,000',
    image: IMG_YAMAHA_R6,
    defaultColorId: 'navy-blue',
    specs: {
      engine: '599 cc Liquid-Cooled Inline-4',
      powerTorque: '123 hp / 68.5 Nm',
      transmission: '6-Speed Manual',
      fuelTank: '17 L Tank',
      weightSeat: '162 kg dry',
      conditionLabel: 'Foreign Used (Tokunbo)',
    },
    defaultGearId: 'gear-dot-helmet',
    inStock: true,
  },
  {
    id: 'honda-cbr600rr',
    model: 'CBR600RR',
    brand: 'Honda',
    category: '600cc Power Bikes',
    condition: 'Foreign Used (Tokunbo)',
    subtitle: 'Imported Foreign Used MotoGP-inspired 600cc superbike',
    priceNGN: 4150000,
    priceUSD: toUSD(4150000),
    marketRangeNGN: '₦2,500,000 – ₦5,800,000',
    image: IMG_HONDA_CBR600,
    flipProfile: true,
    defaultColorId: 'crimson-red',
    specs: {
      engine: '599 cc Liquid-Cooled Inline-4',
      powerTorque: '119 hp / 63 Nm',
      transmission: '6-Speed Manual',
      fuelTank: '18 L Tank',
      weightSeat: '182 kg dry',
      conditionLabel: 'Foreign Used (Tokunbo)',
    },
    defaultGearId: 'gear-dot-helmet',
    inStock: true,
  },
  {
    id: 'daylong-haojue-110-cub',
    model: 'DL110-2 / Dilo & HJ110 / UD110',
    brand: 'Haojue',
    brandTags: ['Daylong', 'Haojue'],
    category: "Ladies' Cubs & Scooters",
    condition: 'Brand New',
    subtitle: 'Easy step-through frame with front basket mount & semi-auto clutch',
    priceNGN: 1050000,
    priceUSD: toUSD(1050000),
    marketRangeNGN: '₦850,000 – ₦1,200,000',
    image: IMG_LADIES_CUB,
    defaultColorId: 'matte-white',
    specs: {
      engine: '110 cc 4-Stroke Step-Through',
      powerTorque: '7.4 kW / 6.9 Nm',
      transmission: '4-Speed Semi-Auto',
      fuelTank: '4.5 L Tank',
      weightSeat: '95 kg (Basket Mount)',
      conditionLabel: 'Brand New',
    },
    defaultGearId: 'gear-armored-gloves',
    inStock: true,
  },
  {
    id: 'tvs-neo-nx-ntorq-125',
    model: 'Neo NX 110 & Ntorq 125',
    brand: 'TVS',
    category: "Ladies' Cubs & Scooters",
    condition: 'Brand New',
    subtitle: 'Modern automatic & semi-auto urban scooter with USB charger',
    priceNGN: 1300000,
    priceUSD: toUSD(1300000),
    marketRangeNGN: 'Neo NX: ₦1.15M–₦1.45M / Ntorq 125: ₦1.55M–₦1.85M',
    image: IMG_LADIES_CUB,
    defaultColorId: 'crimson-red',
    specs: {
      engine: '109.7–124.8 cc 4-Stroke',
      powerTorque: '8.5–9.4 hp',
      transmission: '4-Speed Semi-Auto / CVT',
      fuelTank: '5.8 L Tank',
      weightSeat: 'USB + Front Disc',
      conditionLabel: 'Brand New',
    },
    defaultGearId: 'gear-dot-helmet',
    inStock: true,
  },
  {
    id: 'tvs-king-deluxe-petrol',
    model: 'King Deluxe / Deluxe Plus (Petrol)',
    brand: 'TVS',
    category: 'Tricycles (Passenger)',
    vehicleType: 'tricycle',
    fuelType: 'Petrol',
    condition: 'Brand New',
    subtitle: 'Nigeria’s #1 liquid-cooled commercial passenger keke napep',
    priceNGN: 4600841,
    priceUSD: toUSD(4600841),
    marketRangeNGN: '₦4,600,841 (Brand New)',
    image: IMG_TRICYCLE_TVS_KING,
    defaultColorId: 'tricycle-yellow',
    colorOptions: TRICYCLE_COLOR_OPTIONS,
    specs: {
      engine: '199.26 cc 4-Stroke Liquid-Cooled',
      powerTorque: '7.5 kW (10.1 hp) / 15.5 Nm',
      transmission: '4-Forward + 1-Reverse (Electric & Hand Start)',
      fuelTank: 'Petrol',
      weightSeat: '4-Seater Passenger · 347 kg • 65 km/h',
      conditionLabel: 'Brand New • 0 km',
      fuelSystem: 'Petrol',
      capacityPayload: '4-Seater Passenger',
      weightSpeed: '347 kg • 65 km/h',
    },
    defaultGearId: 'gear-armored-gloves',
    inStock: true,
  },
  {
    id: 'tvs-king-deluxe-cng',
    model: 'King Deluxe CNG (Factory-Fitted)',
    brand: 'TVS',
    category: 'Tricycles (Passenger)',
    vehicleType: 'tricycle',
    fuelType: 'CNG + Petrol Bi-Fuel',
    condition: 'Brand New',
    subtitle: 'Factory-fitted CNG + Petrol bi-fuel passenger keke for maximum fleet savings',
    priceNGN: 5017696,
    priceUSD: toUSD(5017696),
    marketRangeNGN: '₦5,017,696 (Brand New)',
    image: IMG_TRICYCLE_TVS_KING,
    defaultColorId: 'tricycle-green',
    colorOptions: TRICYCLE_COLOR_OPTIONS,
    specs: {
      engine: '199.26 cc 4-Stroke Liquid-Cooled',
      powerTorque: '6.3 kW (8.4 hp) CNG Mode',
      transmission: '4-Forward + 1-Reverse',
      fuelTank: 'Factory CNG + Petrol',
      weightSeat: '4-Seater Passenger · 405 kg Kerb Weight',
      conditionLabel: 'Brand New • 0 km',
      fuelSystem: 'Factory CNG + Petrol',
      capacityPayload: '4-Seater Passenger',
      weightSpeed: '405 kg Kerb Weight',
    },
    defaultGearId: 'gear-armored-gloves',
    inStock: true,
  },
  {
    id: 'tvs-king-duramax-cargo',
    model: 'King Duramax Plus / Kargo 225',
    brand: 'TVS',
    category: 'Tricycles (Heavy-Duty / Cargo)',
    vehicleType: 'tricycle',
    fuelType: 'Petrol',
    condition: 'Brand New',
    subtitle: '225cc reinforced-chassis commercial & cargo workhorse',
    priceNGN: 4900000,
    priceUSD: toUSD(4900000),
    marketRangeNGN: '₦4,700,000 – ₦5,100,000',
    image: IMG_TRICYCLE_PIAGGIO_CARGO,
    defaultColorId: 'tricycle-white',
    colorOptions: TRICYCLE_COLOR_OPTIONS,
    specs: {
      engine: '225.8 cc 4-Stroke Liquid-Cooled',
      powerTorque: '8.1 kW / 18 Nm @ 2,750 rpm',
      transmission: '4-Forward + 1-Reverse',
      fuelTank: 'Petrol',
      weightSeat: 'Heavy-Duty Commercial · Reinforced Chassis',
      conditionLabel: 'Brand New • 0 km',
      fuelSystem: 'Petrol',
      capacityPayload: 'Heavy-Duty Commercial',
      weightSpeed: 'Reinforced Chassis',
    },
    defaultGearId: 'gear-armored-gloves',
    inStock: true,
  },
  {
    id: 'bajaj-re-4s-xl-petrol',
    model: 'RE 4S / RE XL (Petrol)',
    brand: 'Bajaj',
    category: 'Tricycles (Passenger)',
    vehicleType: 'tricycle',
    fuelType: 'Petrol',
    condition: 'Brand New',
    subtitle: 'Extended XL cabin comfort with rugged Bajaj DTS-i reliability',
    priceNGN: 4150000,
    priceUSD: toUSD(4150000),
    marketRangeNGN: '₦3,800,000 – ₦4,420,000',
    image: IMG_TRICYCLE_BAJAJ_RE,
    defaultColorId: 'tricycle-red',
    colorOptions: TRICYCLE_COLOR_OPTIONS,
    specs: {
      engine: '198.88 cc 4-Stroke DTS-i Forced-Air',
      powerTorque: '6.55 kW (8.8 hp) / 14.5 Nm',
      transmission: '4-Forward + 1-Reverse Wet Multiplate',
      fuelTank: 'Petrol',
      weightSeat: 'Extended XL 4-Seater Cabin · 348 kg',
      conditionLabel: 'Brand New • 0 km',
      fuelSystem: 'Petrol',
      capacityPayload: 'Extended XL 4-Seater Cabin',
      weightSpeed: '348 kg',
    },
    defaultGearId: 'gear-armored-gloves',
    inStock: true,
  },
  {
    id: 'bajaj-re-4s-xl-cng',
    model: 'RE 4S / RE XL CNG',
    brand: 'Bajaj',
    category: 'Tricycles (Passenger)',
    vehicleType: 'tricycle',
    fuelType: 'CNG + Petrol Bi-Fuel',
    condition: 'Brand New',
    subtitle: 'Factory 30L CNG cylinder + Petrol bi-fuel extended-cabin keke',
    priceNGN: 4900000,
    priceUSD: toUSD(4900000),
    marketRangeNGN: '₦4,840,000 – ₦4,970,000',
    image: IMG_TRICYCLE_BAJAJ_RE,
    defaultColorId: 'tricycle-green',
    colorOptions: TRICYCLE_COLOR_OPTIONS,
    specs: {
      engine: '198.88 cc 4-Stroke DTS-i',
      powerTorque: '6.55 kW (8.8 hp) / 14.5 Nm',
      transmission: '4-Forward + 1-Reverse',
      fuelTank: '30L CNG Cylinder + Petrol',
      weightSeat: 'Extended XL Cabin · 395 kg',
      conditionLabel: 'Brand New • 0 km',
      fuelSystem: '30L CNG Cylinder + Petrol',
      capacityPayload: 'Extended XL Cabin',
      weightSpeed: '395 kg',
    },
    defaultGearId: 'gear-armored-gloves',
    inStock: true,
  },
  {
    id: 'piaggio-ape-city-passenger',
    model: 'Ape City (200cc / 230cc Passenger)',
    brand: 'Piaggio',
    category: 'Tricycles (Passenger)',
    vehicleType: 'tricycle',
    fuelType: 'Petrol',
    condition: 'Brand New',
    subtitle: 'Italian-engineered Piaggio passenger tricycle with roomy cabin',
    priceNGN: 4000000,
    priceUSD: toUSD(4000000),
    marketRangeNGN: '₦3,800,000 – ₦4,200,000',
    image: IMG_TRICYCLE_PIAGGIO_CITY,
    defaultColorId: 'tricycle-blue',
    colorOptions: TRICYCLE_COLOR_OPTIONS,
    specs: {
      engine: '200–230 cc 4-Stroke Air-Cooled',
      powerTorque: '8–11 hp / 14–17 Nm',
      transmission: '4-Forward + 1-Reverse',
      fuelTank: 'Petrol',
      weightSeat: '4-Seater (2,700mm / 1,920mm WB) · 360 kg',
      conditionLabel: 'Brand New • 0 km',
      fuelSystem: 'Petrol',
      capacityPayload: '4-Seater (2,700mm Length / 1,920mm Wheelbase)',
      weightSpeed: '360 kg',
    },
    defaultGearId: 'gear-armored-gloves',
    inStock: true,
  },
  {
    id: 'piaggio-ape-xtra-ldx-cargo',
    model: 'Ape Xtra LDX (Cargo / Heavy-Duty)',
    brand: 'Piaggio',
    category: 'Tricycles (Heavy-Duty / Cargo)',
    vehicleType: 'tricycle',
    fuelType: 'Diesel / CNG',
    condition: 'Brand New',
    subtitle: '435cc heavy-duty commercial cargo pickup with 975 kg GVW rating',
    priceNGN: 5000000,
    priceUSD: toUSD(5000000),
    marketRangeNGN: '₦4,500,000 – ₦5,500,000',
    image: IMG_TRICYCLE_PIAGGIO_CARGO,
    defaultColorId: 'tricycle-white',
    colorOptions: TRICYCLE_COLOR_OPTIONS,
    specs: {
      engine: '435 cc Single-Cylinder 4-Stroke',
      powerTorque: '7.5–9.59 hp / 16.54–21 Nm',
      transmission: '4-Forward + 1-Reverse',
      fuelTank: 'Diesel / CNG',
      weightSeat: '975 kg GVW Cargo Deck · 479 kg • 245mm Clearance',
      conditionLabel: 'Brand New • 0 km',
      fuelSystem: 'Diesel / CNG',
      capacityPayload: '975 kg GVW Heavy Cargo Deck',
      weightSpeed: '479 kg • 245mm Clearance',
    },
    defaultGearId: 'gear-armored-gloves',
    inStock: true,
  },
  {
    id: 'daylong-dl150-dl200-cargo',
    model: 'DL150 / DL200 Cargo Tricycle',
    brand: 'Daylong',
    category: 'Tricycles (Heavy-Duty / Cargo)',
    vehicleType: 'tricycle',
    fuelType: 'Petrol',
    condition: 'Brand New',
    subtitle: 'Open steel-bed cargo motorcycle tricycle for agricultural & market logistics',
    priceNGN: 2750000,
    priceUSD: toUSD(2750000),
    marketRangeNGN: '₦2,500,000 – ₦3,000,000',
    image: IMG_TRICYCLE_DAYLONG_CARGO,
    defaultColorId: 'tricycle-green',
    colorOptions: TRICYCLE_COLOR_OPTIONS,
    specs: {
      engine: '150–200 cc 4-Stroke Air-Cooled',
      powerTorque: '8–10 hp',
      transmission: '5-Speed + Reverse Gear',
      fuelTank: 'Petrol',
      weightSeat: 'Open Steel Cargo Bed · 330 kg',
      conditionLabel: 'Brand New • 0 km',
      fuelSystem: 'Petrol',
      capacityPayload: 'Open Steel Cargo Bed',
      weightSpeed: '330 kg',
    },
    defaultGearId: 'gear-armored-gloves',
    inStock: true,
  },
];

export function isTricycle(bike: Motorcycle): boolean {
  return (
    bike.vehicleType === 'tricycle' ||
    bike.category === 'Tricycles (Passenger)' ||
    bike.category === 'Tricycles (Heavy-Duty / Cargo)'
  );
}

export function matchesBrandFilter(
  bike: Motorcycle,
  selectedBrand: 'All' | BrandName
): boolean {
  if (selectedBrand === 'All') return true;
  if (bike.brand === selectedBrand) return true;
  if (bike.brandTags && bike.brandTags.includes(selectedBrand)) return true;
  return false;
}

export function formatMoney(
  amountUSD: number,
  amountNGN: number,
  currency: CurrencyCode,
  includePrefixPlus = false
): string {
  const prefix = includePrefixPlus ? '+' : '';
  if (currency === 'NGN') {
    return `${prefix}₦${Math.round(amountNGN).toLocaleString('en-US')}`;
  }
  const formattedUSD = Number.isInteger(amountUSD)
    ? amountUSD.toLocaleString('en-US')
    : amountUSD.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
  return `${prefix}$${formattedUSD}`;
}
