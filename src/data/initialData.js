// Initial Seeds for Transactions, Kitting Orders, Calibration, and Audit Trail

export const INITIAL_RECEIVING_REPORTS = [
  {
    reportNo: "RR-2026-1103-01",
    poNo: "PO-2026-1042",
    drNo: "DR-88491",
    supplier: "P.L. Sebastian Corporation",
    invoiceNo: "Charge Invoice #26223",
    date: "2026-11-03",
    time: "08:15",
    receiver: "Jade Q. Dela Cruz",
    deliveryVehicle: "Isuzu Elf Dropside (Plate: LAE-4912) - Sanitized & Covered",
    items: [
      {
        materialCode: "RM-FAT-001",
        name: "Buttercup Margarine / Bakery Butter",
        primaryQty: 40,
        primaryUom: "Block",
        conversionFactor: 1.0,
        secondaryQty: 40,
        secondaryUom: "kg",
        unitPrice: 110.0,
        totalAmount: 4400.0,
        lotNumber: "LOT-BC-20261102",
        expiryDate: "2027-02-02",
        storageRoom: "Cold Room",
        binLocation: "Freezer Bin 2",
        qtyDamaged: 0,
        inspectionGate: {
          chilledTempCheck: "PASS (Recorded -1.5°C in locked freezer transport)",
          cellophaneExpirySticker: "VERIFIED (Indelible print present on all 40 cellophanes)",
          cleanVehicleCheck: "PASS (Clean deck, zero fuel odor)",
          foodGradeCert: "VERIFIED (CoA on file)"
        }
      },
      {
        materialCode: "RM-SWT-003",
        name: "Refined Iodized Fine Salt (RA 8172)",
        primaryQty: 5,
        primaryUom: "Sack",
        conversionFactor: 25.0,
        secondaryQty: 125,
        secondaryUom: "kg",
        unitPrice: 480.0,
        totalAmount: 2400.0,
        lotNumber: "LOT-SLT-260910",
        expiryDate: "2027-09-10",
        storageRoom: "Dry Room 1",
        binLocation: "Pallet F1",
        qtyDamaged: 0,
        inspectionGate: {
          chilledTempCheck: "N/A (Dry ambient)",
          cellophaneExpirySticker: "N/A",
          cleanVehicleCheck: "PASS",
          foodGradeCert: "VERIFIED (Iodization assay certificate attached)"
        }
      }
    ],
    overallStatus: "ACCEPTED CLEAN",
    totalPaid: 6800.0,
    qcSignoff: "Jade Q. Dela Cruz (Warehouse Supervisor) & Grace P. Suico (QA Director)"
  },
  {
    reportNo: "RR-2026-1102-01",
    poNo: "PO-2026-1039",
    drNo: "DR-79102",
    supplier: "Lucky Roma Trading",
    invoiceNo: "Charge Invoice #19842",
    date: "2026-11-02",
    time: "10:30",
    receiver: "Jade Q. Dela Cruz",
    deliveryVehicle: "Mitsubishi Canter (Plate: MAA-3108)",
    items: [
      {
        materialCode: "RM-FLR-003",
        name: "1st Class Hard Flour (Rossa)",
        primaryQty: 80,
        primaryUom: "Sack",
        conversionFactor: 25.0,
        secondaryQty: 2000,
        secondaryUom: "kg",
        unitPrice: 1120.0,
        totalAmount: 89600.0,
        lotNumber: "LOT-ROS-261022",
        expiryDate: "2027-04-22",
        storageRoom: "Dry Room 1",
        binLocation: "Pallet C2",
        qtyDamaged: 1, // 1 sack torn
        inspectionGate: {
          chilledTempCheck: "N/A",
          cellophaneExpirySticker: "N/A",
          cleanVehicleCheck: "PASS",
          foodGradeCert: "VERIFIED (Flour Fortification Certificate attached)"
        }
      }
    ],
    overallStatus: "PARTIALLY DAMAGED (1 Sack Torn / Repacked to Form-NCR-001)",
    totalPaid: 89600.0,
    qcSignoff: "Jade Q. Dela Cruz"
  }
];

export const INITIAL_WITHDRAWALS = [
  {
    slipNo: "WS-2026-1103-01",
    date: "2026-11-03",
    time: "07:15",
    requestingEntity: "Indangan - Biscocho Commercial Line",
    department: "Production - Biscocho Hall",
    purpose: "Commercial Morning Run Biscocho (Batch 1)",
    requestedBy: "Alwen Hermogeno (Master Head Baker)",
    issuedBy: "Jade Q. Dela Cruz (Warehouse Supervisor)",
    receivedBy: "Vicky Albino (Authorized Baker)",
    items: [
      {
        materialCode: "RM-FLR-003",
        name: "1st Class Hard Flour (Rossa)",
        qtyRequestedSec: 50.0, // 2 sacks
        qtyIssuedSec: 50.0,
        secondaryUom: "kg",
        lotNumber: "LOT-ROS-261005",
        storageRoom: "Dry Room 1",
        remarks: "Strict FEFO lot rotation checked"
      },
      {
        materialCode: "RM-SWT-002",
        name: "Refined White Sugar (Busco)",
        qtyRequestedSec: 6.0,
        qtyIssuedSec: 6.0,
        secondaryUom: "kg",
        lotNumber: "LOT-BSC-261019",
        storageRoom: "Dry Room 1",
        remarks: "Drawn from sealed HDPE bin"
      },
      {
        materialCode: "RM-FAT-001",
        name: "Buttercup Margarine / Butter",
        qtyRequestedSec: 4.0,
        qtyIssuedSec: 4.0,
        secondaryUom: "kg",
        lotNumber: "LOT-BC-20261020",
        storageRoom: "Cold Room",
        remarks: "Tempered to 18°C prior to release"
      }
    ],
    status: "ISSUED & RECONCILED"
  },
  {
    slipNo: "WS-2026-1103-02",
    date: "2026-11-03",
    time: "08:45",
    requestingEntity: "Pan de Verde Outlet (Communal)",
    department: "Retail Outlets Dispatch",
    purpose: "Daily Outlet Kitted Dough Mix - Classic Pandesal",
    requestedBy: "Feliciano T. Gomera (Head Baker)",
    issuedBy: "Jade Q. Dela Cruz / Romeo B. Malusay",
    receivedBy: "Othniel Tilan (Logistics / Driver)",
    items: [
      {
        materialCode: "RM-FLR-001",
        name: "Continental All Purpose Flour",
        qtyRequestedSec: 17.5,
        qtyIssuedSec: 17.5,
        secondaryUom: "kg",
        lotNumber: "LOT-CNT-261015",
        storageRoom: "Dry Room 1",
        remarks: "Sifted through 40-mesh screen"
      },
      {
        materialCode: "RM-FLR-002",
        name: "3rd Class Isla Flour",
        qtyRequestedSec: 7.5,
        qtyIssuedSec: 7.5,
        secondaryUom: "kg",
        lotNumber: "LOT-ISL-260920",
        storageRoom: "Dry Room 1",
        remarks: "Sifted through 40-mesh screen"
      }
    ],
    status: "ISSUED & RECONCILED"
  }
];

export const INITIAL_BATCHING_ORDERS = [
  {
    orderId: "BORD-2026-1103-01",
    requestDate: "2026-11-03",
    targetDate: "2026-11-03",
    outletId: "pan-de-verde",
    outletName: "Pan de Verde Outlet (Communal)",
    recipeSku: "BRD-PAN-001",
    recipeName: "Classic Davao Pandesal",
    batchMultiplier: 2.0, // 2x formula = 25kg flour basis, 900 pieces
    requestedQtyPcs: 900,
    requestedBy: "Mariejohn F. Tacuban (Order Intake)",
    enteredBy: "Mariejohn F. Tacuban",
    status: "RELEASED", // Pending Batching | Batched / Kitted | Released
    batchTagId: "KIT-20261103-PV01",
    actualBatchedKg: 31.8,
    actualBatchedUnits: 900,
    batchedAt: "2026-11-03 07:30",
    batchedBy: "Romeo B. Malusay",
    scaleUsed: "Scale #3 (Govt Seal #798607 / Bench #1 Seal #798073)",
    sifter40MeshChecked: true,
    climateIceAdjusted: false,
    releasedAt: "2026-11-03 08:15",
    releasedTo: "Othniel Tilan (Pan de Verde Driver)",
    notes: "Unitized into 2 color-coded blue sealed bins for Pan de Verde."
  },
  {
    orderId: "BORD-2026-1103-02",
    requestDate: "2026-11-03",
    targetDate: "2026-11-03",
    outletId: "laurice-delicacies",
    outletName: "Laurice Delicacies Outlet (Bankerohan)",
    recipeSku: "BRD-UBE-001",
    recipeName: "Special Ube Cheese Pandesal",
    batchMultiplier: 1.0, // 300 pieces
    requestedQtyPcs: 300,
    requestedBy: "Anecita S. Blase (Bakery Manager)",
    enteredBy: "Jade Q. Dela Cruz",
    status: "BATCHED_KITTED", // Batched / Kitted by Romeo, awaiting pickup/release
    batchTagId: "KIT-20261103-LD01",
    actualBatchedKg: 14.8,
    actualBatchedUnits: 300,
    batchedAt: "2026-11-03 09:10",
    batchedBy: "Romeo B. Malusay",
    scaleUsed: "Scale #3 (Govt Seal #798607)",
    sifter40MeshChecked: true,
    climateIceAdjusted: true,
    releasedAt: null,
    releasedTo: null,
    notes: "Flaked ice substituted (-1.2% water) per Active Notice #CAN-2026-1029."
  },
  {
    orderId: "BORD-2026-1103-03",
    requestDate: "2026-11-03",
    targetDate: "2026-11-03",
    outletId: "pan-de-verde",
    outletName: "Pan de Verde Outlet (Communal)",
    recipeSku: "PST-ENS-001",
    recipeName: "Special Butter Ensaymada",
    batchMultiplier: 1.0, // 200 pieces
    requestedQtyPcs: 200,
    requestedBy: "Jhoanna Tejano (Bakery Manager)",
    enteredBy: "Jade Q. Dela Cruz",
    status: "PENDING_BATCHING", // Pending Batching for Romeo
    batchTagId: null,
    actualBatchedKg: 0,
    actualBatchedUnits: 0,
    batchedAt: null,
    batchedBy: null,
    scaleUsed: null,
    sifter40MeshChecked: false,
    climateIceAdjusted: false,
    releasedAt: null,
    releasedTo: null,
    notes: "Requires 50 fresh farm eggs (sanitizing wash verified)."
  },
  {
    orderId: "BORD-2026-1103-04",
    requestDate: "2026-11-03",
    targetDate: "2026-11-03",
    outletId: "laurice-delicacies",
    outletName: "Laurice Delicacies Outlet (Bankerohan)",
    recipeSku: "BRD-MON-001",
    recipeName: "Classic Monay & Sweet Loaf",
    batchMultiplier: 1.5, // 375 pieces
    requestedQtyPcs: 375,
    requestedBy: "Raffy Boy P. Cortes (Head Baker)",
    enteredBy: "Mariejohn F. Tacuban",
    status: "PENDING_BATCHING",
    batchTagId: null,
    actualBatchedKg: 0,
    actualBatchedUnits: 0,
    batchedAt: null,
    batchedBy: null,
    scaleUsed: null,
    sifter40MeshChecked: false,
    climateIceAdjusted: false,
    releasedAt: null,
    releasedTo: null,
    notes: "Target delivery before 14:00 for afternoon bake."
  }
];

export const INITIAL_CALIBRATIONS = [
  { sealNo: "Seal #798073", scaleType: "Bench Scale #1 (Dividing)", targetRange: "0 - 15 kg", errorMargin: "± 0.5g", expiryDate: "2027-01-10", status: "PASS", inspectedAt: "2026-11-03 06:45" },
  { sealNo: "Seal #798074", scaleType: "Bench Scale #2 (Packaging QC)", targetRange: "0 - 15 kg", errorMargin: "± 0.5g", expiryDate: "2027-01-10", status: "PASS", inspectedAt: "2026-11-03 06:46" },
  { sealNo: "Seal #798607", scaleType: "1 kg Precision Micro Scale (Batching)", targetRange: "0 - 1000g", errorMargin: "± 0.05g", expiryDate: "2027-01-28", status: "PASS", inspectedAt: "2026-11-03 06:47" },
  { sealNo: "Seal #798606", scaleType: "40 kg Platform (Receiving / Flour)", targetRange: "0 - 50 kg", errorMargin: "± 10g", expiryDate: "2027-01-28", status: "PASS", inspectedAt: "2026-11-03 06:50" },
  { sealNo: "Seal #798605", scaleType: "30 kg Platform (Glaze / Dough)", targetRange: "0 - 30 kg", errorMargin: "± 5g", expiryDate: "2027-01-28", status: "PASS", inspectedAt: "2026-11-03 06:52" }
];

export const INITIAL_ADJUSTMENTS = [
  {
    id: "ADJ-2026-1102-01",
    date: "2026-11-02",
    type: "ADJ-OUT (Tare Loss / Spoilage)",
    materialCode: "RM-FLR-003",
    name: "1st Class Hard Flour (Rossa)",
    qtySec: 25.0, // 1 sack damaged
    uom: "kg",
    reason: "Damaged outer sack torn on pallet delivery dock (PO-2026-1039)",
    author: "Jade Q. Dela Cruz",
    fscoSignoff: "Grace P. Suico",
    ncrNumber: "NCR-2026-1102"
  },
  {
    id: "ADJ-2026-1101-01",
    date: "2026-11-01",
    type: "ADJ-IN (Found Stock / Surplus)",
    materialCode: "PM-PAP-002",
    name: "Baking Pan Pattern Paper",
    qtySec: 500, // 1 rim
    uom: "pcs",
    reason: "Surplus rim verified during quarterly physical inventory count reconciliation",
    author: "Mariejohn F. Tacuban",
    fscoSignoff: "Grace P. Suico",
    ncrNumber: "N/A"
  }
];

export const INITIAL_QUARANTINE = [
  {
    ncrNo: "NCR-2026-1002",
    date: "2026-10-02",
    itemDescription: "NECC Strawberry Red Food Color (Exp: 15 Jul 2025)",
    lotNumber: "LOT-NECC-240715",
    qty: "3 Bottles (1.5 kg)",
    reason: "Expired raw material found in storage (PLI Critical Finding C-2)",
    financialLossPhp: 1450.0,
    disposition: "CONDEMNED & DESTROYED (Witnessed by FDA & FSCO)",
    status: "CLOSED"
  },
  {
    ncrNo: "NCR-2026-1001",
    date: "2026-10-02",
    itemDescription: "Hyper Cacao Powder Super Crave (Exp: 22 Aug 2026)",
    lotNumber: "LOT-HYP-240822",
    qty: "2 Packs (2.0 kg)",
    reason: "Moisture clumping observed inside packaging seal",
    financialLossPhp: 850.0,
    disposition: "WITNESSED DISPOSAL (FSCO Grace Suico)",
    status: "CLOSED"
  }
];

export const EOD_EMAIL_RECIPIENTS = [
  "bmd.jangjangbakeshop@gmail.com",
  "zaphyrzurpomicpic@gmail.com",
  "mcbasoc.jjb@gmail.com",
  "mjtacuban.jjb@gmail.com"
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 1,
    timestamp: "2026-11-03 06:30:00",
    actor: "Jade Q. Dela Cruz",
    role: "Warehouse Supervisor",
    action: "WAREHOUSE_OPEN",
    details: "Unlocked Dry Room 1, Cold Room, and Wet Room. Recorded Cold Room at -1.8°C."
  },
  {
    id: 2,
    timestamp: "2026-11-03 06:55:12",
    actor: "Romeo B. Malusay",
    role: "Ingredient Batching Preparer",
    action: "SCALE_CALIBRATION_CHECK",
    details: "Pre-shift Form-CAL-001 zero-point verification passed for 5 Govt-sealed bench scales (#798073 & #798074)."
  },
  {
    id: 3,
    timestamp: "2026-11-03 07:15:30",
    actor: "Jade Q. Dela Cruz",
    role: "Warehouse Supervisor",
    action: "STOCK_OUT_ISSUANCE",
    details: "Issued Form-WAR-001 slip WS-2026-1103-01 to Biscocho Commercial Line (50kg Rossa flour, 6kg sugar, 4kg buttercup)."
  },
  {
    id: 4,
    timestamp: "2026-11-03 07:32:00",
    actor: "Romeo B. Malusay",
    role: "Ingredient Batching Preparer",
    action: "BATCH_KITTED",
    details: "Batched and certified 2x Classic Davao Pandesal (Tag: KIT-20261103-PV01) for Pan de Verde Outlet."
  },
  {
    id: 5,
    timestamp: "2026-11-03 08:15:20",
    actor: "Romeo B. Malusay",
    role: "Ingredient Batching Preparer",
    action: "BATCH_RELEASED",
    details: "Released KIT-20261103-PV01 to driver Othniel Tilan for Pan de Verde Outlet."
  },
  {
    id: 6,
    timestamp: "2026-11-03 08:18:45",
    actor: "Jade Q. Dela Cruz",
    role: "Warehouse Supervisor",
    action: "INBOUND_RECEIVING",
    details: "Inspected and accepted delivery PO-2026-1042 from P.L. Sebastian (40 blocks Buttercup Margarine, 5 sacks Iodized Salt). 0°C cellophane stickers verified."
  }
];
