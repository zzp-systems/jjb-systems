import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import ReceivingModule from './components/ReceivingModule';
import IssuanceModule from './components/IssuanceModule';
import BatchingWorkbench from './components/BatchingWorkbench';
import AdjustmentsModule from './components/AdjustmentsModule';
import EodReportModule from './components/EodReportModule';
import AuditTrailModule from './components/AuditTrailModule';

import { MASTER_MATERIALS, STORAGE_ROOMS } from './data/materialsData';
import { MASTER_RECIPES, OUTLETS } from './data/recipesData';
import { 
  INITIAL_RECEIVING_REPORTS, 
  INITIAL_WITHDRAWALS, 
  INITIAL_BATCHING_ORDERS, 
  INITIAL_ADJUSTMENTS, 
  INITIAL_QUARANTINE, 
  INITIAL_AUDIT_LOGS,
  EOD_EMAIL_RECIPIENTS
} from './data/initialData';

import { CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  // Persistence Helpers
  const getSaved = (key, fallback) => {
    try {
      const saved = localStorage.getItem(`jjb_wms_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  const saveToStorage = (key, value) => {
    try {
      localStorage.setItem(`jjb_wms_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error("Storage error:", e);
    }
  };

  // Main State
  const [inventory, setInventory] = useState(() => getSaved('inventory', MASTER_MATERIALS));
  const [receivingReports, setReceivingReports] = useState(() => getSaved('receiving', INITIAL_RECEIVING_REPORTS));
  const [withdrawals, setWithdrawals] = useState(() => getSaved('withdrawals', INITIAL_WITHDRAWALS));
  const [batchOrders, setBatchOrders] = useState(() => getSaved('batch_orders', INITIAL_BATCHING_ORDERS));
  const [adjustments, setAdjustments] = useState(() => getSaved('adjustments', INITIAL_ADJUSTMENTS));
  const [quarantineList, setQuarantineList] = useState(() => getSaved('quarantine', INITIAL_QUARANTINE));
  const [auditLogs, setAuditLogs] = useState(() => getSaved('audit_logs', INITIAL_AUDIT_LOGS));

  // Operational State
  const [currentRole, setCurrentRole] = useState("Jade Q. Dela Cruz");
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [prefilledItem, setPrefilledItem] = useState(null);

  // Sync state to LocalStorage
  useEffect(() => { saveToStorage('inventory', inventory); }, [inventory]);
  useEffect(() => { saveToStorage('receiving', receivingReports); }, [receivingReports]);
  useEffect(() => { saveToStorage('withdrawals', withdrawals); }, [withdrawals]);
  useEffect(() => { saveToStorage('batch_orders', batchOrders); }, [batchOrders]);
  useEffect(() => { saveToStorage('adjustments', adjustments); }, [adjustments]);
  useEffect(() => { saveToStorage('quarantine', quarantineList); }, [quarantineList]);
  useEffect(() => { saveToStorage('audit_logs', auditLogs); }, [auditLogs]);

  // Toast Helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Audit Helper
  const recordAudit = (action, details) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      actor: currentRole,
      role: currentRole.includes('Jade') ? 'Warehouse Supervisor' :
            currentRole.includes('Romeo') ? 'Ingredient Batching Preparer' :
            currentRole.includes('Mariejohn') ? 'Inventory & Purchasing Manager' :
            currentRole.includes('Grace') ? 'FSCO & QA Director' : 'Chief Operating Authority',
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // WORKFLOW 1: Inbound Receiving Save
  const handleSaveReceiving = (newReport) => {
    setReceivingReports(prev => [newReport, ...prev]);

    // Update perpetual inventory & add lots
    setInventory(prevInv => {
      return prevInv.map(mat => {
        const receivedItem = newReport.items.find(it => it.materialCode === mat.code);
        if (!receivedItem) return mat;

        const addedSec = receivedItem.secondaryQty || 0;
        const newBalance = mat.currentBalance + addedSec;

        // Add or merge lot
        const newLot = {
          lotNumber: receivedItem.lotNumber,
          expiryDate: receivedItem.expiryDate,
          qtySec: addedSec,
          location: receivedItem.binLocation || 'Pallet Staging'
        };

        return {
          ...mat,
          currentBalance: newBalance,
          lots: [newLot, ...(mat.lots || [])]
        };
      });
    });

    recordAudit(
      "INBOUND_RECEIVING",
      `Received PO/DR ${newReport.poNo} from ${newReport.supplier} (Report: ${newReport.reportNo}, Amount: ₱${newReport.totalPaid.toLocaleString()})`
    );

    showToast(`Shipment ${newReport.reportNo} received & inventory updated!`);
    setActiveTab('dashboard');
  };

  // WORKFLOW 2: Stock Withdrawal Save
  const handleSaveWithdrawal = (newWithdrawal) => {
    setWithdrawals(prev => [newWithdrawal, ...prev]);

    // Deduct from perpetual inventory and lot balances
    setInventory(prevInv => {
      return prevInv.map(mat => {
        const issuedItem = newWithdrawal.items.find(it => it.materialCode === mat.code);
        if (!issuedItem) return mat;

        const deductedSec = issuedItem.qtyIssuedSec || 0;
        const newBalance = mat.currentBalance - deductedSec;

        // Deduct from lots in FEFO order
        let remainingToDeduct = deductedSec;
        const updatedLots = (mat.lots || []).map(lot => {
          if (remainingToDeduct <= 0) return lot;
          if (lot.lotNumber === issuedItem.lotNumber || !issuedItem.lotNumber) {
            if (lot.qtySec >= remainingToDeduct) {
              const updated = { ...lot, qtySec: lot.qtySec - remainingToDeduct };
              remainingToDeduct = 0;
              return updated;
            } else {
              remainingToDeduct -= lot.qtySec;
              return { ...lot, qtySec: 0 };
            }
          }
          return lot;
        }).filter(l => l.qtySec > 0);

        return {
          ...mat,
          currentBalance: newBalance,
          lots: updatedLots
        };
      });
    });

    recordAudit(
      "STOCK_OUT_ISSUANCE",
      `Issued Slip ${newWithdrawal.slipNo} to ${newWithdrawal.requestingEntity} (${newWithdrawal.items.length} materials)`
    );

    showToast(`Withdrawal Slip ${newWithdrawal.slipNo} authorized & stock deducted!`);
    setActiveTab('dashboard');
  };

  // WORKFLOW 3: Batch Order Save (Jade or Mariejohn)
  const handleSaveBatchOrder = (newOrder) => {
    setBatchOrders(prev => [newOrder, ...prev]);

    recordAudit(
      "OUTLET_ORDER_INTAKE",
      `Intake batch order ${newOrder.orderId} for ${newOrder.outletName}: ${newOrder.requestedQtyPcs} pcs of ${newOrder.recipeName}`
    );

    showToast(`Order ${newOrder.orderId} queued for Romeo Malusay!`);
  };

  // WORKFLOW 4: Update Batch Order Status (Romeo Malusay)
  const handleUpdateOrderStatus = (orderId, newStatus, tagId = null, batchedKg = 0) => {
    setBatchOrders(prev => prev.map(order => {
      if (order.orderId !== orderId) return order;

      const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

      if (newStatus === 'BATCHED_KITTED') {
        return {
          ...order,
          status: 'BATCHED_KITTED',
          batchTagId: tagId || order.batchTagId || `KIT-${Date.now().toString().slice(-6)}`,
          actualBatchedKg: batchedKg || ((order.requestedQtyPcs * 0.04) + 5),
          actualBatchedUnits: order.requestedQtyPcs,
          batchedAt: nowStr,
          batchedBy: "Romeo B. Malusay",
          scaleUsed: "Bench Scale #1 (Govt Seal #798073) Valid",
          sifter40MeshChecked: true
        };
      } else if (newStatus === 'RELEASED') {
        return {
          ...order,
          status: 'RELEASED',
          releasedAt: nowStr,
          releasedTo: order.outletName.includes('Pan de Verde') ? "Othniel Tilan (Pan de Verde Driver)" : "Roberto S. Blase (Laurice Driver)"
        };
      }
      return { ...order, status: newStatus };
    }));

    recordAudit(
      newStatus === 'BATCHED_KITTED' ? "BATCH_KITTED" : "BATCH_RELEASED",
      `Batch order ${orderId} marked as ${newStatus} by ${currentRole}`
    );

    showToast(`Order ${orderId} updated to ${newStatus}!`);
  };

  // WORKFLOW 5: Collective Release All Completed
  const handleBulkReleaseOrders = () => {
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const count = batchOrders.filter(o => o.status === 'BATCHED_KITTED').length;
    if (count === 0) return;

    setBatchOrders(prev => prev.map(order => {
      if (order.status === 'BATCHED_KITTED') {
        return {
          ...order,
          status: 'RELEASED',
          releasedAt: nowStr,
          releasedTo: order.outletName.includes('Pan de Verde') ? "Othniel Tilan (Pan de Verde Driver)" : "Roberto S. Blase (Laurice Driver)"
        };
      }
      return order;
    }));

    recordAudit(
      "BULK_BATCH_RELEASE",
      `Romeo Malusay collectively marked ${count} recipe mix batches as RELEASED to outlet logistics.`
    );

    showToast(`Successfully released all ${count} completed batches to outlet logistics!`);
  };

  // WORKFLOW 6: Physical Adjustment
  const handleSaveAdjustment = (newAdj) => {
    setAdjustments(prev => [newAdj, ...prev]);

    // Update inventory
    setInventory(prevInv => {
      return prevInv.map(mat => {
        if (mat.code !== newAdj.materialCode) return mat;
        const diff = newAdj.type.includes('OUT') ? -newAdj.qtySec : newAdj.qtySec;
        return {
          ...mat,
          currentBalance: mat.currentBalance + diff
        };
      });
    });

    recordAudit(
      "INVENTORY_ADJUSTMENT",
      `${newAdj.type} for ${newAdj.materialCode}: ${newAdj.qtySec} ${newAdj.uom} (${newAdj.reason})`
    );

    showToast(`Adjustment ${newAdj.id} committed to book balance!`);
  };

  // WORKFLOW 7: Quarantine
  const handleSaveQuarantine = (newNcr) => {
    setQuarantineList(prev => [newNcr, ...prev]);

    recordAudit(
      "QUARANTINE_NCR_FILED",
      `Form-NCR-001 filed: ${newNcr.ncrNo} - ${newNcr.itemDescription} (${newNcr.reason})`
    );

    showToast(`NCR ${newNcr.ncrNo} logged into exterior quarantine cabinet!`);
  };

  // Quick Action from Dashboard
  const handleQuickAction = (action, item = null) => {
    setPrefilledItem(item);
    if (action === 'receiving') setActiveTab('receiving');
    if (action === 'issuance') setActiveTab('issuance');
  };

  // Reset Demo Data
  const handleResetData = () => {
    if (window.confirm("Reset all WMS data back to authentic initial system seeds?")) {
      localStorage.clear();
      setInventory(MASTER_MATERIALS);
      setReceivingReports(INITIAL_RECEIVING_REPORTS);
      setWithdrawals(INITIAL_WITHDRAWALS);
      setBatchOrders(INITIAL_BATCHING_ORDERS);
      setAdjustments(INITIAL_ADJUSTMENTS);
      setQuarantineList(INITIAL_QUARANTINE);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      showToast("Data restored to factory seeds!");
    }
  };

  // JSON Export
  const handleExportJson = () => {
    const backup = {
      system: "JJB Warehouse Inventory System v4.2",
      facility: "Indangan Central Manufacturing Plant (LTO #3000013388488)",
      exportedAt: new Date().toISOString(),
      inventory,
      receivingReports,
      withdrawals,
      batchOrders,
      adjustments,
      quarantineList,
      auditLogs
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `JJB_WMS_BACKUP_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    recordAudit("SYSTEM_BACKUP_EXPORT", "Exported JSON snapshot of all warehouse data");
    showToast("System backup downloaded!");
  };

  // Counts
  const lowStockCount = inventory.filter(i => i.currentBalance <= i.threshold).length;
  const pendingBatchCount = batchOrders.filter(b => b.status === 'PENDING_BATCHING').length;

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2A1B2E] font-sans flex flex-col relative antialiased selection:bg-[#C8963E] selection:text-white">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#1E7A3E] text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-green-300 animate-bounce">
          <CheckCircle2 size={18} />
          <span className="font-bold tracking-wide">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-3 hover:opacity-75 font-bold">✕</button>
        </div>
      )}

      {/* Main Corporate Header & Tab Navigation */}
      <Header
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMode={isMobileMode}
        setIsMobileMode={setIsMobileMode}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        queueCount={0}
        pendingBatchCount={pendingBatchCount}
        lowStockCount={lowStockCount}
        onQuickEod={() => setActiveTab('eod')}
      />

      {/* Main View Container */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* TAB 1: EXECUTIVE COCKPIT & LIVE FEFO */}
        {activeTab === 'dashboard' && (
          <ExecutiveDashboard
            inventory={inventory}
            isMobileMode={isMobileMode}
            onQuickAction={handleQuickAction}
            storageRooms={STORAGE_ROOMS}
          />
        )}

        {/* TAB 2: INBOUND RECEIVING */}
        {activeTab === 'receiving' && (
          <ReceivingModule
            inventory={inventory}
            onSaveReceiving={handleSaveReceiving}
            receivingReports={receivingReports}
            currentRole={currentRole}
            isMobileMode={isMobileMode}
            prefilledItem={prefilledItem}
          />
        )}

        {/* TAB 3: STOCK ISSUANCE */}
        {activeTab === 'issuance' && (
          <IssuanceModule
            inventory={inventory}
            onSaveWithdrawal={handleSaveWithdrawal}
            withdrawals={withdrawals}
            currentRole={currentRole}
            isMobileMode={isMobileMode}
            prefilledItem={prefilledItem}
          />
        )}

        {/* TAB 4: OUTLET KITTING & BATCHING (ROMEO MALUSAY & ORDER INTAKE) */}
        {activeTab === 'batching' && (
          <BatchingWorkbench
            batchOrders={batchOrders}
            onSaveBatchOrder={handleSaveBatchOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onBulkReleaseOrders={handleBulkReleaseOrders}
            recipes={MASTER_RECIPES}
            outlets={OUTLETS}
            inventory={inventory}
            currentRole={currentRole}
            isMobileMode={isMobileMode}
          />
        )}

        {/* TAB 5: ADJUSTMENTS & QUARANTINE */}
        {activeTab === 'adjustments' && (
          <AdjustmentsModule
            inventory={inventory}
            adjustments={adjustments}
            quarantineList={quarantineList}
            onSaveAdjustment={handleSaveAdjustment}
            onSaveQuarantine={handleSaveQuarantine}
            currentRole={currentRole}
          />
        )}

        {/* TAB 6: AUTOMATED END-OF-DAY (EOD) REPORT */}
        {activeTab === 'eod' && (
          <EodReportModule
            receivingReports={receivingReports}
            withdrawals={withdrawals}
            batchOrders={batchOrders}
            inventory={inventory}
            quarantineList={quarantineList}
            currentRole={currentRole}
            onRecordAudit={recordAudit}
          />
        )}

        {/* TAB 7: IMMUTABLE AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <AuditTrailModule
            auditLogs={auditLogs}
            onResetData={handleResetData}
            onExportJson={handleExportJson}
          />
        )}
      </main>

      {/* Corporate Operational Footer */}
      <footer className="bg-[#240e32] text-white py-4 px-6 text-center text-xs border-t border-[#C8963E]/30 mt-auto">
        <div className="max-w-4xl mx-auto space-y-1">
          <p className="font-semibold text-gray-200">
            Jang-Jang Bakeshop &amp; Kingdom Confectionary Business Lines · Manual of Operations Rev. 4.0 WMS Engine
          </p>
          <p className="text-[#E5C585] text-[11px]">
            Indangan Subject Site FDA LTO No. 3000013388488 · Sasa Site LTO No. 3000002291335 · Davao City, Philippines
          </p>
          <p className="text-gray-400 text-[10px]">
            Designed for Jade Q. Dela Cruz (Receiving &amp; Withdrawals) · Romeo B. Malusay (Batching &amp; Releasing) · Mariejohn F. Tacuban (Inventory Reconciliation)
          </p>
        </div>
      </footer>
    </div>
  );
}
