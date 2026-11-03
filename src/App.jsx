import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import ReceivingModule from './components/ReceivingModule';
import IssuanceModule from './components/IssuanceModule';
import BatchingWorkbench from './components/BatchingWorkbench';
import AdjustmentsModule from './components/AdjustmentsModule';
import EodReportModule from './components/EodReportModule';
import AuditTrailModule from './components/AuditTrailModule';
import ReportsModule from './components/ReportsModule';

import { MASTER_MATERIALS, STORAGE_ROOMS } from './data/materialsData';
import { MASTER_RECIPES, OUTLETS } from './data/recipesData';
import { 
  INITIAL_RECEIVING_REPORTS, 
  INITIAL_WITHDRAWALS, 
  INITIAL_BATCHING_ORDERS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_QUARANTINE,
  INITIAL_ADJUSTMENTS
} from './data/initialData';

// Custom Hook for LocalStorage persistence
function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('Jade Q. Dela Cruz');
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  // Persistent States (Data survives browser refresh)
  const [inventory, setInventory] = usePersistentState('JJB_WMS_LIVE_V4_4_INVENTORY', MASTER_MATERIALS);
  const [receivingReports, setReceivingReports] = usePersistentState('JJB_WMS_LIVE_V4_4_RECEIVING', INITIAL_RECEIVING_REPORTS);
  const [withdrawals, setWithdrawals] = usePersistentState('JJB_WMS_LIVE_V4_4_WITHDRAWALS', INITIAL_WITHDRAWALS);
  const [batchOrders, setBatchOrders] = usePersistentState('JJB_WMS_LIVE_V4_4_BATCHING', INITIAL_BATCHING_ORDERS);
  const [quarantineList, setQuarantineList] = usePersistentState('JJB_WMS_LIVE_V4_4_QUARANTINE', INITIAL_QUARANTINE);
  const [adjustments, setAdjustments] = usePersistentState('JJB_WMS_LIVE_V4_4_ADJUSTMENTS', INITIAL_ADJUSTMENTS);
  const [auditLogs, setAuditLogs] = usePersistentState('JJB_WMS_LIVE_V4_4_AUDIT', INITIAL_AUDIT_LOGS);

  const [prefilledItem, setPrefilledItem] = useState(null);

  // Derived metrics
  const lowStockCount = inventory.filter(i => i.currentBalance <= i.threshold).length;
  const pendingBatchCount = batchOrders.filter(b => b.status === 'ORDER_PLACED' || b.status === 'BULK_REQUESTED').length;
  const pendingBulkApprovalCount = withdrawals.filter(w => w.status === 'PENDING_APPROVAL').length;

  // Sync simulation
  useEffect(() => {
    if (queueCount > 0 && !isOffline) {
      const timer = setTimeout(() => setQueueCount(prev => prev - 1), 3000);
      return () => clearTimeout(timer);
    }
  }, [queueCount, isOffline]);

  // 23:45 Automated EOD Watcher
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // Check if time is 23:45 and no EOD has been sent today
      if (now.getHours() === 23 && now.getMinutes() === 45) {
        const lastSent = localStorage.getItem('JJB_EOD_SENT_DATE');
        const today = now.toISOString().slice(0, 10);
        if (lastSent !== today) {
          localStorage.setItem('JJB_EOD_SENT_DATE', today);
          recordAudit('AUTOMATED_EOD_BROADCAST', 'System 23:45 PHT automatic settlement report triggered and dispatched to stakeholders.');
          // In production, this would trigger your Apps Script emailer
        }
      }
    }, 30000); // Check every 30 seconds
    return () => clearInterval(timer);
  }, []);

  const recordAudit = (action, details) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
      actor: currentRole,
      role: currentRole.includes('Jade') ? 'Warehouse Supervisor' : 'Operations Personnel',
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
    if (!isOffline) setQueueCount(prev => prev + 1);
  };

  const handleSaveReceiving = (report) => {
    setReceivingReports(prev => [report, ...prev]);
    setInventory(prev => prev.map(invItem => {
      const receivedItem = report.items.find(i => i.materialCode === invItem.code);
      if (receivedItem) {
        const netAdded = receivedItem.secondaryQty - (receivedItem.qtyDamaged * receivedItem.conversionFactor);
        return { ...invItem, currentBalance: invItem.currentBalance + netAdded };
      }
      return invItem;
    }));
    recordAudit('INBOUND_RECEIVING', `Logged Form-REC-001 ${report.reportNo} from ${report.supplier}`);
    setActiveTab('dashboard');
  };

  const handleSaveWithdrawal = (slip) => {
    setWithdrawals(prev => [slip, ...prev]);
    setInventory(prev => prev.map(invItem => {
      const issuedItem = slip.items.find(i => i.materialCode === invItem.code);
      if (issuedItem) return { ...invItem, currentBalance: invItem.currentBalance - issuedItem.qtyIssuedSec };
      return invItem;
    }));
    recordAudit('STOCK_OUT_ISSUANCE', `Issued Form-WAR-001 ${slip.slipNo} to ${slip.requestingEntity}`);
  };

  // --- APPROVAL GATE FIX ---
  const handleApprovePendingWithdrawal = (slipNo) => {
    const slip = withdrawals.find(w => w.slipNo === slipNo);
    if (!slip) return;

    // 1. Deduct Inventory
    setInventory(prev => prev.map(invItem => {
      const issuedItem = slip.items.find(i => i.materialCode === invItem.code);
      if (issuedItem) return { ...invItem, currentBalance: invItem.currentBalance - issuedItem.qtyIssuedSec };
      return invItem;
    }));

    // 2. Mark Slip as Issued
    setWithdrawals(prev => prev.map(w => w.slipNo === slipNo ? { ...w, status: 'ISSUED & RECONCILED', issuedBy: 'Jade Q. Dela Cruz' } : w));

    // 3. Unlock Romeo's Batching Workbench
    setBatchOrders(prev => prev.map(o => {
      if (o.orderId === slip.linkedOrderId) {
        return { ...o, status: 'BULK_ISSUED_TO_ROMEO', bulkMaterialsApprovedByJade: true, bulkIssuedAt: new Date().toLocaleTimeString(), bulkIssuedBy: 'Jade Q. Dela Cruz' };
      }
      return o;
    }));

    recordAudit('BULK_APPROVED', `Jade approved and released bulk materials for Slip ${slipNo}.`);
  };

  // --- BATCHING ---
  const handleSaveBatchOrder = (newOrder) => {
    setBatchOrders(prev => [newOrder, ...prev]);
    recordAudit('BATCH_REQUISITION', `Created Form-PRO-001 for ${newOrder.recipeName} to ${newOrder.outletName}`);
  };

  const handleRequestBulkMaterials = (order) => {
    const recipe = MASTER_RECIPES.find(r => r.sku === order.recipeSku);
    if (!recipe) return;

    const bulkItems = recipe.ingredients.filter(i => !i.isPackaging && i.code !== 'WATER').map(ing => {
      const requiredSec = (ing.gramsPerBatch * order.batchMultiplier) / 1000;
      const mat = inventory.find(m => m.code === ing.code);
      return {
        materialCode: ing.code,
        name: ing.name,
        qtyRequestedSec: requiredSec,
        qtyIssuedSec: requiredSec,
        secondaryUom: mat ? mat.secondaryUom : 'kg',
        lotNumber: mat?.lots?.[0]?.lotNumber || 'FEFO-LOT',
        storageRoom: mat?.room || 'Dry Room 1',
        remarks: `Bulk requisition for Batch Order ${order.orderId}`
      };
    });

    const newSlip = {
      slipNo: `BRQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-3)}`,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      requestingEntity: 'Romeo B. Malusay (Batching Room)',
      department: 'Dry Room 2 Batching Partition',
      purpose: `Bulk Pull for Order ${order.orderId} (${order.recipeName})`,
      requestedBy: 'Romeo B. Malusay',
      issuedBy: 'Jade Q. Dela Cruz (Pending Approval)',
      receivedBy: 'Romeo B. Malusay',
      items: bulkItems,
      status: "PENDING_APPROVAL",
      linkedOrderId: order.orderId
    };

    setWithdrawals(prev => [newSlip, ...prev]);
    setBatchOrders(prev => prev.map(o => o.orderId === order.orderId ? { ...o, status: 'BULK_REQUESTED', bulkMaterialsRequested: true, linkedWithdrawalSlipNo: newSlip.slipNo } : o));
    recordAudit('BULK_REQUESTED', `Romeo requested bulk materials for Order ${order.orderId}. Slip ${newSlip.slipNo} generated.`);
    
    alert("Bulk Material Request sent to Jade! Inventory will be locked until Jade approves it in the 'Stock Release' tab.");
  };

  const handleUpdateOrderStatus = (orderId, newStatus, batchTagId = null, actualBatchedKg = 0) => {
    setBatchOrders(prev => prev.map(order => {
      if (order.orderId === orderId) {
        return { 
          ...order, 
          status: newStatus,
          batchTagId: batchTagId || order.batchTagId,
          actualBatchedKg: actualBatchedKg || order.actualBatchedKg,
          actualBatchedUnits: order.requestedQtyPcs,
          batchedAt: newStatus === 'BATCHED_KITTED' ? new Date().toLocaleTimeString() : order.batchedAt,
          batchedBy: newStatus === 'BATCHED_KITTED' ? currentRole : order.batchedBy,
          sifter40MeshChecked: newStatus === 'BATCHED_KITTED' ? true : order.sifter40MeshChecked,
          releasedAt: newStatus === 'RELEASED' ? new Date().toLocaleTimeString() : order.releasedAt,
        };
      }
      return order;
    }));

    if (newStatus === 'BATCHED_KITTED') recordAudit('BATCH_KITTED', `Certified Form-ING-001 scaling for Order ${orderId}`);
    if (newStatus === 'RELEASED') recordAudit('BATCH_RELEASED', `Released batch for Order ${orderId} to outlet driver`);
  };

  const handleBulkReleaseOrders = () => {
    setBatchOrders(prev => prev.map(order => {
      if (order.status === 'BATCHED_KITTED') {
        return { ...order, status: 'RELEASED', releasedAt: new Date().toLocaleTimeString() };
      }
      return order;
    }));
    recordAudit('BULK_BATCH_RELEASE', `Collectively released all ready kitted batches to outlets`);
  };

  const handleSaveAdjustment = (adj) => {
    setAdjustments(prev => [adj, ...prev]);
    setInventory(prev => prev.map(invItem => {
      if (invItem.code === adj.materialCode) {
        const isOut = adj.type.includes('OUT');
        return { ...invItem, currentBalance: invItem.currentBalance + (isOut ? -adj.qtySec : adj.qtySec) };
      }
      return invItem;
    }));
    recordAudit('INVENTORY_ADJUSTMENT', `Logged ${adj.type} for ${adj.materialCode}`);
  };

  const handleSaveQuarantine = (ncr) => {
    setQuarantineList(prev => [ncr, ...prev]);
    recordAudit('QUARANTINE_NCR', `Filed Form-NCR-001 ${ncr.ncrNo} for ${ncr.itemDescription}`);
  };

  const handleQuickAction = (tab, item = null) => {
    setPrefilledItem(item);
    setActiveTab(tab);
  };

  const handleImportInventoryCsv = (updates) => {
    setInventory(prev => prev.map(item => {
      const update = updates.find(u => u.code === item.code);
      if (update) return { ...item, currentBalance: update.newBalanceSec };
      return item;
    }));
    recordAudit('CSV_INVENTORY_IMPORT', `Imported ${updates.length} SKU balances via CSV upload.`);
  };

  const handleResetData = () => {
    if (window.confirm("Reset all data to factory seeds?")) {
      setInventory(MASTER_MATERIALS);
      setReceivingReports(INITIAL_RECEIVING_REPORTS);
      setWithdrawals(INITIAL_WITHDRAWALS);
      setBatchOrders(INITIAL_BATCHING_ORDERS);
      setQuarantineList(INITIAL_QUARANTINE);
      setAdjustments(INITIAL_ADJUSTMENTS);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      setActiveTab('dashboard');
    }
  };

  const handleExportJson = () => {
    const data = { inventory, receivingReports, withdrawals, batchOrders, quarantineList, adjustments, auditLogs };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JJB_Backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2A1B2E] font-sans flex flex-col">
      <Header 
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileMode={isMobileMode}
        setIsMobileMode={setIsMobileMode}
        isOffline={isOffline}
        setIsOffline={setIsOffline}
        queueCount={queueCount}
        pendingBatchCount={pendingBatchCount}
        pendingBulkApprovalCount={pendingBulkApprovalCount}
        lowStockCount={lowStockCount}
        onQuickEod={() => setActiveTab('eod')}
      />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && <ExecutiveDashboard inventory={inventory} isMobileMode={isMobileMode} onQuickAction={handleQuickAction} storageRooms={STORAGE_ROOMS} />}
        
        {activeTab === 'receiving' && <ReceivingModule inventory={inventory} onSaveReceiving={handleSaveReceiving} receivingReports={receivingReports} currentRole={currentRole} isMobileMode={isMobileMode} prefilledItem={prefilledItem} />}

        {activeTab === 'issuance' && <IssuanceModule inventory={inventory} onSaveWithdrawal={handleSaveWithdrawal} onApprovePendingWithdrawal={handleApprovePendingWithdrawal} withdrawals={withdrawals} currentRole={currentRole} isMobileMode={isMobileMode} prefilledItem={prefilledItem} />}

        {activeTab === 'batching' && (
          <BatchingWorkbench 
            batchOrders={batchOrders}
            onSaveBatchOrder={handleSaveBatchOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onBulkReleaseOrders={handleBulkReleaseOrders}
            onRequestBulkMaterials={handleRequestBulkMaterials}
            onApproveBulkFromWorkbench={(order) => handleApprovePendingWithdrawal(order.linkedWithdrawalSlipNo)}
            recipes={MASTER_RECIPES}
            outlets={OUTLETS}
            inventory={inventory}
            currentRole={currentRole}
            isMobileMode={isMobileMode}
          />
        )}

        {activeTab === 'adjustments' && <AdjustmentsModule inventory={inventory} adjustments={adjustments} quarantineList={quarantineList} onSaveAdjustment={handleSaveAdjustment} onSaveQuarantine={handleSaveQuarantine} currentRole={currentRole} />}

        {activeTab === 'reports' && (
          <ReportsModule 
            inventory={inventory}
            receivingReports={receivingReports}
            withdrawals={withdrawals}
            batchOrders={batchOrders}
            adjustments={adjustments}
            onImportInventoryCsv={handleImportInventoryCsv}
          />
        )}

        {activeTab === 'eod' && <EodReportModule receivingReports={receivingReports} withdrawals={withdrawals} batchOrders={batchOrders} inventory={inventory} quarantineList={quarantineList} currentRole={currentRole} onRecordAudit={recordAudit} />}

        {activeTab === 'audit' && <AuditTrailModule auditLogs={auditLogs} onResetData={handleResetData} onExportJson={handleExportJson} />}
      </main>

      <footer className="bg-[#3D1C52] text-white py-4 px-6 text-center text-xs border-t border-[#C8963E]/30 mt-auto print:hidden">
        <p>Jang-Jang Bakeshop & Kingdom Confectionary Business Lines · Manual of Operations Rev. 4.0 WMS Engine</p>
        <p className="text-[#E5C585] mt-1">Deployed on Cloudflare Pages & Google Apps Script Queue-First Architecture (`₱0.00 / Month` Stack)</p>
      </footer>
    </div>
  );
}
