import React, { useState } from 'react';
import { 
  Plus, Trash2, CheckCircle2, AlertTriangle, ShieldCheck, 
  Printer, ArrowDownRight, Truck, FileCheck, Thermometer
} from 'lucide-react';

export default function ReceivingModule({ 
  inventory, 
  onSaveReceiving, 
  receivingReports, 
  currentRole,
  isMobileMode,
  prefilledItem 
}) {
  const [reportNo, setReportNo] = useState(`RR-2026-1103-0${receivingReports.length + 1}`);
  const [poNo, setPoNo] = useState('');
  const [drNo, setDrNo] = useState('');
  const [supplier, setSupplier] = useState('P.L. Sebastian Corporation');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [deliveryVehicle, setDeliveryVehicle] = useState('Isuzu Elf Dropside (Clean Deck, Sanitized)');
  const [selectedReportView, setSelectedReportView] = useState(null);

  // Receiving Items
  const [receivingItems, setReceivingItems] = useState([
    prefilledItem ? {
      materialCode: prefilledItem.code,
      name: prefilledItem.name,
      primaryQty: 10,
      primaryUom: prefilledItem.primaryUom,
      conversionFactor: prefilledItem.conversionFactor,
      secondaryQty: 10 * prefilledItem.conversionFactor,
      secondaryUom: prefilledItem.secondaryUom,
      unitPrice: prefilledItem.unitCost || 1000,
      totalAmount: 10 * (prefilledItem.unitCost || 1000),
      lotNumber: `LOT-${prefilledItem.code.split('-')[1] || 'MAT'}-${new Date().toISOString().slice(2,10).replace(/-/g,'')}`,
      expiryDate: '2027-05-15',
      storageRoom: prefilledItem.room,
      binLocation: 'Pallet 1A',
      qtyDamaged: 0,
      chilledTemp: '-1.0',
      butterCellophaneSticker: true,
      eggRinsePassed: true,
      coaPassed: true
    } : {
      materialCode: 'RM-FLR-001',
      name: 'Continental All Purpose Flour',
      primaryQty: 20,
      primaryUom: 'Sack',
      conversionFactor: 25.0,
      secondaryQty: 500,
      secondaryUom: 'kg',
      unitPrice: 1050,
      totalAmount: 21000,
      lotNumber: 'LOT-CNT-261103',
      expiryDate: '2027-05-03',
      storageRoom: 'Dry Room 1',
      binLocation: 'Pallet A3',
      qtyDamaged: 0,
      chilledTemp: '',
      butterCellophaneSticker: true,
      eggRinsePassed: true,
      coaPassed: true
    }
  ]);

  // Handle SKU change in item row
  const handleItemSkuChange = (index, code) => {
    const mat = inventory.find(m => m.code === code);
    if (!mat) return;
    setReceivingItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const primary = item.primaryQty || 1;
      const secQty = primary * mat.conversionFactor;
      return {
        ...item,
        materialCode: mat.code,
        name: mat.name,
        primaryUom: mat.primaryUom,
        conversionFactor: mat.conversionFactor,
        secondaryQty: secQty,
        secondaryUom: mat.secondaryUom,
        unitPrice: mat.unitCost || 1000,
        totalAmount: primary * (mat.unitCost || 1000),
        storageRoom: mat.room,
        lotNumber: `LOT-${mat.code.split('-')[1]}-${new Date().toISOString().slice(2,10).replace(/-/g,'')}`
      };
    }));
  };

  // Handle Qty change
  const handleQtyChange = (index, primaryQty) => {
    const qty = parseFloat(primaryQty) || 0;
    setReceivingItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const secQty = qty * item.conversionFactor;
      return {
        ...item,
        primaryQty: qty,
        secondaryQty: secQty,
        totalAmount: qty * item.unitPrice
      };
    }));
  };

  // Add Item Row
  const handleAddRow = () => {
    const defaultMat = inventory[0];
    setReceivingItems(prev => [
      ...prev,
      {
        materialCode: defaultMat.code,
        name: defaultMat.name,
        primaryQty: 10,
        primaryUom: defaultMat.primaryUom,
        conversionFactor: defaultMat.conversionFactor,
        secondaryQty: 10 * defaultMat.conversionFactor,
        secondaryUom: defaultMat.secondaryUom,
        unitPrice: defaultMat.unitCost || 1000,
        totalAmount: 10 * (defaultMat.unitCost || 1000),
        lotNumber: `LOT-${defaultMat.code.split('-')[1]}-${Date.now().toString().slice(-4)}`,
        expiryDate: '2027-06-01',
        storageRoom: defaultMat.room,
        binLocation: 'Pallet Staging',
        qtyDamaged: 0,
        chilledTemp: '',
        butterCellophaneSticker: true,
        eggRinsePassed: true,
        coaPassed: true
      }
    ]);
  };

  const handleRemoveRow = (index) => {
    if (receivingItems.length <= 1) return;
    setReceivingItems(prev => prev.filter((_, i) => i !== index));
  };

  // Overall Total
  const grandTotal = receivingItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const totalDamaged = receivingItems.reduce((sum, item) => sum + (parseFloat(item.qtyDamaged) || 0), 0);

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!poNo.trim()) {
      alert("Please provide the Purchase Order (PO) or Delivery Receipt (DR) number.");
      return;
    }

    const newReport = {
      reportNo,
      poNo,
      drNo: drNo || poNo,
      supplier,
      invoiceNo: invoiceNo || `CI-${Date.now().toString().slice(-5)}`,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      receiver: currentRole,
      deliveryVehicle,
      items: receivingItems,
      overallStatus: totalDamaged > 0 ? `PARTIALLY DAMAGED (${totalDamaged} units damaged)` : "ACCEPTED CLEAN",
      totalPaid: grandTotal,
      qcSignoff: `${currentRole} (Warehouse Supervisor)`
    };

    onSaveReceiving(newReport);

    // Reset Form for next shipment
    setReportNo(`RR-2026-1103-0${receivingReports.length + 2}`);
    setPoNo('');
    setDrNo('');
    setInvoiceNo('');
  };

  return (
    <div className="space-y-6">
      {/* Title & SLA Header */}
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-[#1E7A3E] text-white px-2 py-0.5 rounded">
              Form-REC-001
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">
              Inbound Receiving &amp; Quality Inspection Dock
            </h2>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            Mandatory 30-min logging SLA · 0°C Butter Cellophane Gate · Egg Sanitization Rinse Protocol · Dual UoM Net Conversion
          </p>
        </div>
        <div className="bg-[#FAF6EE] border border-[#C8963E]/40 px-3 py-1.5 rounded-lg text-right text-xs">
          <p className="font-bold text-[#5B2E7A]">Warehouse Custodian: Jade Q. Dela Cruz</p>
          <p className="text-gray-500 text-[11px]">Unlogged shipments &gt; 1 hr = Mandatory Dock Quarantine</p>
        </div>
      </div>

      {/* Main Receiving Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-[#E2D1B8] shadow-sm space-y-5">
        <div className="border-b border-gray-200 pb-3 flex justify-between items-center flex-wrap gap-2">
          <h3 className="font-serif font-bold text-[#5B2E7A] flex items-center gap-2 text-base">
            <Truck size={18} /> Delivery Shipment Ingest Details
          </h3>
          <span className="text-xs text-[#1E7A3E] font-bold bg-green-50 px-2.5 py-1 rounded border border-green-200">
            Active Receiving Window (&lt; 30m)
          </span>
        </div>

        {/* Header Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Receiving Report No.</label>
            <input 
              type="text" 
              value={reportNo} 
              readOnly 
              className="w-full p-2 border rounded bg-gray-50 font-mono font-bold text-[#5B2E7A]" 
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              PO / DR Number <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="e.g. PO-2026-1045" 
              value={poNo}
              onChange={(e) => setPoNo(e.target.value)}
              required
              className="w-full p-2 border rounded font-mono focus:ring-2 focus:ring-[#C8963E] focus:outline-none" 
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Supplier Name</label>
            <select 
              value={supplier} 
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full p-2 border rounded bg-white font-medium focus:ring-2 focus:ring-[#C8963E]"
            >
              <option>P.L. Sebastian Corporation</option>
              <option>Lucky Roma Trading</option>
              <option>JCT Wheat & Sugar Products</option>
              <option>Davao Great Wall Trading, Inc.</option>
              <option>Golden Fortune Trading Incorporated</option>
              <option>Local Poultry Coop</option>
              <option>C-One Packaging Solutions</option>
              <option>Mandaue Libertad Flexible Packaging</option>
              <option>D'Unibuenas Corporation (Solane LPG)</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Charge Invoice / Delivery Receipt #</label>
            <input 
              type="text" 
              placeholder="e.g. CI-29401 / DR-88492" 
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className="w-full p-2 border rounded font-mono" 
            />
          </div>
        </div>

        {/* Delivery Vehicle & Vehicle Sanitation */}
        <div className="bg-[#FAF6EE] p-3 rounded-lg border border-[#E2D1B8] text-xs flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[240px]">
            <label className="block font-bold text-gray-700 mb-1">Delivery Transport Vehicle &amp; Deck Sanitation</label>
            <input 
              type="text" 
              value={deliveryVehicle} 
              onChange={(e) => setDeliveryVehicle(e.target.value)}
              className="w-full p-2 border rounded bg-white text-xs" 
            />
          </div>
          <div className="flex items-center gap-2 text-green-800 font-semibold text-xs">
            <ShieldCheck size={16} className="text-[#1E7A3E]" />
            <span>Dock Low Care (Black Zone) Unloading Active</span>
          </div>
        </div>

        {/* Itemized Materials Table */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-serif font-bold text-[#3D1C52] text-sm">
              Itemized Materials &amp; Mandatory Quality Gates
            </h4>
            <button
              type="button"
              onClick={handleAddRow}
              className="text-xs bg-[#5B2E7A] text-white px-3 py-1.5 rounded font-bold hover:bg-[#3D1C52] flex items-center gap-1 transition"
            >
              <Plus size={13} /> Add Delivered Item Row
            </button>
          </div>

          <div className="space-y-4">
            {receivingItems.map((item, idx) => {
              const isButter = item.materialCode === 'RM-FAT-001';
              const isEggs = item.materialCode === 'RM-DRY-001';
              const isPackaging = item.materialCode.startsWith('PM-');

              return (
                <div key={idx} className="p-4 rounded-xl border border-[#E2D1B8] bg-white shadow-sm space-y-3">
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <div className="flex-1 min-w-[280px]">
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Delivered Material #{idx + 1}
                      </label>
                      <select
                        value={item.materialCode}
                        onChange={(e) => handleItemSkuChange(idx, e.target.value)}
                        className="w-full p-2 text-xs border rounded bg-white font-medium"
                      >
                        {inventory.map(m => (
                          <option key={m.code} value={m.code}>
                            {m.code} — {m.name} ({m.room} · {m.primaryUom} to {m.conversionFactor} {m.secondaryUom})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-1 bg-gray-100 rounded text-gray-700">
                        Destination: <strong className="text-[#5B2E7A]">{item.storageRoom}</strong>
                      </span>
                      {receivingItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Dual UoM Line */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div>
                      <label className="block text-gray-600 font-semibold mb-1">
                        Primary Count ({item.primaryUom})
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={item.primaryQty}
                        onChange={(e) => handleQtyChange(idx, e.target.value)}
                        className="w-full p-2 border rounded font-mono font-bold text-[#3D1C52]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 font-semibold mb-1">
                        Calculated Net ({item.secondaryUom})
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`${item.secondaryQty.toLocaleString()} ${item.secondaryUom}`}
                        className="w-full p-2 border rounded bg-gray-50 font-mono font-bold text-green-700"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 font-semibold mb-1">Supplier Lot #</label>
                      <input
                        type="text"
                        value={item.lotNumber}
                        onChange={(e) => {
                          const val = e.target.value;
                          setReceivingItems(prev => prev.map((it, i) => i === idx ? { ...it, lotNumber: val } : it));
                        }}
                        className="w-full p-2 border rounded font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 font-semibold mb-1">Expiration Date</label>
                      <input
                        type="date"
                        value={item.expiryDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setReceivingItems(prev => prev.map((it, i) => i === idx ? { ...it, expiryDate: val } : it));
                        }}
                        className="w-full p-2 border rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 font-semibold mb-1">Damage / Broken</label>
                      <input
                        type="number"
                        min="0"
                        value={item.qtyDamaged}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setReceivingItems(prev => prev.map((it, i) => i === idx ? { ...it, qtyDamaged: val } : it));
                        }}
                        className={`w-full p-2 border rounded font-mono ${item.qtyDamaged > 0 ? 'bg-red-50 text-red-600 border-red-300 font-bold' : ''}`}
                      />
                    </div>
                  </div>

                  {/* MANDATORY QUALITY GATE PANEL (Custom to Product Risk) */}
                  <div className="bg-[#FAF6EE] p-3 rounded-lg border border-[#E2D1B8] text-xs space-y-2">
                    <p className="font-bold text-[#5B2E7A] flex items-center gap-1.5">
                      <ShieldCheck size={14} /> Quality Assurance Compliance Gate (FDA PLI Standards):
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {/* Chilled Check for Butter */}
                      {isButter ? (
                        <div className="bg-amber-50 p-2 rounded border border-amber-300">
                          <label className="block font-bold text-amber-900 mb-0.5">
                            Chilled Temp Check (Must be ≤ 0°C)
                          </label>
                          <div className="flex items-center gap-1">
                            <Thermometer size={14} className="text-red-500" />
                            <input
                              type="text"
                              value={item.chilledTemp || '-1.2°C'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setReceivingItems(prev => prev.map((it, i) => i === idx ? { ...it, chilledTemp: val } : it));
                              }}
                              className="w-20 p-1 border rounded bg-white text-xs font-mono font-bold"
                            />
                            <span className="text-[10px] text-amber-800 font-semibold">Locked Freezer Gate</span>
                          </div>
                          <label className="flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-amber-900">
                            <input 
                              type="checkbox" 
                              checked={item.butterCellophaneSticker} 
                              onChange={(e) => {
                                const chk = e.target.checked;
                                setReceivingItems(prev => prev.map((it, i) => i === idx ? { ...it, butterCellophaneSticker: chk } : it));
                              }}
                            />
                            Cellophane Expiry Sticker Verified Intact
                          </label>
                        </div>
                      ) : isEggs ? (
                        <div className="bg-green-50 p-2 rounded border border-green-300">
                          <label className="block font-bold text-green-900 mb-0.5">
                            Egg Sanitization Dip / Rinse Protocol
                          </label>
                          <label className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-green-800">
                            <input 
                              type="checkbox" 
                              checked={item.eggRinsePassed} 
                              onChange={(e) => {
                                const chk = e.target.checked;
                                setReceivingItems(prev => prev.map((it, i) => i === idx ? { ...it, eggRinsePassed: chk } : it));
                              }}
                            />
                            Rinsed &amp; Sanitized prior to Wet Room entry
                          </label>
                        </div>
                      ) : isPackaging ? (
                        <div className="bg-blue-50 p-2 rounded border border-blue-300">
                          <label className="block font-bold text-blue-900 mb-0.5">
                            Food-Grade Packaging CoA / CoC
                          </label>
                          <label className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-blue-800">
                            <input 
                              type="checkbox" 
                              checked={item.coaPassed} 
                              onChange={(e) => {
                                const chk = e.target.checked;
                                setReceivingItems(prev => prev.map((it, i) => i === idx ? { ...it, coaPassed: chk } : it));
                              }}
                            />
                            Food-Contact Resin CoA on file
                          </label>
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-white border text-gray-600">
                          <span className="font-semibold">General Standard:</span> Clean sacks, off-floor pallet staging ≥10cm, zero vermin activity.
                        </div>
                      )}

                      {/* Structural Location */}
                      <div className="p-2 rounded bg-white border">
                        <label className="block font-semibold text-gray-700 mb-0.5">Storage Bay / Pallet #</label>
                        <input
                          type="text"
                          value={item.binLocation}
                          onChange={(e) => {
                            const val = e.target.value;
                            setReceivingItems(prev => prev.map((it, i) => i === idx ? { ...it, binLocation: val } : it));
                          }}
                          className="w-full p-1 border rounded text-xs font-mono"
                          placeholder="e.g. Pallet A1 / Shelf 2B"
                        />
                      </div>

                      {/* Line Valuation */}
                      <div className="p-2 rounded bg-white border flex flex-col justify-between">
                        <span className="text-gray-500 text-[10px]">Total Line Payable:</span>
                        <span className="font-mono font-bold text-sm text-[#3D1C52]">
                          ₱{item.totalAmount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Summary & Commit */}
        <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-xs text-gray-500">Total Inbound Shipment Value:</p>
            <p className="text-2xl font-bold font-serif text-[#1E7A3E]">
              ₱{grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
            {totalDamaged > 0 && (
              <p className="text-xs font-bold text-[#C0392B]">
                ⚠️ {totalDamaged} damaged items flagged for Form-NCR-001 Quarantine
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-[#1E7A3E] hover:bg-[#165c2f] text-white font-bold text-xs px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition"
            >
              <CheckCircle2 size={16} /> Save &amp; Commit Inbound Receiving (`Form-REC-001`)
            </button>
          </div>
        </div>
      </form>

      {/* RECENT INBOUND SHIPMENTS LEDGER */}
      <div className="bg-white rounded-xl border border-[#E2D1B8] shadow-sm overflow-hidden">
        <div className="px-6 py-3.5 bg-[#FAF6EE] border-b border-[#E2D1B8] flex justify-between items-center">
          <h3 className="font-serif font-bold text-[#5B2E7A]">
            Recent Inbound Shipments Logbook (`Form-REC-001` Archive)
          </h3>
          <span className="text-xs text-gray-500 font-medium">{receivingReports.length} logged reports</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#5B2E7A] text-white">
              <tr>
                <th className="p-3">Report #</th>
                <th className="p-3">PO / DR #</th>
                <th className="p-3">Supplier Name</th>
                <th className="p-3">Date &amp; Time</th>
                <th className="p-3">Delivered Items</th>
                <th className="p-3 text-right">Payable Value</th>
                <th className="p-3 text-center">QA Status</th>
                <th className="p-3 text-center">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D1B8]">
              {receivingReports.map((r, i) => (
                <tr key={i} className="hover:bg-[#FAF6EE]/50">
                  <td className="p-3 font-mono font-bold text-[#5B2E7A]">{r.reportNo}</td>
                  <td className="p-3 font-mono">{r.poNo}</td>
                  <td className="p-3 font-medium text-gray-900">{r.supplier}</td>
                  <td className="p-3 text-gray-600">{r.date} {r.time}</td>
                  <td className="p-3">
                    {r.items?.map((it, idx) => (
                      <span key={idx} className="block text-[11px] text-gray-700">
                        • {it.primaryQty} {it.primaryUom}s {it.name} ({it.secondaryQty} {it.secondaryUom})
                      </span>
                    ))}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-gray-900">
                    ₱{r.totalPaid?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.overallStatus.includes('DAMAGED') 
                        ? 'bg-red-100 text-[#C0392B]' 
                        : 'bg-green-100 text-[#1E7A3E]'
                    }`}>
                      {r.overallStatus}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedReportView(r)}
                      className="text-xs text-[#5B2E7A] hover:underline font-bold"
                    >
                      Inspect Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM-REC-001 PRINTABLE INSPECTION MODAL */}
      {selectedReportView && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border-2 border-[#C8963E] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b-2 border-[#5B2E7A] pb-3">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">JANG-JANG BAKESHOP · INDANGAN PLANT LTO #3000013388488</p>
                <h3 className="font-serif font-bold text-xl text-[#3D1C52]">
                  Receiving &amp; Quality Acceptance Report (`Form-REC-001`)
                </h3>
                <p className="text-xs text-[#C8963E] font-mono font-bold">Report ID: {selectedReportView.reportNo}</p>
              </div>
              <button 
                onClick={() => setSelectedReportView(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF6EE] p-3 rounded-lg border border-[#E2D1B8]">
              <div><strong>Supplier:</strong> {selectedReportView.supplier}</div>
              <div><strong>PO / DR #:</strong> {selectedReportView.poNo}</div>
              <div><strong>Invoice #:</strong> {selectedReportView.invoiceNo}</div>
              <div><strong>Date &amp; Time:</strong> {selectedReportView.date} {selectedReportView.time}</div>
              <div><strong>Transport:</strong> {selectedReportView.deliveryVehicle}</div>
              <div><strong>Inspector:</strong> {selectedReportView.receiver}</div>
            </div>

            <table className="w-full text-left text-xs border border-gray-300">
              <thead className="bg-[#5B2E7A] text-white">
                <tr>
                  <th className="p-2">Item Code &amp; Name</th>
                  <th className="p-2 text-right">Primary</th>
                  <th className="p-2 text-right">Net Secondary</th>
                  <th className="p-2">Lot &amp; Expiry</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {selectedReportView.items?.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-medium">{it.materialCode} - {it.name}</td>
                    <td className="p-2 text-right font-mono">{it.primaryQty} {it.primaryUom}</td>
                    <td className="p-2 text-right font-mono font-bold text-[#1E7A3E]">{it.secondaryQty} {it.secondaryUom}</td>
                    <td className="p-2 font-mono text-[11px]">{it.lotNumber} ({it.expiryDate})</td>
                    <td className="p-2 text-right font-mono">₱{it.totalAmount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-2 border-t flex justify-between items-center text-xs">
              <div>
                <p className="text-gray-500">Sign-Off Authority:</p>
                <p className="font-bold text-[#5B2E7A]">{selectedReportView.qcSignoff}</p>
              </div>
              <button
                onClick={() => window.print()}
                className="bg-[#3D1C52] text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5"
              >
                <Printer size={13} /> Print Hard-Copy Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
