import React, { useState } from 'react';
import { 
  Scale, Plus, CheckCircle2, Clock, Truck, Printer, 
  AlertCircle, ShieldCheck, Layers, ArrowRight, CheckCheck, 
  RotateCcw, Sparkles
} from 'lucide-react';

export default function BatchingWorkbench({
  batchOrders,
  onSaveBatchOrder,
  onUpdateOrderStatus,
  onBulkReleaseOrders,
  recipes,
  outlets,
  inventory,
  currentRole,
  isMobileMode
}) {
  const [activeSubTab, setActiveSubTab] = useState('workbench'); // 'workbench' | 'new_order'
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PENDING_BATCHING, BATCHED_KITTED, RELEASED
  const [selectedTagOrder, setSelectedTagOrder] = useState(null);
  const [scalingModalOrder, setScalingModalOrder] = useState(null);

  // Form for New Order
  const [outletId, setOutletId] = useState(outlets[0]?.id || 'pan-de-verde');
  const [recipeSku, setRecipeSku] = useState(recipes[0]?.sku || 'BRD-PAN-001');
  const [batchMultiplier, setBatchMultiplier] = useState(1.0);
  const [targetDate, setTargetDate] = useState(new Date().toISOString().slice(0, 10));
  const [orderNotes, setOrderNotes] = useState('');

  // Selected recipe object
  const currentRecipe = recipes.find(r => r.sku === recipeSku) || recipes[0];
  const selectedOutlet = outlets.find(o => o.id === outletId) || outlets[0];

  // Calculated required ingredients for new order
  const calculatedIngredients = currentRecipe.ingredients.map(ing => ({
    ...ing,
    requiredGrams: ing.gramsPerBatch * batchMultiplier
  }));

  const estimatedUnits = Math.round(currentRecipe.unitPieceYield * batchMultiplier);

  // Submit New Order
  const handleCreateOrder = (e) => {
    e.preventDefault();
    const newOrder = {
      orderId: `BORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-3)}`,
      requestDate: new Date().toISOString().slice(0, 10),
      targetDate,
      outletId: selectedOutlet.id,
      outletName: selectedOutlet.name,
      recipeSku: currentRecipe.sku,
      recipeName: currentRecipe.name,
      batchMultiplier: parseFloat(batchMultiplier) || 1.0,
      requestedQtyPcs: estimatedUnits,
      requestedBy: currentRole,
      enteredBy: currentRole,
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
      notes: orderNotes || `Standard outlet batch for ${selectedOutlet.name}.`
    };

    onSaveBatchOrder(newOrder);
    setActiveSubTab('workbench');
    setOrderNotes('');
  };

  // Filtered Orders
  const filteredOrders = batchOrders.filter(order => {
    if (filterStatus === 'ALL') return true;
    return order.status === filterStatus;
  });

  // Ready to release count
  const readyToReleaseCount = batchOrders.filter(o => o.status === 'BATCHED_KITTED').length;

  return (
    <div className="space-y-6">
      {/* Title & Overview Banner */}
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-[#C8963E] text-[#240e32] px-2 py-0.5 rounded">
              Form-PRO-001 / Form-ING-001
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">
              Outlet Ingredient Batching, Precision Scaling &amp; Release Engine
            </h2>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            Sole Authorized Scaling by Romeo B. Malusay · No Unbatched Flour to Outlets · Pre-Shift Scale Calibration (Seals #798073 &amp; #798074)
          </p>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex bg-white p-1 rounded-lg border border-[#E2D1B8] shadow-sm">
          <button
            onClick={() => setActiveSubTab('workbench')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'workbench'
                ? 'bg-[#3D1C52] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Scale size={14} /> Romeo's Batching Workbench ({batchOrders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('new_order')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'new_order'
                ? 'bg-[#C8963E] text-[#240e32] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Plus size={14} /> Intake Outlet Order (Jade / Mariejohn)
          </button>
        </div>
      </div>

      {/* VIEW 1: ROMEO'S BATCHING WORKBENCH */}
      {activeSubTab === 'workbench' && (
        <div className="space-y-5">
          {/* Pre-Shift Calibration & Metrology Banner */}
          <div className="bg-white p-4 rounded-xl border border-[#E2D1B8] shadow-sm space-y-3">
            <div className="flex justify-between items-center flex-wrap gap-2 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#1E7A3E]" />
                <h3 className="font-serif font-bold text-sm text-[#3D1C52]">
                  Gate 0 — Pre-Shift Scale Metrology &amp; 40-Mesh Sifter Gate (`Form-CAL-001`)
                </h3>
              </div>
              <span className="text-[11px] font-bold bg-green-100 text-[#1E7A3E] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={12} /> City Treasurer Seals Valid to Jan 2027
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-[#FAF6EE] p-2.5 rounded-lg border border-[#E2D1B8]">
                <p className="font-mono font-bold text-[#5B2E7A]">Govt Seal #798073</p>
                <p className="text-[11px] text-gray-600">Bench Scale #1 (Dividing)</p>
                <p className="text-[10px] text-green-700 font-bold mt-1">✓ Zero-Balanced</p>
              </div>
              <div className="bg-[#FAF6EE] p-2.5 rounded-lg border border-[#E2D1B8]">
                <p className="font-mono font-bold text-[#5B2E7A]">Govt Seal #798074</p>
                <p className="text-[11px] text-gray-600">Bench Scale #2 (Packaging QC)</p>
                <p className="text-[10px] text-green-700 font-bold mt-1">✓ Zero-Balanced</p>
              </div>
              <div className="bg-[#FAF6EE] p-2.5 rounded-lg border border-[#E2D1B8]">
                <p className="font-mono font-bold text-[#5B2E7A]">Govt Seal #798607</p>
                <p className="text-[11px] text-gray-600">1kg Precision Micro Scale</p>
                <p className="text-[10px] text-green-700 font-bold mt-1">✓ Zero-Balanced</p>
              </div>
              <div className="bg-[#FAF6EE] p-2.5 rounded-lg border border-[#E2D1B8]">
                <p className="font-bold text-[#3D1C52]">40-Mesh Sieve Screen</p>
                <p className="text-[11px] text-gray-600">Stainless Steel Flour Sifter</p>
                <p className="text-[10px] text-green-700 font-bold mt-1">✓ Intact / Zero Residue</p>
              </div>
            </div>
          </div>

          {/* Action Toolbar & Filters */}
          <div className="bg-white p-3 rounded-xl border border-[#E2D1B8] shadow-sm flex flex-wrap justify-between items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === 'ALL'
                    ? 'bg-[#3D1C52] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Orders ({batchOrders.length})
              </button>
              <button
                onClick={() => setFilterStatus('PENDING_BATCHING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === 'PENDING_BATCHING'
                    ? 'bg-[#C8963E] text-[#240e32] shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending Batching ({batchOrders.filter(o => o.status === 'PENDING_BATCHING').length})
              </button>
              <button
                onClick={() => setFilterStatus('BATCHED_KITTED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === 'BATCHED_KITTED'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Batched / Kitted ({readyToReleaseCount})
              </button>
              <button
                onClick={() => setFilterStatus('RELEASED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === 'RELEASED'
                    ? 'bg-[#1E7A3E] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Released to Outlets ({batchOrders.filter(o => o.status === 'RELEASED').length})
              </button>
            </div>

            {/* COLLECTIVE RELEASE ACTION (User prompt: mark items as released individually or collectively once completed) */}
            <div>
              <button
                onClick={onBulkReleaseOrders}
                disabled={readyToReleaseCount === 0}
                className={`px-4 py-2 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition ${
                  readyToReleaseCount > 0
                    ? 'bg-gradient-to-r from-[#1E7A3E] to-[#27ae60] hover:from-[#176332] hover:to-[#1e8449] text-white cursor-pointer animate-pulse'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title="Mark all completed recipe mixes as released to outlet drivers collectively"
              >
                <CheckCheck size={16} />
                <span>Batch Release All Completed ({readyToReleaseCount})</span>
              </button>
            </div>
          </div>

          {/* Orders Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.length === 0 ? (
              <div className="col-span-2 p-10 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                <p className="font-semibold text-sm">No batching orders found under status "{filterStatus}".</p>
                <p className="text-xs text-gray-400 mt-1">Click "Intake Outlet Order" above to queue a new formula kit.</p>
              </div>
            ) : (
              filteredOrders.map(order => {
                const isPending = order.status === 'PENDING_BATCHING';
                const isBatched = order.status === 'BATCHED_KITTED';
                const isReleased = order.status === 'RELEASED';
                const recipeObj = recipes.find(r => r.sku === order.recipeSku);

                return (
                  <div 
                    key={order.orderId} 
                    className={`bg-white rounded-xl border shadow-sm p-4 flex flex-col justify-between space-y-3 transition ${
                      isPending ? 'border-amber-300 bg-amber-50/10' :
                      isBatched ? 'border-blue-300 bg-blue-50/10' :
                      'border-green-200 bg-white'
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#5B2E7A]">{order.orderId}</span>
                          <span className="text-[10px] text-gray-400">· Req: {order.requestDate}</span>
                        </div>
                        <h4 className="font-bold text-base text-gray-900 mt-0.5">{order.recipeName}</h4>
                        <p className="text-xs font-semibold text-[#C8963E]">
                          {order.outletName}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isPending && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-[#D68910] flex items-center gap-1">
                            <Clock size={11} /> PENDING BATCHING
                          </span>
                        )}
                        {isBatched && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1 font-mono">
                            <CheckCircle2 size={11} /> BATCHED / KITTED
                          </span>
                        )}
                        {isReleased && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-[#1E7A3E] flex items-center gap-1">
                            <Truck size={11} /> RELEASED TO OUTLET
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Batching Formula Snapshot */}
                    <div className="bg-[#FAF6EE] p-3 rounded-lg border border-[#E2D1B8] text-xs space-y-1.5">
                      <div className="flex justify-between text-gray-700">
                        <span>Multiplier: <strong>{order.batchMultiplier}x</strong></span>
                        <span>Estimated Yield: <strong>{order.requestedQtyPcs} pcs</strong></span>
                      </div>
                      {order.batchTagId && (
                        <div className="flex justify-between font-mono text-[11px] text-[#3D1C52] border-t border-gray-200 pt-1">
                          <span>Batch Tag: <strong>{order.batchTagId}</strong></span>
                          <span>Net Mix: <strong>{order.actualBatchedKg} kg</strong></span>
                        </div>
                      )}
                      <p className="text-[11px] text-gray-500 italic mt-0.5">
                        Notes: {order.notes}
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2">
                      <div className="text-[11px] text-gray-500">
                        {isReleased ? (
                          <span className="text-green-700 font-semibold">
                            Released at {order.releasedAt} to {order.releasedTo || 'Outlet Logistics'}
                          </span>
                        ) : isBatched ? (
                          <span className="text-blue-700 font-semibold">
                            Batched at {order.batchedAt} by {order.batchedBy}
                          </span>
                        ) : (
                          <span>Entered by: {order.enteredBy}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Action 1: Romeo Prepare & Scale */}
                        {isPending && (
                          <button
                            onClick={() => setScalingModalOrder(order)}
                            className="bg-[#C8963E] hover:bg-[#b08030] text-[#240e32] px-3 py-1.5 rounded-lg text-xs font-bold shadow flex items-center gap-1 transition"
                          >
                            <Scale size={13} /> Scale &amp; Kit Batch
                          </button>
                        )}

                        {/* Action 2: Individual Release */}
                        {isBatched && (
                          <>
                            <button
                              onClick={() => setSelectedTagOrder(order)}
                              className="text-xs text-[#5B2E7A] hover:bg-purple-50 px-2 py-1 rounded font-bold border border-[#5B2E7A]"
                              title="Print Form-ING-001 Tag"
                            >
                              <Printer size={13} />
                            </button>
                            <button
                              onClick={() => onUpdateOrderStatus(order.orderId, 'RELEASED')}
                              className="bg-[#1E7A3E] hover:bg-[#165c2f] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow flex items-center gap-1 transition"
                            >
                              <Truck size={13} /> Release to Outlet
                            </button>
                          </>
                        )}

                        {/* View Tag for Released */}
                        {isReleased && (
                          <button
                            onClick={() => setSelectedTagOrder(order)}
                            className="text-xs text-gray-600 hover:text-[#5B2E7A] underline font-semibold flex items-center gap-1"
                          >
                            <Printer size={12} /> View Tag
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: INTAKE NEW OUTLET BATCH REQUISITION */}
      {activeSubTab === 'new_order' && (
        <form onSubmit={handleCreateOrder} className="bg-white p-5 rounded-xl border border-[#E2D1B8] shadow-sm space-y-5">
          <div className="border-b border-gray-200 pb-3 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="font-serif font-bold text-base text-[#5B2E7A] flex items-center gap-2">
                <Plus size={18} /> Intake Outlet Ingredient Batch Order (`Form-PRO-001`)
              </h3>
              <p className="text-xs text-gray-500">
                Prepared by Jade Q. Dela Cruz or Mariejohn F. Tacuban for Romeo B. Malusay to Scale
              </p>
            </div>
            <span className="text-xs font-bold text-[#C8963E] bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
              Formulation Costing Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Target Outlet / Facility</label>
              <select
                value={outletId}
                onChange={(e) => setOutletId(e.target.value)}
                className="w-full p-2 border rounded bg-white font-medium"
              >
                {outlets.map(o => (
                  <option key={o.id} value={o.id}>{o.name} ({o.location})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Target Product Recipe</label>
              <select
                value={recipeSku}
                onChange={(e) => setRecipeSku(e.target.value)}
                className="w-full p-2 border rounded bg-white font-medium"
              >
                {recipes.map(r => (
                  <option key={r.sku} value={r.sku}>{r.sku} - {r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Batch Multiplier</label>
              <input
                type="number"
                min="0.25"
                step="0.25"
                value={batchMultiplier}
                onChange={(e) => setBatchMultiplier(parseFloat(e.target.value) || 1.0)}
                className="w-full p-2 border rounded font-mono font-bold text-[#3D1C52]"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 block">
                Calculated Units: <strong>{estimatedUnits} pieces</strong>
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Requested Needed Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-2 border rounded text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1 text-xs">Special Instructions / Climate Notes</label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. For morning delivery before 08:00 AM. Check ice substitution if hot."
              className="w-full p-2 border rounded text-xs"
            />
          </div>

          {/* Master Recipe Pull List Preview */}
          <div className="bg-[#FAF6EE] p-4 rounded-xl border border-[#E2D1B8] space-y-3">
            <h4 className="font-serif font-bold text-xs text-[#5B2E7A] flex items-center justify-between">
              <span>Automatic Component Gram Weights (Flour Basis = 100.0%)</span>
              <span className="text-[11px] text-gray-500">Auto-calculated for Romeo's Pull List</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs bg-white rounded border">
                <thead className="bg-[#3D1C52] text-white">
                  <tr>
                    <th className="p-2">Material Code</th>
                    <th className="p-2">Component Name</th>
                    <th className="p-2 text-right">Baker's %</th>
                    <th className="p-2 text-right font-bold">Scaling Target (Grams)</th>
                    <th className="p-2 text-right font-bold">Weight in kg</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {calculatedIngredients.map((ing, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-mono text-[#5B2E7A] font-bold">{ing.code}</td>
                      <td className="p-2 font-medium">{ing.name}</td>
                      <td className="p-2 text-right font-mono">{ing.pct}%</td>
                      <td className="p-2 text-right font-mono font-bold text-[#1E7A3E]">
                        {ing.requiredGrams.toLocaleString()} g
                      </td>
                      <td className="p-2 text-right font-mono text-gray-700">
                        {(ing.requiredGrams / 1000).toFixed(2)} kg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('workbench')}
              className="text-xs text-gray-600 hover:underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#C8963E] hover:bg-[#b08030] text-[#240e32] font-bold text-xs px-6 py-2.5 rounded-lg shadow-md flex items-center gap-2 transition"
            >
              <Plus size={16} /> Submit Batch Order to Romeo's Queue (`Form-PRO-001`)
            </button>
          </div>
        </form>
      )}

      {/* MODAL 1: ROMEO'S SCALING & KITTING MODAL */}
      {scalingModalOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border-2 border-[#C8963E] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#5B2E7A]">ROMEO MALUSAY SCALING WORKBENCH</span>
                <h3 className="font-serif font-bold text-xl text-gray-900">{scalingModalOrder.recipeName}</h3>
                <p className="text-xs text-gray-500">Destination: {scalingModalOrder.outletName} ({scalingModalOrder.requestedQtyPcs} pcs)</p>
              </div>
              <button 
                onClick={() => setScalingModalOrder(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Checklist */}
            <div className="bg-[#FAF6EE] p-3 rounded-lg border border-[#E2D1B8] text-xs space-y-2">
              <p className="font-bold text-[#3D1C52]">Mandatory Scaling Safety &amp; Metrology Checklist:</p>
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" defaultChecked className="accent-[#1E7A3E]" />
                Bench Scales zero-balanced (Govt Seals #798073 &amp; #798074 verified intact)
              </label>
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" defaultChecked className="accent-[#1E7A3E]" />
                All flour aerated and screened through 40-mesh stainless steel sifter
              </label>
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" defaultChecked className="accent-[#1E7A3E]" />
                Unitized into clean, food-grade HDPE color-coded container
              </label>
            </div>

            {/* Scaling Inputs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Batch Tag ID</label>
                <input
                  type="text"
                  readOnly
                  defaultValue={`KIT-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${scalingModalOrder.orderId.slice(-4)}`}
                  className="w-full p-2 border rounded font-mono font-bold bg-gray-50 text-[#5B2E7A]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Actual Measured Batch Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  defaultValue={((scalingModalOrder.requestedQtyPcs * 0.04) + 5).toFixed(1)}
                  className="w-full p-2 border rounded font-mono font-bold text-green-700"
                />
              </div>
            </div>

            <div className="pt-2 border-t flex justify-end gap-2">
              <button
                onClick={() => setScalingModalOrder(null)}
                className="px-4 py-2 text-xs text-gray-600 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateOrderStatus(
                    scalingModalOrder.orderId, 
                    'BATCHED_KITTED',
                    `KIT-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${scalingModalOrder.orderId.slice(-4)}`,
                    parseFloat(((scalingModalOrder.requestedQtyPcs * 0.04) + 5).toFixed(1))
                  );
                  setScalingModalOrder(null);
                }}
                className="bg-[#1E7A3E] hover:bg-[#165c2f] text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 size={16} /> Certify &amp; Mark as Batched/Kitted (`Form-ING-001`)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE BATCH IDENTIFICATION TAG (FORM-ING-001) */}
      {selectedTagOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-4 border-[#C8963E] space-y-4">
            <div className="text-center border-b-2 border-dashed pb-3">
              <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">JANG-JANG BAKESHOP · KITTING DIVISION</p>
              <h3 className="font-serif font-bold text-xl text-[#3D1C52]">
                Batch Identification &amp; Kitting Tag (`Form-ING-001`)
              </h3>
              <p className="font-mono text-sm font-bold text-[#C8963E] mt-1">
                {selectedTagOrder.batchTagId || 'TAG-PENDING'}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b py-1">
                <span className="text-gray-500">Product Line:</span>
                <span className="font-bold text-gray-900">{selectedTagOrder.recipeName}</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span className="text-gray-500">Destination Outlet:</span>
                <span className="font-bold text-[#5B2E7A]">{selectedTagOrder.outletName}</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span className="text-gray-500">Batch Quantity:</span>
                <span className="font-bold">{selectedTagOrder.requestedQtyPcs} pieces ({selectedTagOrder.batchMultiplier}x multiplier)</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span className="text-gray-500">Scaled Net Weight:</span>
                <span className="font-mono font-bold text-[#1E7A3E]">{selectedTagOrder.actualBatchedKg || 25} kg</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span className="text-gray-500">Scale Inspection:</span>
                <span className="font-mono text-[11px]">Bench #1 (Seal #798073) Valid</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span className="text-gray-500">Flour Screening:</span>
                <span className="text-green-700 font-bold">40-Mesh Sieve Verified</span>
              </div>
            </div>

            <div className="bg-[#FAF6EE] p-2.5 rounded border text-[11px] text-gray-600">
              <p className="font-bold text-[#3D1C52]">Thermal Lethality &amp; Mixing Rule:</p>
              <p>Dough mass exit temperature must strictly remain 26°C–28°C. Oven core internal loaf heat must exceed 95°C (CCP-1).</p>
            </div>

            <div className="border-t pt-3 flex justify-between items-center text-xs">
              <div>
                <p className="text-[10px] text-gray-400">Ingredient Scaler:</p>
                <p className="font-bold text-[#3D1C52]">Romeo B. Malusay</p>
              </div>
              <button
                onClick={() => window.print()}
                className="bg-[#3D1C52] text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5"
              >
                <Printer size={13} /> Print Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
