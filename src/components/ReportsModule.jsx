import React, { useState, useMemo, useRef } from 'react';
import { 
  BarChart3, Download, Upload, Calendar, Printer, Plus, Trash2,
  ArrowDownRight, ArrowUpRight, Scale, ShoppingCart, CheckCircle2
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
  const [activeSubView, setActiveSubView] = useState('analytics'); // 'analytics' | 'po_generator'
  const [timeframe, setTimeframe] = useState('MONTH'); // WEEK, MONTH, QUARTER, YEAR, ALL_TIME
  const [csvImportStatus, setCsvImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  // --- DYNAMIC DATE BOUNDS (Nov 2026 Baseline + Real-Time Forward Compatibility) ---
  const { start, end } = useMemo(() => {
    const sysNow = new Date();
    const seedBaseline = new Date('2026-11-03T23:59:59');
    const refNow = sysNow > seedBaseline ? sysNow : seedBaseline;

    const startDate = new Date(refNow);
    startDate.setHours(0, 0, 0, 0);

    if (timeframe === 'WEEK') {
      startDate.setDate(refNow.getDate() - refNow.getDay());
    } else if (timeframe === 'MONTH') {
      startDate.setDate(1);
    } else if (timeframe === 'QUARTER') {
      const qMonth = Math.floor(refNow.getMonth() / 3) * 3;
      startDate.setMonth(qMonth, 1);
    } else if (timeframe === 'YEAR') {
      startDate.setMonth(0, 1);
    } else if (timeframe === 'ALL_TIME') {
      startDate.setFullYear(2025, 0, 1);
    }

    const endDate = new Date(refNow);
    endDate.setHours(23, 59, 59, 999);
    return { start: startDate, end: endDate };
  }, [timeframe]);

  const filterByDate = (dateString) => {
    if (!dateString || timeframe === 'ALL_TIME') return true;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return true;
    return d >= start && d <= end;
  };

  // Filtered Datasets
  const filteredReceiving = useMemo(
    () => receivingReports.filter(r => filterByDate(r.date)),
    [receivingReports, start, end, timeframe]
  );
  const filteredWithdrawals = useMemo(
    () => withdrawals.filter(w => filterByDate(w.date)),
    [withdrawals, start, end, timeframe]
  );
  const filteredBatchOrders = useMemo(
    () => batchOrders.filter(b => filterByDate(b.requestDate)),
    [batchOrders, start, end, timeframe]
  );
  const filteredAdjustments = useMemo(
    () => adjustments.filter(a => filterByDate(a.date)),
    [adjustments, start, end, timeframe]
  );

  // --- PURCHASE ORDER (PO) GENERATOR STATE (Form-PUR-002) ---
  const buildInitialPoLines = () => {
    const lowItems = inventory.filter(i => i.currentBalance <= i.threshold);
    const sourceList = lowItems.length > 0 ? lowItems : inventory.slice(0, 6);
    return sourceList.map(item => {
      const deficitSec = Math.max(0, (item.threshold * 2) - item.currentBalance);
      const suggestedPrimary = Math.max(
        5,
        Math.ceil(deficitSec / (item.conversionFactor || 1))
      );
      return {
        materialCode: item.code,
        name: item.name,
        brand: item.brand || 'Standard',
        supplier: item.supplier || 'P.L. Sebastian Corporation',
        room: item.room,
        currentBalanceSec: item.currentBalance,
        thresholdSec: item.threshold,
        secondaryUom: item.secondaryUom,
        primaryUom: item.primaryUom,
        conversionFactor: item.conversionFactor || 1,
        orderQtyPrimary: suggestedPrimary,
        unitCost: item.unitCost || 1000,
        lineTotal: suggestedPrimary * (item.unitCost || 1000)
      };
    });
  };

  const [poNumber, setPoNumber] = useState(`PO-2026-11-${Date.now().toString().slice(-4)}`);
  const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10));
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('2026-11-07');
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState('ALL SUPPLIERS (CONSOLIDATED)');
  const [paymentTerms, setPaymentTerms] = useState('30 Days Charge Invoice / Check upon Verification');
  const [poNotes, setPoNotes] = useState(
    'Mandatory FDA Compliance Gate (SOP-REC-001): Attach Certificate of Analysis (CoA) / Food-Grade Certificate (CoC). Cold Room Buttercup blocks must arrive at <= 0°C with individual cellophane expiry stickers.'
  );
  const [poLines, setPoLines] = useState(buildInitialPoLines);
  const [selectedSkuToAdd, setSelectedSkuToAdd] = useState(inventory[0]?.code || 'RM-FLR-001');

  const suppliersList = useMemo(() => {
    const set = new Set(inventory.map(i => i.supplier).filter(Boolean));
    return ['ALL SUPPLIERS (CONSOLIDATED)', ...Array.from(set)];
  }, [inventory]);

  const displayedPoLines = useMemo(() => {
    if (selectedSupplierFilter === 'ALL SUPPLIERS (CONSOLIDATED)') return poLines;
    return poLines.filter(line => line.supplier === selectedSupplierFilter);
  }, [poLines, selectedSupplierFilter]);

  const poSubtotal = useMemo(
    () => displayedPoLines.reduce((sum, l) => sum + (l.lineTotal || 0), 0),
    [displayedPoLines]
  );
  const poVatAmount = poSubtotal * 0.12;
  const poGrandTotal = poSubtotal + poVatAmount;

  const handleRefreshRecommendations = () => {
    setPoLines(buildInitialPoLines());
    if (onRecordAudit) {
      onRecordAudit('PO_REPLENISHMENT_REFRESH', 'Recalculated low-stock PO replenishment recommendations from live inventory.');
    }
  };

  const handlePoQtyChange = (code, newQty) => {
    const qty = Math.max(0, parseFloat(newQty) || 0);
    setPoLines(prev => prev.map(l => {
      if (l.materialCode !== code) return l;
      return {
        ...l,
        orderQtyPrimary: qty,
        lineTotal: qty * l.unitCost
      };
    }));
  };

  const handlePoPriceChange = (code, newCost) => {
    const cost = Math.max(0, parseFloat(newCost) || 0);
    setPoLines(prev => prev.map(l => {
      if (l.materialCode !== code) return l;
      return {
        ...l,
        unitCost: cost,
        lineTotal: l.orderQtyPrimary * cost
      };
    }));
  };

  const handleAddPoLine = () => {
    const mat = inventory.find(m => m.code === selectedSkuToAdd);
    if (!mat) return;
    if (poLines.some(l => l.materialCode === mat.code)) {
      alert(`${mat.code} (${mat.name}) is already in the Purchase Order table.`);
      return;
    }
    const defaultQty = 10;
    setPoLines(prev => [
      ...prev,
      {
        materialCode: mat.code,
        name: mat.name,
        brand: mat.brand || 'Standard',
        supplier: mat.supplier || 'P.L. Sebastian Corporation',
        room: mat.room,
        currentBalanceSec: mat.currentBalance,
        thresholdSec: mat.threshold,
        secondaryUom: mat.secondaryUom,
        primaryUom: mat.primaryUom,
        conversionFactor: mat.conversionFactor || 1,
        orderQtyPrimary: defaultQty,
        unitCost: mat.unitCost || 1000,
        lineTotal: defaultQty * (mat.unitCost || 1000)
      }
    ]);
  };

  const handleRemovePoLine = (code) => {
    setPoLines(prev => prev.filter(l => l.materialCode !== code));
  };

  // --- CSV EXPORT & IMPORT HELPERS ---
  const downloadCSV = (data, headers, filename) => {
    if (!data || data.length === 0) {
      alert('No records available for the selected filter.');
      return;
    }
    const csvRows = [headers.join(',')];
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${timeframe}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPoCsv = () => {
    const flat = displayedPoLines.map((l, idx) => ({
      LineNo: idx + 1,
      PONumber: poNumber,
      PODate: poDate,
      Supplier: l.supplier,
      MaterialCode: l.materialCode,
      ItemName: l.name,
      Brand: l.brand,
      CurrentBalanceNet: `${l.currentBalanceSec} ${l.secondaryUom}`,
      ReorderThresholdNet: `${l.thresholdSec} ${l.secondaryUom}`,
      OrderQtyPrimary: l.orderQtyPrimary,
      PrimaryUoM: l.primaryUom,
      EquivalentNetQty: `${(l.orderQtyPrimary * l.conversionFactor).toFixed(2)} ${l.secondaryUom}`,
      UnitPricePHP: l.unitCost,
      LineTotalPHP: l.lineTotal
    }));
    downloadCSV(
      flat,
      ['LineNo', 'PONumber', 'PODate', 'Supplier', 'MaterialCode', 'ItemName', 'Brand', 'CurrentBalanceNet', 'ReorderThresholdNet', 'OrderQtyPrimary', 'PrimaryUoM', 'EquivalentNetQty', 'UnitPricePHP', 'LineTotalPHP'],
      `JJB_Purchase_Order_${poNumber}`
    );
    if (onRecordAudit) {
      onRecordAudit('PO_EXPORTED_CSV', `Exported Purchase Order ${poNumber} (${displayedPoLines.length} items, Grand Total ₱${poGrandTotal.toLocaleString()})`);
    }
  };

  const handleExportReceiving = () => {
    const flat = filteredReceiving.flatMap(r => (r.items || []).map(i => ({
      ReportNo: r.reportNo,
      Date: r.date,
      PONumber: r.poNo,
      Supplier: r.supplier,
      MaterialCode: i.materialCode,
      ItemName: i.name,
      QtyReceived: i.primaryQty,
      PrimaryUoM: i.primaryUom,
      NetQty: i.secondaryQty,
      NetUoM: i.secondaryUom,
      LotNumber: i.lotNumber,
      ExpiryDate: i.expiryDate,
      TotalAmountPHP: i.totalAmount
    })));
    downloadCSV(flat, ['ReportNo', 'Date', 'PONumber', 'Supplier', 'MaterialCode', 'ItemName', 'QtyReceived', 'PrimaryUoM', 'NetQty', 'NetUoM', 'LotNumber', 'ExpiryDate', 'TotalAmountPHP'], 'JJB_Receiving_Report');
  };

  const handleExportWithdrawals = () => {
    const flat = filteredWithdrawals.flatMap(w => (w.items || []).map(i => ({
      SlipNo: w.slipNo,
      Date: w.date,
      Time: w.time,
      RequestingLine: w.requestingEntity,
      Purpose: w.purpose,
      MaterialCode: i.materialCode,
      ItemName: i.name,
      QtyIssuedNet: i.qtyIssuedSec,
      UoM: i.secondaryUom,
      LotNumber: i.lotNumber,
      RequestedBy: w.requestedBy,
      IssuedBy: w.issuedBy,
      ReceivedBy: w.receivedBy,
      Status: w.status
    })));
    downloadCSV(flat, ['SlipNo', 'Date', 'Time', 'RequestingLine', 'Purpose', 'MaterialCode', 'ItemName', 'QtyIssuedNet', 'UoM', 'LotNumber', 'RequestedBy', 'IssuedBy', 'ReceivedBy', 'Status'], 'JJB_Withdrawal_Report');
  };

  const handleExportBatching = () => {
    const flat = filteredBatchOrders.map(b => ({
      OrderID: b.orderId,
      RequestDate: b.requestDate,
      TargetDate: b.targetDate,
      Outlet: b.outletName,
      RecipeSKU: b.recipeSku,
      RecipeName: b.recipeName,
      KitCountMultiplier: b.batchMultiplier,
      TargetPieces: b.requestedQtyPcs,
      BulkReqSlipNo: b.bulkReqSlipNo || (b.bulkMaterialsRequested ? 'REQUESTED' : 'PENDING'),
      BatchTagID: b.batchTagId || 'PENDING',
      ActualScaledKg: b.actualBatchedKg || 0,
      Status: b.status,
      BatchedBy: b.batchedBy || 'Romeo B. Malusay',
      ReleasedTo: b.releasedTo || 'Pending'
    }));
    downloadCSV(flat, ['OrderID', 'RequestDate', 'TargetDate', 'Outlet', 'RecipeSKU', 'RecipeName', 'KitCountMultiplier', 'TargetPieces', 'BulkReqSlipNo', 'BatchTagID', 'ActualScaledKg', 'Status', 'BatchedBy', 'ReleasedTo'], 'JJB_Batching_Kitting_Report');
  };

  const handleExportAdjustments = () => {
    const flat = filteredAdjustments.map(a => ({
      AdjID: a.id,
      Date: a.date,
      Type: a.type,
      MaterialCode: a.materialCode,
      ItemName: a.name,
      QtyNet: a.qtySec,
      UoM: a.uom,
      Reason: a.reason,
      Author: a.author,
      FSCOSignoff: a.fscoSignoff
    }));
    downloadCSV(flat, ['AdjID', 'Date', 'Type', 'MaterialCode', 'ItemName', 'QtyNet', 'UoM', 'Reason', 'Author', 'FSCOSignoff'], 'JJB_Adjustments_Report');
  };

  const handleCsvFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text !== 'string') return;
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        alert('CSV file must contain a header row and at least one data row (MaterialCode,CurrentBalance,UnitCost).');
        return;
      }
      const updates = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
        const code = cols[0];
        const bal = parseFloat(cols[1]);
        const cost = cols[2] !== undefined ? parseFloat(cols[2]) : undefined;
        if (code && !isNaN(bal)) {
          updates.push({ code, currentBalance: bal, unitCost: !isNaN(cost) ? cost : undefined });
        }
      }
      if (updates.length > 0 && onImportInventoryCsv) {
        onImportInventoryCsv(updates);
        setCsvImportStatus(`Successfully imported & updated ${updates.length} SKU balances from ${file.name}.`);
        setTimeout(() => setCsvImportStatus(null), 5000);
      } else {
        alert('No valid MaterialCode,CurrentBalance rows found in CSV.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-View Toggle */}
      <div className="flex justify-between items-start flex-wrap gap-3">
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
            onClick={() => setActiveSubView('analytics')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubView === 'analytics'
                ? 'bg-[#3D1C52] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 size={14} /> Documentation & CSV Reports
          </button>
          <button
            onClick={() => setActiveSubView('po_generator')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubView === 'po_generator'
                ? 'bg-[#C8963E] text-[#240e32] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart size={14} /> Purchase Order (PO) Generator ({poLines.length})
          </button>
        </div>
      </div>

      {/* CSV Import Confirmation Banner */}
      {csvImportStatus && (
        <div className="bg-green-100 border border-green-300 text-green-900 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle2 size={16} className="text-green-700" />
          <span>{csvImportStatus}</span>
        </div>
      )}

      {/* SUB-VIEW 1: DOCUMENTATION & ANALYTICS REPORTS */}
      {activeSubView === 'analytics' && (
        <div className="space-y-6">
          {/* Control Panel */}
          <div className="bg-white p-4 rounded-xl border border-[#E2D1B8] shadow-sm flex flex-wrap gap-4 items-center justify-between">
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
                <option value="ALL_TIME">All Recorded History</option>
              </select>
              <span className="text-[11px] text-gray-500 font-mono">
                ({start.toISOString().slice(0, 10)} to {end.toISOString().slice(0, 10)})
              </span>
            </div>

            <div className="flex gap-2 flex-wrap">
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleCsvFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#1E7A3E] hover:bg-[#165c2f] text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow flex items-center gap-1.5 transition"
                title="Upload CSV with columns: MaterialCode,CurrentBalance,UnitCost"
              >
                <Upload size={14} /> Import Live Inventory CSV
              </button>
              <button
                onClick={() => window.print()}
                className="bg-[#3D1C52] hover:bg-[#240e32] text-white text-xs font-bold px-4 py-2 rounded-lg shadow flex items-center gap-1.5 transition"
              >
                <Printer size={14} /> Print / Save PDF
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
                <button
                  onClick={handleExportReceiving}
                  className="text-xs bg-white border border-[#1E7A3E] text-[#1E7A3E] font-bold px-3 py-1 rounded hover:bg-green-50 flex items-center gap-1"
                >
                  <Download size={12} /> Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#5B2E7A] text-white">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Report # & PO</th>
                      <th className="p-3">Supplier</th>
                      <th className="p-3">Material</th>
                      <th className="p-3 text-right">Primary Bulk</th>
                      <th className="p-3 text-right">Net Qty</th>
                      <th className="p-3 text-right">Amount (₱)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredReceiving.length === 0 ? (
                      <tr><td colSpan="7" className="p-4 text-center text-gray-500">No receiving records for this timeframe.</td></tr>
                    ) : (
                      filteredReceiving.map(r => (r.items || []).map((i, idx) => (
                        <tr key={`${r.reportNo}-${idx}`} className="hover:bg-[#FAF6EE]/40">
                          <td className="p-3 font-mono">{r.date}</td>
                          <td className="p-3 font-mono font-bold text-[#5B2E7A]">{r.reportNo} <span className="text-gray-400 font-normal">({r.poNo})</span></td>
                          <td className="p-3">{r.supplier}</td>
                          <td className="p-3 font-medium">{i.materialCode} — {i.name}</td>
                          <td className="p-3 text-right font-mono">{i.primaryQty} {i.primaryUom}</td>
                          <td className="p-3 text-right font-mono font-bold text-[#1E7A3E]">{i.secondaryQty} {i.secondaryUom}</td>
                          <td className="p-3 text-right font-mono font-bold">₱{i.totalAmount?.toLocaleString()}</td>
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
                  <ArrowUpRight size={18} className="text-[#5B2E7A]" /> 2. Warehouse Floor & Bulk Batching Withdrawals (`Form-WAR-001`)
                </h3>
                <button
                  onClick={handleExportWithdrawals}
                  className="text-xs bg-white border border-[#5B2E7A] text-[#5B2E7A] font-bold px-3 py-1 rounded hover:bg-purple-50 flex items-center gap-1"
                >
                  <Download size={12} /> Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#5B2E7A] text-white">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Slip #</th>
                      <th className="p-3">Requesting Line / Area</th>
                      <th className="p-3">Material</th>
                      <th className="p-3 text-right">Net Qty Issued</th>
                      <th className="p-3 text-center">Approval Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredWithdrawals.length === 0 ? (
                      <tr><td colSpan="6" className="p-4 text-center text-gray-500">No withdrawal records for this timeframe.</td></tr>
                    ) : (
                      filteredWithdrawals.map(w => (w.items || []).map((i, idx) => (
                        <tr key={`${w.slipNo}-${idx}`} className="hover:bg-[#FAF6EE]/40">
                          <td className="p-3 font-mono">{w.date}</td>
                          <td className="p-3 font-mono font-bold text-[#5B2E7A]">{w.slipNo}</td>
                          <td className="p-3 font-medium">{w.requestingEntity}</td>
                          <td className="p-3">{i.materialCode} — {i.name}</td>
                          <td className="p-3 text-right font-mono font-bold text-[#5B2E7A]">{i.qtyIssuedSec} {i.secondaryUom}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              w.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-[#D68910]' : 'bg-green-100 text-[#1E7A3E]'
                            }`}>
                              {w.status}
                            </span>
                          </td>
                        </tr>
                      )))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Outlet Batching & Kitting Report */}
            <div className="bg-white rounded-xl border border-[#E2D1B8] shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-[#FAF6EE] border-b border-[#E2D1B8] flex justify-between items-center">
                <h3 className="font-serif font-bold text-[#3D1C52] flex items-center gap-2 text-sm">
                  <Scale size={18} className="text-[#C8963E]" /> 3. Outlet Batching, Kitting & Dispatch Lifecycle (`Form-PRO-001` / `Form-ING-001`)
                </h3>
                <button
                  onClick={handleExportBatching}
                  className="text-xs bg-white border border-[#C8963E] text-[#C8963E] font-bold px-3 py-1 rounded hover:bg-amber-50 flex items-center gap-1"
                >
                  <Download size={12} /> Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#5B2E7A] text-white">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Outlet</th>
                      <th className="p-3">Recipe & Kit Count</th>
                      <th className="p-3">Upstream Bulk Slip</th>
                      <th className="p-3">Batch Tag (`Form-ING-001`)</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBatchOrders.length === 0 ? (
                      <tr><td colSpan="7" className="p-4 text-center text-gray-500">No batching orders for this timeframe.</td></tr>
                    ) : (
                      filteredBatchOrders.map(b => (
                        <tr key={b.orderId} className="hover:bg-[#FAF6EE]/40">
                          <td className="p-3 font-mono">{b.requestDate}</td>
                          <td className="p-3 font-mono font-bold text-[#5B2E7A]">{b.orderId}</td>
                          <td className="p-3 font-bold text-[#C8963E]">{b.outletName}</td>
                          <td className="p-3 font-medium">{b.recipeName} ({b.batchMultiplier} Kits / {b.requestedQtyPcs} pcs)</td>
                          <td className="p-3 font-mono text-[11px]">{b.bulkReqSlipNo || (b.bulkMaterialsRequested ? 'Requested' : 'Not Requested')}</td>
                          <td className="p-3 font-mono font-bold text-[#1E7A3E]">{b.batchTagId || 'Pending Scaling'}</td>
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

            {/* 4. Inventory Adjustments Report */}
            <div className="bg-white rounded-xl border border-[#E2D1B8] shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-[#FAF6EE] border-b border-[#E2D1B8] flex justify-between items-center">
                <h3 className="font-serif font-bold text-[#3D1C52] flex items-center gap-2 text-sm">
                  4. Inventory Reconciliation Adjustments (`ADJ-IN` / `ADJ-OUT`)
                </h3>
                <button
                  onClick={handleExportAdjustments}
                  className="text-xs bg-white border border-gray-400 text-gray-700 font-bold px-3 py-1 rounded hover:bg-gray-50 flex items-center gap-1"
                >
                  <Download size={12} /> Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#5B2E7A] text-white">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Adjustment ID</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Material</th>
                      <th className="p-3 text-right">Net Qty</th>
                      <th className="p-3">Reason & FSCO Sign-Off</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAdjustments.length === 0 ? (
                      <tr><td colSpan="6" className="p-4 text-center text-gray-500">No adjustments for this timeframe.</td></tr>
                    ) : (
                      filteredAdjustments.map(a => (
                        <tr key={a.id} className="hover:bg-[#FAF6EE]/40">
                          <td className="p-3 font-mono">{a.date}</td>
                          <td className="p-3 font-mono font-bold text-[#5B2E7A]">{a.id}</td>
                          <td className="p-3 font-semibold">{a.type}</td>
                          <td className="p-3">{a.materialCode} — {a.name}</td>
                          <td className="p-3 text-right font-mono font-bold">{a.qtySec} {a.uom}</td>
                          <td className="p-3 text-gray-600">{a.reason} (FSCO: {a.fscoSignoff})</td>
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

      {/* SUB-VIEW 2: INTERACTIVE PURCHASE ORDER (PO) GENERATOR (Form-PUR-002) */}
      {activeSubView === 'po_generator' && (
        <div className="space-y-6">
          {/* PO Configuration & Customizer Bar */}
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

            {/* PO Metadata Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
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
                <label className="block font-bold text-gray-700 mb-1">Filter / Target Supplier</label>
                <select
                  value={selectedSupplierFilter}
                  onChange={(e) => setSelectedSupplierFilter(e.target.value)}
                  className="w-full p-2 border rounded bg-white font-bold text-[#3D1C52]"
                >
                  {suppliersList.map(sup => (
                    <option key={sup} value={sup}>{sup}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Required Delivery Date</label>
                <input
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="w-full p-2 border rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Add Additional Item to PO */}
            <div className="bg-[#FAF6EE] p-3 rounded-lg border border-[#E2D1B8] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                <span className="font-bold text-[#3D1C52] whitespace-nowrap">Add Catalog Item to PO:</span>
                <select
                  value={selectedSkuToAdd}
                  onChange={(e) => setSelectedSkuToAdd(e.target.value)}
                  className="flex-1 p-2 border rounded bg-white font-medium"
                >
                  {inventory.map(item => (
                    <option key={item.code} value={item.code}>
                      {item.code} — {item.name} (Cur: {item.currentBalance} {item.secondaryUom} / Thresh: {item.threshold} {item.secondaryUom} · {item.supplier || 'General'})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddPoLine}
                className="bg-[#5B2E7A] hover:bg-[#3D1C52] text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1"
              >
                <Plus size={14} /> Add Item to PO
              </button>
            </div>
          </div>

          {/* PRINTABLE PURCHASE ORDER DOCUMENT (Form-PUR-002) */}
          <div id="printable-purchase-order" className="bg-white rounded-2xl border-2 border-[#5B2E7A] p-6 md:p-8 shadow-lg space-y-6">
            <div className="border-b-2 border-[#5B2E7A] pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-[#C8963E] uppercase">
                  OFFICIAL PROCUREMENT REQUISITION & PURCHASE ORDER (`Form-PUR-002`)
                </p>
                <h1 className="font-serif font-bold text-2xl text-[#3D1C52] mt-0.5">
                  JANG-JANG BAKESHOP & KINGDOM CONFECTIONARY
                </h1>
                <p className="text-xs text-gray-600">
                  Ship To: Purok 8, San Miguel, Barangay Indangan, Buhangin District, Davao City, 8000
                </p>
                <p className="text-[11px] text-gray-500">
                  VAT Reg TIN: 434-271-509-00000 · Indangan FDA LTO #3000013388488 · Contact: +63 927 526 9774
                </p>
              </div>

              <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#E2D1B8] text-xs text-right min-w-[230px]">
                <p className="font-mono font-bold text-sm text-[#5B2E7A]">{poNumber}</p>
                <p className="text-gray-600 mt-0.5"><strong>PO Date:</strong> {poDate}</p>
                <p className="text-gray-600"><strong>Delivery Needed:</strong> {expectedDeliveryDate}</p>
                <p className="text-[#1E7A3E] font-bold mt-1">Vendor: {selectedSupplierFilter}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#3D1C52] text-white">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">SKU & Material Description</th>
                    <th className="p-2.5">Assigned Supplier</th>
                    <th className="p-2.5 text-right">Current Stock</th>
                    <th className="p-2.5 text-center">Order Qty (Primary UoM)</th>
                    <th className="p-2.5 text-right">Net Equivalent</th>
                    <th className="p-2.5 text-right">Unit Price (₱)</th>
                    <th className="p-2.5 text-right">Line Total (₱)</th>
                    <th className="p-2.5 text-center">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayedPoLines.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-6 text-center text-gray-500 italic">
                        No items in this Purchase Order view. Use "Add Catalog Item to PO" above.
                      </td>
                    </tr>
                  ) : (
                    displayedPoLines.map((line, idx) => (
                      <tr key={line.materialCode} className="hover:bg-[#FAF6EE]/40">
                        <td className="p-2.5 font-mono text-gray-500">{idx + 1}</td>
                        <td className="p-2.5">
                          <div className="font-bold text-[#3D1C52]">{line.materialCode} — {line.name}</div>
                          <div className="text-[10px] text-gray-500">Brand: {line.brand} · Chamber: {line.room}</div>
                        </td>
                        <td className="p-2.5 font-medium text-gray-700">{line.supplier}</td>
                        <td className="p-2.5 text-right font-mono text-[#C0392B] font-bold">
                          {line.currentBalanceSec} {line.secondaryUom}
                          <span className="block text-[10px] text-gray-400 font-normal"> Min: {line.thresholdSec} {line.secondaryUom}</span>
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={line.orderQtyPrimary}
                              onChange={(e) => handlePoQtyChange(line.materialCode, e.target.value)}
                              className="w-20 p-1.5 border rounded font-mono font-bold text-center text-[#5B2E7A]"
                            />
                            <span className="font-semibold text-gray-700">{line.primaryUom}s</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-right font-mono text-[#1E7A3E] font-bold">
                          {(line.orderQtyPrimary * line.conversionFactor).toLocaleString()} {line.secondaryUom}
                        </td>
                        <td className="p-2.5 text-right">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={line.unitCost}
                            onChange={(e) => handlePoPriceChange(line.materialCode, e.target.value)}
                            className="w-24 p-1.5 border rounded font-mono text-right"
                          />
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-gray-900">
                          ₱{line.lineTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePoLine(line.materialCode)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Remove from PO"
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

            {/* PO Valuation Summary & Mandatory FDA Receiving Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2 text-xs">
                <label className="block font-bold text-[#3D1C52]">
                  Mandatory Supplier Quality & Receiving Directives (`SOP-REC-001`):
                </label>
                <textarea
                  rows={3}
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  className="w-full p-2.5 border rounded-lg bg-[#FAF6EE] text-xs text-gray-700"
                />
                <p className="text-[11px] text-gray-500">
                  <strong>Payment Terms:</strong> {paymentTerms}
                </p>
              </div>

              <div className="bg-[#FAF6EE] p-4 rounded-xl border border-[#E2D1B8] space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({displayedPoLines.length} Line Items):</span>
                  <span className="font-mono font-semibold">₱{poSubtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Input VAT (12.0%):</span>
                  <span className="font-mono font-semibold">₱{poVatAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 flex justify-between text-sm font-bold text-[#3D1C52]">
                  <span>Total Authorized PO Value:</span>
                  <span className="font-mono text-[#1E7A3E]">₱{poGrandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Sign-off Blocks */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t-2 border-[#5B2E7A] text-xs">
              <div className="p-3 bg-gray-50 rounded border">
                <p className="text-[10px] font-bold uppercase text-gray-500">Prepared By (Warehouse):</p>
                <p className="font-bold text-[#3D1C52] mt-1">Jade Q. Dela Cruz</p>
                <p className="text-[10px] text-gray-400 mt-2">Warehouse Supervisor</p>
              </div>
              <div className="p-3 bg-gray-50 rounded border">
                <p className="text-[10px] font-bold uppercase text-gray-500">Canvassed & Reconciled:</p>
                <p className="font-bold text-[#3D1C52] mt-1">Mariejohn F. Tacuban</p>
                <p className="text-[10px] text-gray-400 mt-2">Inventory & Purchasing Manager</p>
              </div>
              <div className="p-3 bg-gray-50 rounded border">
                <p className="text-[10px] font-bold uppercase text-gray-500">Budget & Costing Clearance:</p>
                <p className="font-bold text-[#3D1C52] mt-1">Jeanifer S. Sauping / M.C. Basoc</p>
                <p className="text-[10px] text-gray-400 mt-2">Finance & Costing Directorate</p>
              </div>
              <div className="p-3 bg-gray-50 rounded border">
                <p className="text-[10px] font-bold uppercase text-gray-500">Approved By (Executive):</p>
                <p className="font-bold text-[#3D1C52] mt-1">Angelina P. Sun</p>
                <p className="text-[10px] text-gray-400 mt-2">Head of Administration / COA</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
