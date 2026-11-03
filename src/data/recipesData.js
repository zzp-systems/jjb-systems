// Master Formulation & Product Recipe Register
// Governed by SOP-WAR-002 / SOP-PRO-004 Rev. 04 (JJB-MAN-001 Indangan Site LTO No. 3000013388488)

export const MASTER_RECIPES = [
  {
    sku: "BIS-001",
    name: "Biscocho Toasted Bread Delicacy",
    category: "Pasalubong / Shelf-Stable Delicacy",
    targetFacility: "Indangan Biscocho Hall & Outlets",
    standardBatchFlourKg: 25.0, // 1 sack flour basis
    unitPieceYield: 1000, // 1,000 finished toasted pieces / ~83 packs
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
      { code: "PM-PAP-002", name: "Baking Pan Pattern Paper", pct: 0.0, gramsPerBatch: 25, isPackaging: true } // 25 sheets
    ]
  },
  {
    sku: "OTP-001",
    name: "Otap Layered Laminated Puff Pastry",
    category: "Laminated Dry Delicacy",
    targetFacility: "Indangan Otap Hall & Outlets",
    standardBatchFlourKg: 25.0,
    unitPieceYield: 1200, // 1,200 pcs (100 dozen)
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "0.20 – 0.30 aw",
    ingredients: [
      { code: "RM-FLR-003", name: "1st Class Hard Flour (Rossa)", pct: 80.0, gramsPerBatch: 20000 },
      { code: "RM-FLR-004", name: "Soft Flour (General Milling)", pct: 20.0, gramsPerBatch: 5000 },
      { code: "RM-FAT-003", name: "Vegetable Shortening (Sunny Suy)", pct: 35.0, gramsPerBatch: 8750 },
      { code: "RM-SWT-002", name: "Refined White Sugar (Coating & Mix)", pct: 25.0, gramsPerBatch: 6250 },
      { code: "RM-SWT-003", name: "Refined Iodized Fine Salt", pct: 1.5, gramsPerBatch: 375 },
      { code: "PM-PAP-001", name: "Glassine Wax Paper Sheets", pct: 0.0, gramsPerBatch: 600, isPackaging: true } // 600 wraps
    ]
  },
  {
    sku: "BRD-PAN-001",
    name: "Classic Davao Pandesal",
    category: "Breads / Daily Outlets",
    targetFacility: "Pan de Verde & Laurice Delicacies",
    standardBatchFlourKg: 12.5, // 0.5 sack flour basis
    unitPieceYield: 450, // 450 pcs (35g raw)
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "Moist Crumb",
    ingredients: [
      { code: "RM-FLR-001", name: "Continental All Purpose Flour", pct: 70.0, gramsPerBatch: 8750 },
      { code: "RM-FLR-002", name: "3rd Class Isla Flour", pct: 30.0, gramsPerBatch: 3750 },
      { code: "RM-SWT-001", name: "Crystal Brown Sugar", pct: 16.0, gramsPerBatch: 2000 },
      { code: "RM-FAT-004", name: "Alpha Margarine", pct: 8.0, gramsPerBatch: 1000 },
      { code: "RM-LEV-001", name: "Gloripan Instant Dry Yeast", pct: 1.6, gramsPerBatch: 200 },
      { code: "RM-SWT-003", name: "Refined Iodized Fine Salt", pct: 1.6, gramsPerBatch: 200 },
      { code: "RM-DRY-004", name: "Skim Milk Powder (Farmland)", pct: 4.0, gramsPerBatch: 500 },
      { code: "RM-LEV-003", name: "Calcium Propionate (CSP Mold Inhibitor)", pct: 0.3, gramsPerBatch: 37.5 }
    ]
  },
  {
    sku: "BRD-UBE-001",
    name: "Special Ube Cheese Pandesal",
    category: "Signature Outlet Pastry",
    targetFacility: "Pan de Verde & Laurice Delicacies",
    standardBatchFlourKg: 10.0,
    unitPieceYield: 300,
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "Moist Crumb",
    ingredients: [
      { code: "RM-FLR-001", name: "Continental All Purpose Flour", pct: 100.0, gramsPerBatch: 10000 },
      { code: "RM-SWT-002", name: "Refined White Sugar", pct: 18.0, gramsPerBatch: 1800 },
      { code: "RM-FAT-001", name: "Buttercup Margarine / Butter", pct: 10.0, gramsPerBatch: 1000 },
      { code: "RM-FLV-001", name: "Unibake Ube Flavor & Color Blend", pct: 3.5, gramsPerBatch: 350 },
      { code: "RM-LEV-001", name: "Gloripan Instant Dry Yeast", pct: 1.8, gramsPerBatch: 180 },
      { code: "RM-SWT-003", name: "Refined Iodized Fine Salt", pct: 1.5, gramsPerBatch: 150 },
      { code: "RM-DRY-002", name: "Master Chef Condensada", pct: 5.0, gramsPerBatch: 500 }
    ]
  },
  {
    sku: "BRD-MON-001",
    name: "Classic Monay & Sweet Loaf",
    category: "Heavy Loaf Breads",
    targetFacility: "Pan de Verde & Laurice Delicacies",
    standardBatchFlourKg: 12.5,
    unitPieceYield: 250,
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "Moist Crumb",
    ingredients: [
      { code: "RM-FLR-001", name: "Continental All Purpose Flour", pct: 100.0, gramsPerBatch: 12500 },
      { code: "RM-SWT-002", name: "Refined White Sugar", pct: 20.0, gramsPerBatch: 2500 },
      { code: "RM-FAT-004", name: "Alpha Margarine", pct: 10.0, gramsPerBatch: 1250 },
      { code: "RM-DRY-001", name: "Fresh Farm Eggs", pct: 6.0, gramsPerBatch: 750 }, // ~25 eggs
      { code: "RM-DRY-004", name: "Skim Milk Powder", pct: 5.0, gramsPerBatch: 625 },
      { code: "RM-LEV-001", name: "Gloripan Instant Dry Yeast", pct: 1.8, gramsPerBatch: 225 },
      { code: "RM-SWT-003", name: "Refined Iodized Fine Salt", pct: 1.6, gramsPerBatch: 200 }
    ]
  },
  {
    sku: "PST-ENS-001",
    name: "Special Butter Ensaymada",
    category: "Brioche / Rich Pastry",
    targetFacility: "Pan de Verde & Laurice Delicacies",
    standardBatchFlourKg: 10.0,
    unitPieceYield: 200,
    doughExitTempTarget: "26°C – 28°C",
    ccp1LethalityTarget: "> 95°C",
    waterActivityLimit: "Moist Rich Crumb",
    ingredients: [
      { code: "RM-FLR-001", name: "Continental All Purpose Flour", pct: 80.0, gramsPerBatch: 8000 },
      { code: "RM-FLR-006", name: "Cake Flour (General Milling)", pct: 20.0, gramsPerBatch: 2000 },
      { code: "RM-SWT-002", name: "Refined White Sugar", pct: 22.0, gramsPerBatch: 2200 },
      { code: "RM-FAT-001", name: "Buttercup Margarine / Butter", pct: 20.0, gramsPerBatch: 2000 },
      { code: "RM-DRY-001", name: "Fresh Farm Eggs", pct: 15.0, gramsPerBatch: 1500 }, // ~50 eggs
      { code: "RM-DRY-003", name: "Jersey Evaporada", pct: 12.0, gramsPerBatch: 1200 },
      { code: "RM-LEV-001", name: "Gloripan Instant Dry Yeast", pct: 2.2, gramsPerBatch: 220 },
      { code: "RM-SWT-003", name: "Refined Iodized Fine Salt", pct: 1.2, gramsPerBatch: 120 }
    ]
  },
  {
    sku: "SUB-GLZ-001",
    name: "Biscocho Buttermilk Sweet Glaze (Banya Sub-Line)",
    category: "Glaze / Sub-Assembly",
    targetFacility: "Indangan Biscocho Hall",
    standardBatchFlourKg: 0.0,
    unitPieceYield: 1500, // Glazes 1500 slices
    doughExitTempTarget: "Ambient (< 4hr OPRP limit)",
    ccp1LethalityTarget: "Toast bake CCP-2",
    waterActivityLimit: "Dry Sugar Glaze",
    ingredients: [
      { code: "RM-SWT-002", name: "Refined White Sugar", pct: 50.0, gramsPerBatch: 10000 },
      { code: "RM-FAT-001", name: "Buttercup Margarine / Butter", pct: 35.0, gramsPerBatch: 7000 },
      { code: "RM-DRY-003", name: "Jersey Evaporada", pct: 10.0, gramsPerBatch: 2000 },
      { code: "RM-FLV-004", name: "Pure Ground Cinnamon Powder", pct: 1.0, gramsPerBatch: 200 },
      { code: "RM-FLV-002", name: "Vanilla Flavor FF", pct: 0.5, gramsPerBatch: 100 }
    ]
  }
];

export const OUTLETS = [
  {
    id: "pan-de-verde",
    name: "Pan de Verde Outlet",
    location: "Purok 8, Communal, Davao City",
    manager: "Jhoanna Tejano",
    headBaker: "Feliciano T. Gomera",
    contact: "+63 905-218-2190",
    driver: "Othniel Tilan"
  },
  {
    id: "laurice-delicacies",
    name: "Laurice Delicacies Outlet",
    location: "Lower Quary, Brgy 5-A, Bankerohan, Davao City",
    manager: "Anecita S. Blase",
    headBaker: "Raffy Boy P. Cortes",
    contact: "+63 927-142-1510",
    driver: "Roberto S. Blase"
  },
  {
    id: "indangan-biscocho",
    name: "Indangan - Biscocho Commercial Line",
    location: "Indangan Plant (Biscocho Hall)",
    manager: "Irene C. Capada",
    headBaker: "Alwen Hermogeno",
    contact: "Plant Ext 102",
    driver: "Internal Floor Transfer"
  },
  {
    id: "indangan-otap",
    name: "Indangan - Otap Laminated Line",
    location: "Indangan Plant (Otap Hall)",
    manager: "Zillah F. Tilan",
    headBaker: "Reymark V. Albia",
    contact: "Plant Ext 104",
    driver: "Internal Floor Transfer"
  }
];
