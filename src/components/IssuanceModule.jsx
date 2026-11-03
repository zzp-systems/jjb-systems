import React, { useState } from 'react';
import { 
  FileText, Plus, Trash2, CheckCircle2, AlertCircle, 
  Printer, ArrowUpRight, Clock, ShieldCheck
} from 'lucide-react';

export default function IssuanceModule({ 
  inventory, 
  onSaveWithdrawal, 
  withdrawals, 
  currentRole,
  isMobileMode,
  prefilledItem 
}) {
  const [slipNo, setSlipNo] = useState(`WS-2026-1103-0${withdrawals.length + 1}`);
  const [requestingEntity, setRequestingEntity] = useState('Indangan - Biscocho Commercial Line');
  const [department, setDepartment] = useState('Production - Biscocho Hall');
  const [purpose, setPurpose] = useState('Commercial Afternoon Bake Run');
  const [requestedBy, setRequestedBy] = useState('Alwen Hermogeno (Master Head Baker)');
  const [receivedBy, setReceivedBy] = useState('Vicky Albino (Authorized Baker)');
  const [selectedSlipView, setSelectedSlipView] = useState(null);

  // Line items
  const [items, setItems] = useState([
    prefilledItem ? {
      materialCode: prefilledItem.code,
      name: prefilledItem.name,
      qtyRequestedSec: 25.0,
      qtyIssuedSec: 25.0,
      secondaryUom: prefilledItem.secondaryUom,
      lotNumber: prefilledItem.lots?.[0]?.lotNumber || 'DEFAULT-LOT',
      storageRoom: prefilledItem.room,
      remarks: 'FEFO prioritized issuance'
    } : {
      materialCode: 'RM-FLR-003',
      name: '1st Class Hard Flour (Rossa)',
      qtyRequestedSec: 50.0,
      qtyIssuedSec: 50.0,
      secondaryUom: 'kg',
      lotNumber: 'LOT-ROS-261005',
      storageRoom: 'Dry Room 1',
      remarks: 'Strict FEFO lot rotation'
    }
  ]);

  const handleMaterialChange = (index, code) => {
    const mat = inventory.find(m => m.code === code);
    if (!mat) return;
    const oldestLot = mat.lots && mat.lots.length > 0 ? mat.lots[0].lotNumber : 'DEFAULT-LOT';
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      return {
        ...item,
        materialCode: mat.code,
        name: mat.name,
        secondaryUom: mat.secondaryUom,
        storageRoom: mat.room,
        lotNumber: oldestLot
      };
    }));
  };

  const handleQtyChange = (index, qty) => {
    const val = parseFloat(qty) || 0;
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      return {
        ...item,
        qtyRequestedSec: val,
        qtyIssuedSec: val
      };
    }));
  };

  const handleAddRow = () => {
    const defaultMat = inventory[0];
    const oldestLot = defaultMat.lots && defaultMat.lots.length > 0 ? defaultMat.lots[0].lotNumber : 'DEFAULT-LOT';
    setItems(prev => [
      ...prev,
      {
        materialCode: defaultMat.code,
        name: defaultMat.name,
        qtyRequestedSec: 10.0,
        qtyIssuedSec: 10.0,
        secondaryUom: defaultMat.secondaryUom,
        lotNumber: oldestLot,
        storageRoom: defaultMat.room,
        remarks: 'FEFO Verified'
      }
    ]);
  };

  const handleRemoveRow = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check inventory balances
    for (const item of items) {
      const mat = inventory.find(m => m.code === item.materialCode);
      if (mat && mat.currentBalance < item.qtyIssuedSec) {
        const proceed = window.confirm(
          `Warning: Issuance of ${item.qtyIssuedSec} ${item.secondaryUom} for ${item.name} exceeds current net balance (${mat.currentBalance} ${item.secondaryUom}). Are you sure you want to proceed and trigger a negative stock anomaly audit?`
        );
        if (!proceed) return;
      }
    }

    const newWithdrawal = {
      slipNo,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      requestingEntity,
      department,
      purpose,
      requestedBy,
      issuedBy: `${currentRole} (Warehouse Custodian)`,
      receivedBy,
      items,
      status: "ISSUED & RECONCILED"
    };

    onSaveWithdrawal(newWithdrawal);

    // Reset Form
    setSlipNo(`WS-2026-1103-0${withdrawals.length + 2}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-[#5B2E7A] text-white px-2 py-0.5 rounded">
              Form-WAR-001
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">
              Material Release &amp; Stock Withdrawal Slip
            </h2>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            Strict First-Expired, First-Out (FEFO) Rotation · Real-Time Balance Deduction · Dual Custodial Sign-Off
          </p>
        </div>
        <div className="bg-[#FAF6EE] border border-[#C8963E]/40 px-3 py-1.5 rounded-lg text-right text-xs">
          <p className="font-bold text-[#5B2E7A]">Warehouse Issuance Lead: Jade Q. Dela Cruz</p>
          <p className="text-gray-500 text-[11px]">Unlogged floor releases = Immediate Production Stoppage</p>
        </div>
      </div>

      {/* Main Withdrawal Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-[#E2D1B8] shadow-sm space-y-5">
        <div className="border-b border-gray-200 pb-3 flex justify-between items-center flex-wrap gap-2">
          <h3 className="font-serif font-bold text-[#5B2E7A] flex items-center gap-2 text-base">
            <ArrowUpRight size={18} /> New Raw Material Requisition Slip
          </h3>
          <span className="text-xs bg-purple-50 text-[#5B2E7A] font-bold px-2.5 py-1 rounded border border-purple-200">
            Real-Time Release (Pre-Bake Door Handoff)
          </span>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Withdrawal Slip #</label>
            <input 
              type="text" 
              value={slipNo} 
              readOnly 
              className="w-full p-2 border rounded bg-gray-50 font-mono font-bold text-[#5B2E7A]" 
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Requesting Production Line / Outlet</label>
            <select
              value={requestingEntity}
              onChange={(e) => {
                const val = e.target.value;
                setRequestingEntity(val);
                if (val.includes('Biscocho')) setDepartment('Production - Biscocho Hall');
                else if (val.includes('Otap')) setDepartment('Production - Otap Hall');
                else if (val.includes('Pan de Verde')) setDepartment('Retail Outlets Dispatch (Communal)');
                else if (val.includes('Laurice')) setDepartment('Retail Outlets Dispatch (Bankerohan)');
                else setDepartment('Central Production Support');
              }}
              className="w-full p-2 border rounded bg-white font-medium"
            >
              <option>Indangan - Biscocho Commercial Line</option>
              <option>Indangan - Otap Laminated Line</option>
              <option>Pan de Verde Outlet (Communal)</option>
              <option>Laurice Delicacies Outlet (Bankerohan)</option>
              <option>Biscocho Buttermilk Sweet Glaze (Banya Sub-Line)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Target Department / Cost Center</label>
            <input 
              type="text" 
              value={department} 
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-2 border rounded text-xs bg-gray-50" 
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Requisition Purpose / Reason</label>
            <input 
              type="text" 
              value={purpose} 
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-2 border rounded text-xs" 
              placeholder="e.g. Commercial Morning Run"
            />
          </div>
        </div>

        {/* Authorized Signoff Personnel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#FAF6EE] p-3 rounded-lg border border-[#E2D1B8]">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Requisitioned By (Baker / Outlet)</label>
            <select
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              className="w-full p-2 border rounded bg-white"
            >
              <option>Alwen Hermogeno (Master Head Baker - Biscocho)</option>
              <option>Reymark V. Albia (Head Baker - Otap)</option>
              <option>Feliciano T. Gomera (Head Baker - Pan de Verde)</option>
              <option>Raffy Boy P. Cortes (Head Baker - Laurice Delicacies)</option>
              <option>Romeo B. Malusay (Ingredient Batching Preparer)</option>
              <option>Irene C. Capada (Biscocho Production Manager)</option>
              <option>Zillah F. Tilan (Otap Production Manager)</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Warehouse Custodian / Issuer</label>
            <input 
              type="text" 
              value={`${currentRole} (Warehouse Custodian)`} 
              disabled 
              className="w-full p-2 border rounded bg-gray-100 font-bold text-[#5B2E7A]" 
            />
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Physically Received By (Floor Handoff)</label>
            <input 
              type="text" 
              value={receivedBy} 
              onChange={(e) => setReceivedBy(e.target.value)}
              className="w-full p-2 border rounded" 
              placeholder="e.g. Vicky Albino / Othniel Tilan"
            />
          </div>
        </div>

        {/* Requisition Line Items */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-serif font-bold text-[#3D1C52] text-sm">
              Materials to be Withdrawn &amp; FEFO Lot Selection
            </h4>
            <button
              type="button"
              onClick={handleAddRow}
              className="text-xs bg-[#5B2E7A] text-white px-3 py-1.5 rounded font-bold hover:bg-[#3D1C52] flex items-center gap-1"
            >
              <Plus size={13} /> Add Requisition Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const mat = inventory.find(m => m.code === item.materialCode);
              const available = mat ? mat.currentBalance : 0;
              const isInsufficient = available < item.qtyIssuedSec;

              return (
                <div key={idx} className="p-3.5 rounded-xl border border-[#E2D1B8] bg-white shadow-sm space-y-2">
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <div className="flex-1 min-w-[280px]">
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">
                        Material #{idx + 1}
                      </label>
                      <select
                        value={item.materialCode}
                        onChange={(e) => handleMaterialChange(idx, e.target.value)}
                        className="w-full p-2 text-xs border rounded bg-white font-medium"
                      >
                        {inventory.map(m => (
                          <option key={m.code} value={m.code}>
                            {m.code} — {m.name} (Available: {m.currentBalance.toLocaleString()} {m.secondaryUom})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-1 bg-gray-100 rounded">
                        Available: <strong className={available <= 0 ? 'text-red-600' : 'text-green-700'}>{available.toLocaleString()} {item.secondaryUom}</strong>
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-gray-600 font-semibold mb-1">
                        Quantity to Withdraw ({item.secondaryUom})
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={item.qtyIssuedSec}
                        onChange={(e) => handleQtyChange(idx, e.target.value)}
                        className={`w-full p-2 border rounded font-mono font-bold ${
                          isInsufficient ? 'bg-red-50 border-red-300 text-red-600' : 'text-[#3D1C52]'
                        }`}
                      />
                      {isInsufficient && (
                        <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                          ⚠️ Exceeds current stock balance ({available} {item.secondaryUom})
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-600 font-semibold mb-1">
                        Target Lot # (Strict FEFO Oldest)
                      </label>
                      <select
                        value={item.lotNumber}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems(prev => prev.map((it, i) => i === idx ? { ...it, lotNumber: val } : it));
                        }}
                        className="w-full p-2 border rounded bg-white font-mono text-xs"
                      >
                        {mat && mat.lots && mat.lots.length > 0 ? (
                          mat.lots.map((l, li) => (
                            <option key={li} value={l.lotNumber}>
                              {l.lotNumber} (Exp: {l.expiryDate} · {l.qtySec} {mat.secondaryUom} on {l.location})
                            </option>
                          ))
                        ) : (
                          <option value="DEFAULT-LOT">Standard Active Batch Lot</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-600 font-semibold mb-1">Verification Remarks</label>
                      <input
                        type="text"
                        value={item.remarks}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItems(prev => prev.map((it, i) => i === idx ? { ...it, remarks: val } : it));
                        }}
                        className="w-full p-2 border rounded text-xs"
                        placeholder="e.g. Sifted, tempered to 18°C"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            className="bg-[#5B2E7A] hover:bg-[#3D1C52] text-white font-bold text-xs px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition"
          >
            <CheckCircle2 size={16} /> Authorize &amp; Deduct Stock Withdrawal (`Form-WAR-001`)
          </button>
        </div>
      </form>

      {/* HISTORICAL WITHDRAWALS LOGBOOK */}
      <div className="bg-white rounded-xl border border-[#E2D1B8] shadow-sm overflow-hidden">
        <div className="px-6 py-3.5 bg-[#FAF6EE] border-b border-[#E2D1B8] flex justify-between items-center">
          <h3 className="font-serif font-bold text-[#5B2E7A]">
            Materials Issuance &amp; Floor Withdrawal Ledger (`Form-WAR-001` Archive)
          </h3>
          <span className="text-xs text-gray-500 font-medium">{withdrawals.length} logged slips</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#5B2E7A] text-white">
              <tr>
                <th className="p-3">Slip #</th>
                <th className="p-3">Date &amp; Time</th>
                <th className="p-3">Requesting Production Line / Outlet</th>
                <th className="p-3">Purpose</th>
                <th className="p-3">Withdrawn Items</th>
                <th className="p-3">Requested By</th>
                <th className="p-3">Received By</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D1B8]">
              {withdrawals.map((w, i) => (
                <tr key={i} className="hover:bg-[#FAF6EE]/50">
                  <td className="p-3 font-mono font-bold text-[#5B2E7A]">{w.slipNo}</td>
                  <td className="p-3 text-gray-600">{w.date} {w.time}</td>
                  <td className="p-3 font-medium text-gray-900">{w.requestingEntity}</td>
                  <td className="p-3 text-gray-600">{w.purpose}</td>
                  <td className="p-3">
                    {w.items?.map((it, idx) => (
                      <span key={idx} className="block text-[11px] text-gray-700">
                        • {it.qtyIssuedSec} {it.secondaryUom} {it.name} <span className="font-mono text-gray-400">({it.lotNumber})</span>
                      </span>
                    ))}
                  </td>
                  <td className="p-3 text-gray-700">{w.requestedBy}</td>
                  <td className="p-3 text-gray-700 font-semibold">{w.receivedBy}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-[#1E7A3E]">
                      {w.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedSlipView(w)}
                      className="text-xs text-[#5B2E7A] hover:underline font-bold"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM-WAR-001 PRINTABLE MODAL */}
      {selectedSlipView && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border-2 border-[#5B2E7A] space-y-4">
            <div className="flex justify-between items-start border-b-2 border-[#5B2E7A] pb-3">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">JANG-JANG BAKESHOP · INDANGAN BODEGA</p>
                <h3 className="font-serif font-bold text-xl text-[#3D1C52]">
                  Withdrawal &amp; Material Issuance Slip (`Form-WAR-001`)
                </h3>
                <p className="text-xs text-[#C8963E] font-mono font-bold">Slip No: {selectedSlipView.slipNo}</p>
              </div>
              <button 
                onClick={() => setSelectedSlipView(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF6EE] p-3 rounded border border-[#E2D1B8]">
              <div><strong>Line / Outlet:</strong> {selectedSlipView.requestingEntity}</div>
              <div><strong>Date &amp; Time:</strong> {selectedSlipView.date} {selectedSlipView.time}</div>
              <div><strong>Purpose:</strong> {selectedSlipView.purpose}</div>
              <div><strong>Department:</strong> {selectedSlipView.department}</div>
            </div>

            <table className="w-full text-left text-xs border">
              <thead className="bg-[#5B2E7A] text-white">
                <tr>
                  <th className="p-2">Material Code &amp; Name</th>
                  <th className="p-2 text-right">Net Qty Issued</th>
                  <th className="p-2">FEFO Lot #</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {selectedSlipView.items?.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-medium">{it.materialCode} - {it.name}</td>
                    <td className="p-2 text-right font-mono font-bold text-[#5B2E7A]">{it.qtyIssuedSec} {it.secondaryUom}</td>
                    <td className="p-2 font-mono text-[11px]">{it.lotNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t text-[11px]">
              <div>
                <p className="text-gray-500">Requested By:</p>
                <p className="font-semibold">{selectedSlipView.requestedBy}</p>
              </div>
              <div>
                <p className="text-gray-500">Issued By:</p>
                <p className="font-semibold">{selectedSlipView.issuedBy}</p>
              </div>
              <div>
                <p className="text-gray-500">Received By:</p>
                <p className="font-semibold">{selectedSlipView.receivedBy}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => window.print()}
                className="bg-[#3D1C52] text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5"
              >
                <Printer size={13} /> Print Hard-Copy Requisition Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
