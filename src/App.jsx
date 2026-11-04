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

const STORAGE_KEY = 'JJB_WMS_LIVE_V4_6_STATE';
const WORKER_SYNC_URL = '/api/sync';
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwBll5ZKuiBO0wX9WSXGRd-Tua4QpxbfKAcrnWhVmdkjkU_3mnwgI7bX-iiRgjHlkYa/exec';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('Jade Q. Dela Cruz');
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [lastAutoDispatchTime, setLastAutoDispatchTime] = useState(null);
  const [liveToast, setLiveToast] = useState(null);

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
  const lastPolledTimestampRef = useRef(0);
  const processedQueueIdsRef = useRef(new Set());

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          inventory, receivingReports, withdrawals, batchOrders, quarantineList, adjustments, auditLogs
        })
      );
    } catch (e) {}
  }, [inventory, receivingReports, withdrawals, batchOrders, quarantineList, adjustments, auditLogs]);

  const lowStockCount = inventory.filter(i => i.currentBalance <= i.threshold).length;
  const pendingBatchCount = batchOrders.filter(b => b.status === 'PENDING_BATCHING').length;
  const pendingJadeApprovalCount = withdrawals.filter(w => w.status === 'PENDING_APPROVAL').length;

  useEffect(() => {
    if (queueCount > 0 && !isOffline) {
      const timer = setTimeout(() => setQueueCount(prev => Math.max(0, prev - 1)), 2000);
      return () => clearTimeout(timer);
    }
  }, [queueCount, isOffline]);

  const recordAudit = (action, details, payloadData = {}) => {
    const queueId = `Q-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    processedQueueIdsRef.current.add(queueId);

    const roleLabel = currentRole.includes('Jade')
      ? 'Terminal 1 · Warehouse Supervisor'
      : currentRole.includes('Romeo')
      ? 'Terminal 2 · Ingredient Batching Preparer'
      : 'Terminal 3 · Operations / Management';

    const newLog = {
      id: queueId,
      timestamp: new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
      actor: currentRole,
      role: roleLabel,
      action,
      details
    };

    setAuditLogs(prev => [newLog, ...prev]);

    if (!isOffline) {
      setQueueCount(prev => prev + 1);
      const envelope = {
        queueId,
        timestamp: newLog.timestamp,
        terminalId: roleLabel.split('·')[0].trim(),
        actorName: currentRole,
        actorRole: roleLabel,
        actionType: action,
        details,
        payload: payloadData
      };

      fetch(WORKER_SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envelope)
      }).catch(() => {
        fetch(GAS_WEB_APP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(envelope),
          mode: 'no-cors'
        }).catch(() => {});
      });
    }
  };

  useEffect(() => {
    if (isOffline) return;

    const ingestIncomingEvent = (ev) => {
      if (!ev || !ev.queueId || processedQueueIdsRef.current.has(ev.queueId)) return;
      processedQueueIdsRef.current.add(ev.queueId);

      const p = ev.payload || {};
      let notificationMsg = null;

      if (ev.actionType === 'BATCH_REQUISITION' && p.orderId) {
        setBatchOrders(prev => {
          if (prev.some(o => o.orderId === p.orderId)) return prev;
          notificationMsg = `New Outlet Kit Order: ${p.outletName} requested ${p.batchMultiplier}x ${p.recipeName} (${p.orderId})`;
          return [p, ...prev];
        });
      } else if (ev.actionType === 'BULK_REQUISITION_REQUESTED' && p.slipNo) {
        setWithdrawals(prev => {
          if (prev.some(w => w.slipNo === p.slipNo)) return prev;
          notificationMsg = `New Material Pull Request: ${p.requestingEntity} (${p.slipNo}) awaiting Jade's approval`;
          return [p, ...prev];
        });
      }

      if (notificationMsg) {
        setLiveToast(notificationMsg);
        setTimeout(() => setLiveToast(null), 6000);
      }

      setAuditLogs(prev => [
        {
          id: ev.queueId,
          timestamp: ev.timestamp || new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
          actor: ev.actorName || 'Outlet Portal',
          role: ev.actorRole || 'Outlet Requisitioner',
          action: ev.actionType,
          details: ev.details || `Incoming live order (${p.orderId || p.slipNo})`
        },
        ...prev
      ]);
    };

    const pollEdgeWorkerAndInbox = async () => {
      try {
        const localInbox = JSON.parse(localStorage.getItem('JJB_PORTAL_INBOX') || '[]');
        if (localInbox.length > 0) {
          localInbox.forEach(ingestIncomingEvent);
          localStorage.removeItem('JJB_PORTAL_INBOX');
        }
      } catch (e) {}

      try {
        const res = await fetch(`${WORKER_SYNC_URL}?since=${lastPolledTimestampRef.current}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.events) && data.events.length > 0) {
            data.events.forEach(ingestIncomingEvent);
            lastPolledTimestampRef.current = data.serverTimeMs || Date.now();
          }
        }
      } catch (e) {}
    };

    const pollTimer = setInterval(pollEdgeWorkerAndInbox, 4000);
    return () => clearInterval(pollTimer);
  }, [isOffline]);

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
          `Scheduled 23:45 PHT EOD Settlement Report automatically compiled and queued to ${EOD_EMAIL_RECIPIENTS.join(', ')}`,
          { date: dateKey, recipients: EOD_EMAIL_RECIPIENTS }
        );
      }
    };

    const intervalId = setInterval(checkNightly2345Trigger, 20000);
    return () => clearInterval(intervalId);
  }, [receivingReports, withdrawals, batchOrders]);

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

        return { ...invItem, currentBalance: Number((invItem.currentBalance + netAdded).toFixed(3)), lots: updatedLots };
      }
      return invItem;
    }));
    recordAudit('INBOUND_RECEIVING', `Logged Form-REC-001 ${report.reportNo} from ${report.supplier}`, report);
    setActiveTab('dashboard');
  };

  const handleSaveWithdrawal = (slip) => {
    setWithdrawals(prev => [slip, ...prev]);
    if (slip.status !== 'PENDING_APPROVAL') {
      setInventory(prev => prev.map(invItem => {
        const issuedItem = slip.items.find(i => i.materialCode === invItem.code);
        if (issuedItem) {
          return { ...invItem, currentBalance: Number((invItem.currentBalance - issuedItem.qtyIssuedSec).toFixed(3)) };
        }
        return invItem;
      }));
    }
    recordAudit('STOCK_OUT_ISSUANCE', `Issued Form-WAR-001 ${slip.slipNo} to ${slip.requestingEntity}`, slip);
  };

  const handleSaveBatchOrder = (newOrder) => {
    setBatchOrders(prev => [newOrder, ...prev]);
    recordAudit('BATCH_REQUISITION', `Created Form-PRO-001 (${newOrder.orderId}) for ${newOrder.batchMultiplier} Kits to ${newOrder.outletName}`, newOrder);
  };

  const handleRequestBulkMaterials = (order) => {
    const recipe = MASTER_RECIPES.find(r => r.sku === order.recipeSku);
    if (!recipe) return;

    const bulkItems = recipe.ingredients
      .filter(i => !i.isPackaging && !i.isWater && !i.isAsNeeded && i.code !== 'WATER')
      .map(ing => {
        const requiredSec = Number(((ing.gramsPerBatch * order.batchMultiplier) / 1000).toFixed(3));
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
      requestingEntity: `Terminal 2 · Batching Room (Romeo for ${order.outletName})`,
      department: 'Ingredient Batching & Kitting Partition',
      purpose: `Bulk Material Pull for Order ${order.orderId} (${order.batchMultiplier}x ${order.recipeName})`,
      requestedBy: 'Romeo B. Malusay (Ingredient Batching Preparer)',
      issuedBy: 'Pending Jade Q. Dela Cruz Release',
      receivedBy: 'Romeo B. Malusay',
      items: bulkItems,
      status: 'PENDING_APPROVAL'
    };

    const updatedOrder = {
      ...order,
      bulkMaterialsRequested: true,
      bulkRequisitionStatus: 'PENDING_JADE_APPROVAL',
      linkedWithdrawalSlipNo: newSlipNo
    };

    setWithdrawals(prev => [newSlip, ...prev]);
    setBatchOrders(prev => prev.map(o => o.orderId === order.orderId ? updatedOrder : o));

    recordAudit('BULK_REQUISITION_REQUESTED', `Romeo submitted Bulk Pull Request (${newSlipNo}) to Jade for Order ${order.orderId}`, { ...newSlip, orderId: order.orderId });
    alert(`Bulk Material Pull Request (${newSlipNo}) sent to Terminal 1! Jade can now approve it in Tab 3.`);
  };

  const handleApprovePendingWithdrawal = (slipNo) => {
    const targetSlip = withdrawals.find(w => w.slipNo === slipNo);
    if (!targetSlip || targetSlip.status !== 'PENDING_APPROVAL') return;

    setInventory(prev => prev.map(invItem => {
      const issuedItem = targetSlip.items.find(i => i.materialCode === invItem.code);
      if (issuedItem) {
        return { ...invItem, currentBalance: Number((invItem.currentBalance - issuedItem.qtyIssuedSec).toFixed(3)) };
      }
      return invItem;
    }));

    const approvedSlip = { ...targetSlip, status: 'ISSUED & RECONCILED', issuedBy: 'Jade Q. Dela Cruz (Warehouse Supervisor)' };
    setWithdrawals(prev => prev.map(w => w.slipNo === slipNo ? approvedSlip : w));

    setBatchOrders(prev => prev.map(o => {
      if (o.linkedWithdrawalSlipNo === slipNo || o.orderId === targetSlip.linkedOrderId) {
        return { ...o, bulkMaterialsRequested: true, bulkMaterialsApprovedByJade: true, bulkRequisitionStatus: 'BULK_ISSUED_BY_JADE', linkedWithdrawalSlipNo: slipNo };
      }
      return o;
    }));

    recordAudit('BULK_REQUISITION_APPROVED', `Jade approved Form-WAR-001 (${slipNo}), deducted FEFO lots, and transferred to Romeo.`, approvedSlip);
  };

  const handleUpdateOrderStatus = (orderId, newStatus, batchTagId = null, actualBatchedKg = 0, scaleSealUsed = 'Seal #798073 (Bench Scale #1)') => {
    let updatedOrderSnapshot = null;

    setBatchOrders(prev => prev.map(order => {
      if (order.orderId === orderId) {
        const assignedDriver = order.outletName.includes('Pan de Verde') ? 'Othniel Tilan (Pan de Verde Logistics)' : order.outletName.includes('Laurice') ? 'Roberto S. Blase (Laurice Logistics)' : 'Internal Grey Zone Airlock Transfer';
        updatedOrderSnapshot = { 
          ...order, 
          status: newStatus,
          batchTagId: batchTagId || order.batchTagId,
          actualBatchedKg: actualBatchedKg || order.actualBatchedKg,
          actualBatchedUnits: order.requestedQtyPcs,
          scaleUsed: scaleSealUsed || order.scaleUsed,
          sifter40MeshChecked: true,
          batchedAt: newStatus === 'BATCHED_KITTED' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : order.batchedAt,
          batchedBy: newStatus === 'BATCHED_KITTED' ? 'Romeo B. Malusay' : order.batchedBy,
          releasedAt: newStatus === 'RELEASED' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : order.releasedAt,
          releasedTo: newStatus === 'RELEASED' ? assignedDriver : order.releasedTo
        };
        return updatedOrderSnapshot;
      }
      return order;
    }));

    if (newStatus === 'BATCHED_KITTED') recordAudit('BATCH_KITTED', `Romeo certified Form-ING-001 scaling (${batchTagId}, ${actualBatchedKg} kg) for Order ${orderId}`, updatedOrderSnapshot);
    if (newStatus === 'RELEASED') recordAudit('BATCH_RELEASED', `Released sealed batch kit for Order ${orderId} to outlet logistics`, updatedOrderSnapshot);
  };

  const handleBulkReleaseOrders = () => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const releasedBatchPayload = [];

    setBatchOrders(prev => prev.map(order => {
      if (order.status === 'BATCHED_KITTED') {
        const assignedDriver = order.outletName.includes('Pan de Verde') ? 'Othniel Tilan (Pan de Verde Logistics)' : order.outletName.includes('Laurice') ? 'Roberto S. Blase (Laurice Logistics)' : 'Internal Grey Zone Airlock Transfer';
        const rel = { ...order, status: 'RELEASED', releasedAt: nowTime, releasedTo: assignedDriver };
        releasedBatchPayload.push(rel);
        return rel;
      }
      return order;
    }));

    recordAudit('BULK_BATCH_RELEASE', `Collectively released ${releasedBatchPayload.length} completed kitted batches to outlet drivers`, { orders: releasedBatchPayload });
  };

  const handleSaveAdjustment = (adj) => {
    setAdjustments(prev => [adj, ...prev]);
    setInventory(prev => prev.map(invItem => {
      if (invItem.code === adj.materialCode) {
        const isOut = adj.type.includes('OUT');
        return { ...invItem, currentBalance: Number((invItem.currentBalance + (isOut ? -adj.qtySec : adj.qtySec)).toFixed(3)) };
      }
      return invItem;
    }));
    recordAudit('INVENTORY_ADJUSTMENT', `Logged ${adj.type} for ${adj.materialCode} (${adj.qtySec} ${adj.uom})`, adj);
  };

  const handleSaveQuarantine = (ncr) => {
    setQuarantineList(prev => [ncr, ...prev]);
    recordAudit('QUARANTINE_NCR', `Filed Form-NCR-001 ${ncr.ncrNo} for ${ncr.itemDescription}`, ncr);
  };

  const handleImportInventoryCsv = (updates) => {
    setInventory(prev => prev.map(item => {
      const match = updates.find(u => u.code.toUpperCase() === item.code.toUpperCase());
      if (!match) return item;
      const updatedBalance = match.newBalanceSec !== undefined ? match.newBalanceSec : match.currentBalance;
      return { ...item, currentBalance: !isNaN(updatedBalance) ? updatedBalance : item.currentBalance, unitCost: match.unitCost !== undefined ? match.unitCost : item.unitCost };
    }));
    recordAudit('CSV_INVENTORY_IMPORT', `Bulk updated ${updates.length} SKU balances via CSV import`, { count: updates.length });
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
        pendingBulkApprovalCount={pendingJadeApprovalCount}
        lowStockCount={lowStockCount}
        onQuickEod={() => setActiveTab('eod')}
      />

      {liveToast && (
        <div className="bg-[#1E7A3E] text-white px-4 py-2.5 text-xs font-bold text-center shadow-lg animate-bounce flex items-center justify-center gap-2 print:hidden">
          <span>🔔 LIVE OUTLET PORTAL SYNC: {liveToast}</span>
          <button onClick={() => setLiveToast(null)} className="ml-3 underline text-[11px]">Dismiss</button>
        </div>
      )}

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && <ExecutiveDashboard inventory={inventory} isMobileMode={isMobileMode} onQuickAction={handleQuickAction} storageRooms={STORAGE_ROOMS} />}
        {activeTab === 'receiving' && <ReceivingModule inventory={inventory} onSaveReceiving={handleSaveReceiving} receivingReports={receivingReports} currentRole={currentRole} isMobileMode={isMobileMode} prefilledItem={prefilledItem} />}
        {activeTab === 'issuance' && <IssuanceModule inventory={inventory} onSaveWithdrawal={handleSaveWithdrawal} onApprovePendingWithdrawal={handleApprovePendingWithdrawal} withdrawals={withdrawals} currentRole={currentRole} isMobileMode={isMobileMode} prefilledItem={prefilledItem} />}
        {activeTab === 'batching' && (
          <BatchingWorkbench 
            batchOrders={batchOrders} onSaveBatchOrder={handleSaveBatchOrder} onUpdateOrderStatus={handleUpdateOrderStatus} onBulkReleaseOrders={handleBulkReleaseOrders}
            onRequestBulkMaterials={handleRequestBulkMaterials} recipes={MASTER_RECIPES} outlets={OUTLETS} inventory={inventory} currentRole={currentRole} isMobileMode={isMobileMode}
          />
        )}
        {activeTab === 'adjustments' && <AdjustmentsModule inventory={inventory} adjustments={adjustments} quarantineList={quarantineList} onSaveAdjustment={handleSaveAdjustment} onSaveQuarantine={handleSaveQuarantine} currentRole={currentRole} />}
        {activeTab === 'reports' && <ReportsModule inventory={inventory} receivingReports={receivingReports} withdrawals={withdrawals} batchOrders={batchOrders} adjustments={adjustments} onImportInventoryCsv={handleImportInventoryCsv} currentRole={currentRole} onRecordAudit={recordAudit} />}
        {activeTab === 'eod' && <EodReportModule receivingReports={receivingReports} withdrawals={withdrawals} batchOrders={batchOrders} inventory={inventory} quarantineList={quarantineList} currentRole={currentRole} onRecordAudit={recordAudit} lastAutoDispatchTime={lastAutoDispatchTime} />}
        {activeTab === 'audit' && <AuditTrailModule auditLogs={auditLogs} onResetData={handleResetData} onExportJson={handleExportJson} />}
      </main>

      <footer className="bg-[#3D1C52] text-white py-4 px-6 text-center text-xs border-t border-[#C8963E]/30 mt-auto print:hidden">
        <p>Jang-Jang Bakeshop & Kingdom Confectionary Business Lines · Manual of Operations Rev. 4.0 WMS Engine</p>
        <p className="text-[#E5C585] mt-1">
          Terminals 1–3 Active · Cloudflare Worker Edge API (`/api/sync`) + Google Sheets Master Ledger · <a href="/outlet-portal.html" target="_blank" rel="noreferrer" className="underline font-bold text-white hover:text-[#C8963E]">Open Outlet Requisition Portal ↗</a>
        </p>
      </footer>
    </div>
  );
}
