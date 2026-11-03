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
  INITIAL_AUDIT_LOGS,
  INITIAL_QUARANTINE,
  INITIAL_ADJUSTMENTS
} from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('Jade Q. Dela Cruz');
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  const [inventory, setInventory] = useState(MASTER_MATERIALS);
  const [receivingReports, setReceivingReports] = useState(INITIAL_RECEIVING_REPORTS);
  const [withdrawals, setWithdrawals] = useState(INITIAL_WITHDRAWALS);
  const [batchOrders, setBatchOrders] = useState(INITIAL_BATCHING_ORDERS);
  const [quarantineList, setQuarantineList] = useState(INITIAL_QUARANTINE);
  const [adjustments, setAdjustments] = useState(INITIAL_ADJUSTMENTS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  const [prefilledItem, setPrefilledItem] = useState(null);

  const lowStockCount = inventory.filter(i => i.currentBalance <= i.threshold).length;
  const pendingBatchCount = batchOrders.filter(b => b.status === 'PENDING_BATCHING').length;

  useEffect(() => {
    if (queueCount > 0 && !isOffline) {
      const timer = setTimeout(() => setQueueCount(prev => prev - 1), 3000);
      return () => clearTimeout(timer);
    }
  }, [queueCount, isOffline]);

  const recordAudit = (action, details) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
      actor: currentRole,
      role: currentRole === 'Jade Q. Dela Cruz' ? 'Warehouse Supervisor' : 'Operations Personnel',
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
    recordAudit('INBOUND_RECEIVING', `Logged Form-REC-001 ${report.reportNo} from ${report.supplier} valued at ₱${report.totalPaid.toLocaleString()}`);
    setActiveTab('dashboard');
  };

  const handleSaveWithdrawal = (slip) => {
    setWithdrawals(prev => [slip, ...prev]);
    setInventory(prev => prev.map(invItem => {
      const issuedItem = slip.items.find(i => i.materialCode === invItem.code);
      if (issuedItem) {
        return { ...invItem, currentBalance: invItem.currentBalance - issuedItem.qtyIssuedSec };
      }
      return invItem;
    }));
    recordAudit('STOCK_OUT_ISSUANCE', `Logged Form-WAR-001 ${slip.slipNo} for ${slip.requestingEntity}`);
  };

  const handleSaveBatchOrder = (newOrder) => {
    setBatchOrders(prev => [newOrder, ...prev]);
    recordAudit('BATCH_REQUISITION', `Created Form-PRO-001 for ${newOrder.recipeName} to ${newOrder.outletName}`);
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

  const handleSaveAdjustment = (adj) => {
    setAdjustments(prev => [adj, ...prev]);
    setInventory(prev => prev.map(invItem => {
      if (invItem.code === adj.materialCode) {
        const isOut = adj.type.includes('OUT');
        return { 
          ...invItem, 
          currentBalance: invItem.currentBalance + (isOut ? -adj.qtySec : adj.qtySec) 
        };
      }
      return invItem;
    }));
    recordAudit('INVENTORY_ADJUSTMENT', `Logged ${adj.type} for ${adj.materialCode} (${adj.qtySec} ${adj.uom})`);
  };

  const handleSaveQuarantine = (ncr) => {
    setQuarantineList(prev => [ncr, ...prev]);
    recordAudit('QUARANTINE_NCR', `Filed Form-NCR-001 ${ncr.ncrNo} for ${ncr.itemDescription}`);
  };

  const handleQuickAction = (tab, item = null) => {
    setPrefilledItem(item);
    setActiveTab(tab);
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all data to factory seeds?")) {
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
        lowStockCount={lowStockCount}
        onQuickEod={() => setActiveTab('eod')}
      />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <ExecutiveDashboard 
            inventory={inventory}
            isMobileMode={isMobileMode}
            onQuickAction={handleQuickAction}
            storageRooms={STORAGE_ROOMS}
          />
        )}
        
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

        {activeTab === 'audit' && (
          <AuditTrailModule 
            auditLogs={auditLogs}
            onResetData={handleResetData}
            onExportJson={handleExportJson}
          />
        )}
      </main>

      <footer className="bg-[#3D1C52] text-white py-4 px-6 text-center text-xs border-t border-[#C8963E]/30 mt-auto">
        <p>Jang-Jang Bakeshop & Kingdom Confectionary Business Lines · Manual of Operations Rev. 4.0 WMS Engine</p>
        <p className="text-[#E5C585] mt-1">Deployed on Cloudflare Pages & Google Apps Script Queue-First Architecture (`₱0.00 / Month` Stack)</p>
      </footer>
    </div>
  );
}
