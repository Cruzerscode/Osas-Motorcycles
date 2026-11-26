export type PartCategory =
  | 'Engine & Transmission'
  | 'Brakes & Suspension'
  | 'Electrical & Lighting'
  | 'Tires, Tubes & Wheels'
  | 'Bodywork & Dispatch Racks'
  | 'Service & Oils';

export type PartCompatibilityBrand =
  | 'Bajaj Boxer'
  | 'TVS HLX / Neo'
  | 'Honda CG125 / Ace'
  | 'Hero Hunter'
  | 'Qlink / Daylong'
  | '600cc Power Bikes';

export interface PartVariant {
  id: string;
  label: string;
  priceNGN: number;
}

export type PartStockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface SparePart {
  id: string;
  sku: string;
  name: string;
  category: PartCategory;
  fitsSummary: string;
  compatibleBrands: PartCompatibilityBrand[];
  compatibleModels: string[];
  priceNGN: number;
  variants?: PartVariant[];
  details: string;
  specs: Array<{ label: string; value: string }>;
  installationNotes: string;
  image: string;
  inStock: boolean;
  stockQuantity?: number;
  stockStatus?: PartStockStatus;
}

export const PART_CATEGORIES: Array<'All Parts' | PartCategory> = [
  'All Parts',
  'Engine & Transmission',
  'Brakes & Suspension',
  'Electrical & Lighting',
  'Tires, Tubes & Wheels',
  'Bodywork & Dispatch Racks',
  'Service & Oils',
];

export const PART_BRAND_FILTERS: Array<'All Brands' | PartCompatibilityBrand> =
  [
    'All Brands',
    'Bajaj Boxer',
    'TVS HLX / Neo',
    'Honda CG125 / Ace',
    'Hero Hunter',
    'Qlink / Daylong',
    '600cc Power Bikes',
  ];

export const IMG_PART_ENGINE =
  '/src/assets/images/part_engine_piston_carb_1795697764301.jpg';
export const IMG_PART_BRAKES =
  '/src/assets/images/part_brakes_suspension_1795697761456.jpg';
export const IMG_PART_ELECTRICAL =
  '/src/assets/images/part_electrical_battery_1795697762410.jpg';
export const IMG_PART_TIRES =
  '/src/assets/images/part_tires_tubes_1795697764048.jpg';
export const IMG_PART_BODYWORK =
  '/src/assets/images/part_bodywork_rack_1795697763660.jpg';
export const IMG_PART_SERVICE =
  '/src/assets/images/part_service_oil_bundle_1795697763686.jpg';

export const SPARE_PARTS: SparePart[] = [
  {
    id: 'part-piston-ring-kit',
    sku: 'OS-ENG-101',
    name: 'Complete Piston & Ring Kit (Standard / 0.50mm)',
    category: 'Engine & Transmission',
    fitsSummary: 'Bajaj Boxer BM100/150, TVS HLX 125/150',
    compatibleBrands: ['Bajaj Boxer', 'TVS HLX / Neo'],
    compatibleModels: [
      'Bajaj Boxer BM100',
      'Bajaj Boxer BM150 / BM150 X',
      'TVS HLX 125 (5G / ES)',
      'TVS HLX 150 (5G / X)',
    ],
    priceNGN: 18500,
    variants: [
      { id: 'std', label: 'Standard Bore (STD)', priceNGN: 18500 },
      { id: '050', label: 'Oversize (+0.50mm)', priceNGN: 19500 },
    ],
    details:
      'High-compression aluminum alloy piston, 5-piece ring set, gudgeon pin, and circlips.',
    specs: [
      { label: 'Material', value: 'High-Silicon Forged Aluminum Alloy' },
      { label: 'Ring Pack', value: '5-Piece Chrome-Nitride Coated' },
      { label: 'Pin Diameter', value: '13mm / 14mm Hardened Steel' },
      { label: 'Tolerance', value: 'OEM Factory Clearance' },
    ],
    installationNotes:
      'Check cylinder bore taper before fitting. Soak piston rings in clean 20W-50 oil and stagger ring gaps at 120° during assembly.',
    image: IMG_PART_ENGINE,
    inStock: true,
  },
  {
    id: 'part-gold-chain-sprocket',
    sku: 'OS-ENG-102',
    name: 'Heavy-Duty Gold Drive Chain & Sprocket Kit (428H)',
    category: 'Engine & Transmission',
    fitsSummary: 'Bajaj Boxer, TVS HLX, Honda CG125, Hero Hunter',
    compatibleBrands: [
      'Bajaj Boxer',
      'TVS HLX / Neo',
      'Honda CG125 / Ace',
      'Hero Hunter',
    ],
    compatibleModels: [
      'Bajaj Boxer BM100 / BM150',
      'TVS HLX 100 / 125 / 150',
      'Honda CG125 / Ace 125',
      'Hero Hunter 100 / 125',
    ],
    priceNGN: 24000,
    details:
      'Reinforced 126-link roller chain with 14T front and 42T hardened steel rear sprockets for commercial durability.',
    specs: [
      { label: 'Chain Pitch', value: '428H Heavy-Duty (126 Links)' },
      { label: 'Front Sprocket', value: '14T Case-Hardened C45 Steel' },
      { label: 'Rear Sprocket', value: '42T High-Carbon Steel' },
      { label: 'Tensile Strength', value: '24.5 kN Commercial Grade' },
    ],
    installationNotes:
      'Replace chain and both sprockets together. Adjust rear wheel slack to 20–25mm with rider seated and lubricate every 500 km.',
    image: IMG_PART_ENGINE,
    inStock: true,
  },
  {
    id: 'part-carburetor-pz26-pz27',
    sku: 'OS-ENG-103',
    name: 'Complete Carburetor Assembly (PZ26 / PZ27)',
    category: 'Engine & Transmission',
    fitsSummary: 'Honda CG125, Bajaj Boxer BM150, Qlink XP200, Daylong DL200',
    compatibleBrands: [
      'Honda CG125 / Ace',
      'Bajaj Boxer',
      'Qlink / Daylong',
    ],
    compatibleModels: [
      'Honda CG125',
      'Honda Ace 125',
      'Bajaj Boxer BM150 / BM150 X',
      'Qlink XP 200 & Legend 250',
      'Daylong DL200-30',
    ],
    priceNGN: 28500,
    details:
      'Precision-calibrated factory carburetor for smooth idling, fast throttle response, and optimal fuel economy.',
    specs: [
      { label: 'Venturi Size', value: '26mm / 27mm Slide Valve' },
      { label: 'Choke Type', value: 'Manual Lever / Cable Choke' },
      { label: 'Air Filter Mount', value: '38mm / 40mm Outer Flange' },
      { label: 'Calibration', value: 'Pre-Jetted for Nigerian Fuel' },
    ],
    installationNotes:
      'Inspect intake manifold O-ring for air leaks and install a fresh inline fuel filter to keep main jets free from sediment.',
    image: IMG_PART_ENGINE,
    inStock: true,
  },
  {
    id: 'part-clutch-plate-set',
    sku: 'OS-ENG-104',
    name: 'Multi-Plate Clutch Plate & Pressure Set',
    category: 'Engine & Transmission',
    fitsSummary: 'TVS HLX 125/150, Bajaj Boxer BM150, Suzuki GN125',
    compatibleBrands: ['TVS HLX / Neo', 'Bajaj Boxer'],
    compatibleModels: [
      'TVS HLX 125 (5G / ES)',
      'TVS HLX 150 (5G / X)',
      'Bajaj Boxer BM150 / BM150 X',
      'Suzuki GN125',
    ],
    priceNGN: 14000,
    details:
      '5-piece high-friction cork/kevlar clutch plates engineered for heavy load and stop-and-go city riding.',
    specs: [
      { label: 'Friction Material', value: 'Kevlar-Reinforced Composite' },
      { label: 'Kit Contents', value: '5 Friction + 4 Steel Pressure Plates' },
      { label: 'Clutch Type', value: 'Wet Multi-Plate Assembly' },
      { label: 'Heat Rating', value: 'Up to 260°C Continuous Duty' },
    ],
    installationNotes:
      'Pre-soak friction plates in fresh JASO MA2 engine oil for at least 30 minutes before installation and set clutch lever free-play to 10–15mm.',
    image: IMG_PART_ENGINE,
    inStock: true,
  },
  {
    id: 'part-rear-shock-pair',
    sku: 'OS-BRK-201',
    name: 'Heavy-Duty Rear Shock Absorber Pair (Dual Spring)',
    category: 'Brakes & Suspension',
    fitsSummary: 'Bajaj Boxer BM100/150, TVS HLX 100/125/150, Hero Hunter',
    compatibleBrands: ['Bajaj Boxer', 'TVS HLX / Neo', 'Hero Hunter'],
    compatibleModels: [
      'Bajaj Boxer BM100 / BM150',
      'TVS HLX 100 Plus / 125 / 150',
      'Hero Hunter 100 / 125',
      'Daylong DL125-1',
    ],
    priceNGN: 36000,
    details:
      'Hydraulic twin-tube rear shocks with 5-step preload adjustment built for rough roads and heavy cargo.',
    specs: [
      { label: 'Eye-to-Eye Length', value: '335mm Standard Commuter Fit' },
      { label: 'Preload Adjust', value: '5-Step Mechanical Cam' },
      { label: 'Spring Design', value: 'Dual-Rate Progressive Coil' },
      { label: 'Max Load Rating', value: '220 kg Combined Payload' },
    ],
    installationNotes:
      'Set both left and right preload collars to the exact same notch. Torque mounting bolts evenly with the rear wheel resting on the ground.',
    image: IMG_PART_BRAKES,
    inStock: true,
  },
  {
    id: 'part-brake-shoes-pads',
    sku: 'OS-BRK-202',
    name: 'Front & Rear Drum Brake Shoe Set / Sintered Disc Pads',
    category: 'Brakes & Suspension',
    fitsSummary: 'All Commuter Bikes & 600cc Power Bikes',
    compatibleBrands: [
      'Bajaj Boxer',
      'TVS HLX / Neo',
      'Honda CG125 / Ace',
      'Hero Hunter',
      'Qlink / Daylong',
      '600cc Power Bikes',
    ],
    compatibleModels: [
      'Bajaj Boxer BM100 / BM150',
      'TVS HLX 100 / 125 / 150 & Neo NX',
      'Honda CG125 / Ace 125 / CBR600RR',
      'Suzuki GSX-R600 & Yamaha YZF-R6',
    ],
    priceNGN: 8500,
    variants: [
      { id: 'commuter', label: 'Commuter Drum / Pad Set', priceNGN: 8500 },
      {
        id: '600cc',
        label: '600cc Power Bike Sintered Pads',
        priceNGN: 22000,
      },
    ],
    details:
      'Asbestos-free high-grip friction lining for reliable wet and dry stopping power.',
    specs: [
      { label: 'Compound', value: 'Asbestos-Free Ceramic / Copper Sintered' },
      { label: 'Drum Size', value: '130mm Standard Commuter Drum' },
      { label: 'Fade Resistance', value: 'High Thermal Recovery' },
      { label: 'Included', value: 'Return Springs (Drum Kit)' },
    ],
    installationNotes:
      'Clean brake drum interior or rotor surface with brake cleaner prior to installation and bed in gently over the first 50 km.',
    image: IMG_PART_BRAKES,
    inStock: true,
  },
  {
    id: 'part-fork-oil-seal-kit',
    sku: 'OS-BRK-203',
    name: 'Front Telescopic Fork Oil Seal & Dust Cover Kit',
    category: 'Brakes & Suspension',
    fitsSummary: 'Bajaj, TVS, Honda, Qlink, Yamaha R6 / GSX-R600',
    compatibleBrands: [
      'Bajaj Boxer',
      'TVS HLX / Neo',
      'Honda CG125 / Ace',
      'Qlink / Daylong',
      '600cc Power Bikes',
    ],
    compatibleModels: [
      'Bajaj Boxer BM100 / BM150',
      'TVS HLX 125 / 150',
      'Honda CG125 / CBR600RR',
      'Qlink XP 200 / XF 200',
      'Yamaha YZF-R6 & Suzuki GSX-R600',
    ],
    priceNGN: 6500,
    details:
      'Double-lip nitrile rubber oil seals preventing fork leakage on uneven terrain.',
    specs: [
      { label: 'Seal Type', value: 'Double-Lip NBR + Garter Spring' },
      { label: 'Kit Contents', value: '2× Oil Seals + 2× Dust Wipers' },
      { label: 'Fork Tube Sizes', value: '31mm Commuter / 41mm Power Bike' },
      { label: 'Fluid Compatibility', value: '10W / 15W Fork Oil' },
    ],
    installationNotes:
      'Inspect chrome stanchions for stone nicks before sliding new seals over the tube; refill each fork leg to OEM oil volume.',
    image: IMG_PART_BRAKES,
    inStock: true,
  },
  {
    id: 'part-gel-battery-12v',
    sku: 'OS-ELC-301',
    name: '12V 7Ah / 9Ah Maintenance-Free Gel Motorcycle Battery',
    category: 'Electrical & Lighting',
    fitsSummary:
      'All Electric-Start Bikes (Boxer ES, HLX, Ace 125, Qlink, Haojue)',
    compatibleBrands: [
      'Bajaj Boxer',
      'TVS HLX / Neo',
      'Honda CG125 / Ace',
      'Qlink / Daylong',
      '600cc Power Bikes',
    ],
    compatibleModels: [
      'Bajaj Boxer BM150 ES',
      'TVS HLX 125 / 150 & Ntorq 125',
      'Honda Ace 125 / CG125 ES',
      'Qlink XP 200 / Daylong DL200-30',
      'Haojue HJ110 / Suzuki GSX-R600',
    ],
    priceNGN: 26500,
    details:
      'Sealed spill-proof AGM gel battery with high cold-cranking amps and 12-month warranty.',
    specs: [
      { label: 'Voltage / Capacity', value: '12V · 7Ah / 9Ah Sealed AGM Gel' },
      { label: 'Cranking Power', value: '135 CCA Instant Start' },
      { label: 'Maintenance', value: '100% Zero-Top-Up Spill-Proof' },
      { label: 'Warranty', value: '12 Months Osas Replacement' },
    ],
    installationNotes:
      'Connect positive (+) red terminal first, then negative (-). Verify rectifier charging output is between 13.8V and 14.5V at 4,000 rpm.',
    image: IMG_PART_ELECTRICAL,
    inStock: true,
  },
  {
    id: 'part-stator-cdi-unit',
    sku: 'OS-ELC-302',
    name: 'Complete Stator Coil & CDI Ignition Unit',
    category: 'Electrical & Lighting',
    fitsSummary: 'Bajaj Boxer, TVS HLX, Honda CG125, Daylong DL125/200',
    compatibleBrands: [
      'Bajaj Boxer',
      'TVS HLX / Neo',
      'Honda CG125 / Ace',
      'Qlink / Daylong',
    ],
    compatibleModels: [
      'Bajaj Boxer BM100 / BM150',
      'TVS HLX 100 / 125 / 150',
      'Honda CG125 / Ace 125',
      'Daylong DL125-1 / DL200-30',
    ],
    priceNGN: 19500,
    details:
      '8-pole copper-wound stator assembly and digital CDI box for consistent spark and battery charging.',
    specs: [
      { label: 'Winding', value: '100% Oxygen-Free Enameled Copper' },
      { label: 'Configuration', value: '8-Pole AC/DC Stator + Pickup Trigger' },
      { label: 'Ignition Module', value: '6-Pin Digital Advance CDI' },
      { label: 'Insulation', value: 'High-Temp Epoxy Potted Core' },
    ],
    installationNotes:
      'Check flywheel Woodruff key and pickup coil air gap (0.4–0.6mm) during installation for crisp cold-morning starts.',
    image: IMG_PART_ELECTRICAL,
    inStock: true,
  },
  {
    id: 'part-led-headlight-kit',
    sku: 'OS-ELC-303',
    name: 'High-Intensity LED Headlight & Indicator Conversion Kit',
    category: 'Electrical & Lighting',
    fitsSummary: "Universal 12V (Commuter, Dispatch & Ladies' Cubs)",
    compatibleBrands: [
      'Bajaj Boxer',
      'TVS HLX / Neo',
      'Honda CG125 / Ace',
      'Hero Hunter',
      'Qlink / Daylong',
    ],
    compatibleModels: [
      'Bajaj Boxer BM100 / BM150',
      'TVS HLX Series & Neo NX 110',
      'Honda CG125 / Ace 125',
      'Hero Hunter 100 / 125',
      'Qlink XP 200 / Daylong DL110-2',
    ],
    priceNGN: 12500,
    details:
      '6000K bright white H4/BA20D LED bulb with amber turn signals for safer night riding.',
    specs: [
      { label: 'Color Temperature', value: '6000K Pure Daylight White' },
      { label: 'Socket Fit', value: 'H4 & BA20D Dual-Beam Base' },
      { label: 'Output', value: '2,800 Lumens Low/High Cutoff' },
      { label: 'Package', value: '1× LED Headlight + 4× Amber Indicators' },
    ],
    installationNotes:
      'Plug-and-play installation on 12V DC headlights. Aim beam slightly downward after fitting to avoid dazzling oncoming riders.',
    image: IMG_PART_ELECTRICAL,
    inStock: true,
  },
  {
    id: 'part-6ply-tires',
    sku: 'OS-TIR-401',
    name: 'Heavy-Duty 6-Ply Tubeless/Tube Tires (2.75-18 Front & 3.00-18 / 100/90-18 Rear)',
    category: 'Tires, Tubes & Wheels',
    fitsSummary: 'Bajaj Boxer, TVS HLX, Honda CG125, Hero Hunter',
    compatibleBrands: [
      'Bajaj Boxer',
      'TVS HLX / Neo',
      'Honda CG125 / Ace',
      'Hero Hunter',
    ],
    compatibleModels: [
      'Bajaj Boxer BM100 / BM150',
      'TVS HLX 100 / 125 / 150',
      'Honda CG125 / Ace 125',
      'Hero Hunter 100 / 125',
    ],
    priceNGN: 34000,
    variants: [
      { id: 'front', label: 'Front Tire (2.75-18)', priceNGN: 34000 },
      {
        id: 'rear',
        label: 'Rear Tire (3.00-18 / 100/90-18)',
        priceNGN: 42000,
      },
    ],
    details:
      'Deep-tread puncture-resistant nylon compound built for high mileage on paved and unpaved roads.',
    specs: [
      { label: 'Ply Rating', value: '6PR Reinforced Nylon Carcass' },
      { label: 'Tread Depth', value: '8.5mm Deep Water-Evacuation Grooves' },
      { label: 'Rim Diameter', value: '18-Inch Spoke & Alloy Compatible' },
      { label: 'Load Index', value: '52P / 56P Commercial Endurance' },
    ],
    installationNotes:
      'Align rotational direction arrow on the sidewall with forward wheel rotation. Maintain 28 PSI front and 32–36 PSI rear.',
    image: IMG_PART_TIRES,
    inStock: true,
  },
  {
    id: 'part-butyl-inner-tube',
    sku: 'OS-TIR-402',
    name: 'Heavy-Duty Butyl Inner Tube Set (17" & 18")',
    category: 'Tires, Tubes & Wheels',
    fitsSummary: "All Spoke & Alloy Wheel Commuter/Ladies' Bikes",
    compatibleBrands: [
      'Bajaj Boxer',
      'TVS HLX / Neo',
      'Honda CG125 / Ace',
      'Hero Hunter',
      'Qlink / Daylong',
    ],
    compatibleModels: [
      'Bajaj Boxer / TVS HLX (17" & 18")',
      'Honda CG125 / Ace 125',
      'Hero Hunter 100 / 125',
      'Daylong DL110-2 & Haojue HJ110 (17")',
    ],
    priceNGN: 6000,
    details:
      'Thick 2.5mm natural/butyl rubber inner tubes with reinforced TR4 metal valve stems.',
    specs: [
      { label: 'Wall Thickness', value: '2.5mm Heavy-Duty Butyl Rubber' },
      { label: 'Valve Stem', value: 'TR4 Threaded Brass Metal Stem' },
      { label: 'Sizes Covered', value: '2.50/2.75-17 & 2.75/3.00-18' },
      { label: 'Air Retention', value: 'Low-Permeability Compound' },
    ],
    installationNotes:
      'Check tire inner liner for thorns or spoke-nipple burrs and replace worn rim tape before seating the new tube.',
    image: IMG_PART_TIRES,
    inStock: true,
  },
  {
    id: 'part-dispatch-carrier-rack',
    sku: 'OS-BDY-501',
    name: 'Reinforced Steel Dispatch Carrier & Delivery Box Rack',
    category: 'Bodywork & Dispatch Racks',
    fitsSummary: 'Bajaj Boxer, TVS HLX, Qlink XP200, Hero Hunter',
    compatibleBrands: [
      'Bajaj Boxer',
      'TVS HLX / Neo',
      'Qlink / Daylong',
      'Hero Hunter',
    ],
    compatibleModels: [
      'Bajaj Boxer BM100 / BM150',
      'TVS HLX 125 / 150',
      'Qlink XP 200 & XF 200',
      'Hero Hunter 100 / 125',
      'Daylong DL200-30',
    ],
    priceNGN: 25000,
    details:
      'Powder-coated tubular steel rear carrier bracket supporting up to 80 kg commercial delivery boxes.',
    specs: [
      { label: 'Tubing', value: '18mm Seamless Schedule Steel' },
      { label: 'Finish', value: 'Anti-Rust Matte Black Powder Coat' },
      { label: 'Load Rating', value: '80 kg Reinforced Sub-Frame' },
      { label: 'Mounting', value: 'Direct Bolt-On + Plate Pre-Drilled' },
    ],
    installationNotes:
      'Bolts directly to rear shock upper mounts and subframe rails; pair with our 55L Heavy-Duty Dispatch Delivery Box.',
    image: IMG_PART_BODYWORK,
    inStock: true,
  },
  {
    id: 'part-fuel-tank-body-kit',
    sku: 'OS-BDY-502',
    name: 'Complete Fuel Tank & Side Cover Body Kit',
    category: 'Bodywork & Dispatch Racks',
    fitsSummary: 'Bajaj Boxer BM150, TVS HLX 125, Honda CG125',
    compatibleBrands: [
      'Bajaj Boxer',
      'TVS HLX / Neo',
      'Honda CG125 / Ace',
    ],
    compatibleModels: [
      'Bajaj Boxer BM150 / BM150 X',
      'TVS HLX 125 (5G / ES)',
      'Honda CG125',
    ],
    priceNGN: 58000,
    details:
      'Factory-painted rust-treated steel tank with matching ABS side panels, fuel tap, and lockable cap.',
    specs: [
      { label: 'Tank Shell', value: '1.2mm Anti-Corrosion Steel' },
      { label: 'Paint Finish', value: '2K Clear-Coated Gloss Red / Black' },
      { label: 'Included Hardware', value: 'Fuel Petcock Tap + Cap + 2 Keys' },
      { label: 'Side Panels', value: 'Matching Impact-Grade ABS Pair' },
    ],
    installationNotes:
      'Transfer rubber frame mounting grommets from the chassis and flush tank with clean petrol before attaching the fuel line.',
    image: IMG_PART_BODYWORK,
    inStock: true,
  },
  {
    id: 'part-engine-oil-20w50',
    sku: 'OS-SVC-601',
    name: '20W-50 4-Stroke Motorcycle Engine Oil (1 Litre Pack)',
    category: 'Service & Oils',
    fitsSummary: "All 4-Stroke Commuter, Dispatch & Ladies' Bikes",
    compatibleBrands: [
      'Bajaj Boxer',
      'TVS HLX / Neo',
      'Honda CG125 / Ace',
      'Hero Hunter',
      'Qlink / Daylong',
    ],
    compatibleModels: [
      'All Bajaj Boxer & TVS HLX / Neo Models',
      'Honda CG125 & Ace 125',
      'Hero Hunter 100 / 125',
      'Qlink XP200 / XF200 & Daylong DL Series',
      'Haojue HJ110 / Suzuki AX4 & GN125',
    ],
    priceNGN: 7500,
    details:
      'JASO MA2 certified mineral/semi-synthetic oil protecting high-temperature air-cooled engines and wet clutches.',
    specs: [
      { label: 'Viscosity Grade', value: 'SAE 20W-50 Tropical Spec' },
      { label: 'Certification', value: 'API SL / JASO MA2 Wet-Clutch Safe' },
      { label: 'Volume', value: '1 Litre Factory Sealed Pack' },
      { label: 'Service Interval', value: 'Every 2,000 – 2,500 km' },
    ],
    installationNotes:
      'Warm engine for 2 minutes before draining old oil; clean mesh oil strainer screen and refill to dipstick upper mark.',
    image: IMG_PART_SERVICE,
    inStock: true,
  },
  {
    id: 'part-periodic-service-bundle',
    sku: 'OS-SVC-602',
    name: 'Complete Periodic Service Tune-Up Bundle',
    category: 'Service & Oils',
    fitsSummary: 'Bajaj, TVS, Honda, Hero, Qlink, Daylong',
    compatibleBrands: [
      'Bajaj Boxer',
      'TVS HLX / Neo',
      'Honda CG125 / Ace',
      'Hero Hunter',
      'Qlink / Daylong',
    ],
    compatibleModels: [
      'Bajaj Boxer BM100 / BM150',
      'TVS HLX 100 / 125 / 150 & Neo NX',
      'Honda CG125 / Ace 125',
      'Hero Hunter 100 / 125',
      'Qlink XP 200 & Daylong DL125 / DL200',
    ],
    priceNGN: 14500,
    details:
      'Includes 1L 20W-50 engine oil, NGK spark plug, foam/paper air filter element, and inline fuel filter.',
    specs: [
      { label: 'Oil Included', value: '1× 1L 20W-50 JASO MA2 4T Oil' },
      { label: 'Ignition', value: '1× Genuine NGK CR7HSA / D8EA Plug' },
      { label: 'Filtration', value: '1× Air Filter + 1× Inline Fuel Filter' },
      { label: 'Bundle Savings', value: 'Save 18% vs Individual Items' },
    ],
    installationNotes:
      'Recommended every 2,500 km for commercial and dispatch riders. Lightly oil foam air filter elements before reassembly.',
    image: IMG_PART_SERVICE,
    inStock: true,
  },
];
