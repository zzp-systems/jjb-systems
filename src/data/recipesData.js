// Master Formulation & Product Recipe Register
// Governed by SOP-WAR-002 / SOP-PRO-004 Rev. 04 (JJB-MAN-001 Indangan Site LTO No. 3000013388488)

export const MASTER_RECIPES = [
  {
    sku: "BRD-PAN-001",
    name: "Commercial Pandesal — 3-Kilo Yield Kit (3,000g Flour)",
    category: "Breads / Daily Outlets",
    targetFacility: "Pan de Verde & Laurice Delicacies",
    standardBatchFlourKg: 3.0, // 3,000g flour basis per kit
    unitPieceYield: 85, // ~85 pcs per 3kg kit
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "Moist Crumb",
    waterMlRange: "1,440 ml to 1,500 ml",
    yeastGramRange: "30 g to 45 g",
    ingredients: [
      { code: "RM-FLR-003", name: "Bread Flour (1st Class Hard Flour)", pct: 100.0, gramsPerBatch: 3000, note: "3,000 g (3 kg)" },
      { code: "RM-DRY-004", name: "Skim Milk Powder", pct: 4.0, gramsPerBatch: 120, note: "120 g" },
      { code: "RM-LEV-001", name: "Instant Dry Yeast (Gloripan)", pct: 1.25, gramsPerBatch: 37.5, note: "30 g to 45 g (Std 37.5 g)" },
      { code: "RM-SWT-001", name: "Crystal Brown Sugar", pct: 20.0, gramsPerBatch: 600, note: "600 g" },
      { code: "RM-SWT-003", name: "Refined Iodized Salt (RA 8172)", pct: 1.5, gramsPerBatch: 45, note: "45 g" },
      { code: "WATER", name: "Chilled Potable Water (Outlet Mixer)", pct: 48.0, gramsPerBatch: 1440, isWater: true, note: "1,440 ml to 1,500 ml" },
      { code: "RM-FAT-003", name: "Vegetable Shortening (Sunny Suy)", pct: 6.67, gramsPerBatch: 200, note: "200 g" },
      { code: "RM-FAT-004", name: "Margarine (Alpha)", pct: 3.33, gramsPerBatch: 100, note: "100 g" },
      { code: "RM-LEV-005", name: "Bread Improver (Baker's Choice)", pct: 0.5, gramsPerBatch: 15, note: "15 g" },
      { code: "RM-DRY-006", name: "Fine Breadcrumbs (For Rolling)", pct: 0.0, gramsPerBatch: 100, isAsNeeded: true, note: "As needed for rolling" }
    ]
  },
  {
    sku: "BRD-PAN-002",
    name: "Commercial Pandesal — 6-Kilo Yield Kit (6,000g Flour)",
    category: "Breads / Daily Outlets",
    targetFacility: "Pan de Verde & Laurice Delicacies",
    standardBatchFlourKg: 6.0, // 6,000g flour basis per kit
    unitPieceYield: 170, // ~170 pcs per 6kg kit
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "Moist Crumb",
    waterMlRange: "2,880 ml to 3,000 ml",
    yeastGramRange: "60 g to 90 g",
    ingredients: [
      { code: "RM-FLR-003", name: "Bread Flour (1st Class Hard Flour)", pct: 100.0, gramsPerBatch: 6000, note: "6,000 g (6 kg)" },
      { code: "RM-DRY-004", name: "Skim Milk Powder", pct: 4.0, gramsPerBatch: 240, note: "240 g" },
      { code: "RM-LEV-001", name: "Instant Dry Yeast (Gloripan)", pct: 1.25, gramsPerBatch: 75, note: "60 g to 90 g (Std 75 g)" },
      { code: "RM-SWT-001", name: "Crystal Brown Sugar", pct: 20.0, gramsPerBatch: 1200, note: "1,200 g" },
      { code: "RM-SWT-003", name: "Refined Iodized Salt (RA 8172)", pct: 1.5, gramsPerBatch: 90, note: "90 g" },
      { code: "WATER", name: "Chilled Potable Water (Outlet Mixer)", pct: 48.0, gramsPerBatch: 2880, isWater: true, note: "2,880 ml to 3,000 ml" },
      { code: "RM-FAT-003", name: "Vegetable Shortening (Sunny Suy)", pct: 6.67, gramsPerBatch: 400, note: "400 g" },
      { code: "RM-FAT-004", name: "Margarine (Alpha)", pct: 3.33, gramsPerBatch: 200, note: "200 g" },
      { code: "RM-LEV-005", name: "Bread Improver (Baker's Choice)", pct: 0.5, gramsPerBatch: 30, note: "30 g" },
      { code: "RM-DRY-006", name: "Fine Breadcrumbs (For Rolling)", pct: 0.0, gramsPerBatch: 200, isAsNeeded: true, note: "As needed for rolling" }
    ]
  },
  {
    sku: "BIS-001",
    name: "Biscocho Toasted Bread Delicacy (25kg Sack Kit)",
    category: "Pasalubong / Shelf-Stable Delicacy",
    targetFacility: "Indangan Biscocho Hall & Outlets",
    standardBatchFlourKg: 25.0,
    unitPieceYield: 1000,
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "< 0.60 aw",
    ingredients: [
      { code: "RM-FLR-003", name: "1st Class Hard Flour (Rossa)", pct: 100.0, gramsPerBatch: 25000 },
      { code: "RM-SWT-002", name: "Refined White Sugar (Busco)", pct: 12.0, gramsPerBatch: 3000 },
      { code: "RM-FAT-001", name: "Buttercup Margarine / Butter", pct: 8.0, gramsPerBatch: 2000 },
      { code: "RM-LEV-001", name: "Gloripan Instant Dry Yeast", pct: 1.5, gramsPerBatch: 375 },
      { code: "RM-SWT-003", name: "Refined Iodized Fine Salt", pct: 1.8, gramsPerBatch: 450 },
      { code: "RM-LEV-005", name: "Bread Improver (Baker's Choice)", pct: 0.5, gramsPerBatch: 125 },
      { code: "PM-PAP-002", name: "Baking Pan Pattern Paper", pct: 0.0, gramsPerBatch: 25, isPackaging: true }
    ]
  },
  {
    sku: "OTP-001",
    name: "Otap Layered Laminated Puff Pastry (25kg Sack Kit)",
    category: "Laminated Dry Delicacy",
    targetFacility: "Indangan Otap Hall & Outlets",
    standardBatchFlourKg: 25.0,
    unitPieceYield: 1200,
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "0.20 – 0.30 aw",
    ingredients: [
      { code: "RM-FLR-003", name: "1st Class Hard Flour (Rossa)", pct: 80.0, gramsPerBatch: 20000 },
      { code: "RM-FLR-004", name: "Soft Flour (General Milling)", pct: 20.0, gramsPerBatch: 5000 },
      { code: "RM-FAT-003", name: "Vegetable Shortening (Sunny Suy)", pct: 35.0, gramsPerBatch: 8750 },
      { code: "RM-SWT-002", name: "Refined White Sugar (Coating & Mix)", pct: 25.0, gramsPerBatch: 6250 },
      { code: "RM-SWT-003", name: "Refined Iodized Fine Salt", pct: 1.5, gramsPerBatch: 375 },
      { code: "PM-PAP-001", name: "Glassine Wax Paper Sheets", pct: 0.0, gramsPerBatch: 600, isPackaging: true }
    ]
  },
  {
    sku: "BRD-UBE-001",
    name: "Special Ube Cheese Pandesal (3kg Yield Kit)",
    category: "Signature Outlet Pastry",
    targetFacility: "Pan de Verde & Laurice Delicacies",
    standardBatchFlourKg: 3.0,
    unitPieceYield: 90,
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "Moist Crumb",
    ingredients: [
      { code: "RM-FLR-001", name: "Continental All Purpose Flour", pct: 100.0, gramsPerBatch: 3000 },
      { code: "RM-SWT-002", name: "Refined White Sugar", pct: 18.0, gramsPerBatch: 540 },
      { code: "RM-FAT-001", name: "Buttercup Margarine / Butter", pct: 10.0, gramsPerBatch: 300 },
      { code: "RM-FLV-001", name: "Unibake Ube Flavor & Color Blend", pct: 3.5, gramsPerBatch: 105 },
      { code: "RM-LEV-001", name: "Gloripan Instant Dry Yeast", pct: 1.5, gramsPerBatch: 45 },
      { code: "RM-SWT-003", name: "Refined Iodized Fine Salt", pct: 1.5, gramsPerBatch: 45 },
      { code: "RM-DRY-002", name: "Master Chef Condensada", pct: 5.0, gramsPerBatch: 150 }
    ]
  },
  {
    sku: "BRD-MON-001",
    name: "Classic Monay & Sweet Loaf (3kg Yield Kit)",
    category: "Heavy Loaf Breads",
    targetFacility: "Pan de Verde & Laurice Delicacies",
    standardBatchFlourKg: 3.0,
    unitPieceYield: 60,
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "Moist Crumb",
    ingredients: [
      { code: "RM-FLR-001", name: "Continental All Purpose Flour", pct: 100.0, gramsPerBatch: 3000 },
      { code: "RM-SWT-002", name: "Refined White Sugar", pct: 20.0, gramsPerBatch: 600 },
      { code: "RM-FAT-004", name: "Alpha Margarine", pct: 10.0, gramsPerBatch: 300 },
      { code: "RM-DRY-004", name: "Skim Milk Powder", pct: 5.0, gramsPerBatch: 150 },
      { code: "RM-LEV-001", name: "Gloripan Instant Dry Yeast", pct: 1.5, gramsPerBatch: 45 },
      { code: "RM-SWT-003", name: "Refined Iodized Fine Salt", pct: 1.5, gramsPerBatch: 45 }
    ]
  },
  {
    sku: "PST-ENS-001",
    name: "Special Butter Ensaymada (3kg Yield Kit)",
    category: "Brioche / Rich Pastry",
    targetFacility: "Pan de Verde & Laurice Delicacies",
    standardBatchFlourKg: 3.0,
    unitPieceYield: 60,
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "Moist Rich Crumb",
    ingredients: [
      { code: "RM-FLR-001", name: "Continental All Purpose Flour", pct: 80.0, gramsPerBatch: 2400 },
      { code: "RM-FLR-006", name: "Soft Cake Flour (General Milling)", pct: 20.0, gramsPerBatch: 600 },
      { code: "RM-SWT-002", name: "Refined White Sugar", pct: 22.0, gramsPerBatch: 660 },
      { code: "RM-FAT-001", name: "Buttercup Margarine / Butter", pct: 20.0, gramsPerBatch: 600 },
      { code: "RM-LEV-001", name: "Gloripan Instant Dry Yeast", pct: 2.0, gramsPerBatch: 60 },
      { code: "RM-SWT-003", name: "Refined Iodized Fine Salt", pct: 1.2, gramsPerBatch: 36 }
    ]
  }
];

export const OUTLETS = [
  {
    id: "laurice-delicacies",
    name: "Laurice Delicacies Outlet (Bankerohan)",
    location: "Lower Quarry, Brgy 5-A, Bankerohan, Davao City",
    manager: "Anecita S. Blase",
    headBaker: "Raffy Boy P. Cortes",
    driver: "Roberto S. Blase"
  },
  {
    id: "pan-de-verde",
    name: "Pan de Verde Outlet (Communal)",
    location: "Purok 8, Communal, Davao City",
    manager: "Jhoanna Tejano",
    headBaker: "Feliciano T. Gomera",
    driver: "Othniel Tilan"
  },
  {
    id: "indangan-biscocho",
    name: "Indangan - Biscocho Commercial Line",
    location: "Indangan Plant (Biscocho Hall)",
    manager: "Irene C. Capada",
    headBaker: "Alwen Hermogeno",
    driver: "Internal Grey Zone Transfer"
  },
  {
    id: "indangan-otap",
    name: "Indangan - Otap Laminated Line",
    location: "Indangan Plant (Otap Hall)",
    manager: "Zillah F. Tilan",
    headBaker: "Reymark V. Albia",
    driver: "Internal Grey Zone Transfer"
  }
];
