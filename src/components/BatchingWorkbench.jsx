import React, { useState } from 'react';
import { 
  Scale, Plus, CheckCircle2, Clock, Truck, Printer, 
  ShieldCheck, CheckCheck, FileText, PackageCheck
} from 'lucide-react';

export default function BatchingWorkbench({
  batchOrders,
  onSaveBatchOrder,
  onUpdateOrderStatus,
  onBulkReleaseOrders,
  onRequestBulkMaterials,
  recipes,
  outlets,
  inventory,
  currentRole,
  isMobileMode
}) {
  const [activeSubTab, setActiveSubTab] = useState('workbench');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedTagOrder, setSelectedTagOrder] = useState(null);
  const [scalingModalOrder, setScalingModalOrder] = useState(null);
  const [customScaledWeight, setCustomScaledWeight] = useState('');
  const [selectedScaleSeal, setSelectedScaleSeal] = useState('Seal #798073 (Bench Scale #1)');

  // New Order Form State (Defaults to Laurice Delicacies + 4x 3kg-Yield Pandesal Kits scenario)
  const [outletId, setOutletId] = useState('laurice-delicacies');
  const [recipeSku, setRecipeSku] = useState('BRD-PAN-3KG');
  const [batchMultiplier, setBatchMultiplier] = useState(4);
  const [targetDate, setTargetDate] = useState(new Date().toISOString().slice(0, 10));
  const [orderNotes, setOrderNotes] = useState('');

  const currentRecipe = recipes.find(r => r.sku === recipeSku) || recipes[0];
  const selectedOutlet = outlets.find(o => o.id === outletId) || outlets[0];

  const calculatedIngredients = currentRecipe.ingredients.map(ing => ({
    ...ing,
    requiredGrams: ing.gramsPerBatch * batchMultiplier,
    maxRequiredGrams: ing.maxGramsPerBatch ? ing.maxGramsPerBatch * batchMultiplier : null
  }));

  const estimatedUnits = Math.round(currentRecipe.unitPieceYield * batchMultiplier);
  const totalDryFatKitKg = Number(((currentRecipe.unitKitWeightKg || 4.11) * batchMultiplier).toFixed(2));

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
      expectedKitWeightKg: totalDryFatKitKg,
      requestedBy: `${selectedOutlet.manager} / ${selectedOutlet.headBaker}`,
      enteredBy: currentRole,
      status: "PENDING_BATCHING",
      bulkRequisitionStatus: "NOT_REQUESTED", // NOT_REQUESTED | PENDING_JADE_APPROVAL | BULK_ISSUED_BY_JADE
      linkedWithdrawalSlipNo: null,
      batchTagId: null,
      actualBatchedKg: 0,
      actualBatchedUnits: 0,
      batchedAt: null,
      batchedBy: null,
      scaleUsed: null,
      sifter40MeshChecked: false,
      releasedAt: null,
      releasedTo: selectedOutlet.driver || "Outlet Logistics",
      notes: orderNotes || `${batchMultiplier}x ${currentRecipe.name} for ${selectedOutlet.name}.`
    };

    onSaveBatchOrder(newOrder);
    setActiveSubTab('workbench');
    setOrderNotes('');
  };

  const openScalingModal = (order) => {
    const rec = recipes.find(r => r.sku === order.recipeSku);
    const defaultKg = order.expectedKitWeightKg || Number(((rec?.unitKitWeightKg || 4.11) * order.batchMultiplier).toFixed(2));
    setCustomScaledWeight(String(defaultKg));
    setScalingModalOrder(order);
  };

  const filteredOrders = batchOrders.filter(order => {
    if (filterStatus === 'ALL') return true;
    return order.status === filterStatus;
  });

  const readyToReleaseCount = batchOrders.filter(o => o.status === 'BATCHED_KITTED').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-[#C8963E] text-[#240e32] px-2 py-0.5 rounded">
              Terminal 2 · Form-PRO-001 / Form-ING-001
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">
              Outlet Ingredient Batching, Precision Scaling & Release Engine
            </h2>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            Step 1: Romeo requests bulk raw materials from Jade · Step 2: Jade releases FEFO bulk lots · Step 3: Romeo scales unitized kits & dispatches to Outlets
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-lg border border-[#E2D1B8] shadow-sm">
          <button
            onClick={() => setActiveSubTab('workbench')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'workbench' ? 'bg-[#3D1C52] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Scale size={14} /> Romeo's Workbench ({batchOrders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('new_order')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'new_order' ? 'bg-[#C8963E] text-[#240e32] shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Plus size={14} /> Enter Outlet Kitting Order (Jade / Mariejohn)
          </button>
        </div>
      </div>

      {activeSubTab === 'workbench' && (
        <div className="space-y-5">
          {/* Gate 0 Calibration Banner */}
          <div className="bg-white p-4 rounded-xl border border-[#E2D1B8] shadow-sm space-y-3">
            <div className="flex justify-between items-center flex-wrap gap-2 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#1E7A3E]" />
                <h3 className="font-serif font-bold text-sm text-[#3D1C52]">
                  Gate 0 — Pre-Shift Scale Metrology & 40-Mesh Sieve Verification (`Form-CAL-001`)
                </h3>
              </div>
              <span className="text-[11px] font-bold bg-green-100 text-[#1E7A3E] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={12} /> 5 City Treasurer Seals Valid to Jan 2027
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div className="bg-[#FAF6EE] p-2.5 rounded-lg border border-[#E2D1B8]">
                <p className="font-mono font-bold text-[#5B2E7A]">Seal #798073</p>
                <p className="text-[11px] text-gray-600">Bench Scale #1</p>
                <p className="text-[10px] text-green-700 font-bold mt-1">✓ Zero-Balanced</p>
              </div>
              <div className="bg-[#FAF6EE] p-2.5 rounded-lg border border-[#E2D1B8]">
                <p className="font-mono font-bold text-[#5B2E7A]">Seal #798074</p>
                <p className="text-[11px] text-gray-600">Bench Scale #2</p>
                <p className="text-[10px] text-green-700 font-bold mt-1">✓ Zero-Balanced</p>
              </div>
              <div className="bg-[#FAF6EE] p-2.5 rounded-lg border border-[#E2D1B8]">
                <p className="font-mono font-bold text-[#5B2E7A]">Seal #798607</p>
                <p className="text-[11px] text-gray-600">1kg SF-400 Micro</p>
                <p className="text-[10px] text-green-700 font-bold mt-1">✓ Zero-Balanced</p>
              </div>
              <div className="bg-[#FAF6EE] p-2.5 rounded-lg border border-[#E2D1B8]">
                <p className="font-mono font-bold text-[#5B2E7A]">Seals #798606 / #605</p>
                <p className="text-[11px] text-gray-600">40kg & 30kg Platform</p>
                <p className="text-[10px] text-green-700 font-bold mt-1">✓ Zero-Balanced</p>
              </div>
              <div className="bg-[#FAF6EE] p-2.5 rounded-lg border border-[#E2D1B8]">
                <p className="font-bold text-[#3D1C52]">40-Mesh Sieve</p>
                <p className="text-[11px] text-gray-600">Stainless Flour Sifter</p>
                <p className="text-[10px] text-green-700 font-bold mt-1">✓ Intact</p>
              </div>
            </div>
          </div>

          {/* Filter & Collective Release Bar */}
          <div className="bg-white p-3 rounded-xl border border-[#E2D1B8] shadow-sm flex flex-wrap justify-between items-center gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {[
                { id: 'ALL', label: 'All Orders' },
                { id: 'PENDING_BATCHING', label: 'Pending Batching' },
                { id: 'BATCHED_KITTED', label: 'Batched / Kitted' },
                { id: 'RELEASED', label: 'Released to Outlets' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setFilterStatus(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    filterStatus === st.id ? 'bg-[#3D1C52] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {st.label} ({batchOrders.filter(o => st.id === 'ALL' || o.status === st.id).length})
                </button>
              ))}
            </div>

            <button
              onClick={onBulkReleaseOrders}
              disabled={readyToReleaseCount === 0}
              className={`px-4 py-2 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition ${
                readyToReleaseCount > 0 ? 'bg-gradient-to-r from-[#1E7A3E] to-[#27ae60] hover:from-[#176332] hover:to-[#1e8449] text-white cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <CheckCheck size={16} />
              <span>Collectively Release All Completed Kits ({readyToReleaseCount})</span>
            </button>
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.length === 0 ? (
              <div className="col-span-2 p-10 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                <p className="font-semibold text-sm">No batching orders found for this filter.</p>
              </div>
            ) : (
              filteredOrders.map(order => {
                const isPending = order.status === 'PENDING_BATCHING';
                const isBatched = order.status === 'BATCHED_KITTED';
                const isReleased = order.status === 'RELEASED';
                const bulkStatus = order.bulkRequisitionStatus || (order.bulkMaterialsRequested ? 'BULK_ISSUED_BY_JADE' : 'NOT_REQUESTED');
                const rec = recipes.find(r => r.sku === order.recipeSku);

                return (
                  <div 
                    key={order.orderId} 
                    className={`bg-white rounded-xl border shadow-sm p-4 flex flex-col justify-between space-y-3 ${
                      isPending ? 'border-amber-300 bg-amber-50/10' : isBatched ? 'border-blue-300 bg-blue-50/10' : 'border-green-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#5B2E7A]">{order.orderId}</span>
                          <span className="text-[10px] text-gray-500">· Needed: {order.targetDate || order.requestDate}</span>
                        </div>
                        <h4 className="font-bold text-base text-gray-900 mt-0.5">{order.recipeName}</h4>
                        <p className="text-xs font-semibold text-[#C8963E]">{order.outletName}</p>
                      </div>
                      <div>
                        {isPending && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-[#D68910] flex items-center gap-1"><Clock size={11} /> PENDING BATCHING</span>}
                        {isBatched && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1"><CheckCircle2 size={11} /> BATCHED / KITTED</span>}
                        {isReleased && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-[#1E7A3E] flex items-center gap-1"><Truck size={11} /> RELEASED</span>}
                      </div>
                    </div>

                    <div className="bg-[#FAF6EE] p-3 rounded-lg border border-[#E2D1B8] text-xs space-y-1.5">
                      <div className="flex justify-between text-gray-800">
                        <span>Ordered Kits: <strong>{order.batchMultiplier} Kits</strong> ({rec ? `${rec.standardBatchFlourKg * order.batchMultiplier} kg flour total` : ''})</span>
                        <span>Est. Yield: <strong>{order.requestedQtyPcs} pcs</strong></span>
                      </div>

                      {/* Component Breakdown Preview */}
                      {rec && (
                        <div className="pt-1 border-t border-gray-200 text-[11px] text-gray-600 grid grid-cols-2 gap-x-3 gap-y-0.5">
                          {rec.ingredients.map((ing, i) => (
                            <div key={i} className="flex justify-between">
                              <span>{ing.name}:</span>
                              <span className="font-mono font-semibold text-gray-800">
                                {ing.isAsNeeded ? 'As needed' : `${(ing.gramsPerBatch * order.batchMultiplier).toLocaleString()} ${ing.isWater ? 'ml' : 'g'}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {order.linkedWithdrawalSlipNo && (
                        <div className="pt-1 border-t border-gray-200 flex justify-between items-center text-[11px]">
                          <span className="text-gray-600">Bulk Warehouse Slip: <strong className="font-mono text-[#5B2E7A]">{order.linkedWithdrawalSlipNo}</strong></span>
                          <span className={`font-bold ${bulkStatus === 'BULK_ISSUED_BY_JADE' ? 'text-green-700' : 'text-amber-700'}`}>
                            {bulkStatus === 'BULK_ISSUED_BY_JADE' ? '✓ Bulk Issued by Jade' : '⏳ Awaiting Jade Approval'}
                          </span>
                        </div>
                      )}

                      {order.batchTagId && (
                        <div className="flex justify-between font-mono text-[11px] text-[#3D1C52] border-t border-gray-200 pt-1">
                          <span>Batch Tag: <strong>{order.batchTagId}</strong></span>
                          <span>Total Scaled Kit Weight: <strong>{order.actualBatchedKg} kg</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2">
                      <div className="text-[11px] text-gray-500">
                        {isReleased ? (
                          <span className="text-green-700 font-semibold">Released at {order.releasedAt} to {order.releasedTo || 'Outlet Driver'}</span>
                        ) : isBatched ? (
                          <span className="text-blue-700 font-semibold">Kitted at {order.batchedAt} by {order.batchedBy}</span>
                        ) : (
                          <span>Order Intake: {order.enteredBy}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* STEP 1: ROMEO REQUESTS BULK RAW MATERIALS FROM JADE */}
                        {isPending && bulkStatus === 'NOT_REQUESTED' && (
                          <button
                            onClick={() => onRequestBulkMaterials(order)}
                            className="bg-[#5B2E7A] hover:bg-[#3D1C52] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow flex items-center gap-1 transition"
                          >
                            <FileText size={13} /> 1. Request Bulk Mats from Jade
                          </button>
                        )}

                        {/* STEP 1.5: AWAITING JADE RELEASE AT DUTCH DOOR */}
                        {isPending && bulkStatus === 'PENDING_JADE_APPROVAL' && (
                          <span className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            ⏳ Awaiting Jade's Release in Tab 3
                          </span>
                        )}

                        {/* STEP 2: ROMEO SCALES & KITS ONCE JADE RELEASES BULK */}
                        {isPending && bulkStatus === 'BULK_ISSUED_BY_JADE' && (
                          <button
                            onClick={() => openScalingModal(order)}
                            className="bg-[#C8963E] hover:bg-[#b08030] text-[#240e32] px-3 py-1.5 rounded-lg text-xs font-bold shadow flex items-center gap-1 transition"
                          >
                            <Scale size={13} /> 2. Scale & Kit Recipe Mix
                          </button>
                        )}

                        {/* STEP 3: INDIVIDUAL RELEASE TO OUTLET */}
                        {isBatched && (
                          <>
                            <button
                              onClick={() => setSelectedTagOrder(order)}
                              className="text-xs text-[#5B2E7A] hover:bg-purple-50 px-2.5 py-1.5 rounded font-bold border border-[#5B2E7A] flex items-center gap-1"
                              title="Print Form-ING-001 Tag"
                            >
                              <Printer size={13} /> Tag
                            </button>
                            <button
                              onClick={() => onUpdateOrderStatus(order.orderId, 'RELEASED')}
                              className="bg-[#1E7A3E] hover:bg-[#165c2f] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow flex items-center gap-1 transition"
                            >
                              <Truck size={13} /> 3. Release to Outlet
                            </button>
                          </>
                        )}

                        {isReleased && (
                          <button
                            onClick={() => setSelectedTagOrder(order)}
                            className="text-xs text-gray-600 hover:text-[#5B2E7A] underline font-semibold flex items-center gap-1"
                          >
                            <Printer size={12} /> Print Tag
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

      {/* SUB-TAB 2: INTAKE NEW OUTLET KITTING ORDER */}
      {activeSubTab === 'new_order' && (
        <form onSubmit={handleCreateOrder} className="bg-white p-5 rounded-xl border border-[#E2D1B8] shadow-sm space-y-5">
          <div className="border-b border-gray-200 pb-3 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="font-serif font-bold text-base text-[#5B2E7A] flex items-center gap-2">
                <Plus size={18} /> Intake Outlet Ingredient Kitting Order (`Form-PRO-001`)
              </h3>
              <p className="text-xs text-gray-500">
                Enter outlet orders (e.g., Laurice Delicacies ordering 4x 3kg-yield Kits of Commercial Pandesal Mix) for Romeo B. Malusay to batch and kit.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Requesting Outlet / Line</label>
              <select value={outletId} onChange={(e) => setOutletId(e.target.value)} className="w-full p-2 border rounded bg-white font-medium">
                {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Product Recipe Kit</label>
              <select value={recipeSku} onChange={(e) => setRecipeSku(e.target.value)} className="w-full p-2 border rounded bg-white font-medium">
                {recipes.map(r => <option key={r.sku} value={r.sku}>{r.sku} — {r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Quantity of Kits Ordered</label>
              <input
                type="number"
                min="1"
                step="1"
                value={batchMultiplier}
                onChange={(e) => setBatchMultiplier(parseFloat(e.target.value) || 1)}
                className="w-full p-2 border rounded font-mono font-bold text-[#3D1C52]"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 block">
                Total Flour: <strong>{(currentRecipe.standardBatchFlourKg * batchMultiplier).toFixed(1)} kg</strong> · Est. Yield: <strong>{estimatedUnits} pcs</strong>
              </span>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Requested Delivery Date</label>
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full p-2 border rounded text-xs" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1 text-xs">Order Notes / Instructions</label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Pack into 4 separate sealed 3kg-yield HDPE kits for Laurice Delicacies morning bake."
              className="w-full p-2 border rounded text-xs"
            />
          </div>

          {/* Scaled Measurements Table */}
          <div className="bg-[#FAF6EE] p-4 rounded-xl border border-[#E2D1B8] space-y-3">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h4 className="font-serif font-bold text-xs text-[#5B2E7A]">
                Scaled Measurements Breakdown ({batchMultiplier}x {currentRecipe.name})
              </h4>
              <span className="text-xs font-mono font-bold text-[#1E7A3E]">
                Total Dry + Fat Kit Weight: {totalDryFatKitKg} kg
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs bg-white rounded border">
                <thead className="bg-[#3D1C52] text-white">
                  <tr>
                    <th className="p-2">Material Code</th>
                    <th className="p-2">Ingredient Component</th>
                    <th className="p-2">Per 1 Kit Standard</th>
                    <th className="p-2 text-right font-bold">Total for {batchMultiplier} Kit(s) (Grams)</th>
                    <th className="p-2 text-right font-bold">Total Bulk Pull (kg / L)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {calculatedIngredients.map((ing, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-mono text-[#5B2E7A] font-bold">{ing.code}</td>
                      <td className="p-2 font-medium">{ing.name}</td>
                      <td className="p-2 text-gray-600 font-mono">{ing.rangeNote || `${ing.gramsPerBatch} g`}</td>
                      <td className="p-2 text-right font-mono font-bold text-[#1E7A3E]">
                        {ing.isAsNeeded
                          ? 'As needed for rolling'
                          : ing.maxRequiredGrams
                          ? `${ing.requiredGrams.toLocaleString()} g to ${ing.maxRequiredGrams.toLocaleString()} ${ing.isWater ? 'ml' : 'g'}`
                          : `${ing.requiredGrams.toLocaleString()} ${ing.isWater ? 'ml' : 'g'}`}
                      </td>
                      <td className="p-2 text-right font-mono text-gray-800 font-semibold">
                        {ing.isAsNeeded ? 'As needed' : `${(ing.requiredGrams / 1000).toFixed(3)} ${ing.isWater ? 'L' : 'kg'}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-[#C8963E] hover:bg-[#b08030] text-[#240e32] font-bold text-xs px-6 py-2.5 rounded-lg shadow-md flex items-center gap-2">
              <Plus size={16} /> Submit Outlet Order to Romeo's Workbench
            </button>
          </div>
        </form>
      )}

      {/* MODAL 1: ROMEO'S SCALING & KITTING CERTIFICATION */}
      {scalingModalOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border-2 border-[#C8963E] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#5B2E7A]">ROMEO B. MALUSAY · PRECISION SCALING WORKBENCH</span>
                <h3 className="font-serif font-bold text-xl text-gray-900">{scalingModalOrder.recipeName}</h3>
                <p className="text-xs text-gray-500">
                  Outlet: <strong>{scalingModalOrder.outletName}</strong> · Quantity: <strong>{scalingModalOrder.batchMultiplier} Kits</strong> ({scalingModalOrder.requestedQtyPcs} pcs yield)
                </p>
              </div>
              <button onClick={() => setScalingModalOrder(null)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
            </div>

            <div className="bg-[#FAF6EE] p-3 rounded-lg border border-[#E2D1B8] text-xs space-y-2">
              <p className="font-bold text-[#3D1C52]">Mandatory cGMP Scaling & Kitting Verification (`Form-ING-001`):</p>
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" defaultChecked className="accent-[#1E7A3E]" />
                Digital scales zero-balanced (City Treasurer Seals #798073, #798074 & #798607 verified intact)
              </label>
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" defaultChecked className="accent-[#1E7A3E]" />
                All Bread Flour passed through 40-mesh stainless steel sifter screen
              </label>
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" defaultChecked className="accent-[#1E7A3E]" />
                Portioned into {scalingModalOrder.batchMultiplier} individual sealed, food-grade HDPE kit containers
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Batch Identification Tag ID</label>
                <input
                  type="text"
                  readOnly
                  value={`KIT-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${scalingModalOrder.orderId.slice(-4)}`}
                  className="w-full p-2 border rounded font-mono font-bold bg-gray-50 text-[#5B2E7A]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Calibrated Scale Used</label>
                <select
                  value={selectedScaleSeal}
                  onChange={(e) => setSelectedScaleSeal(e.target.value)}
                  className="w-full p-2 border rounded bg-white font-mono text-xs"
                >
                  <option>Seal #798073 (Bench Scale #1)</option>
                  <option>Seal #798607 (1kg Precision SF-400)</option>
                  <option>Seal #798606 (40kg Platform Scale)</option>
                  <option>Seal #798605 (30kg Platform Scale)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Total Scaled Kit Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={customScaledWeight}
                  onChange={(e) => setCustomScaledWeight(e.target.value)}
                  className="w-full p-2 border rounded font-mono font-bold text-green-700"
                />
              </div>
            </div>

            <div className="pt-2 border-t flex justify-end gap-2">
              <button onClick={() => setScalingModalOrder(null)} className="px-4 py-2 text-xs text-gray-600 hover:underline">Cancel</button>
              <button
                onClick={() => {
                  onUpdateOrderStatus(
                    scalingModalOrder.orderId,
                    'BATCHED_KITTED',
                    `KIT-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${scalingModalOrder.orderId.slice(-4)}`,
                    parseFloat(customScaledWeight) || scalingModalOrder.expectedKitWeightKg || 16.44,
                    selectedScaleSeal
                  );
                  setScalingModalOrder(null);
                }}
                className="bg-[#1E7A3E] hover:bg-[#165c2f] text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-md flex items-center gap-1.5"
              >
                <PackageCheck size={16} /> Certify & Mark as Batched / Kitted (`Form-ING-001`)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE BATCH IDENTIFICATION TAG */}
      {selectedTagOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-4 border-[#C8963E] space-y-4">
            <div className="text-center border-b-2 border-dashed pb-3">
              <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">JANG-JANG BAKESHOP · KITTING DIVISION</p>
              <h3 className="font-serif font-bold text-xl text-[#3D1C52]">Batch Identification Tag (`Form-ING-001`)</h3>
              <p className="font-mono text-sm font-bold text-[#C8963E] mt-1">{selectedTagOrder.batchTagId}</p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b py-1"><span className="text-gray-500">Recipe Kit:</span><span className="font-bold">{selectedTagOrder.recipeName}</span></div>
              <div className="flex justify-between border-b py-1"><span className="text-gray-500">Destination Outlet:</span><span className="font-bold text-[#5B2E7A]">{selectedTagOrder.outletName}</span></div>
              <div className="flex justify-between border-b py-1"><span className="text-gray-500">Kit Count & Yield:</span><span className="font-bold">{selectedTagOrder.batchMultiplier} Kits ({selectedTagOrder.requestedQtyPcs} pcs)</span></div>
              <div className="flex justify-between border-b py-1"><span className="text-gray-500">Total Scaled Net Weight:</span><span className="font-mono font-bold text-[#1E7A3E]">{selectedTagOrder.actualBatchedKg} kg</span></div>
              <div className="flex justify-between border-b py-1"><span className="text-gray-500">Calibrated Scale:</span><span className="font-mono text-[11px]">{selectedTagOrder.scaleUsed || 'Seal #798073 Valid'}</span></div>
              <div className="flex justify-between border-b py-1"><span className="text-gray-500">Prepared By:</span><span className="font-bold">{selectedTagOrder.batchedBy || 'Romeo B. Malusay'}</span></div>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <button onClick={() => setSelectedTagOrder(null)} className="text-xs text-gray-500 hover:underline">Close</button>
              <button onClick={() => window.print()} className="bg-[#3D1C52] text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5">
                <Printer size={13} /> Print Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
