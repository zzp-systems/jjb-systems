import React, { useState, useEffect, useRef } from 'react';
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
  INITIAL_ADJUSTMENTS,
  EOD_EMAIL_RECIPIENTS
} from './data/initialData';

const STORAGE_KEY = 'JJB_WMS_LIVE_V4_4_STATE';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('Jade Q. Dela Cruz');
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [lastAutoDispatchTime, setLastAutoDispatchTime] = useState(null);

  // Hydrate state from localStorage so Jade's & Romeo's November 2026+ updates persist across browser refreshes
  const loadSaved = (key, fallback) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed[key] !== undefined ? parsed[key] : fallback;
    } catch {
      return fallback;
    }
  };

  const [inventory, setInventory] = useState(() => loadSaved('inventory', MASTER_MATERIALS));
  const [receivingReports, setReceivingReports] = useState(() => loadSaved('receivingReports', INITIAL_RECEIVING_REPORTS));
  const [withdrawals, setWithdrawals] = useState(() => loadSaved('withdrawals', INITIAL_WITHDRAWALS));
  const [batchOrders, setBatchOrders] = useState(() => loadSaved('batchOrders', INITIAL_BATCHING_ORDERS));
  const [quarantineList, setQuarantineList] = useState(() => loadSaved('quarantineList', INITIAL_QUARANTINE));
  const [adjustments, setAdjustments] = useState(() => loadSaved('adjustments', INITIAL_ADJUSTMENTS));
  const [auditLogs, setAuditLogs] = useState(() => loadSaved('auditLogs', INITIAL_AUDIT_LOGS));

  const [prefilledItem, setPrefilledItem] = useState(null);
  const lastTriggeredDateRef = useRef(null);

  // Save state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          inventory,
          receivingReports,
          withdrawals,
          batchOrders,
          quarantineList,
          adjustments,
          auditLogs
        })
      );
    } catch (e) {
      console.error('Local storage persistence warning:', e);
    }
  }, [inventory, receivingReports, withdrawals, batchOrders, quarantineList, adjustments, auditLogs]);

  // Header Badge Counts
  const lowStockCount = inventory.filter(i => i.currentBalance <= i.threshold).length;
  const pendingBatchCount = batchOrders.filter(b => b.status === 'PENDING_BATCHING').length;
  const pendingJadeApprovalCount = withdrawals.filter(w => w.status === 'PENDING_APPROVAL').length;

  // Offline Queue Sync Drain Simulation
  useEffect(() => {
    if (queueCount > 0 && !isOffline) {
      const timer = setTimeout(() => setQueueCount(prev => Math.max(0, prev - 1)), 2500);
      return () => clearTimeout(timer);
    }
  }, [queueCount, isOffline]);

  const recordAudit = (action, details) => {
    const newLog = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
      actor: currentRole,
      role: currentRole.includes('Jade')
        ? 'Terminal 1 · Warehouse Supervisor'
        : currentRole.includes('Romeo')
        ? 'Terminal 2 · Ingredient Batching Preparer'
        : 'Terminal 3 · Operations / Management',
      action,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
    if (!isOffline) setQueueCount(prev => prev + 1);
  };

  // --- AUTOMATED 23:45 PHT NIGHTLY EOD SETTLEMENT REPORT WATCHER ---
  useEffect(() => {
    const checkNightly2345Trigger = () => {
      const nowManila = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
      const hours = nowManila.getHours();
      const minutes = nowManila.getMinutes();
      const dateKey = nowManila.toISOString().slice(0, 10);

      if (hours === 23 && minutes === 45 && lastTriggeredDateRef.current !== dateKey) {
        lastTriggeredDateRef.current = dateKey;
        const stamp = nowManila.toLocaleString('en-PH');
        setLastAutoDispatchTime(stamp);
        recordAudit(
          'AUTOMATED_EOD_2345_DISPATCH',
          `Scheduled 23:45 PHT EOD Settlement Report (Inbound Receiving, Floor Withdrawals, and 3-Step Batching Lifecycle) automatically compiled and queued to ${EOD_EMAIL_RECIPIENTS.join(', ')}`
        );
      }
    };

    const intervalId = setInterval(checkNightly2345Trigger, 20000);
    return () => clearInterval(intervalId);
  }, [receivingReports, withdrawals, batchOrders]);

  // 1. Save Inbound Receiving (Form-REC-001)
  const handleSaveReceiving = (report) => {
    setReceivingReports(prev => [report, ...prev]);
    setInventory(prev => prev.map(invItem => {
      const receivedItem = report.items.find(i => i.materialCode === invItem.code);
      if (receivedItem) {
        const damagedNet = (parseFloat(receivedItem.qtyDamaged) || 0) * (receivedItem.conversionFactor || invItem.conversionFactor || 1);
        const netAdded = Math.max(0, receivedItem.secondaryQty - damagedNet);
        const updatedLots = [
          ...(invItem.lots || []),
          {
            lotNumber: receivedItem.lotNumber,
            expiryDate: receivedItem.expiryDate,
            qtySec: netAdded,
            location: receivedItem.binLocation || 'Pallet Staging'
          }
        ].sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

        return {
          ...invItem,
          currentBalance: Number((invItem.currentBalance + netAdded).toFixed(3)),
          lots: updatedLots
        };
      }
      return invItem;
    }));
    recordAudit('INBOUND_RECEIVING', `Logged Form-REC-001 ${report.reportNo} from ${report.supplier} valued at ₱${report.totalPaid?.toLocaleString()}`);
    setActiveTab('dashboard');
  };

  // 2. Save Direct Stock Withdrawal (Form-WAR-001)
  const handleSaveWithdrawal = (slip) => {
    setWithdrawals(prev => [slip, ...prev]);
    if (slip.status !== 'PENDING_APPROVAL') {
      setInventory(prev => prev.map(invItem => {
        const issuedItem = slip.items.find(i => i.materialCode === invItem.code);
        if (issuedItem) {
          return {
            ...invItem,
            currentBalance: Number((invItem.currentBalance - issuedItem.qtyIssuedSec).toFixed(3))
          };
        }
        return invItem;
      }));
    }
    recordAudit('STOCK_OUT_ISSUANCE', `Issued Form-WAR-001 ${slip.slipNo} to ${slip.requestingEntity}`);
  };

  // 3. Step 1 of Batching: Intake Outlet Order (Form-PRO-001)
  const handleSaveBatchOrder = (newOrder) => {
    setBatchOrders(prev => [newOrder, ...prev]);
    recordAudit(
      'BATCH_REQUISITION',
      `Created Form-PRO-001 (${newOrder.orderId}) for ${newOrder.batchMultiplier} Kits of ${newOrder.recipeName} to ${newOrder.outletName}`
    );
  };

  // 4. Step 2A of Batching: Romeo Requests Bulk Raw Materials from Jade (Creates PENDING_APPROVAL Slip in Tab 3)
  const handleRequestBulkMaterials = (order) => {
    const recipe = MASTER_RECIPES.find(r => r.sku === order.recipeSku);
    if (!recipe) return;

    const bulkItems = recipe.ingredients
      .filter(i => !i.isPackaging && !i.isWater && !i.isAsNeeded && i.code !== 'WATER')
      .map(ing => {
        const requiredSec = Number(((ing.gramsPerBatch * order.batchMultiplier) / 1000).toFixed(3)); // g -> kg
        const mat = inventory.find(m => m.code === ing.code);

        return {
          materialCode: ing.code,
          name: ing.name,
          qtyRequestedSec: requiredSec,
          qtyIssuedSec: requiredSec,
          secondaryUom: mat ? mat.secondaryUom : 'kg',
          lotNumber: mat?.lots?.[0]?.lotNumber || 'FEFO-OLDEST-LOT',
          storageRoom: mat?.room || 'Dry Room 1',
          remarks: `Bulk pull for ${order.batchMultiplier} Kits of ${order.recipeName} (${order.orderId})`
        };
      });

    const newSlipNo = `WS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-3)}`;
    const newSlip = {
      slipNo: newSlipNo,
      linkedOrderId: order.orderId,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      requestingEntity: `Terminal 2 · Batching Room (Romeo B. Malusay for ${order.outletName})`,
      department: 'Ingredient Batching & Kitting Partition',
      purpose: `Bulk Material Pull for Order ${order.orderId} (${order.batchMultiplier}x ${order.recipeName})`,
      requestedBy: 'Romeo B. Malusay (Ingredient Batching Preparer)',
      issuedBy: 'Pending Jade Q. Dela Cruz Release',
      receivedBy: 'Romeo B. Malusay',
      items: bulkItems,
      status: 'PENDING_APPROVAL'
    };

    setWithdrawals(prev => [newSlip, ...prev]);
    setBatchOrders(prev => prev.map(o =>
      o.orderId === order.orderId
        ? {
            ...o,
            bulkMaterialsRequested: true,
            bulkRequisitionStatus: 'PENDING_JADE_APPROVAL',
            linkedWithdrawalSlipNo: newSlipNo
          }
        : o
    ));

    recordAudit(
      'BULK_REQUISITION_REQUESTED',
      `Romeo B. Malusay submitted Bulk Material Pull Request (${newSlipNo}) to Jade Q. Dela Cruz for Order ${order.orderId} (${order.batchMultiplier} Kits of ${order.recipeName}).`
    );

    alert(
      `Bulk Material Pull Request (${newSlipNo}) sent to Terminal 1! Jade Q. Dela Cruz can now click "Approve & Release Bulk Lots (FEFO)" in Tab 3 (Stock Release & Issuance) to deduct inventory and unlock Romeo's Scaling Workbench.`
    );
  };

  // 4B. Step 2B of Batching: Jade Approves & Releases Bulk Lots at Dutch Door (Deducts Inventory & Unlocks Romeo's Scale Button)
  const handleApprovePendingWithdrawal = (slipNo) => {
    const targetSlip = withdrawals.find(w => w.slipNo === slipNo);
    if (!targetSlip || targetSlip.status !== 'PENDING_APPROVAL') return;

    // Deduct bulk ingredients from perpetual warehouse inventory
    setInventory(prev => prev.map(invItem => {
      const issuedItem = targetSlip.items.find(i => i.materialCode === invItem.code);
      if (issuedItem) {
        return {
          ...invItem,
          currentBalance: Number((invItem.currentBalance - issuedItem.qtyIssuedSec).toFixed(3))
        };
      }
      return invItem;
    }));

    // Mark Form-WAR-001 slip as ISSUED & RECONCILED
    setWithdrawals(prev => prev.map(w =>
      w.slipNo === slipNo
        ? {
            ...w,
            status: 'ISSUED & RECONCILED',
            issuedBy: 'Jade Q. Dela Cruz (Warehouse Supervisor)'
          }
        : w
    ));

    // Unlock Romeo's "2. Scale & Kit Recipe Mix" button on BatchingWorkbench
    setBatchOrders(prev => prev.map(o => {
      if (
        o.linkedWithdrawalSlipNo === slipNo ||
        o.orderId === targetSlip.linkedOrderId ||
        (targetSlip.purpose && targetSlip.purpose.includes(o.orderId))
      ) {
        return {
          ...o,
          bulkMaterialsRequested: true,
          bulkMaterialsApprovedByJade: true,
          bulkRequisitionStatus: 'BULK_ISSUED_BY_JADE',
          linkedWithdrawalSlipNo: slipNo
        };
      }
      return o;
    }));

    recordAudit(
      'BULK_REQUISITION_APPROVED',
      `Jade Q. Dela Cruz approved Form-WAR-001 (${slipNo}), deducted FEFO bulk lots, and transferred materials across the Dutch door to Romeo B. Malusay.`
    );
  };

  // 5. Step 3 of Batching: Romeo Scales/Kits (Form-ING-001) & Releases to Outlet
  const handleUpdateOrderStatus = (
    orderId,
    newStatus,
    batchTagId = null,
    actualBatchedKg = 0,
    scaleSealUsed = 'Seal #798073 (Bench Scale #1)'
  ) => {
    setBatchOrders(prev => prev.map(order => {
      if (order.orderId === orderId) {
        const assignedDriver = order.outletName.includes('Pan de Verde')
          ? 'Othniel Tilan (Pan de Verde Logistics)'
          : order.outletName.includes('Laurice')
          ? 'Roberto S. Blase (Laurice Logistics)'
          : 'Internal Grey Zone Airlock Transfer';

        return { 
          ...order, 
          status: newStatus,
          batchTagId: batchTagId || order.batchTagId,
          actualBatchedKg: actualBatchedKg || order.actualBatchedKg,
          actualBatchedUnits: order.requestedQtyPcs,
          scaleUsed: scaleSealUsed || order.scaleUsed || 'Seal #798073 (Bench Scale #1)',
          sifter40MeshChecked: true,
          batchedAt: newStatus === 'BATCHED_KITTED' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : order.batchedAt,
          batchedBy: newStatus === 'BATCHED_KITTED' ? 'Romeo B. Malusay' : order.batchedBy,
          releasedAt: newStatus === 'RELEASED' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : order.releasedAt,
          releasedTo: newStatus === 'RELEASED' ? assignedDriver : order.releasedTo
        };
      }
      return order;
    }));

    if (newStatus === 'BATCHED_KITTED') {
      recordAudit('BATCH_KITTED', `Romeo B. Malusay certified Form-ING-001 scaling (${batchTagId}, ${actualBatchedKg} kg on ${scaleSealUsed}) for Order ${orderId}`);
    } else if (newStatus === 'RELEASED') {
      recordAudit('BATCH_RELEASED', `Released sealed batch kit for Order ${orderId} to outlet logistics`);
    }
  };

  const handleBulkReleaseOrders = () => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBatchOrders(prev => prev.map(order => {
      if (order.status === 'BATCHED_KITTED') {
        const assignedDriver = order.outletName.includes('Pan de Verde')
          ? 'Othniel Tilan (Pan de Verde Logistics)'
          : order.outletName.includes('Laurice')
          ? 'Roberto S. Blase (Laurice Logistics)'
          : 'Internal Grey Zone Airlock Transfer';
        return { ...order, status: 'RELEASED', releasedAt: nowTime, releasedTo: assignedDriver };
      }
      return order;
    }));
    recordAudit('BULK_BATCH_RELEASE', 'Collectively released all completed kitted batches to outlet drivers');
  };

  const handleSaveAdjustment = (adj) => {
    setAdjustments(prev => [adj, ...prev]);
    setInventory(prev => prev.map(invItem => {
      if (invItem.code === adj.materialCode) {
        const isOut = adj.type.includes('OUT');
        return {
          ...invItem,
          currentBalance: Number((invItem.currentBalance + (isOut ? -adj.qtySec : adj.qtySec)).toFixed(3))
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

  // CSV Bulk Inventory Update Handler (Supports both newBalanceSec and currentBalance keys)
  const handleImportInventoryCsv = (updates) => {
    setInventory(prev => prev.map(item => {
      const match = updates.find(u => u.code.toUpperCase() === item.code.toUpperCase());
      if (!match) return item;
      const updatedBalance = match.newBalanceSec !== undefined ? match.newBalanceSec : match.currentBalance;
      return {
        ...item,
        currentBalance: !isNaN(updatedBalance) ? updatedBalance : item.currentBalance,
        unitCost: match.unitCost !== undefined ? match.unitCost : item.unitCost
      };
    }));
    recordAudit('CSV_INVENTORY_IMPORT', `Bulk updated ${updates.length} SKU balances via CSV import`);
  };

  const handleQuickAction = (tab, item = null) => {
    setPrefilledItem(item);
    setActiveTab(tab);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all warehouse data to November 2026 baseline seeds?')) {
      localStorage.removeItem(STORAGE_KEY);
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
    a.download = `JJB_Warehouse_Backup_${new Date().toISOString().slice(0, 10)}.json`;
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
        pendingJadeApprovalCount={pendingJadeApprovalCount}
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
            onApprovePendingWithdrawal={handleApprovePendingWithdrawal}
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
            onRequestBulkMaterials={handleRequestBulkMaterials}
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

        {activeTab === 'eod' && (
          <EodReportModule 
            receivingReports={receivingReports} 
            withdrawals={withdrawals} 
            batchOrders={batchOrders} 
            inventory={inventory} 
            quarantineList={quarantineList} 
            currentRole={currentRole} 
            onRecordAudit={recordAudit}
            lastAutoDispatchTime={lastAutoDispatchTime}
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

      <footer className="bg-[#3D1C52] text-white py-4 px-6 text-center text-xs border-t border-[#C8963E]/30 mt-auto print:hidden">
        <p>Jang-Jang Bakeshop & Kingdom Confectionary Business Lines · Manual of Operations Rev. 4.0 WMS Engine</p>
        <p className="text-[#E5C585] mt-1">Terminals 1–3 Active · Deployed on Cloudflare Pages & Google Apps Script Queue-First Architecture</p>
      </footer>
    </div>
  );
}
