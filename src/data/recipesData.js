// Master Formulation & Product Recipe Register
// Governed by SOP-WAR-002 / SOP-PRO-004 Rev. 04 (JJB-MAN-001 Indangan Site LTO No. 3000013388488)

export const MASTER_RECIPES = [
  {
    sku: "BRD-PAN-3KG",
    name: "Commercial Pandesal Batched Ingredient Mix (3-Kilo Yield Kit)",
    category: "Breads / Daily Outlet Kit",
    targetFacility: "Pan de Verde & Laurice Delicacies",
    standardBatchFlourKg: 3.0, // 3,000 g flour basis per kit
    unitKitWeightKg: 4.11, // 4,110 g dry + fats per 3kg kit (excluding water & as-needed breadcrumbs)
    unitPieceYield: 85, // ~85 pcs per 3kg kit
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "Moist Crumb",
    ingredients: [
      { code: "RM-FLR-003", name: "Bread Flour (1st Class)", pct: 100.0, gramsPerBatch: 3000, rangeNote: "3,000 g (3 kg)" },
      { code: "RM-DRY-004", name: "Skim Milk Powder", pct: 4.0, gramsPerBatch: 120, rangeNote: "120 g" },
      { code: "RM-LEV-001", name: "Instant Yeast", pct: 1.0, gramsPerBatch: 30, maxGramsPerBatch: 45, rangeNote: "30 g to 45 g" },
      { code: "RM-SWT-001", name: "Brown Sugar", pct: 20.0, gramsPerBatch: 600, rangeNote: "600 g" },
      { code: "RM-SWT-003", name: "Refined Iodized Salt", pct: 1.5, gramsPerBatch: 45, rangeNote: "45 g" },
      { code: "WATER", name: "Water (or Chilled Ice Substitution)", pct: 48.0, gramsPerBatch: 1440, maxGramsPerBatch: 1500, rangeNote: "1,440 ml to 1,500 ml", isWater: true },
      { code: "RM-FAT-003", name: "Vegetable Shortening", pct: 6.67, gramsPerBatch: 200, rangeNote: "200 g" },
      { code: "RM-FAT-004", name: "Margarine", pct: 3.33, gramsPerBatch: 100, rangeNote: "100 g" },
      { code: "RM-LEV-005", name: "Bread Improver", pct: 0.5, gramsPerBatch: 15, rangeNote: "15 g" },
      { code: "RM-DRY-006", name: "Fine Breadcrumbs (For Rolling)", pct: 0.0, gramsPerBatch: 0, rangeNote: "As needed for rolling", isAsNeeded: true }
    ]
  },
  {
    sku: "BRD-PAN-6KG",
    name: "Commercial Pandesal Batched Ingredient Mix (6-Kilo Yield Kit)",
    category: "Breads / Daily Outlet Kit",
    targetFacility: "Pan de Verde & Laurice Delicacies",
    standardBatchFlourKg: 6.0, // 6,000 g flour basis per kit
    unitKitWeightKg: 8.22, // 8,220 g dry + fats per 6kg kit
    unitPieceYield: 170, // ~170 pcs per 6kg kit
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "Moist Crumb",
    ingredients: [
      { code: "RM-FLR-003", name: "Bread Flour (1st Class)", pct: 100.0, gramsPerBatch: 6000, rangeNote: "6,000 g (6 kg)" },
      { code: "RM-DRY-004", name: "Skim Milk Powder", pct: 4.0, gramsPerBatch: 240, rangeNote: "240 g" },
      { code: "RM-LEV-001", name: "Instant Yeast", pct: 1.0, gramsPerBatch: 60, maxGramsPerBatch: 90, rangeNote: "60 g to 90 g" },
      { code: "RM-SWT-001", name: "Brown Sugar", pct: 20.0, gramsPerBatch: 1200, rangeNote: "1,200 g" },
      { code: "RM-SWT-003", name: "Refined Iodized Salt", pct: 1.5, gramsPerBatch: 90, rangeNote: "90 g" },
      { code: "WATER", name: "Water (or Chilled Ice Substitution)", pct: 48.0, gramsPerBatch: 2880, maxGramsPerBatch: 3000, rangeNote: "2,880 ml to 3,000 ml", isWater: true },
      { code: "RM-FAT-003", name: "Vegetable Shortening", pct: 6.67, gramsPerBatch: 400, rangeNote: "400 g" },
      { code: "RM-FAT-004", name: "Margarine", pct: 3.33, gramsPerBatch: 200, rangeNote: "200 g" },
      { code: "RM-LEV-005", name: "Bread Improver", pct: 0.5, gramsPerBatch: 30, rangeNote: "30 g" },
      { code: "RM-DRY-006", name: "Fine Breadcrumbs (For Rolling)", pct: 0.0, gramsPerBatch: 0, rangeNote: "As needed for rolling", isAsNeeded: true }
    ]
  },
  {
    sku: "BIS-001",
    name: "Biscocho Toasted Bread Delicacy",
    category: "Pasalubong / Shelf-Stable Delicacy",
    targetFacility: "Indangan Biscocho Hall & Outlets",
    standardBatchFlourKg: 25.0,
    unitKitWeightKg: 30.95,
    unitPieceYield: 1000,
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "< 0.60 aw",
    ingredients: [
      { code: "RM-FLR-003", name: "1st Class Hard Flour (Rossa)", pct: 100.0, gramsPerBatch: 25000, rangeNote: "25,000 g" },
      { code: "RM-SWT-002", name: "Refined White Sugar (Busco)", pct: 12.0, gramsPerBatch: 3000, rangeNote: "3,000 g" },
      { code: "RM-FAT-001", name: "Buttercup Margarine / Butter", pct: 8.0, gramsPerBatch: 2000, rangeNote: "2,000 g" },
      { code: "RM-LEV-001", name: "Gloripan Instant Dry Yeast", pct: 1.5, gramsPerBatch: 375, rangeNote: "375 g" },
      { code: "RM-SWT-003", name: "Refined Iodized Fine Salt", pct: 1.8, gramsPerBatch: 450, rangeNote: "450 g" },
      { code: "RM-LEV-005", name: "Bread Improver (Baker's Choice)", pct: 0.5, gramsPerBatch: 125, rangeNote: "125 g" },
      { code: "PM-PAP-002", name: "Baking Pan Pattern Paper", pct: 0.0, gramsPerBatch: 25, rangeNote: "25 sheets", isPackaging: true }
    ]
  },
  {
    sku: "OTP-001",
    name: "Otap Layered Laminated Puff Pastry",
    category: "Laminated Dry Delicacy",
    targetFacility: "Indangan Otap Hall & Outlets",
    standardBatchFlourKg: 25.0,
    unitKitWeightKg: 40.375,
    unitPieceYield: 1200,
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "0.20 – 0.30 aw",
    ingredients: [
      { code: "RM-FLR-003", name: "1st Class Hard Flour (Rossa)", pct: 80.0, gramsPerBatch: 20000, rangeNote: "20,000 g" },
      { code: "RM-FLR-004", name: "Soft Flour (General Milling)", pct: 20.0, gramsPerBatch: 5000, rangeNote: "5,000 g" },
      { code: "RM-FAT-003", name: "Vegetable Shortening (Sunny Suy)", pct: 35.0, gramsPerBatch: 8750, rangeNote: "8,750 g" },
      { code: "RM-SWT-002", name: "Refined White Sugar (Coating & Mix)", pct: 25.0, gramsPerBatch: 6250, rangeNote: "6,250 g" },
      { code: "RM-SWT-003", name: "Refined Iodized Fine Salt", pct: 1.5, gramsPerBatch: 375, rangeNote: "375 g" },
      { code: "PM-PAP-001", name: "Glassine Wax Paper Sheets", pct: 0.0, gramsPerBatch: 600, rangeNote: "600 sheets", isPackaging: true }
    ]
  },
  {
    sku: "BRD-UBE-001",
    name: "Special Ube Cheese Pandesal Kit",
    category: "Signature Outlet Pastry",
    targetFacility: "Pan de Verde & Laurice Delicacies",
    standardBatchFlourKg: 10.0,
    unitKitWeightKg: 13.98,
    unitPieceYield: 300,
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "Moist Crumb",
    ingredients: [
      { code: "RM-FLR-001", name: "Continental All Purpose Flour", pct: 100.0, gramsPerBatch: 10000, rangeNote: "10,000 g" },
      { code: "RM-SWT-002", name: "Refined White Sugar", pct: 18.0, gramsPerBatch: 1800, rangeNote: "1,800 g" },
      { code: "RM-FAT-001", name: "Buttercup Margarine / Butter", pct: 10.0, gramsPerBatch: 1000, rangeNote: "1,000 g" },
      { code: "RM-FLV-001", name: "Unibake Ube Flavor & Color Blend", pct: 3.5, gramsPerBatch: 350, rangeNote: "350 g" },
      { code: "RM-LEV-001", name: "Gloripan Instant Dry Yeast", pct: 1.8, gramsPerBatch: 180, rangeNote: "180 g" },
      { code: "RM-SWT-003", name: "Refined Iodized Fine Salt", pct: 1.5, gramsPerBatch: 150, rangeNote: "150 g" },
      { code: "RM-DRY-002", name: "Master Chef Condensada", pct: 5.0, gramsPerBatch: 500, rangeNote: "500 g" }
    ]
  },
  {
    sku: "BRD-MON-001",
    name: "Classic Monay & Sweet Loaf Kit",
    category: "Heavy Loaf Breads",
    targetFacility: "Pan de Verde & Laurice Delicacies",
    standardBatchFlourKg: 12.5,
    unitKitWeightKg: 18.05,
    unitPieceYield: 250,
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "Moist Crumb",
    ingredients: [
      { code: "RM-FLR-001", name: "Continental All Purpose Flour", pct: 100.0, gramsPerBatch: 12500, rangeNote: "12,500 g" },
      { code: "RM-SWT-002", name: "Refined White Sugar", pct: 20.0, gramsPerBatch: 2500, rangeNote: "2,500 g" },
      { code: "RM-FAT-004", name: "Alpha Margarine", pct: 10.0, gramsPerBatch: 1250, rangeNote: "1,250 g" },
      { code: "RM-DRY-001", name: "Fresh Farm Eggs", pct: 6.0, gramsPerBatch: 750, rangeNote: "750 g (~25 pcs)" },
      { code: "RM-DRY-004", name: "Skim Milk Powder", pct: 5.0, gramsPerBatch: 625, rangeNote: "625 g" },
      { code: "RM-LEV-001", name: "Gloripan Instant Dry Yeast", pct: 1.8, gramsPerBatch: 225, rangeNote: "225 g" },
      { code: "RM-SWT-003", name: "Refined Iodized Fine Salt", pct: 1.6, gramsPerBatch: 200, rangeNote: "200 g" }
    ]
  },
  {
    sku: "PST-ENS-001",
    name: "Special Butter Ensaymada Kit",
    category: "Brioche / Rich Pastry",
    targetFacility: "Pan de Verde & Laurice Delicacies",
    standardBatchFlourKg: 10.0,
    unitKitWeightKg: 17.24,
    unitPieceYield: 200,
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "Moist Rich Crumb",
    ingredients: [
      { code: "RM-FLR-001", name: "Continental All Purpose Flour", pct: 80.0, gramsPerBatch: 8000, rangeNote: "8,000 g" },
      { code: "RM-FLR-006", name: "Soft Cake Flour (General Milling)", pct: 20.0, gramsPerBatch: 2000, rangeNote: "2,000 g" },
      { code: "RM-SWT-002", name: "Refined White Sugar", pct: 22.0, gramsPerBatch: 2200, rangeNote: "2,200 g" },
      { code: "RM-FAT-001", name: "Buttercup Margarine / Butter", pct: 20.0, gramsPerBatch: 2000, rangeNote: "2,000 g" },
      { code: "RM-DRY-001", name: "Fresh Farm Eggs", pct: 15.0, gramsPerBatch: 1500, rangeNote: "1,500 g (~50 pcs)" },
      { code: "RM-DRY-003", name: "Jersey Evaporada", pct: 12.0, gramsPerBatch: 1200, rangeNote: "1,200 g" },
      { code: "RM-LEV-001", name: "Gloripan Instant Dry Yeast", pct: 2.2, gramsPerBatch: 220, rangeNote: "220 g" },
      { code: "RM-SWT-003", name: "Refined Iodized Fine Salt", pct: 1.2, gramsPerBatch: 120, rangeNote: "120 g" }
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
    location: "Indangan Central Plant (Biscocho Hall)",
    manager: "Irene C. Capada",
    headBaker: "Alwen Hermogeno",
    driver: "Internal Grey Zone Airlock Transfer"
  },
  {
    id: "indangan-otap",
    name: "Indangan - Otap Laminated Line",
    location: "Indangan Central Plant (Otap Hall)",
    manager: "Zillah F. Tilan",
    headBaker: "Reymark V. Albia",
    driver: "Internal Grey Zone Airlock Transfer"
  }
];
