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

  // Persistent States
  const [inventory, setInventory] = usePersistentState('JJB_WMS_LIVE_V4_3_INVENTORY', MASTER_MATERIALS);
  const [receivingReports, setReceivingReports] = usePersistentState('JJB_WMS_LIVE_V4_3_RECEIVING', INITIAL_RECEIVING_REPORTS);
  const [withdrawals, setWithdrawals] = usePersistentState('JJB_WMS_LIVE_V4_3_WITHDRAWALS', INITIAL_WITHDRAWALS);
  const [batchOrders, setBatchOrders] = usePersistentState('JJB_WMS_LIVE_V4_3_BATCHING', INITIAL_BATCHING_ORDERS);
  const [quarantineList, setQuarantineList] = usePersistentState('JJB_WMS_LIVE_V4_3_QUARANTINE', INITIAL_QUARANTINE);
  const [adjustments, setAdjustments] = usePersistentState('JJB_WMS_LIVE_V4_3_ADJUSTMENTS', INITIAL_ADJUSTMENTS);
  const [auditLogs, setAuditLogs] = usePersistentState('JJB_WMS_LIVE_V4_3_AUDIT', INITIAL_AUDIT_LOGS);
  const [purchaseOrders, setPurchaseOrders] = usePersistentState('JJB_WMS_LIVE_V4_3_PO', []);

  const [prefilledItem, setPrefilledItem] = useState(null);

  const lowStockCount = inventory.filter(i => i.currentBalance <= i.threshold).length;
  const pendingBatchCount = batchOrders.filter(b => b.status === 'ORDER_PLACED' || b.status === 'BULK_REQUESTED').length;

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
          recordAudit('AUTOMATED_EOD_BROADCAST', 'System 23:45 automatic settlement report triggered and dispatched to stakeholders.');
          // In a real app, this would trigger an API call to your Apps Script emailer
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

  // --- RECEIVING ---
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

  // --- DIRECT ISSUANCE (JADE) ---
  const handleSaveWithdrawal = (slip) => {
    setWithdrawals(prev => [slip, ...prev]);
    setInventory(prev => prev.map(invItem => {
      const issuedItem = slip.items.find(i => i.materialCode === invItem.code);
      if (issuedItem) {
        return { ...invItem, currentBalance: invItem.currentBalance - issuedItem.qtyIssuedSec };
      }
      return invItem;
    }));
    recordAudit('STOCK_OUT_ISSUANCE', `Issued Form-WAR-001 ${slip.slipNo} to ${slip.requestingEntity}`);
  };

  // --- BATCHING (ROMEO) ---
  const handleSaveBatchOrder = (newOrder) => {
    setBatchOrders(prev => [newOrder, ...prev]);
    recordAudit('BATCH_REQUISITION', `Created Form-PRO-001 for ${newOrder.recipeName} to ${newOrder.outletName}`);
  };

  const handleRequestBulkMaterials = (order, bulkReqs) => {
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
      items: bulkReqs.filter(i => !i.isHydrationRef && !i.isAsNeeded && !i.isPackaging).map(ing => ({
        materialCode: ing.code,
        name: ing.name,
        qtyRequestedSec: ing.totalKg,
        qtyIssuedSec: ing.totalKg,
        secondaryUom: ing.secondaryUom,
        lotNumber: ing.oldestLot,
        storageRoom: inventory.find(m => m.code === ing.code)?.room || 'Dry Room 1',
        remarks: `Bulk pull for ${order.kitCount} kits`
      })),
      status: "PENDING_APPROVAL",
      linkedOrderId: order.orderId
    };

    setWithdrawals(prev => [newSlip, ...prev]);
    setBatchOrders(prev => prev.map(o => o.orderId === order.orderId ? { ...o, status: 'BULK_REQUESTED', bulkSlipNo: newSlip.slipNo } : o));
    recordAudit('BULK_REQUESTED', `Romeo requested bulk materials for Order ${order.orderId}. Slip ${newSlip.slipNo} generated.`);
  };

  // --- APPROVAL (JADE) ---
  const handleApproveBulkRelease = (slipNo) => {
    const slip = withdrawals.find(w => w.slipNo === slipNo);
    if (!slip) return;

    // 1. Deduct Inventory
    setInventory(prev => prev.map(invItem => {
      const issuedItem = slip.items.find(i => i.materialCode === invItem.code);
      if (issuedItem) {
        return { ...invItem, currentBalance: invItem.currentBalance - issuedItem.qtyIssuedSec };
      }
      return invItem;
    }));

    // 2. Mark Slip as Issued
    setWithdrawals(prev => prev.map(w => w.slipNo === slipNo ? { ...w, status: 'ISSUED & RECONCILED', issuedBy: 'Jade Q. Dela Cruz' } : w));

    // 3. Update Order Status to Unlock Romeo
    setBatchOrders(prev => prev.map(o => {
      if (o.orderId === slip.linkedOrderId) {
        return { ...o, status: 'BULK_ISSUED_TO_ROMEO', bulkIssuedAt: new Date().toLocaleTimeString(), bulkIssuedBy: 'Jade Q. Dela Cruz' };
      }
      return o;
    }));

    recordAudit('BULK_APPROVED', `Jade approved and released bulk materials for Slip ${slipNo}.`);
  };

  // --- KITTING & RELEASING (ROMEO) ---
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
          releasedAt: newStatus === 'RELEASED' ? new Date().toLocaleTimeString() : order.releasedAt,
        };
      }
      return order;
    }));

    if (newStatus === 'BATCHED_KITTED') {
      recordAudit('BATCH_KITTED', `Certified Form-ING-001 scaling for Order ${orderId}`);
    } else if (newStatus === 'RELEASED') {
      recordAudit('BATCH_RELEASED', `Released batch for Order ${orderId} to outlet driver`);
    }
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

  // --- ADJUSTMENTS ---
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

  // --- PURCHASE ORDERS ---
  const handleSavePO = (po) => {
    setPurchaseOrders(prev => [po, ...prev]);
    recordAudit('PO_GENERATED', `Generated PO ${po.poNo} for ${po.supplier} (${po.items.length} items)`);
  };

  // --- RESET ---
  const handleResetData = () => {
    if (window.confirm("Reset all data to factory seeds?")) {
      setInventory(MASTER_MATERIALS);
      setReceivingReports(INITIAL_RECEIVING_REPORTS);
      setWithdrawals(INITIAL_WITHDRAWALS);
      setBatchOrders(INITIAL_BATCHING_ORDERS);
      setQuarantineList(INITIAL_QUARANTINE);
      setAdjustments(INITIAL_ADJUSTMENTS);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      setPurchaseOrders([]);
      setActiveTab('dashboard');
    }
  };

  const handleExportJson = () => {
    const data = { inventory, receivingReports, withdrawals, batchOrders, quarantineList, adjustments, auditLogs, purchaseOrders };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JJB_Backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const handleQuickAction = (tab, item = null) => {
    setPrefilledItem(item);
    setActiveTab(tab);
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
        lowStockCount={lowStockCount}
        onQuickEod={() => setActiveTab('eod')}
      />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && <ExecutiveDashboard inventory={inventory} isMobileMode={isMobileMode} onQuickAction={handleQuickAction} storageRooms={STORAGE_ROOMS} />}
        
        {activeTab === 'receiving' && <ReceivingModule inventory={inventory} onSaveReceiving={handleSaveReceiving} receivingReports={receivingReports} currentRole={currentRole} isMobileMode={isMobileMode} prefilledItem={prefilledItem} />}

        {activeTab === 'issuance' && <IssuanceModule inventory={inventory} onSaveWithdrawal={handleSaveWithdrawal} onApproveBulkRelease={handleApproveBulkRelease} withdrawals={withdrawals} currentRole={currentRole} isMobileMode={isMobileMode} prefilledItem={prefilledItem} />}

        {activeTab === 'batching' && (
          <BatchingWorkbench 
            batchOrders={batchOrders}
            onSaveBatchOrder={handleSaveBatchOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onBulkReleaseOrders={handleBulkReleaseOrders}
            onRequestBulkMaterials={handleRequestBulkMaterials}
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
            receivingReports={receivingReports}
            withdrawals={withdrawals}
            batchOrders={batchOrders}
            adjustments={adjustments}
            inventory={inventory}
            purchaseOrders={purchaseOrders}
            onSavePO={handleSavePO}
          />
        )}

        {activeTab === 'eod' && <EodReportModule receivingReports={receivingReports} withdrawals={withdrawals} batchOrders={batchOrders} inventory={inventory} quarantineList={quarantineList} currentRole={currentRole} onRecordAudit={recordAudit} />}

        {activeTab === 'audit' && <AuditTrailModule auditLogs={auditLogs} onResetData={handleResetData} onExportJson={handleExportJson} />}
      </main>

      <footer className="bg-[#3D1C52] text-white py-4 px-6 text-center text-xs border-t border-[#C8963E]/30 mt-auto">
        <p>Jang-Jang Bakeshop & Kingdom Confectionary Business Lines · Manual of Operations Rev. 4.0 WMS Engine</p>
        <p className="text-[#E5C585] mt-1">Deployed on Cloudflare Pages & Google Apps Script Queue-First Architecture (`₱0.00 / Month` Stack)</p>
      </footer>
    </div>
  );
}
