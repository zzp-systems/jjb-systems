import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  BarChart3, Download, Upload, Calendar, Printer, 
  ArrowDownRight, ArrowUpRight, Scale, ShoppingCart, Plus, Trash2, CheckCircle2
} from 'lucide-react';

export default function ReportsModule({ 
  inventory = [],
  receivingReports = [], 
  withdrawals = [], 
  batchOrders = [], 
  adjustments = [],
  onImportInventoryCsv,
  currentRole = 'Jade Q. Dela Cruz',
  onRecordAudit
}) {
  const [activeView, setActiveView] = useState('reports'); // 'reports' | 'po_generator'
  const [timeframe, setTimeframe] = useState('MONTH'); // WEEK, MONTH, QUARTER, YEAR, ALL

  // PURCHASE ORDER GENERATOR STATE
  const [poNumber, setPoNumber] = useState(`PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`);
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState('ALL');
  const [poNotes, setPoNotes] = useState('Mandatory Requirement: All food-contact packaging must include CoA/CoC; Chilled Buttercup blocks must arrive <= 0°C with individual cellophane expiry stickers.');
  const [poItems, setPoItems] = useState([]);
  const [newSkuToAdd, setNewSkuToAdd] = useState(inventory[0]?.code || 'RM-FLR-001');
  const fileInputRef = useRef(null);
  const [csvImportStatus, setCsvImportStatus] = useState(null);

  // Initialize PO items automatically from low-stock inventory recommendations
  useEffect(() => {
    const lowItems = inventory.filter(i => i.currentBalance <= i.threshold * 1.25);
    const initialPoLines = (lowItems.length > 0 ? lowItems : inventory.slice(0, 5)).map(item => {
      const currentBulk = item.currentBalance / (item.conversionFactor || 1);
      const thresholdBulk = item.threshold / (item.conversionFactor || 1);
      const recommendedOrderBulk = Math.max(Math.ceil((thresholdBulk * 2) - currentBulk), 5);
      return {
        code: item.code,
        name: item.name,
        brand: item.brand || 'Standard',
        supplier: item.supplier || 'P.L. Sebastian Corporation',
        currentBalanceSec: item.currentBalance,
        thresholdSec: item.threshold,
        secondaryUom: item.secondaryUom,
        orderQtyPrimary: recommendedOrderBulk,
        primaryUom: item.primaryUom,
        conversionFactor: item.conversionFactor || 1,
        unitCostPhp: item.unitCost || 1000
      };
    });
    setPoItems(initialPoLines);
  }, [inventory]);

  // Dynamic Date Bounds (Works accurately throughout November 2026 and all future dates)
  const getDateBounds = () => {
    const systemNow = new Date();
    const seedBaseline = new Date('2026-11-03T23:59:59');
    const now = systemNow > seedBaseline ? systemNow : seedBaseline;
    const start = new Date(now);
    
    if (timeframe === 'WEEK') {
      start.setDate(now.getDate() - 7);
    } else if (timeframe === 'MONTH') {
      start.setDate(1);
    } else if (timeframe === 'QUARTER') {
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      start.setMonth(quarterMonth, 1);
    } else if (timeframe === 'YEAR') {
      start.setMonth(0, 1);
    } else {
      start.setFullYear(2020, 0, 1);
    }
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(now);
    end.setFullYear(end.getFullYear() + 1); // Include any upcoming scheduled dates
    return { start, end };
  };

  const { start, end } = getDateBounds();

  const filterByDate = (dateString) => {
    if (!dateString || timeframe === 'ALL') return true;
    const d = new Date(dateString);
    return d >= start && d <= end;
  };

  const filteredReceiving = useMemo(() => receivingReports.filter(r => filterByDate(r.date)), [receivingReports, timeframe]);
  const filteredWithdrawals = useMemo(() => withdrawals.filter(w => filterByDate(w.date)), [withdrawals, timeframe]);
  const filteredBatchOrders = useMemo(() => batchOrders.filter(b => filterByDate(b.requestDate)), [batchOrders, timeframe]);
  const filteredAdjustments = useMemo(() => adjustments.filter(a => filterByDate(a.date)), [adjustments, timeframe]);

  // CSV Export Helper
  const downloadCSV = (data, headers, filename) => {
    if (!data || data.length === 0) return alert("No records found for this timeframe.");
    const csvRows = [headers.join(',')];
    for (const row of data) {
      const values = headers.map(header => `"${String(row[header] ?? '').replace(/"/g, '""')}"`);
      csvRows.push(values.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${timeframe}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleExportReceiving = () => {
    const flat = filteredReceiving.flatMap(r => (r.items || []).map(i => ({
      ReportNo: r.reportNo, Date: r.date, PO_DR: r.poNo, Supplier: r.supplier,
      MaterialCode: i.materialCode, ItemName: i.name, PrimaryQty: i.primaryQty,
      PrimaryUoM: i.primaryUom, NetQty: i.secondaryQty, NetUoM: i.secondaryUom, TotalAmountPHP: i.totalAmount
    })));
    downloadCSV(flat, ['ReportNo', 'Date', 'PO_DR', 'Supplier', 'MaterialCode', 'ItemName', 'PrimaryQty', 'PrimaryUoM', 'NetQty', 'NetUoM', 'TotalAmountPHP'], 'JJB_Receiving_Report');
  };

  const handleExportWithdrawals = () => {
    const flat = filteredWithdrawals.flatMap(w => (w.items || []).map(i => ({
      SlipNo: w.slipNo, Date: w.date, TargetLine: w.requestingEntity, Purpose: w.purpose,
      MaterialCode: i.materialCode, ItemName: i.name, NetQtyIssued: i.qtyIssuedSec, UoM: i.secondaryUom, Lot: i.lotNumber, Status: w.status
    })));
    downloadCSV(flat, ['SlipNo', 'Date', 'TargetLine', 'Purpose', 'MaterialCode', 'ItemName', 'NetQtyIssued', 'UoM', 'Lot', 'Status'], 'JJB_Withdrawal_Report');
  };

  const handleExportBatching = () => {
    const flat = filteredBatchOrders.map(b => ({
      OrderID: b.orderId, Date: b.requestDate, Outlet: b.outletName, Recipe: b.recipeName,
      KitsOrdered: b.batchMultiplier, YieldPcs: b.requestedQtyPcs, BulkRequested: b.bulkMaterialsRequested ? 'YES' : 'NO',
      BulkApprovedByJade: b.bulkMaterialsApprovedByJade ? 'YES' : 'NO', Status: b.status, BatchTag: b.batchTagId || 'N/A', ActualWeightKg: b.actualBatchedKg || 0
    }));
    downloadCSV(flat, ['OrderID', 'Date', 'Outlet', 'Recipe', 'KitsOrdered', 'YieldPcs', 'BulkRequested', 'BulkApprovedByJade', 'Status', 'BatchTag', 'ActualWeightKg'], 'JJB_Batching_Kitting_Report');
  };

  // CSV Import Handler for Live Inventory Updates
  const handleCsvFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) return alert("CSV file is empty or invalid.");
      const updates = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
        if (cols[0] && !isNaN(parseFloat(cols[1]))) {
          updates.push({ code: cols[0], newBalanceSec: parseFloat(cols[1]), unitCost: cols[2] ? parseFloat(cols[2]) : undefined });
        }
      }
      if (updates.length > 0 && onImportInventoryCsv) {
        onImportInventoryCsv(updates);
        setCsvImportStatus(`Successfully updated ${updates.length} SKU balances from CSV!`);
        setTimeout(() => setCsvImportStatus(null), 5000);
      } else {
        alert("CSV format tip: Column 1 = Material Code (e.g. RM-FLR-001), Column 2 = New Net Balance.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // PO Generator Helpers
  const suppliersList = useMemo(() => {
    const s = new Set(poItems.map(i => i.supplier));
    return ['ALL', ...Array.from(s)];
  }, [poItems]);

  const displayedPoItems = poItems.filter(i => selectedSupplierFilter === 'ALL' || i.supplier === selectedSupplierFilter);
  const totalPoAmountPhp = displayedPoItems.reduce((sum, i) => sum + (i.orderQtyPrimary * i.unitCostPhp), 0);
  const poVatAmount = totalPoAmountPhp * 0.12;
  const poGrandTotal = totalPoAmountPhp + poVatAmount;

  const handleAddPoItem = () => {
    const mat = inventory.find(m => m.code === newSkuToAdd);
    if (!mat) return;
    if (poItems.some(p => p.code === mat.code)) {
      alert("Item is already in the Purchase Order table below.");
      return;
    }
    setPoItems(prev => [
      ...prev,
      {
        code: mat.code,
        name: mat.name,
        brand: mat.brand || 'Standard',
        supplier: mat.supplier || 'P.L. Sebastian Corporation',
        currentBalanceSec: mat.currentBalance,
        thresholdSec: mat.threshold,
        secondaryUom: mat.secondaryUom,
        orderQtyPrimary: 10,
        primaryUom: mat.primaryUom,
        conversionFactor: mat.conversionFactor,
        unitCostPhp: mat.unitCost || 1000
      }
    ]);
  };

  const handleRemovePoItem = (code) => {
    setPoItems(prev => prev.filter(i => i.code !== code));
  };

  const handleExportPoCsv = () => {
    const flat = displayedPoItems.map((i, idx) => ({
      LineNo: idx + 1,
      PONumber: poNumber,
      Supplier: i.supplier,
      MaterialCode: i.code,
      ItemDescription: `${i.name} (${i.brand})`,
      OrderQtyBulk: i.orderQtyPrimary,
      BulkUoM: i.primaryUom,
      EquivalentNetQty: i.orderQtyPrimary * i.conversionFactor,
      NetUoM: i.secondaryUom,
      UnitPricePHP: i.unitCostPhp,
      LineTotalPHP: i.orderQtyPrimary * i.unitCostPhp
    }));
    downloadCSV(flat, ['LineNo', 'PONumber', 'Supplier', 'MaterialCode', 'ItemDescription', 'OrderQtyBulk', 'BulkUoM', 'EquivalentNetQty', 'NetUoM', 'UnitPricePHP', 'LineTotalPHP'], `Purchase_Order_${poNumber}`);
    if(onRecordAudit) {
      onRecordAudit('PO_EXPORTED_CSV', `Exported Purchase Order ${poNumber} (${displayedPoItems.length} items, Grand Total ₱${poGrandTotal.toLocaleString()})`);
    }
  };

  const handleRefreshRecommendations = () => {
     const lowItems = inventory.filter(i => i.currentBalance <= i.threshold * 1.25);
     const initialPoLines = (lowItems.length > 0 ? lowItems : inventory.slice(0, 5)).map(item => {
      const currentBulk = item.currentBalance / (item.conversionFactor || 1);
      const thresholdBulk = item.threshold / (item.conversionFactor || 1);
      const recommendedOrderBulk = Math.max(Math.ceil((thresholdBulk * 2) - currentBulk), 5);
      return {
        code: item.code,
        name: item.name,
        brand: item.brand || 'Standard',
        supplier: item.supplier || 'P.L. Sebastian Corporation',
        currentBalanceSec: item.currentBalance,
        thresholdSec: item.threshold,
        secondaryUom: item.secondaryUom,
        orderQtyPrimary: recommendedOrderBulk,
        primaryUom: item.primaryUom,
        conversionFactor: item.conversionFactor || 1,
        unitCostPhp: item.unitCost || 1000
      };
    });
    setPoItems(initialPoLines);
    if(onRecordAudit) {
        onRecordAudit('PO_REPLENISHMENT_REFRESH', 'Recalculated low-stock PO replenishment recommendations from live inventory.');
    }
  };

  const handlePoQtyChange = (code, val) => {
    const qty = Math.max(0, parseFloat(val) || 0);
    setPoItems(prev => prev.map(p => p.code === code ? {...p, orderQtyPrimary: qty} : p));
  };
  
  const handlePoPriceChange = (code, val) => {
      const price = Math.max(0, parseFloat(val) || 0);
      setPoItems(prev => prev.map(p => p.code === code ? {...p, unitCostPhp: price} : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-3 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-[#5B2E7A] text-white px-2 py-0.5 rounded">
              SOP-PUR-002 / Analytics Hub
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">
              Warehouse Reports, CSV Ingest & Purchase Order Generator
            </h2>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            Sort records by Week, Month, Quarter, or Year · Bulk CSV Inventory Sync · Automated Supplier Replenishment PO (`Form-PUR-002`)
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-lg border border-[#E2D1B8] shadow-sm">
          <button
            onClick={() => setActiveView('reports')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeView === 'reports' ? 'bg-[#3D1C52] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 size={14} /> Documentation & CSV Reports
          </button>
          <button
            onClick={() => setActiveView('po_generator')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeView === 'po_generator' ? 'bg-[#C8963E] text-[#240e32] shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart size={14} /> Purchase Order (PO) Generator ({poItems.length})
          </button>
        </div>
      </div>
      
      {csvImportStatus && (
        <div className="bg-green-100 border border-green-300 text-green-900 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 size={16} className="text-green-700" />
          <span>{csvImportStatus}</span>
        </div>
      )}

      {/* VIEW 1: MULTI-PERIOD REPORTS & CSV IMPORT/EXPORT */}
      {activeView === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-[#E2D1B8] shadow-sm flex flex-wrap gap-4 items-center justify-between print:hidden">
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar size={18} className="text-[#C8963E]" />
              <span className="font-bold text-xs text-gray-700">Filter Timeframe:</span>
              <select 
                value={timeframe} 
                onChange={(e) => setTimeframe(e.target.value)}
                className="p-2 border rounded-lg text-xs font-bold bg-[#FAF6EE] text-[#3D1C52] focus:outline-none focus:ring-2 focus:ring-[#C8963E]"
              >
                <option value="WEEK">This Week</option>
                <option value="MONTH">This Month (Nov 2026+)</option>
                <option value="QUARTER">This Quarter (Q4 2026)</option>
                <option value="YEAR">This Year (2026)</option>
                <option value="ALL">All Historical & Active Records</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <label className="bg-purple-50 hover:bg-purple-100 text-[#5B2E7A] border border-[#5B2E7A] text-xs font-bold px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 transition">
                <Upload size={14} />
                <span>Import Inventory CSV</span>
                <input type="file" accept=".csv" onChange={handleCsvFileUpload} className="hidden" />
              </label>

              <button onClick={() => window.print()} className="bg-[#3D1C52] hover:bg-[#240e32] text-white text-xs font-bold px-4 py-2 rounded-lg shadow flex items-center gap-1.5">
                <Printer size={14} /> Print / Save as PDF
              </button>
            </div>
          </div>

          <div id="printable-reports" className="space-y-6">
            {/* 1. Receiving Report */}
            <div className="bg-white rounded-xl border border-[#E2D1B8] shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-[#FAF6EE] border-b border-[#E2D1B8] flex justify-between items-center">
                <h3 className="font-serif font-bold text-[#3D1C52] flex items-center gap-2 text-sm">
                  <ArrowDownRight size={18} className="text-[#1E7A3E]" /> 1. Incoming Raw Materials (`Form-REC-001`)
                </h3>
                <button onClick={handleExportReceiving} className="text-xs bg-white border border-[#1E7A3E] text-[#1E7A3E] font-bold px-3 py-1 rounded hover:bg-green-50 flex items-center gap-1 print:hidden">
                  <Download size={12} /> Download CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#5B2E7A] text-white">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Report / PO #</th>
                      <th className="p-3">Supplier</th>
                      <th className="p-3">Material</th>
                      <th className="p-3 text-right">Net Qty</th>
                      <th className="p-3 text-right">Amount (₱)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredReceiving.length === 0 ? (
                      <tr><td colSpan="6" className="p-4 text-center text-gray-500">No records for this timeframe.</td></tr>
                    ) : (
                      filteredReceiving.map(r => (r.items || []).map((i, idx) => (
                        <tr key={`${r.reportNo}-${idx}`}>
                          <td className="p-3 font-mono">{r.date}</td>
                          <td className="p-3 font-mono font-bold text-[#5B2E7A]">{r.reportNo} ({r.poNo})</td>
                          <td className="p-3">{r.supplier}</td>
                          <td className="p-3 font-medium">{i.materialCode} — {i.name}</td>
                          <td className="p-3 text-right font-mono">{i.secondaryQty} {i.secondaryUom}</td>
                          <td className="p-3 text-right font-mono font-bold text-[#1E7A3E]">₱{i.totalAmount?.toLocaleString()}</td>
                        </tr>
                      )))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Withdrawals Report */}
            <div className="bg-white rounded-xl border border-[#E2D1B8] shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-[#FAF6EE] border-b border-[#E2D1B8] flex justify-between items-center">
                <h3 className="font-serif font-bold text-[#3D1C52] flex items-center gap-2 text-sm">
                  <ArrowUpRight size={18} className="text-[#5B2E7A]" /> 2. Warehouse Bulk & Line Withdrawals (`Form-WAR-001`)
                </h3>
                <button onClick={handleExportWithdrawals} className="text-xs bg-white border border-[#5B2E7A] text-[#5B2E7A] font-bold px-3 py-1 rounded hover:bg-purple-50 flex items-center gap-1 print:hidden">
                  <Download size={12} /> Download CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#5B2E7A] text-white">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Slip #</th>
                      <th className="p-3">Recipient / Line</th>
                      <th className="p-3">Material</th>
                      <th className="p-3 text-right">Net Qty Issued</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredWithdrawals.length === 0 ? (
                      <tr><td colSpan="6" className="p-4 text-center text-gray-500">No records for this timeframe.</td></tr>
                    ) : (
                      filteredWithdrawals.map(w => (w.items || []).map((i, idx) => (
                        <tr key={`${w.slipNo}-${idx}`} className="hover:bg-[#FAF6EE]/40">
                          <td className="p-3 font-mono">{w.date}</td>
                          <td className="p-3 font-mono font-bold text-[#5B2E7A]">{w.slipNo}</td>
                          <td className="p-3 font-medium">{w.requestingEntity}</td>
                          <td className="p-3">{i.materialCode} — {i.name}</td>
                          <td className="p-3 text-right font-mono font-bold text-[#5B2E7A]">{i.qtyIssuedSec} {i.secondaryUom}</td>
                          <td className="p-3 text-center"><span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold">{w.status}</span></td>
                        </tr>
                      )))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Batching & Kitting Report */}
            <div className="bg-white rounded-xl border border-[#E2D1B8] shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-[#FAF6EE] border-b border-[#E2D1B8] flex justify-between items-center">
                <h3 className="font-serif font-bold text-[#3D1C52] flex items-center gap-2 text-sm">
                  <Scale size={18} className="text-[#C8963E]" /> 3. Outlet Batching & Kitting Orders (`Form-PRO-001` / `Form-ING-001`)
                </h3>
                <button onClick={handleExportBatching} className="text-xs bg-white border border-[#C8963E] text-[#C8963E] font-bold px-3 py-1 rounded hover:bg-amber-50 flex items-center gap-1 print:hidden">
                  <Download size={12} /> Download CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#5B2E7A] text-white">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Target Outlet</th>
                      <th className="p-3">Recipe & Kit Count</th>
                      <th className="p-3 text-right">Scaled Weight</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBatchOrders.length === 0 ? (
                      <tr><td colSpan="6" className="p-4 text-center text-gray-500">No records for this timeframe.</td></tr>
                    ) : (
                      filteredBatchOrders.map(b => (
                        <tr key={b.orderId} className="hover:bg-[#FAF6EE]/40">
                          <td className="p-3 font-mono">{b.requestDate}</td>
                          <td className="p-3 font-mono font-bold text-[#5B2E7A]">{b.orderId}</td>
                          <td className="p-3 font-semibold text-[#C8963E]">{b.outletName}</td>
                          <td className="p-3">{b.recipeName} ({b.batchMultiplier} Kits)</td>
                          <td className="p-3 text-right font-mono font-bold text-[#1E7A3E]">{b.actualBatchedKg ? `${b.actualBatchedKg} kg` : 'Pending'}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100">{b.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: AUTOMATED PURCHASE ORDER (PO) GENERATOR */}
      {activeView === 'po_generator' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-[#E2D1B8] shadow-sm space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2 border-b pb-3">
              <div>
                <h3 className="font-serif font-bold text-base text-[#5B2E7A] flex items-center gap-2">
                  <ShoppingCart size={18} /> Automated Replenishment Purchase Order Builder (`Form-PUR-002`)
                </h3>
                <p className="text-xs text-gray-500">
                  Pre-filled with items at or below safety reorder threshold. Customize quantities, add/remove items, and print/export for suppliers.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleRefreshRecommendations}
                  className="bg-amber-50 hover:bg-amber-100 text-[#D68910] border border-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg"
                >
                  Reset to Low-Stock Recommendations
                </button>
                <button
                  onClick={handleExportPoCsv}
                  className="bg-[#1E7A3E] hover:bg-[#165c2f] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Download size={13} /> Download PO CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-[#3D1C52] hover:bg-[#240e32] text-white text-xs font-bold px-4 py-1.5 rounded-lg flex items-center gap-1.5"
                >
                  <Printer size={13} /> Print Official PO
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Purchase Order No.</label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="w-full p-2 border rounded font-mono font-bold text-[#5B2E7A]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Filter by Supplier</label>
                <select
                  value={selectedSupplierFilter}
                  onChange={(e) => setSelectedSupplierFilter(e.target.value)}
                  className="w-full p-2 border rounded bg-white font-bold text-[#3D1C52]"
                >
                  {suppliersList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Add Any SKU to PO</label>
                <div className="flex items-center gap-1.5">
                  <select
                    value={newSkuToAdd}
                    onChange={(e) => setNewSkuToAdd(e.target.value)}
                    className="flex-1 p-2 border rounded bg-white font-medium"
                  >
                    {inventory.map(m => (
                      <option key={m.code} value={m.code}>
                        {m.code} — {m.name} (Bal: {m.currentBalance} {m.secondaryUom})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddPoItem}
                    className="bg-[#5B2E7A] hover:bg-[#3D1C52] text-white font-bold px-3 py-2 rounded flex items-center gap-1"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div id="printable-purchase-order" className="bg-white rounded-2xl border-2 border-[#5B2E7A] p-6 md:p-8 shadow-lg space-y-6">
            <div className="border-b-2 border-[#5B2E7A] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-[#C8963E] uppercase">
                  OFFICIAL PROCUREMENT REQUISITION · SOP-PUR-002
                </p>
                <h1 className="font-serif font-bold text-2xl text-[#3D1C52] mt-0.5">
                  PURCHASE ORDER DOCUMENT
                </h1>
                <p className="text-xs text-gray-600">
                  Jang-Jang Bakeshop & Kingdom Confectionary · Purok 8, San Miguel, Brgy. Indangan, Davao City
                </p>
                <p className="text-[11px] text-gray-500">
                  VAT Reg. TIN: 434-271-509-00000 · Indangan FDA LTO #3000013388488
                </p>
              </div>

              <div className="bg-[#FAF6EE] p-3 rounded-lg border border-[#E2D1B8] text-xs text-right min-w-[230px]">
                <p className="font-mono font-bold text-sm text-[#5B2E7A]">{poNumber}</p>
                <p className="text-gray-600 mt-0.5"><strong>Date:</strong> {new Date().toISOString().slice(0, 10)}</p>
                <p className="font-semibold text-[#1E7A3E] mt-1">Vendor: {selectedSupplierFilter}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200">
                <thead className="bg-[#3D1C52] text-white">
                  <tr>
                    <th className="p-2.5">SKU Code</th>
                    <th className="p-2.5">Material Description</th>
                    <th className="p-2.5">Supplier</th>
                    <th className="p-2.5 text-right">Cur. Bal</th>
                    <th className="p-2.5 text-center">Order Qty (Bulk)</th>
                    <th className="p-2.5 text-right">Unit Price (₱)</th>
                    <th className="p-2.5 text-right">Line Total (₱)</th>
                    <th className="p-2.5 text-center print:hidden">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayedPoItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-6 text-center text-gray-500 italic">
                        No items in this Purchase Order view.
                      </td>
                    </tr>
                  ) : (
                    displayedPoItems.map((line, idx) => (
                      <tr key={line.code} className="hover:bg-[#FAF6EE]/50">
                        <td className="p-2.5 font-mono font-bold text-[#5B2E7A]">{line.code}</td>
                        <td className="p-2.5 font-medium">{line.name}</td>
                        <td className="p-2.5 text-gray-700">{line.supplier}</td>
                        <td className="p-2.5 text-right font-mono text-[#C0392B] font-bold">
                          {line.currentBalanceSec} {line.secondaryUom}
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="1"
                              value={line.orderQtyPrimary}
                              onChange={(e) => handlePoQtyChange(line.code, e.target.value)}
                              className="w-16 p-1.5 border rounded font-mono font-bold text-center text-[#5B2E7A]"
                            />
                            <span className="font-semibold text-gray-700">{line.primaryUom}s</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-right">
                          <input
                            type="number"
                            step="any"
                            value={line.unitCostPhp}
                            onChange={(e) => handlePoPriceChange(line.code, e.target.value)}
                            className="w-20 p-1.5 border rounded text-right font-mono"
                          />
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-gray-900">
                          ₱{line.lineTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-center print:hidden">
                          <button
                            type="button"
                            onClick={() => handleRemovePoItem(line.code)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4">
              <div className="text-right space-y-1 bg-[#FAF6EE] p-4 rounded-xl border border-[#C8963E] min-w-[240px]">
                <p className="text-xs text-gray-500">Total Authorized PO Amount:</p>
                <p className="text-2xl font-serif font-bold text-[#1E7A3E]">
                  ₱{totalPoAmountPhp.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
