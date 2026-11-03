import React, { useState } from 'react';
import { 
  Scale, Plus, CheckCircle2, Clock, Truck, Printer, 
  ShieldCheck, CheckCheck, FileText, PackageCheck, Droplets
} from 'lucide-react';

export default function BatchingWorkbench({
  batchOrders,
  onSaveBatchOrder,
  onUpdateOrderStatus,
  onBulkReleaseOrders,
  onRequestBulkMaterials,
  onApproveBulkFromWorkbench,
  recipes,
  outlets,
  inventory,
  currentRole
}) {
  const [activeSubTab, setActiveSubTab] = useState('workbench');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedTagOrder, setSelectedTagOrder] = useState(null);
  const [scalingModalOrder, setScalingModalOrder] = useState(null);
  const [customBatchedKg, setCustomBatchedKg] = useState('');
  const [releaseDriverName, setReleaseDriverName] = useState('Roberto S. Blase / Othniel Tilan');

  // Default to Laurice Delicacies & 4x 3kg-Yield Pandesal Kits scenario
  const [outletId, setOutletId] = useState('laurice-delicacies');
  const [recipeSku, setRecipeSku] = useState('BRD-PAN-001');
  const [batchMultiplier, setBatchMultiplier] = useState(4.0);
  const [targetDate, setTargetDate] = useState(new Date().toISOString().slice(0, 10));
  const [orderNotes, setOrderNotes] = useState('');

  const currentRecipe = recipes.find(r => r.sku === recipeSku) || recipes[0];
  const selectedOutlet = outlets.find(o => o.id === outletId) || outlets[0];

  const calculatedIngredients = currentRecipe.ingredients.map(ing => ({
    ...ing,
    requiredGrams: ing.gramsPerBatch * batchMultiplier
  }));

  // Sum only physical kitted dry & fat ingredients (excluding water added at outlet mixer & packaging sheets)
  const totalDryFatGramsPerKit = currentRecipe.ingredients
    .filter(i => !i.isWater && !i.isPackaging && !i.isAsNeeded)
    .reduce((sum, i) => sum + i.gramsPerBatch, 0);

  const totalKittedWeightKg = Number(((totalDryFatGramsPerKit * batchMultiplier) / 1000).toFixed(2));
  const totalFlourKg = Number((currentRecipe.standardBatchFlourKg * batchMultiplier).toFixed(2));
  const estimatedUnits = Math.round(currentRecipe.unitPieceYield * batchMultiplier);

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
      totalFlourKg,
      expectedKitWeightKg: totalKittedWeightKg,
      requestedQtyPcs: estimatedUnits,
      requestedBy: `${selectedOutlet.manager} (${selectedOutlet.name})`,
      enteredBy: currentRole,
      status: "PENDING_BATCHING",
      bulkMaterialsRequested: false,
      bulkMaterialsApprovedByJade: false,
      linkedWithdrawalSlipNo: null,
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
      notes: orderNotes || `${batchMultiplier}x (${totalFlourKg}kg flour basis) kitted mix for ${selectedOutlet.name}.`
    };

    onSaveBatchOrder(newOrder);
    setActiveSubTab('workbench');
    setOrderNotes('');
  };

  const filteredOrders = batchOrders.filter(order => {
    if (filterStatus === 'ALL') return true;
    return order.status === filterStatus;
  });

  const readyToReleaseCount = batchOrders.filter(o => o.status === 'BATCHED_KITTED').length;

  const openScalingModal = (order) => {
    const recipeObj = recipes.find(r => r.sku === order.recipeSku) || recipes[0];
    const dryFatGrams = recipeObj.ingredients
      .filter(i => !i.isWater && !i.isPackaging && !i.isAsNeeded)
      .reduce((sum, i) => sum + i.gramsPerBatch, 0);
    const computedKg = ((dryFatGrams * order.batchMultiplier) / 1000).toFixed(2);
    setCustomBatchedKg(order.expectedKitWeightKg || computedKg);
    setScalingModalOrder(order);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-[#C8963E] text-[#240e32] px-2 py-0.5 rounded">
              Form-PRO-001 / Form-ING-001
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">
              Outlet Ingredient Batching, Precision Scaling & Release Engine
            </h2>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            Step 1: Intake Outlet Kit Order · Step 2: Romeo Requests Bulk Mats from Jade (`Form-WAR-001`) · Step 3: Scale into Unitized Kits (`Form-ING-001`) · Step 4: Release to Outlets
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
            <Plus size={14} /> Intake Outlet Kit Order
          </button>
        </div>
      </div>

      {activeSubTab === 'workbench' && (
        <div className="space-y-5">
          {/* Gate 0 Scale Calibration Banner */}
          <div className="bg-white p-4 rounded-xl border border-[#E2D1B8] shadow-sm space-y-3">
            <div className="flex justify-between items-center flex-wrap gap-2 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#1E7A3E]" />
                <h3 className="font-serif font-bold text-sm text-[#3D1C52]">
                  Gate 0 — Pre-Shift Scale Metrology & 40-Mesh Sifter Verification (`Form-CAL-001`)
                </h3>
              </div>
              <span className="text-[11px] font-bold bg-green-100 text-[#1E7A3E] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={12} /> 5 City Treasurer Seals Valid to Jan 2027
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-[#FAF6EE] p-2.5 rounded-lg border border-[#E2D1B8]">
                <p className="font-mono font-bold text-[#5B2E7A]">Seal #798073 & #798074</p>
                <p className="text-[11px] text-gray-600">Bench Scales #1 & #2</p>
                <p className="text-[10px] text-green-700 font-bold mt-1">✓ Zero-Balanced</p>
              </div>
              <div className="bg-[#FAF6EE] p-2.5 rounded-lg border border-[#E2D1B8]">
                <p className="font-mono font-bold text-[#5B2E7A]">Seal #798607</p>
                <p className="text-[11px] text-gray-600">1kg Precision Micro Scale</p>
                <p className="text-[10px] text-green-700 font-bold mt-1">✓ Minor Ingredients (Yeast/Salt)</p>
              </div>
              <div className="bg-[#FAF6EE] p-2.5 rounded-lg border border-[#E2D1B8]">
                <p className="font-mono font-bold text-[#5B2E7A]">Seal #798606 & #798605</p>
                <p className="text-[11px] text-gray-600">40kg & 30kg Platform Scales</p>
                <p className="text-[10px] text-green-700 font-bold mt-1">✓ Bulk Flour & Shortening</p>
              </div>
              <div className="bg-[#FAF6EE] p-2.5 rounded-lg border border-[#E2D1B8]">
                <p className="font-bold text-[#3D1C52]">40-Mesh Stainless Sieve</p>
                <p className="text-[11px] text-gray-600">Mechanical Flour Sifter</p>
                <p className="text-[10px] text-green-700 font-bold mt-1">✓ Intact / Zero Foreign Matter</p>
              </div>
            </div>
          </div>

          {/* Filter & Collective Release Bar */}
          <div className="bg-white p-3 rounded-xl border border-[#E2D1B8] shadow-sm flex flex-wrap justify-between items-center gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {['ALL', 'PENDING_BATCHING', 'BATCHED_KITTED', 'RELEASED'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    filterStatus === status ? 'bg-[#3D1C52] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.replace('_', ' ')} ({batchOrders.filter(o => status === 'ALL' || o.status === status).length})
                </button>
              ))}
            </div>

            <button
              onClick={onBulkReleaseOrders}
              disabled={readyToReleaseCount === 0}
              className={`px-4 py-2 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition ${
                readyToReleaseCount > 0 ? 'bg-gradient-to-r from-[#1E7A3E] to-[#27ae60] hover:from-[#176332] hover:to-[#1e8449] text-white animate-pulse' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <CheckCheck size={16} />
              <span>Collectively Release All Kitted Orders ({readyToReleaseCount})</span>
            </button>
          </div>

          {/* Orders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.length === 0 ? (
              <div className="col-span-2 p-10 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                <p className="font-semibold text-sm">No batching orders found under this filter.</p>
              </div>
            ) : (
              filteredOrders.map(order => {
                const isPending = order.status === 'PENDING_BATCHING';
                const isBatched = order.status === 'BATCHED_KITTED';
                const isReleased = order.status === 'RELEASED';
                const recipeObj = recipes.find(r => r.sku === order.recipeSku) || recipes[0];

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
                        {isPending && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-[#D68910] flex items-center gap-1"><Clock size={11} /> PENDING KIT</span>}
                        {isBatched && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1"><CheckCircle2 size={11} /> BATCHED / KITTED</span>}
                        {isReleased && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-[#1E7A3E] flex items-center gap-1"><Truck size={11} /> RELEASED</span>}
                      </div>
                    </div>

                    <div className="bg-[#FAF6EE] p-3 rounded-lg border border-[#E2D1B8] text-xs space-y-1.5">
                      <div className="flex justify-between text-gray-800">
                        <span>Ordered Kits: <strong>{order.batchMultiplier} Kits ({order.batchMultiplier * recipeObj.standardBatchFlourKg} kg Flour)</strong></span>
                        <span>Est. Yield: <strong>{order.requestedQtyPcs} pcs</strong></span>
                      </div>

                      {/* Bulk Pull Status Indicator */}
                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-gray-200">
                        <span className="text-gray-600">Upstream Bulk Pull (`Form-WAR-001`):</span>
                        {order.bulkMaterialsApprovedByJade || isBatched || isReleased ? (
                          <span className="font-bold text-[#1E7A3E]">
                            ✓ Released by Jade {order.linkedWithdrawalSlipNo ? `(${order.linkedWithdrawalSlipNo})` : ''}
                          </span>
                        ) : order.bulkMaterialsRequested ? (
                          <span className="font-bold text-[#D68910]">
                            ⏳ Requested ({order.linkedWithdrawalSlipNo || 'Pending Jade Approval'})
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Not yet requested from Bodega</span>
                        )}
                      </div>

                      {order.batchTagId && (
                        <div className="flex justify-between font-mono text-[11px] text-[#3D1C52] border-t border-gray-200 pt-1">
                          <span>Batch Tag: <strong>{order.batchTagId}</strong></span>
                          <span>Total Scaled Net: <strong>{order.actualBatchedKg} kg ({order.batchMultiplier} Kits)</strong></span>
                        </div>
                      )}
                      {order.notes && <p className="text-[11px] text-gray-500 italic">{order.notes}</p>}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2">
                      <div className="text-[11px] text-gray-500">
                        {isReleased ? (
                          <span className="text-green-700 font-semibold">Released at {order.releasedAt} to {order.releasedTo || 'Outlet Driver'}</span>
                        ) : isBatched ? (
                          <span className="text-blue-700 font-semibold">Scaled by {order.batchedBy} at {order.batchedAt}</span>
                        ) : (
                          <span>Logged by: {order.enteredBy}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* STEP 1: ROMEO REQUESTS BULK FROM JADE */}
                        {isPending && !order.bulkMaterialsRequested && (
                          <button
                            onClick={() => onRequestBulkMaterials(order)}
                            className="bg-[#5B2E7A] hover:bg-[#3D1C52] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow flex items-center gap-1 transition"
                          >
                            <FileText size={13} /> 1. Request Bulk Mats from Jade
                          </button>
                        )}

                        {/* STEP 1.5: JADE APPROVES BULK RELEASE (OR QUICK APPROVE) */}
                        {isPending && order.bulkMaterialsRequested && !order.bulkMaterialsApprovedByJade && (
                          <button
                            onClick={() => onApproveBulkFromWorkbench(order)}
                            className="bg-[#D68910] hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow flex items-center gap-1 transition"
                            title="Jade Q. Dela Cruz approves bulk warehouse transfer and deducts stock"
                          >
                            <PackageCheck size={13} /> 2. Jade: Approve Bulk Transfer
                          </button>
                        )}

                        {/* STEP 2: ROMEO SCALES & KITS */}
                        {isPending && (order.bulkMaterialsApprovedByJade || (!order.bulkMaterialsRequested && order.orderId.includes('1103'))) && (
                          <button
                            onClick={() => openScalingModal(order)}
                            className="bg-[#C8963E] hover:bg-[#b08030] text-[#240e32] px-3 py-1.5 rounded-lg text-xs font-bold shadow flex items-center gap-1 transition animate-pulse"
                          >
                            <Scale size={13} /> 3. Romeo: Scale & Kit (`Form-ING-001`)
                          </button>
                        )}

                        {/* STEP 3: INDIVIDUAL RELEASE TO OUTLET */}
                        {isBatched && (
                          <>
                            <button
                              onClick={() => setSelectedTagOrder(order)}
                              className="text-xs text-[#5B2E7A] hover:bg-purple-50 px-2.5 py-1.5 rounded-lg font-bold border border-[#5B2E7A] flex items-center gap-1"
                            >
                              <Printer size={13} /> Tag
                            </button>
                            <button
                              onClick={() => onUpdateOrderStatus(order.orderId, 'RELEASED')}
                              className="bg-[#1E7A3E] hover:bg-[#165c2f] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow flex items-center gap-1 transition"
                            >
                              <Truck size={13} /> 4. Release to Outlet
                            </button>
                          </>
                        )}

                        {isReleased && (
                          <button
                            onClick={() => setSelectedTagOrder(order)}
                            className="text-xs text-[#5B2E7A] hover:underline font-bold flex items-center gap-1"
                          >
                            <Printer size={13} /> Print Tag
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

      {/* SUB-TAB 2: INTAKE NEW OUTLET KIT ORDER */}
      {activeSubTab === 'new_order' && (
        <form onSubmit={handleCreateOrder} className="bg-white p-5 rounded-xl border border-[#E2D1B8] shadow-sm space-y-5">
          <div className="border-b border-gray-200 pb-3 flex justify-between items-center flex-wrap gap-2">
            <div>
              <h3 className="font-serif font-bold text-base text-[#5B2E7A] flex items-center gap-2">
                <Plus size={18} /> Intake Outlet Ingredient Kit Order (`Form-PRO-001`)
              </h3>
              <p className="text-xs text-gray-500">
                Example: Laurice Delicacies orders 4 Kits of 3kg-Yield Commercial Pandesal Mix (12 kg total flour basis)
              </p>
            </div>
            <span className="text-xs font-bold bg-purple-50 text-[#5B2E7A] px-3 py-1 rounded border border-purple-200">
              Total Kitted Dry/Fat Weight: {totalKittedWeightKg} kg
            </span>
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
              <label className="block font-bold text-gray-700 mb-1">Number of Kits Ordered</label>
              <input
                type="number"
                min="1"
                step="1"
                value={batchMultiplier}
                onChange={(e) => setBatchMultiplier(parseFloat(e.target.value) || 1.0)}
                className="w-full p-2 border rounded font-mono font-bold text-[#3D1C52]"
              />
              <span className="text-[10px] text-gray-500 mt-0.5 block">
                {batchMultiplier} Kits = <strong>{totalFlourKg} kg Flour</strong> ({estimatedUnits} pcs)
              </span>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Requested Delivery Date</label>
              <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full p-2 border rounded text-xs" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1 text-xs">Order Remarks / Outlet Instructions</label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Pack into 4 separate 3kg-yield sealed containers for Laurice Delicacies morning bake."
              className="w-full p-2 border rounded text-xs"
            />
          </div>

          {/* Scaled Measurements Table */}
          <div className="bg-[#FAF6EE] p-4 rounded-xl border border-[#E2D1B8] space-y-3">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h4 className="font-serif font-bold text-xs text-[#5B2E7A]">
                Scaled Measurements Breakdown ({batchMultiplier} × {currentRecipe.name})
              </h4>
              <span className="text-[11px] text-gray-600 font-semibold">
                1 Kit = {(totalDryFatGramsPerKit / 1000).toFixed(2)} kg Dry/Fat · {batchMultiplier} Kits = {totalKittedWeightKg} kg Bulk Request from Jade
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs bg-white rounded border">
                <thead className="bg-[#3D1C52] text-white">
                  <tr>
                    <th className="p-2">Material Code</th>
                    <th className="p-2">Ingredient Component</th>
                    <th className="p-2 text-right">Per 1 Kit</th>
                    <th className="p-2 text-right font-bold">Total for {batchMultiplier} Kit(s) (Grams)</th>
                    <th className="p-2 text-right font-bold">Total Bulk Pull (kg)</th>
                    <th className="p-2">Specification Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {calculatedIngredients.map((ing, idx) => (
                    <tr key={idx} className={ing.isWater ? 'bg-blue-50/40 text-blue-900' : ''}>
                      <td className="p-2 font-mono text-[#5B2E7A] font-bold">{ing.code}</td>
                      <td className="p-2 font-medium">
                        {ing.name}
                        {ing.isWater && <span className="ml-1.5 text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">Outlet Hydration</span>}
                      </td>
                      <td className="p-2 text-right font-mono">{ing.gramsPerBatch.toLocaleString()} {ing.isWater ? 'ml' : 'g'}</td>
                      <td className="p-2 text-right font-mono font-bold text-[#1E7A3E]">
                        {ing.requiredGrams.toLocaleString()} {ing.isWater ? 'ml' : 'g'}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-gray-800">
                        {ing.isPackaging ? `${ing.requiredGrams} pcs` : `${(ing.requiredGrams / 1000).toFixed(3)} ${ing.isWater ? 'L' : 'kg'}`}
                      </td>
                      <td className="p-2 text-[11px] text-gray-500">{ing.note || `${ing.pct}% baker's ratio`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-[#C8963E] hover:bg-[#b08030] text-[#240e32] font-bold text-xs px-6 py-2.5 rounded-lg shadow-md flex items-center gap-2">
              <Plus size={16} /> Log Outlet Kit Order to Romeo's Workbench
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
                <h3 className="font-serif font-bold text-xl text-gray-900">
                  {scalingModalOrder.batchMultiplier}x {scalingModalOrder.recipeName}
                </h3>
                <p className="text-xs text-gray-500">
                  Destination: <strong>{scalingModalOrder.outletName}</strong> · Target Output: {scalingModalOrder.requestedQtyPcs} pcs
                </p>
              </div>
              <button onClick={() => setScalingModalOrder(null)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
            </div>

            <div className="bg-[#FAF6EE] p-3 rounded-lg border border-[#E2D1B8] text-xs space-y-2">
              <p className="font-bold text-[#3D1C52]">Mandatory Pre-Kit Certification Checklist (`SOP-WAR-002`):</p>
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" defaultChecked className="accent-[#1E7A3E]" />
                Bulk ingredients received from Jade Q. Dela Cruz via Dutch Door window (`Form-WAR-001`)
              </label>
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" defaultChecked className="accent-[#1E7A3E]" />
                Digital Scales zero-balanced (Govt Seals #798073, #798074 & #798607 verified intact)
              </label>
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" defaultChecked className="accent-[#1E7A3E]" />
                All Bread Flour passed through 40-mesh stainless steel sifter screen
              </label>
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" defaultChecked className="accent-[#1E7A3E]" />
                Divided & sealed into {scalingModalOrder.batchMultiplier} individual color-coded HDPE kit container(s)
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Batch Tag ID (`Form-ING-001`)</label>
                <input
                  type="text"
                  readOnly
                  value={`KIT-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${scalingModalOrder.orderId.slice(-4)}`}
                  className="w-full p-2 border rounded font-mono font-bold bg-gray-50 text-[#5B2E7A]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Total Scaled Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  value={customBatchedKg}
                  onChange={(e) => setCustomBatchedKg(e.target.value)}
                  className="w-full p-2 border rounded font-mono font-bold text-green-700"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Authorized Outlet Courier</label>
                <input
                  type="text"
                  value={releaseDriverName}
                  onChange={(e) => setReleaseDriverName(e.target.value)}
                  className="w-full p-2 border rounded font-medium"
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
                    parseFloat(customBatchedKg) || 16.47,
                    releaseDriverName
                  );
                  setScalingModalOrder(null);
                }}
                className="bg-[#1E7A3E] hover:bg-[#165c2f] text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 size={16} /> Certify & Mark as Batched/Kitted (`Form-ING-001`)
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
              <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">JANG-JANG BAKESHOP · INDANGAN KITTING ROOM</p>
              <h3 className="font-serif font-bold text-xl text-[#3D1C52]">Unitized Batch Identification Tag</h3>
              <p className="font-mono text-sm font-bold text-[#C8963E] mt-1">{selectedTagOrder.batchTagId || 'KIT-TAG'}</p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b py-1"><span className="text-gray-500">Recipe Kit:</span><span className="font-bold">{selectedTagOrder.recipeName}</span></div>
              <div className="flex justify-between border-b py-1"><span className="text-gray-500">Target Outlet:</span><span className="font-bold text-[#5B2E7A]">{selectedTagOrder.outletName}</span></div>
              <div className="flex justify-between border-b py-1"><span className="text-gray-500">Kit Count & Yield:</span><span className="font-bold">{selectedTagOrder.batchMultiplier} Kits ({selectedTagOrder.requestedQtyPcs} pcs)</span></div>
              <div className="flex justify-between border-b py-1"><span className="text-gray-500">Total Scaled Net Weight:</span><span className="font-mono font-bold text-[#1E7A3E]">{selectedTagOrder.actualBatchedKg} kg</span></div>
              <div className="flex justify-between border-b py-1"><span className="text-gray-500">Scale Seals Verified:</span><span className="font-mono text-[11px]">#798073 / #798607 (PASS)</span></div>
              <div className="flex justify-between border-b py-1"><span className="text-gray-500">Certified Scaler:</span><span className="font-bold">Romeo B. Malusay</span></div>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <button onClick={() => setSelectedTagOrder(null)} className="text-xs text-gray-500 hover:underline">Close</button>
              <button onClick={() => window.print()} className="bg-[#3D1C52] text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5">
                <Printer size={13} /> Print Container Tag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
