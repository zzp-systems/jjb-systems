import React, { useState } from 'react';
import { 
  AlertTriangle, Plus, ShieldAlert, CheckCircle2, 
  Trash2, FileText, DollarSign, Archive, RotateCcw
} from 'lucide-react';

export default function AdjustmentsModule({
  inventory,
  adjustments,
  quarantineList,
  onSaveAdjustment,
  onSaveQuarantine,
  currentRole
}) {
  const [activeTab, setActiveTab] = useState('quarantine'); // 'quarantine' | 'adjustment'
  
  // Adjustment Form State
  const [adjType, setAdjType] = useState('ADJ-OUT (Tare Loss / Spoilage)');
  const [adjMaterial, setAdjMaterial] = useState(inventory[0]?.code || 'RM-FLR-001');
  const [adjQty, setAdjQty] = useState(1);
  const [adjReason, setAdjReason] = useState('');

  // Quarantine Form State
  const [ncrNo, setNcrNo] = useState(`NCR-2026-1103-0${quarantineList.length + 1}`);
  const [ncrItem, setNcrItem] = useState('');
  const [ncrLot, setNcrLot] = useState('');
  const [ncrQty, setNcrQty] = useState('');
  const [ncrReason, setNcrReason] = useState('Cargo damaged upon delivery receiving dock');
  const [ncrLoss, setNcrLoss] = useState(500);
  const [ncrDisposition, setNcrDisposition] = useState('RETURN TO SUPPLIER (Credit Memo)');

  const selectedMat = inventory.find(m => m.code === adjMaterial) || inventory[0];

  const handleCreateAdjustment = (e) => {
    e.preventDefault();
    if (!adjReason.trim()) {
      alert("Please provide the physical reason for this inventory adjustment.");
      return;
    }

    const newAdj = {
      id: `ADJ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-3)}`,
      date: new Date().toISOString().slice(0, 10),
      type: adjType,
      materialCode: selectedMat.code,
      name: selectedMat.name,
      qtySec: parseFloat(adjQty) || 1,
      uom: selectedMat.secondaryUom,
      reason: adjReason,
      author: currentRole,
      fscoSignoff: "Grace P. Suico (FSCO)",
      ncrNumber: adjType.includes('OUT') ? "NCR-FORM-LINK" : "N/A"
    };

    onSaveAdjustment(newAdj);
    setAdjReason('');
    setAdjQty(1);
  };

  const handleCreateQuarantine = (e) => {
    e.preventDefault();
    if (!ncrItem.trim()) {
      alert("Please specify the quarantined item description.");
      return;
    }

    const newNcr = {
      ncrNo,
      date: new Date().toISOString().slice(0, 10),
      itemDescription: ncrItem,
      lotNumber: ncrLot || 'LOT-REJECTED',
      qty: ncrQty || '1 Unit',
      reason: ncrReason,
      financialLossPhp: parseFloat(ncrLoss) || 0,
      disposition: ncrDisposition,
      status: "ACTIVE QUARANTINE"
    };

    onSaveQuarantine(newNcr);
    setNcrItem('');
    setNcrLot('');
    setNcrQty('');
    setNcrNo(`NCR-2026-1103-0${quarantineList.length + 2}`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-[#C0392B] text-white px-2 py-0.5 rounded">
              Form-NCR-001 / ADJ-001
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">
              Exterior Quarantine Cabinet &amp; Stock Variance Adjustments
            </h2>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            Physical Red-Tagging · Tare Loss &amp; Surplus Reconciliation · Financial Scrap &amp; Loss Allocations (SOP-QC-004)
          </p>
        </div>

        {/* Toggle between Quarantine and Adjustment */}
        <div className="flex bg-white p-1 rounded-lg border border-[#E2D1B8] shadow-sm">
          <button
            onClick={() => setActiveTab('quarantine')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'quarantine'
                ? 'bg-[#C0392B] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShieldAlert size={14} /> Exterior Quarantine Cabinet ({quarantineList.length})
          </button>
          <button
            onClick={() => setActiveTab('adjustment')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'adjustment'
                ? 'bg-[#5B2E7A] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <RotateCcw size={14} /> Stock Variance Adjustments ({adjustments.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: QUARANTINE CABINET */}
      {activeTab === 'quarantine' && (
        <div className="space-y-5">
          {/* File New NCR Form */}
          <form onSubmit={handleCreateQuarantine} className="bg-white p-5 rounded-xl border border-red-200 shadow-sm space-y-4">
            <div className="border-b border-red-100 pb-3 flex justify-between items-center flex-wrap gap-2">
              <h3 className="font-serif font-bold text-base text-[#C0392B] flex items-center gap-2">
                <ShieldAlert size={18} /> File Non-Conformance Report &amp; Segregate to Quarantine (`Form-NCR-001`)
              </h3>
              <span className="text-[11px] font-bold bg-red-50 text-[#C0392B] px-2.5 py-1 rounded border border-red-200">
                Mandatory Physical Red-Tagging
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">NCR Reference #</label>
                <input
                  type="text"
                  value={ncrNo}
                  readOnly
                  className="w-full p-2 border rounded font-mono font-bold bg-gray-50 text-[#C0392B]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Item Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 Sack Rossa Flour (Water damaged)"
                  value={ncrItem}
                  onChange={(e) => setNcrItem(e.target.value)}
                  required
                  className="w-full p-2 border rounded text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Lot / Batch Number</label>
                <input
                  type="text"
                  placeholder="e.g. LOT-ROS-261022"
                  value={ncrLot}
                  onChange={(e) => setNcrLot(e.target.value)}
                  className="w-full p-2 border rounded font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Quantity Segregated</label>
                <input
                  type="text"
                  placeholder="e.g. 25 kg / 1 Sack"
                  value={ncrQty}
                  onChange={(e) => setNcrQty(e.target.value)}
                  className="w-full p-2 border rounded text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Reason for Segregation</label>
                <select
                  value={ncrReason}
                  onChange={(e) => setNcrReason(e.target.value)}
                  className="w-full p-2 border rounded bg-white"
                >
                  <option>Cargo damaged upon delivery receiving dock</option>
                  <option>Expired raw material found in storage (PLI Critical Finding C-2)</option>
                  <option>Butter temperature breach (&gt; 0°C on arrival)</option>
                  <option>Cellophane expiry sticker missing on butter</option>
                  <option>Foreign matter / tear in packaging</option>
                  <option>Thermal lethality failure during test bake</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Estimated Financial Loss (₱)</label>
                <input
                  type="number"
                  value={ncrLoss}
                  onChange={(e) => setNcrLoss(e.target.value)}
                  className="w-full p-2 border rounded font-mono font-bold text-[#C0392B]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Corrective Disposition Action</label>
                <select
                  value={ncrDisposition}
                  onChange={(e) => setNcrDisposition(e.target.value)}
                  className="w-full p-2 border rounded bg-white font-semibold text-gray-800"
                >
                  <option>RETURN TO SUPPLIER (Credit Memo)</option>
                  <option>WITNESSED DISPOSAL (FSCO Grace Suico)</option>
                  <option>CONDEMNED &amp; DESTROYED (Witnessed by FDA)</option>
                  <option>RE-TESTING BY QA LAB</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                type="submit"
                className="bg-[#C0392B] hover:bg-[#a93226] text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow flex items-center gap-1.5 transition"
              >
                <ShieldAlert size={15} /> Lock into Exterior Quarantine Cabinet
              </button>
            </div>
          </form>

          {/* Active Quarantined Table */}
          <div className="bg-white rounded-xl border border-[#E2D1B8] shadow-sm overflow-hidden">
            <div className="px-6 py-3.5 bg-[#FAF6EE] border-b border-[#E2D1B8] flex justify-between items-center">
              <h3 className="font-serif font-bold text-[#5B2E7A]">
                Exterior Quarantine Cabinet Roster (`Form-NCR-001` Records)
              </h3>
              <span className="text-xs bg-red-100 text-[#C0392B] px-2.5 py-0.5 rounded font-bold">
                Physical Red Tag Attached
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#5B2E7A] text-white">
                <tr>
                  <th className="p-3">NCR Tag #</th>
                  <th className="p-3">Segregation Date</th>
                  <th className="p-3">Item Description &amp; Lot</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Reason for Quarantine</th>
                  <th className="p-3 text-right">Financial Loss (PHP)</th>
                  <th className="p-3 text-center">Disposition Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D1B8]">
                {quarantineList.map((q, idx) => (
                  <tr key={idx} className="hover:bg-red-50/20">
                    <td className="p-3 font-mono font-bold text-[#C0392B]">{q.ncrNo}</td>
                    <td className="p-3 text-gray-600">{q.date}</td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{q.itemDescription}</div>
                      <div className="font-mono text-[11px] text-gray-500">Lot: {q.lotNumber}</div>
                    </td>
                    <td className="p-3 font-mono">{q.qty}</td>
                    <td className="p-3 text-gray-700">{q.reason}</td>
                    <td className="p-3 text-right font-mono font-bold text-[#C0392B]">
                      ₱{q.financialLossPhp?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-[#C0392B]">
                        {q.disposition}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: INVENTORY ADJUSTMENTS (ADJ-IN / ADJ-OUT) */}
      {activeTab === 'adjustment' && (
        <div className="space-y-5">
          {/* New Adjustment Form */}
          <form onSubmit={handleCreateAdjustment} className="bg-white p-5 rounded-xl border border-[#E2D1B8] shadow-sm space-y-4">
            <div className="border-b pb-3 flex justify-between items-center flex-wrap gap-2">
              <h3 className="font-serif font-bold text-base text-[#5B2E7A] flex items-center gap-2">
                <RotateCcw size={18} /> Physical Inventory Variance Reconciliation (ADJ-IN / ADJ-OUT)
              </h3>
              <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded border border-amber-200">
                Variances &gt; 2.0% require Form-NCR-001
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Adjustment Type</label>
                <select
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value)}
                  className="w-full p-2 border rounded bg-white font-bold text-[#5B2E7A]"
                >
                  <option>ADJ-OUT (Tare Loss / Spoilage)</option>
                  <option>ADJ-IN (Found Stock / Surplus)</option>
                  <option>ADJ-OUT (Floor Spillage / Drop)</option>
                  <option>ADJ-IN (Physical Count Correction)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Material SKU</label>
                <select
                  value={adjMaterial}
                  onChange={(e) => setAdjMaterial(e.target.value)}
                  className="w-full p-2 border rounded bg-white font-medium"
                >
                  {inventory.map(m => (
                    <option key={m.code} value={m.code}>
                      {m.code} - {m.name} ({m.currentBalance} {m.secondaryUom})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Adjust Quantity ({selectedMat.secondaryUom})
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={adjQty}
                  onChange={(e) => setAdjQty(e.target.value)}
                  className="w-full p-2 border rounded font-mono font-bold text-[#3D1C52]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">FSCO Approver</label>
                <input
                  type="text"
                  value="Grace P. Suico (FSCO Director)"
                  disabled
                  className="w-full p-2 border rounded bg-gray-100 font-semibold text-gray-700 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1 text-xs">
                Audit Justification &amp; Root Cause <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Tare loss identified during 17:00 physical bag count reconciliation"
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                required
                className="w-full p-2 border rounded text-xs"
              />
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                type="submit"
                className="bg-[#5B2E7A] hover:bg-[#3D1C52] text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow flex items-center gap-1.5 transition"
              >
                <CheckCircle2 size={15} /> Commit Perpetual Balance Adjustment
              </button>
            </div>
          </form>

          {/* Adjustments Ledger */}
          <div className="bg-white rounded-xl border border-[#E2D1B8] shadow-sm overflow-hidden">
            <div className="px-6 py-3.5 bg-[#FAF6EE] border-b border-[#E2D1B8] flex justify-between items-center">
              <h3 className="font-serif font-bold text-[#5B2E7A]">
                Historical Physical Variance Ledger
              </h3>
              <span className="text-xs text-gray-500 font-medium">{adjustments.length} logged adjustments</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#5B2E7A] text-white">
                <tr>
                  <th className="p-3">Adjustment ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Material Code &amp; Name</th>
                  <th className="p-3 text-right">Adjustment Net</th>
                  <th className="p-3">Reason / Justification</th>
                  <th className="p-3">Author</th>
                  <th className="p-3">FSCO Signoff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D1B8]">
                {adjustments.map((a, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF6EE]/50">
                    <td className="p-3 font-mono font-bold text-[#5B2E7A]">{a.id}</td>
                    <td className="p-3 text-gray-600">{a.date}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.type.includes('OUT') ? 'bg-red-100 text-[#C0392B]' : 'bg-green-100 text-[#1E7A3E]'
                      }`}>
                        {a.type}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-gray-900">{a.materialCode} - {a.name}</td>
                    <td className={`p-3 text-right font-mono font-bold ${
                      a.type.includes('OUT') ? 'text-[#C0392B]' : 'text-[#1E7A3E]'
                    }`}>
                      {a.type.includes('OUT') ? `-${a.qtySec}` : `+${a.qtySec}`} {a.uom}
                    </td>
                    <td className="p-3 text-gray-700">{a.reason}</td>
                    <td className="p-3 text-gray-600">{a.author}</td>
                    <td className="p-3 font-semibold text-green-800">{a.fscoSignoff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
