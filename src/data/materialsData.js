// 69-SKU Material Master with Dual Unit of Measure (UoM) Engine
// Sourced from authentic JJB Operations Dossier (Indangan Plant LTO No. 3000013388488)

export const MASTER_MATERIALS = [
  {
    code: "RM-FLR-001",
    category: "Flour & Grains",
    brand: "Continental",
    name: "Continental All Purpose Flour",
    supplier: "JCT Wheat & Sugar Products",
    room: "Dry Room 1",
    primaryUom: "Sack",
    secondaryUom: "kg",
    conversionFactor: 25.00,
    threshold: 250, // in kg
    unitCost: 1050, // per Sack
    currentBalance: 1250, // in kg (50 sacks)
    lots: [
      { lotNumber: "LOT-CNT-261015", expiryDate: "2027-04-15", qtySec: 750, location: "Pallet A1" },
      { lotNumber: "LOT-CNT-261101", expiryDate: "2027-05-01", qtySec: 500, location: "Pallet A2" }
    ]
  },
  {
    code: "RM-FLR-002",
    category: "Flour & Grains",
    brand: "Isla",
    name: "3rd Class Isla Flour",
    supplier: "Lucky Roma Trading",
    room: "Dry Room 1",
    primaryUom: "Sack",
    secondaryUom: "kg",
    conversionFactor: 25.00,
    threshold: 500,
    unitCost: 920,
    currentBalance: 11912.75,
    lots: [
      { lotNumber: "LOT-ISL-260920", expiryDate: "2027-03-20", qtySec: 5000, location: "Pallet B1" },
      { lotNumber: "LOT-ISL-261010", expiryDate: "2027-04-10", qtySec: 6912.75, location: "Pallet B2" }
    ]
  },
  {
    code: "RM-FLR-003",
    category: "Flour & Grains",
    brand: "Rossa",
    name: "1st Class Hard Flour (Biscocho Base)",
    supplier: "Lucky Roma Trading",
    room: "Dry Room 1",
    primaryUom: "Sack",
    secondaryUom: "kg",
    conversionFactor: 25.00,
    threshold: 375,
    unitCost: 1120,
    currentBalance: 4275,
    lots: [
      { lotNumber: "LOT-ROS-261005", expiryDate: "2027-04-05", qtySec: 2000, location: "Pallet C1" },
      { lotNumber: "LOT-ROS-261022", expiryDate: "2027-04-22", qtySec: 2275, location: "Pallet C2" }
    ]
  },
  {
    code: "RM-FLR-004",
    category: "Flour & Grains",
    brand: "General Milling",
    name: "General Milling Soft Flour",
    supplier: "Lucky Roma Trading",
    room: "Dry Room 1",
    primaryUom: "Sack",
    secondaryUom: "kg",
    conversionFactor: 25.00,
    threshold: 250,
    unitCost: 980,
    currentBalance: 1900,
    lots: [
      { lotNumber: "LOT-GMC-260918", expiryDate: "2027-03-18", qtySec: 1900, location: "Pallet D1" }
    ]
  },
  {
    code: "RM-FLR-005",
    category: "Flour & Grains",
    brand: "Master Chef",
    name: "100% Pure Cornstarch (Gawgaw)",
    supplier: "Lucky Roma Trading",
    room: "Dry Room 1",
    primaryUom: "Sack",
    secondaryUom: "kg",
    conversionFactor: 25.00,
    threshold: 50,
    unitCost: 850,
    currentBalance: 50,
    lots: [
      { lotNumber: "LOT-CRN-260812", expiryDate: "2027-02-12", qtySec: 50, location: "Pallet D2" }
    ]
  },
  {
    code: "RM-FLR-006",
    category: "Flour & Grains",
    brand: "General Milling",
    name: "Soft Cake Flour (Low-Protein / Chlorinated)",
    supplier: "Lucky Roma Trading",
    room: "Dry Room 1",
    primaryUom: "Sack",
    secondaryUom: "kg",
    conversionFactor: 25.00,
    threshold: 50,
    unitCost: 1150,
    currentBalance: 25,
    lots: [
      { lotNumber: "LOT-CKF-260820", expiryDate: "2027-02-20", qtySec: 25, location: "Pallet D3" }
    ]
  },
  {
    code: "RM-DRY-005",
    category: "Flour & Grains",
    brand: "Good Seed Co.",
    name: "Desiccated Coconut (Medium / Fine Grade 500g)",
    supplier: "JCT Wheat & Sugar Products",
    room: "Dry Room 1",
    primaryUom: "Bag",
    secondaryUom: "kg",
    conversionFactor: 0.50,
    threshold: 5,
    unitCost: 75,
    currentBalance: 14.5,
    lots: [
      { lotNumber: "LOT-DCO-260901", expiryDate: "2027-03-01", qtySec: 14.5, location: "Shelf 1A" }
    ]
  },
  {
    code: "RM-FAT-001",
    category: "Fats & Oils",
    brand: "Magnolia Buttercup",
    name: "Buttercup Margarine / Bakery Butter (0°C Cellophane Sticker)",
    supplier: "P.L. Sebastian Corporation",
    room: "Cold Room",
    primaryUom: "Block",
    secondaryUom: "kg",
    conversionFactor: 1.00,
    threshold: 25,
    unitCost: 110,
    currentBalance: 129,
    lots: [
      { lotNumber: "LOT-BC-20261020", expiryDate: "2027-01-20", qtySec: 40, location: "Freezer Bin 1" },
      { lotNumber: "LOT-BC-20261102", expiryDate: "2027-02-02", qtySec: 89, location: "Freezer Bin 2" }
    ]
  },
  {
    code: "RM-FAT-002",
    category: "Fats & Oils",
    brand: "Marca Leon",
    name: "Marca Leon Coconut Oil",
    supplier: "Lucky Roma Trading",
    room: "Wet Room",
    primaryUom: "Tin Can",
    secondaryUom: "kg",
    conversionFactor: 17.00,
    threshold: 85,
    unitCost: 1450,
    currentBalance: 102,
    lots: [
      { lotNumber: "LOT-ML-261011", expiryDate: "2027-04-11", qtySec: 102, location: "Bundy Tray 1" }
    ]
  },
  {
    code: "RM-FAT-003",
    category: "Fats & Oils",
    brand: "Sunny Suy",
    name: "Vegetable Shortening (Laminated Otap/Pastry)",
    supplier: "Lucky Roma Trading",
    room: "Wet Room",
    primaryUom: "Laton",
    secondaryUom: "kg",
    conversionFactor: 30.00,
    threshold: 150,
    unitCost: 2200,
    currentBalance: 960,
    lots: [
      { lotNumber: "LOT-SS-260915", expiryDate: "2027-03-15", qtySec: 360, location: "Bundy Tray 2" },
      { lotNumber: "LOT-SS-261025", expiryDate: "2027-04-25", qtySec: 600, location: "Bundy Tray 3" }
    ]
  },
  {
    code: "RM-FAT-004",
    category: "Fats & Oils",
    brand: "Alpha Margarine",
    name: "Margarine (Commercial Bakery Bulk)",
    supplier: "JCT Wheat & Sugar Products",
    room: "Wet Room",
    primaryUom: "Laton",
    secondaryUom: "kg",
    conversionFactor: 40.00,
    threshold: 120,
    unitCost: 2850,
    currentBalance: 544,
    lots: [
      { lotNumber: "LOT-ALP-261001", expiryDate: "2027-04-01", qtySec: 544, location: "Bundy Tray 4" }
    ]
  },
  {
    code: "RM-FAT-005",
    category: "Fats & Oils",
    brand: "Unlabeled",
    name: "Palm Oil (Food Grade Certified)",
    supplier: "Lucky Roma Trading",
    room: "Wet Room",
    primaryUom: "Tin Can",
    secondaryUom: "kg",
    conversionFactor: 17.00,
    threshold: 85,
    unitCost: 1380,
    currentBalance: 68,
    lots: [
      { lotNumber: "LOT-PLM-261014", expiryDate: "2027-04-14", qtySec: 68, location: "Bundy Tray 5" }
    ]
  },
  {
    code: "RM-SWT-001",
    category: "Sweeteners",
    brand: "Crystal Sugar Co.",
    name: "Crystal Brown Sugar",
    supplier: "Davao Great Wall Trading, Inc.",
    room: "Dry Room 1",
    primaryUom: "Sack",
    secondaryUom: "kg",
    conversionFactor: 50.00,
    threshold: 250,
    unitCost: 3100,
    currentBalance: 846.77,
    lots: [
      { lotNumber: "LOT-CSB-261008", expiryDate: "2027-04-08", qtySec: 846.77, location: "Pallet E1" }
    ]
  },
  {
    code: "RM-SWT-002",
    category: "Sweeteners",
    brand: "Busco Cane",
    name: "Refined White Sugar",
    supplier: "Davao Great Wall Trading, Inc.",
    room: "Dry Room 1",
    primaryUom: "Sack",
    secondaryUom: "kg",
    conversionFactor: 50.00,
    threshold: 250,
    unitCost: 3450,
    currentBalance: 1250,
    lots: [
      { lotNumber: "LOT-BSC-261019", expiryDate: "2027-04-19", qtySec: 1250, location: "Pallet E2" }
    ]
  },
  {
    code: "RM-SWT-003",
    category: "Sweeteners & Salt",
    brand: "Fidelis / Master Chef",
    name: "Refined Iodized Fine Salt (ASIN Law RA 8172)",
    supplier: "P.L. Sebastian Corporation",
    room: "Dry Room 1",
    primaryUom: "Sack",
    secondaryUom: "kg",
    conversionFactor: 25.00,
    threshold: 50,
    unitCost: 480,
    currentBalance: 125,
    lots: [
      { lotNumber: "LOT-SLT-260910", expiryDate: "2027-09-10", qtySec: 125, location: "Pallet F1" }
    ]
  },
  {
    code: "RM-SWT-004",
    category: "Sweeteners",
    brand: "Peotraco / Victoria",
    name: "Confectioners / Powdered Icing Sugar",
    supplier: "Davao Great Wall Trading, Inc.",
    room: "Dry Room 1",
    primaryUom: "Pack",
    secondaryUom: "kg",
    conversionFactor: 2.00,
    threshold: 20,
    unitCost: 140,
    currentBalance: 56,
    lots: [
      { lotNumber: "LOT-ICG-261003", expiryDate: "2027-04-03", qtySec: 56, location: "Shelf 2A" }
    ]
  },
  {
    code: "RM-DRY-001",
    category: "Dairy & Eggs",
    brand: "Local Coop",
    name: "Fresh Farm Eggs (Sanitizing Rinse Protocol)",
    supplier: "Local Poultry Coop",
    room: "Wet Room",
    primaryUom: "Tray",
    secondaryUom: "pcs",
    conversionFactor: 30.00,
    threshold: 1500,
    unitCost: 225,
    currentBalance: 3885, // in pcs (129.5 trays)
    lots: [
      { lotNumber: "EGG-20261013", expiryDate: "2026-11-15", qtySec: 1200, location: "Egg Racks A" }, // Alert: < 30 days
      { lotNumber: "EGG-20261028", expiryDate: "2026-11-28", qtySec: 2685, location: "Egg Racks B" }
    ]
  },
  {
    code: "RM-DRY-002",
    category: "Dairy & Eggs",
    brand: "Master Chef",
    name: "Condensada (1kg Tin Can)",
    supplier: "Lucky Roma Trading",
    room: "Wet Room",
    primaryUom: "Tin Can",
    secondaryUom: "kg",
    conversionFactor: 1.00,
    threshold: 50,
    unitCost: 88,
    currentBalance: 555,
    lots: [
      { lotNumber: "LOT-CND-260905", expiryDate: "2027-03-05", qtySec: 555, location: "Shelf 3A" }
    ]
  },
  {
    code: "RM-DRY-003",
    category: "Dairy & Eggs",
    brand: "Jersey",
    name: "Evaporada (370ml Tin Can / 48 Cans)",
    supplier: "Golden Fortune Trading",
    room: "Wet Room",
    primaryUom: "Box",
    secondaryUom: "can",
    conversionFactor: 48.00,
    threshold: 240,
    unitCost: 1420,
    currentBalance: 1393,
    lots: [
      { lotNumber: "LOT-EVP-260912", expiryDate: "2027-03-12", qtySec: 1393, location: "Shelf 3B" }
    ]
  },
  {
    code: "RM-DRY-004",
    category: "Dairy & Eggs",
    brand: "Farmland A.",
    name: "Skim Milk Powder (Hygroscopic)",
    supplier: "JCT Wheat & Sugar Products",
    room: "Dry Room 1",
    primaryUom: "Sack",
    secondaryUom: "kg",
    conversionFactor: 25.00,
    threshold: 75,
    unitCost: 3200,
    currentBalance: 175,
    lots: [
      { lotNumber: "LOT-MLK-261016", expiryDate: "2027-04-16", qtySec: 175, location: "Pallet F2" }
    ]
  },
  {
    code: "RM-LEV-001",
    category: "Leavening & Additives",
    brand: "Gloripan",
    name: "Gloripan Instant Dry Yeast (10kg Box)",
    supplier: "JCT Wheat & Sugar Products",
    room: "Dry Room 1",
    primaryUom: "Box",
    secondaryUom: "kg",
    conversionFactor: 10.00,
    threshold: 30,
    unitCost: 1850,
    currentBalance: 40,
    lots: [
      { lotNumber: "LOT-YST-261020", expiryDate: "2027-04-20", qtySec: 40, location: "Shelf 4A" }
    ]
  },
  {
    code: "RM-LEV-002",
    category: "Leavening & Additives",
    brand: "Calumet",
    name: "Calumet Baking Powder (14kg Bag)",
    supplier: "JCT Wheat & Sugar Products",
    room: "Dry Room 1",
    primaryUom: "Bag",
    secondaryUom: "kg",
    conversionFactor: 14.00,
    threshold: 28,
    unitCost: 1650,
    currentBalance: 135,
    lots: [
      { lotNumber: "LOT-CAL-260914", expiryDate: "2027-03-14", qtySec: 135, location: "Shelf 4B" }
    ]
  },
  {
    code: "RM-LEV-003",
    category: "Leavening & Additives",
    brand: "Food Grade FCC",
    name: "Calcium Propionate (CSP Bread Mold Inhibitor)",
    supplier: "P.L. Sebastian Corporation",
    room: "Dry Room 1",
    primaryUom: "Pack",
    secondaryUom: "kg",
    conversionFactor: 1.00,
    threshold: 10,
    unitCost: 260,
    currentBalance: 24,
    lots: [
      { lotNumber: "LOT-CSP-260830", expiryDate: "2027-08-30", qtySec: 24, location: "Shelf 4C" }
    ]
  },
  {
    code: "RM-LEV-004",
    category: "Leavening & Additives",
    brand: "Food Grade FCC",
    name: "Potassium Sorbate (Granular Antimicrobial)",
    supplier: "P.L. Sebastian Corporation",
    room: "Dry Room 1",
    primaryUom: "Pack",
    secondaryUom: "kg",
    conversionFactor: 1.00,
    threshold: 5,
    unitCost: 310,
    currentBalance: 18,
    lots: [
      { lotNumber: "LOT-PSB-260905", expiryDate: "2027-09-05", qtySec: 18, location: "Shelf 4C" }
    ]
  },
  {
    code: "RM-LEV-005",
    category: "Leavening & Additives",
    brand: "Baker's Choice",
    name: "Baker's Choice Non-Bromated Bread Improver",
    supplier: "P.L. Sebastian Corporation",
    room: "Dry Room 1",
    primaryUom: "Pack",
    secondaryUom: "kg",
    conversionFactor: 1.00,
    threshold: 15,
    unitCost: 195,
    currentBalance: 42,
    lots: [
      { lotNumber: "LOT-BCI-260920", expiryDate: "2027-03-20", qtySec: 42, location: "Shelf 4D" }
    ]
  },
  {
    code: "RM-FLV-001",
    category: "Flavors & Colors",
    brand: "Unibake",
    name: "Unibake Ube Flavor & Color Blend (5L Jug)",
    supplier: "JCT Wheat & Sugar Products",
    room: "Wet Room",
    primaryUom: "Bottle",
    secondaryUom: "L",
    conversionFactor: 5.00,
    threshold: 15,
    unitCost: 1100,
    currentBalance: 35,
    lots: [
      { lotNumber: "LOT-UBE-260910", expiryDate: "2027-03-10", qtySec: 35, location: "Shelf 5A" }
    ]
  },
  {
    code: "RM-FLV-002",
    category: "Flavors & Colors",
    brand: "Kanegie Food",
    name: "Vanilla Flavor FF (3.79L Gallon)",
    supplier: "Lucky Roma Trading",
    room: "Wet Room",
    primaryUom: "Gallon",
    secondaryUom: "L",
    conversionFactor: 3.79,
    threshold: 11.37,
    unitCost: 950,
    currentBalance: 22.74,
    lots: [
      { lotNumber: "LOT-VAN-260915", expiryDate: "2027-03-15", qtySec: 22.74, location: "Shelf 5A" }
    ]
  },
  {
    code: "RM-FLV-004",
    category: "Flavors & Colors",
    brand: "McCormick / Pure",
    name: "Pure Ground Cinnamon Powder (Biscocho Glaze)",
    supplier: "P.L. Sebastian Corporation",
    room: "Dry Room 1",
    primaryUom: "Pack",
    secondaryUom: "kg",
    conversionFactor: 1.00,
    threshold: 5,
    unitCost: 450,
    currentBalance: 12,
    lots: [
      { lotNumber: "LOT-CIN-260815", expiryDate: "2027-08-15", qtySec: 12, location: "Shelf 5B" }
    ]
  },
  {
    code: "PM-PAP-001",
    category: "Packaging Materials",
    brand: "Mandaue Libertad",
    name: "Glassine Wax Paper Sheets (Otap Wrapping)",
    supplier: "Mandaue Libertad",
    room: "Dry Room 2",
    primaryUom: "Rim",
    secondaryUom: "pcs",
    conversionFactor: 500.00,
    threshold: 2500,
    unitCost: 480,
    currentBalance: 5000,
    lots: [
      { lotNumber: "LOT-GLS-260822", expiryDate: "2028-08-22", qtySec: 5000, location: "Rack P1" }
    ]
  },
  {
    code: "PM-PAP-002",
    category: "Packaging Materials",
    brand: "Pattern Paper",
    name: "Baking Pan Pattern Paper (Laminated Sheets)",
    supplier: "JCT Wheat & Sugar Products",
    room: "Dry Room 2",
    primaryUom: "Rim",
    secondaryUom: "pcs",
    conversionFactor: 500.00,
    threshold: 1500,
    unitCost: 520,
    currentBalance: 2500,
    lots: [
      { lotNumber: "LOT-PTR-260905", expiryDate: "2028-09-05", qtySec: 2500, location: "Rack P2" }
    ]
  },
  {
    code: "PM-BOX-001",
    category: "Packaging Materials",
    brand: "Jang-Jang",
    name: "Jang-Jang Master Shipping Carton Box (50 pk/box)",
    supplier: "C-One",
    room: "Dry Room 2",
    primaryUom: "Rim",
    secondaryUom: "pcs",
    conversionFactor: 20.00,
    threshold: 100,
    unitCost: 350,
    currentBalance: 400,
    lots: [
      { lotNumber: "LOT-BX-260910", expiryDate: "2028-09-10", qtySec: 400, location: "Rack P3" }
    ]
  },
  {
    code: "UT-GAS-001",
    category: "Utilities & Fuel",
    brand: "Solane",
    name: "Solane LPG 50kg Industrial Tank",
    supplier: "D'Unibuenas Corporation",
    room: "Wet Room",
    primaryUom: "Tank",
    secondaryUom: "tank",
    conversionFactor: 1.00,
    threshold: 2,
    unitCost: 4600,
    currentBalance: 6,
    lots: [
      { lotNumber: "LOT-GAS-261029", expiryDate: "2027-10-29", qtySec: 6, location: "Gas Bunker Chained" }
    ]
  }
];

export const STORAGE_ROOMS = [
  { id: "Dry Room 1", name: "Dry Room 1", desc: "Flour sacks, bulk sugars, starches, salt (<25°C, RH <65%)" },
  { id: "Dry Room 2", name: "Dry Room 2", desc: "Packaging materials, glassine paper, boxes, kitting window (<28°C)" },
  { id: "Cold Room", name: "Cold Room (0°C)", desc: "Magnolia Buttercup blocks exclusively (0°C to -4°C freezer)" },
  { id: "Wet Room", name: "Wet Room", desc: "Oils, shortening, fresh farm eggs, flavors, LPG tanks (<30°C)" }
];
