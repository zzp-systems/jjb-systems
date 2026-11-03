import React, { useState } from 'react';
import { 
  Plus, Trash2, CheckCircle2, Printer, ArrowUpRight, PackageCheck, Clock
} from 'lucide-react';

export default function IssuanceModule({ 
  inventory, 
  onSaveWithdrawal, 
  onApprovePendingWithdrawal,
  withdrawals, 
  currentRole,
  prefilledItem 
}) {
  const [slipNo, setSlipNo] = useState(`WS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-0${withdrawals.length + 1}`);
  const [requestingEntity, setRequestingEntity] = useState('Indangan - Batching Area (Romeo B. Malusay)');
  const [department, setDepartment] = useState('Ingredient Batching & Kitting');
  const [purpose, setPurpose] = useState('Bulk Raw Material Transfer to Romeo for Outlet Kitting');
  const [requestedBy, setRequestedBy] = useState('Romeo B. Malusay (Ingredient Batching Preparer)');
  const [receivedBy, setReceivedBy] = useState('Romeo B. Malusay');
  const [selectedSlipView, setSelectedSlipView] = useState(null);

  const [items, setItems] = useState([
    prefilledItem ? {
      materialCode: prefilledItem.code,
      name: prefilledItem.name,
      qtyRequestedSec: 12.0,
      qtyIssuedSec: 12.0,
      secondaryUom: prefilledItem.secondaryUom,
      lotNumber: prefilledItem.lots?.[0]?.lotNumber || 'FEFO-LOT',
      storageRoom: prefilledItem.room,
      remarks: 'FEFO prioritized issuance'
    } : {
      materialCode: 'RM-FLR-003',
      name: '1st Class Hard Flour (Rossa)',
      qtyRequestedSec: 12.0,
      qtyIssuedSec: 12.0,
      secondaryUom: 'kg',
      lotNumber: 'LOT-ROS-261005',
      storageRoom: 'Dry Room 1',
      remarks: 'For 4x 3kg-Yield Pandesal Kits'
    }
  ]);

  const pendingBulkSlips = withdrawals.filter(w => w.status === 'PENDING_APPROVAL');

  const handleMaterialChange = (index, code) => {
    const mat = inventory.find(m => m.code === code);
    if (!mat) return;
    const oldestLot = mat.lots && mat.lots.length > 0 ? mat.lots[0].lotNumber : 'FEFO-LOT';
    setItems(prev => prev.map((item, i) => i === index ? {
      ...item,
      materialCode: mat.code,
      name: mat.name,
      secondaryUom: mat.secondaryUom,
      storageRoom: mat.room,
      lotNumber: oldestLot
    } : item));
  };

  const handleQtyChange = (index, qty) => {
    const val = parseFloat(qty) || 0;
    setItems(prev => prev.map((item, i) => i === index ? { ...item, qtyRequestedSec: val, qtyIssuedSec: val } : item));
  };

  const handleAddRow = () => {
    const defaultMat = inventory[0];
    setItems(prev => [
      ...prev,
      {
        materialCode: defaultMat.code,
        name: defaultMat.name,
        qtyRequestedSec: 5.0,
        qtyIssuedSec: 5.0,
        secondaryUom: defaultMat.secondaryUom,
        lotNumber: defaultMat.lots?.[0]?.lotNumber || 'FEFO-LOT',
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
    const newWithdrawal = {
      slipNo,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      requestingEntity,
      department,
      purpose,
      requestedBy,
      issuedBy: `Jade Q. Dela Cruz (Warehouse Supervisor)`,
      receivedBy,
      items,
      status: "ISSUED & RECONCILED"
    };
    onSaveWithdrawal(newWithdrawal);
    setSlipNo(`WS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-0${withdrawals.length + 2}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-[#5B2E7A] text-white px-2 py-0.5 rounded">
              Form-WAR-001
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">
              Warehouse Bulk Material Release & Stock Withdrawal (`Jade Q. Dela Cruz`)
            </h2>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            Approve Romeo Malusay's Upstream Bulk Pull Lists (`Form-ING-001` / `Form-WAR-001`) or log direct line withdrawals under strict FEFO rotation.
          </p>
        </div>
      </div>

      {/* ROMEO'S PENDING BULK REQUESTS QUEUE FOR JADE */}
      {pendingBulkSlips.length > 0 && (
        <div className="bg-amber-50 border-2 border-[#D68910] rounded-xl p-4 shadow-md space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h3 className="font-serif font-bold text-sm text-amber-900 flex items-center gap-2">
              <Clock size={16} className="text-[#D68910]" />
              Pending Bulk Material Requisitions from Romeo B. Malusay ({pendingBulkSlips.length})
            </h3>
            <span className="text-[11px] font-bold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
              Awaiting Jade's Dutch-Door Handoff Approval
            </span>
          </div>

          <div className="space-y-3">
            {pendingBulkSlips.map(slip => (
              <div key={slip.slipNo} className="bg-white p-4 rounded-lg border border-amber-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#5B2E7A]">{slip.slipNo}</span>
                    <span className="font-bold text-gray-900">{slip.purpose}</span>
                  </div>
                  <p className="text-gray-600">Requested By: <strong>{slip.requestedBy}</strong> · Date: {slip.date} {slip.time}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {slip.items?.map((it, idx) => (
                      <span key={idx} className="bg-[#FAF6EE] border border-[#E2D1B8] px-2 py-0.5 rounded font-mono text-[11px]">
                        {it.name}: <strong>{it.qtyIssuedSec} {it.secondaryUom}</strong> ({it.lotNumber})
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onApprovePendingWithdrawal(slip.slipNo)}
                  className="bg-[#1E7A3E] hover:bg-[#165c2f] text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow flex items-center gap-1.5 whitespace-nowrap transition"
                >
                  <PackageCheck size={15} /> Approve & Deduct Bulk Stock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Withdrawal Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-[#E2D1B8] shadow-sm space-y-5">
        <div className="border-b border-gray-200 pb-3 flex justify-between items-center flex-wrap gap-2">
          <h3 className="font-serif font-bold text-[#5B2E7A] flex items-center gap-2 text-base">
            <ArrowUpRight size={18} /> Direct Warehouse Stock Release Slip (`Form-WAR-001`)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Withdrawal Slip #</label>
            <input type="text" value={slipNo} readOnly className="w-full p-2 border rounded bg-gray-50 font-mono font-bold text-[#5B2E7A]" />
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Target Line / Recipient Area</label>
            <select
              value={requestingEntity}
              onChange={(e) => setRequestingEntity(e.target.value)}
              className="w-full p-2 border rounded bg-white font-medium"
            >
              <option>Indangan - Batching Area (Romeo B. Malusay)</option>
              <option>Indangan - Biscocho Commercial Line</option>
              <option>Indangan - Otap Laminated Line</option>
              <option>Biscocho Buttermilk Sweet Glaze (Armando Lendong)</option>
              <option>Mess Hall / Workforce Kitchen</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Requisition Purpose</label>
            <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full p-2 border rounded text-xs" />
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Received By (Countersignature)</label>
            <input type="text" value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} className="w-full p-2 border rounded text-xs" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-serif font-bold text-[#3D1C52] text-sm">Withdrawn Raw Materials (FEFO Lot Allocation)</h4>
            <button type="button" onClick={handleAddRow} className="text-xs bg-[#5B2E7A] text-white px-3 py-1.5 rounded font-bold hover:bg-[#3D1C52] flex items-center gap-1">
              <Plus size={13} /> Add Material Row
            </button>
          </div>

          {items.map((item, idx) => {
            const mat = inventory.find(m => m.code === item.materialCode);
            const available = mat ? mat.currentBalance : 0;
            return (
              <div key={idx} className="p-3.5 rounded-xl border border-[#E2D1B8] bg-white shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">Material #{idx + 1}</label>
                  <select value={item.materialCode} onChange={(e) => handleMaterialChange(idx, e.target.value)} className="w-full p-2 border rounded bg-white font-medium">
                    {inventory.map(m => (
                      <option key={m.code} value={m.code}>{m.code} — {m.name} (Avail: {m.currentBalance} {m.secondaryUom})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">Net Qty ({item.secondaryUom})</label>
                  <input type="number" step="any" value={item.qtyIssuedSec} onChange={(e) => handleQtyChange(idx, e.target.value)} className="w-full p-2 border rounded font-mono font-bold" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="text" value={item.lotNumber} onChange={(e) => { const v = e.target.value; setItems(prev => prev.map((it, i) => i === idx ? { ...it, lotNumber: v } : it)); }} className="w-full p-2 border rounded font-mono text-xs" />
                  {items.length > 1 && (
                    <button type="button" onClick={() => handleRemoveRow(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t flex justify-end">
          <button type="submit" className="bg-[#5B2E7A] hover:bg-[#3D1C52] text-white font-bold text-xs px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle2 size={16} /> Authorize & Deduct Stock Release (`Form-WAR-001`)
          </button>
        </div>
      </form>

      {/* Historical Withdrawals Table */}
      <div className="bg-white rounded-xl border border-[#E2D1B8] shadow-sm overflow-hidden">
        <div className="px-6 py-3.5 bg-[#FAF6EE] border-b border-[#E2D1B8] flex justify-between items-center">
          <h3 className="font-serif font-bold text-[#5B2E7A]">Materials Issuance & Bulk Transfer Ledger (`Form-WAR-001`)</h3>
          <span className="text-xs text-gray-500 font-medium">{withdrawals.length} total slips</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#5B2E7A] text-white">
              <tr>
                <th className="p-3">Slip #</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Destination / Recipient</th>
                <th className="p-3">Purpose</th>
                <th className="p-3">Withdrawn Items</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D1B8]">
              {withdrawals.map((w, i) => (
                <tr key={i} className="hover:bg-[#FAF6EE]/50">
                  <td className="p-3 font-mono font-bold text-[#5B2E7A]">{w.slipNo}</td>
                  <td className="p-3 text-gray-600">{w.date} {w.time}</td>
                  <td className="p-3 font-medium">{w.requestingEntity}</td>
                  <td className="p-3 text-gray-600">{w.purpose}</td>
                  <td className="p-3">
                    {w.items?.map((it, idx) => (
                      <span key={idx} className="block text-[11px] text-gray-700">
                        • {it.qtyIssuedSec} {it.secondaryUom} {it.name} ({it.lotNumber})
                      </span>
                    ))}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      w.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-[#D68910]' : 'bg-green-100 text-[#1E7A3E]'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {w.status === 'PENDING_APPROVAL' ? (
                      <button
                        onClick={() => onApprovePendingWithdrawal(w.slipNo)}
                        className="bg-[#1E7A3E] text-white px-2.5 py-1 rounded text-[11px] font-bold hover:bg-green-800"
                      >
                        Approve
                      </button>
                    ) : (
                      <button onClick={() => setSelectedSlipView(w)} className="text-xs text-[#5B2E7A] hover:underline font-bold">
                        Print Slip
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSlipView && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border-2 border-[#5B2E7A] space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#3D1C52]">Material Withdrawal Slip (`Form-WAR-001`)</h3>
                <p className="font-mono text-xs text-[#C8963E] font-bold">{selectedSlipView.slipNo}</p>
              </div>
              <button onClick={() => setSelectedSlipView(null)} className="text-gray-400 font-bold">✕</button>
            </div>
            <div className="text-xs space-y-1">
              <p><strong>Recipient:</strong> {selectedSlipView.requestingEntity}</p>
              <p><strong>Purpose:</strong> {selectedSlipView.purpose}</p>
              <p><strong>Issued By:</strong> {selectedSlipView.issuedBy} · <strong>Received By:</strong> {selectedSlipView.receivedBy}</p>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => window.print()} className="bg-[#3D1C52] text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5">
                <Printer size={13} /> Print Hard-Copy Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
