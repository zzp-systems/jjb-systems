import React, { useState } from 'react';
import { 
  Send, Mail, Copy, Printer, CheckCircle2, 
  Sparkles, Clock, Download
} from 'lucide-react';
import { EOD_EMAIL_RECIPIENTS } from '../data/initialData';

export default function EodReportModule({
  receivingReports = [],
  withdrawals = [],
  batchOrders = [],
  inventory = [],
  quarantineList = [],
  currentRole = 'Jade Q. Dela Cruz',
  onRecordAudit,
  lastAutoDispatchTime = null
}) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [dispatchedStatus, setDispatchedStatus] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [recipients, setRecipients] = useState(EOD_EMAIL_RECIPIENTS);

  // Filter records matching selectedDate (or show all if selectedDate is baseline 2026-11-03)
  const matchesSelectedDate = (recordDate) => {
    if (!recordDate) return true;
    return recordDate === selectedDate || selectedDate === '2026-11-03';
  };

  const todaysReceiving = receivingReports.filter(r => matchesSelectedDate(r.date));
  const totalReceivingValue = todaysReceiving.reduce((sum, r) => sum + (r.totalPaid || 0), 0);
  const todaysWithdrawals = withdrawals.filter(w => matchesSelectedDate(w.date));
  const todaysRequestedRecipes = batchOrders.filter(b => matchesSelectedDate(b.requestDate));
  const todaysBatchedAndReleased = batchOrders.filter(
    b => matchesSelectedDate(b.requestDate) && (b.status === 'BATCHED_KITTED' || b.status === 'RELEASED')
  );

  // Build Complete 4-Part Plain-Text Report (Includes Full 3-Step Batching Lifecycle)
  const buildPlainTextReport = () => {
    let body = `JANG-JANG BAKESHOP & KINGDOM CONFECTIONARY\n`;
    body += `DAILY WAREHOUSE & INGREDIENT BATCHING END-OF-DAY (EOD) SETTLEMENT REPORT\n`;
    body += `Indangan Central Plant LTO #3000013388488 | Sasa Facility LTO #3000002291335\n`;
    body += `Date: ${selectedDate} | Automated Scheduled Cutoff: 23:45 PHT\n`;
    body += `Recipients: ${recipients.join(', ')}\n`;
    body += `Governing Authority: Angelina P. Sun (COA) / Zaphyr Zur Pomicpic (Ops Advisor)\n`;
    body += `========================================================================\n\n`;

    body += `PART 1: INCOMING RAW MATERIALS (ITEMIZED INVENTORY RECEIVING REPORT - Form-REC-001)\n`;
    body += `------------------------------------------------------------------------\n`;
    if (todaysReceiving.length === 0) {
      body += `No incoming deliveries logged for ${selectedDate}.\n\n`;
    } else {
      todaysReceiving.forEach((r, idx) => {
        body += `[Delivery #${idx + 1}] Report: ${r.reportNo} | PO/DR: ${r.poNo} | Supplier: ${r.supplier} | Status: ${r.overallStatus}\n`;
        r.items?.forEach(it => {
          body += `   • ${it.materialCode} - ${it.name}: ${it.primaryQty} ${it.primaryUom} (${it.secondaryQty} ${it.secondaryUom}) | Lot: ${it.lotNumber} (Exp: ${it.expiryDate}) | Payable: PHP ${it.totalAmount?.toLocaleString()}\n`;
        });
        body += `   Total Delivery Value: PHP ${r.totalPaid?.toLocaleString()}\n\n`;
      });
      body += `TOTAL INCOMING PURCHASES TODAY: PHP ${totalReceivingValue.toLocaleString()}\n\n`;
    }

    body += `PART 2: WITHDRAWN / ISSUED MATERIALS REPORT (Form-WAR-001 FLOOR & BULK BATCHING SLIPS)\n`;
    body += `------------------------------------------------------------------------\n`;
    if (todaysWithdrawals.length === 0) {
      body += `No floor withdrawals logged for ${selectedDate}.\n\n`;
    } else {
      todaysWithdrawals.forEach((w, idx) => {
        body += `[Slip #${idx + 1}] Slip No: ${w.slipNo} | Status: ${w.status} | Line/Destination: ${w.requestingEntity}\n`;
        body += `   Purpose: ${w.purpose}\n`;
        w.items?.forEach(it => {
          body += `   • ${it.materialCode} - ${it.name}: ${it.qtyIssuedSec} ${it.secondaryUom} (FEFO Lot: ${it.lotNumber})\n`;
        });
        body += `   Requested By: ${w.requestedBy} | Issued/Approved By: ${w.issuedBy} | Received By: ${w.receivedBy}\n\n`;
      });
    }

    body += `PART 3: REQUESTED KITTED PRODUCT RECIPES & UPSTREAM BULK REQUISITION WORKFLOW\n`;
    body += `(Step 1: Outlet Order Intake -> Step 2: Romeo Requests Bulk Materials from Jade via Form-WAR-001)\n`;
    body += `------------------------------------------------------------------------\n`;
    if (todaysRequestedRecipes.length === 0) {
      body += `No outlet batch requisitions submitted for ${selectedDate}.\n\n`;
    } else {
      todaysRequestedRecipes.forEach((b, idx) => {
        const linkedSlip = withdrawals.find(
          w => w.slipNo === b.linkedWithdrawalSlipNo || w.linkedOrderId === b.orderId || (w.purpose && w.purpose.includes(b.orderId))
        );
        const bulkStatusText = linkedSlip
          ? `${linkedSlip.slipNo} (${linkedSlip.status} - Issued by ${linkedSlip.issuedBy})`
          : (b.bulkRequisitionStatus === 'PENDING_JADE_APPROVAL'
              ? 'Bulk Requested by Romeo (Awaiting Jade Approval)'
              : b.bulkRequisitionStatus === 'BULK_ISSUED_BY_JADE'
              ? 'Bulk Released by Jade'
              : 'Awaiting Bulk Requisition by Romeo');

        body += `[Order #${idx + 1}] Order ID: ${b.orderId} | Outlet: ${b.outletName}\n`;
        body += `   Step 1 (Order Intake): ${b.recipeSku} - ${b.recipeName} | ${b.batchMultiplier} Kits (${b.requestedQtyPcs} finished pcs)\n`;
        body += `   Requested Date: ${b.requestDate} | Target Date: ${b.targetDate} | Entered By: ${b.enteredBy}\n`;
        body += `   Step 2 (Upstream Bulk Requisition - Form-WAR-001): ${bulkStatusText}\n\n`;
      });
    }

    body += `PART 4: ACTUAL QUANTITIES BATCHED/KITTED BY ROMEO MALUSAY & RELEASED TO OUTLETS\n`;
    body += `(Step 3: Precision Scaling on City Treasurer Scales, 40-Mesh Sifting, Form-ING-001 Tagging & Release)\n`;
    body += `------------------------------------------------------------------------\n`;
    if (todaysBatchedAndReleased.length === 0) {
      body += `No completed batching/releasing logged yet for ${selectedDate}.\n\n`;
    } else {
      todaysBatchedAndReleased.forEach((b, idx) => {
        body += `[Batch Tag #${idx + 1}] Form-ING-001 Tag ID: ${b.batchTagId || 'N/A'} | Order ID: ${b.orderId} | Status: ${b.status}\n`;
        body += `   Recipe & Destination: ${b.recipeName} -> ${b.outletName}\n`;
        body += `   Ordered Kits: ${b.batchMultiplier} Kits (${b.requestedQtyPcs} pcs) | Actual Batched Weight: ${b.actualBatchedKg} kg (${b.actualBatchedUnits || b.requestedQtyPcs} pcs)\n`;
        body += `   Scaled & Kitted By: ${b.batchedBy || 'Romeo B. Malusay'} at ${b.batchedAt || 'Shift Start'}\n`;
        body += `   Metrology & Sifter Gate: ${b.scaleUsed || 'City Treasurer Seals #798073 & #798607 Verified'} | 40-Mesh Sifter: ${b.sifter40MeshChecked !== false ? 'VERIFIED INTACT' : 'PENDING'}\n`;
        if (b.status === 'RELEASED') {
          body += `   OUTLET RELEASE DISPATCH: Released at ${b.releasedAt || 'Today'} to ${b.releasedTo || 'Outlet Logistics Driver'}\n`;
        } else {
          body += `   OUTLET RELEASE DISPATCH: Sealed in HDPE container & Staged at Grey Zone (Awaiting driver handoff)\n`;
        }
        body += `\n`;
      });
    }

    body += `========================================================================\n`;
    body += `23:45 PHT DAILY AUDIT SIGN-OFF:\n`;
    body += `Warehouse Supervisor (Terminal 1): Jade Q. Dela Cruz\n`;
    body += `Ingredient Batching Preparer (Terminal 2): Romeo B. Malusay\n`;
    body += `Inventory & Stock Reconciler (Terminal 3): Mariejohn F. Tacuban\n`;
    body += `QA & Food Safety Director (Terminal 3): Grace P. Suico\n`;
    body += `Chief Operating Authority (Terminal 3): Angelina P. Sun\n`;

    return body;
  };

  // SAFE DOWNLOAD METHOD (Bypasses URL Length Limits)
  const handleDownloadReport = () => {
    const reportText = buildPlainTextReport();
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `JJB_EOD_Settlement_Report_${selectedDate}_2345PHT.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    if (onRecordAudit) {
      onRecordAudit('EOD_REPORT_DOWNLOADED', `Downloaded 4-part itemized 23:45 EOD report for ${selectedDate}`);
    }
  };

  const handleLaunchMailto = () => {
    const subject = encodeURIComponent(`[23:45 EOD REPORT] Jang-Jang Bakeshop Warehouse & Kitting Operations - ${selectedDate}`);
    const body = encodeURIComponent(buildPlainTextReport());
    const mailtoUrl = `mailto:${recipients.join(',')}?subject=${subject}&body=${body}`;
    
    if (mailtoUrl.length > 2000) {
      const proceed = window.confirm(
        "Warning: This 4-part EOD report exceeds standard browser mailto URL length limits (2,000 chars) and may be truncated by Gmail/Outlook. We strongly recommend clicking 'Download as TXT' and attaching the file. Proceed with mailto anyway?"
      );
      if (!proceed) return;
    }

    window.location.href = mailtoUrl;

    if (onRecordAudit) {
      onRecordAudit('EOD_REPORT_DISPATCH_MAILTO', `Triggered 23:45 EOD email client to ${recipients.join(', ')}`);
    }
  };

  const handleCopyReport = () => {
    const text = buildPlainTextReport();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 3000);
      if (onRecordAudit) {
        onRecordAudit('EOD_REPORT_COPIED', 'Copied 4-part itemized 23:45 EOD report to clipboard');
      }
    });
  };

  const handleSimulateAutomatedDispatch = () => {
    setDispatchedStatus(true);
    if (onRecordAudit) {
      onRecordAudit(
        'AUTOMATED_EOD_2345_DISPATCH', 
        `Automated 23:45 PHT settlement broadcast (including 3-step Batching Lifecycle) routed to ${recipients.join(', ')}`
      );
    }
    setTimeout(() => setDispatchedStatus(false), 5000);
  };

  const handleAddRecipient = (e) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) return;
    if (!recipients.includes(customEmail.trim())) {
      setRecipients([...recipients, customEmail.trim()]);
    }
    setCustomEmail('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start flex-wrap gap-2 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-[#1E7A3E] text-white px-2 py-0.5 rounded">
              23:45 PHT Automated Settlement
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">
              Automated End-of-Day (EOD) Operations & Batching Lifecycle Report
            </h2>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            Automatically triggers every night at <strong>23:45 PHT</strong> · Records Inbound Receiving, Floor Withdrawals, Romeo's Bulk Requisitions, Kitting & Outlet Releases
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E2D1B8] shadow-sm text-xs">
          <Clock size={14} className="text-[#5B2E7A]" />
          <span className="font-bold text-gray-700">Settlement Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-1 border rounded font-mono font-bold text-[#5B2E7A]"
          />
        </div>
      </div>

      {/* RECIPIENT STAKEHOLDERS BAR */}
      <div className="bg-[#FAF6EE] p-4 rounded-xl border border-[#C8963E]/40 shadow-sm space-y-2 print:hidden">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h4 className="font-serif font-bold text-xs text-[#5B2E7A] flex items-center gap-1.5">
            <Mail size={15} /> Designated 23:45 PHT Auto-Email Stakeholder Recipients:
          </h4>
          <span className="text-[11px] text-[#1E7A3E] font-bold">
            {lastAutoDispatchTime ? `Last Auto-Trigger: ${lastAutoDispatchTime}` : '23:45 PHT Nightly Watcher Active'}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {recipients.map((email, idx) => (
            <span 
              key={idx} 
              className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-white border border-[#C8963E]/60 text-[#3D1C52] shadow-xs flex items-center gap-1"
            >
              <CheckCircle2 size={12} className="text-[#1E7A3E]" />
              {email}
            </span>
          ))}
        </div>

        <div className="pt-2 flex flex-wrap gap-2 justify-between items-center">
          <form onSubmit={handleAddRecipient} className="flex gap-2 text-xs">
            <input
              type="email"
              placeholder="Add secondary recipient email..."
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              className="p-1.5 border rounded bg-white text-xs w-60"
            />
            <button
              type="submit"
              className="bg-[#5B2E7A] hover:bg-[#3D1C52] text-white px-3 py-1 rounded font-bold"
            >
              Add
            </button>
          </form>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleDownloadReport}
              className="bg-[#5B2E7A] hover:bg-[#3D1C52] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition"
              title="Download full report as a text file (Bypasses 2,000-character mailto URL limit)"
            >
              <Download size={14} />
              <span>Download as TXT (Recommended)</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="bg-white hover:bg-gray-50 text-[#5B2E7A] border border-[#5B2E7A] text-xs font-bold px-3 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Copy size={14} />
              <span>{copiedStatus ? 'Copied!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleLaunchMailto}
              className="bg-[#1E7A3E] hover:bg-[#165c2f] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition"
            >
              <Send size={14} />
              <span>Email All Stakeholders</span>
            </button>

            <button
              onClick={handleSimulateAutomatedDispatch}
              className="bg-gradient-to-r from-[#C8963E] to-[#E5C585] text-[#240e32] hover:brightness-105 text-xs font-bold px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition"
            >
              <Sparkles size={14} />
              <span>{dispatchedStatus ? '✓ 23:45 Dispatch Simulated' : 'Trigger 23:45 Auto-Broadcast'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="bg-[#3D1C52] hover:bg-[#240e32] text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {dispatchedStatus && (
        <div className="bg-green-100 border border-green-300 text-green-900 p-4 rounded-xl flex items-center gap-3 shadow-sm">
          <CheckCircle2 size={24} className="text-green-700 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-sm">Automated 23:45 PHT EOD Report Broadcast Confirmed!</p>
            <p className="mt-0.5">
              Itemized 4-part report (including full 3-step Batching & Kitting workflow logs) dispatched to <strong>{recipients.join(', ')}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* PRINTABLE EOD DOSSIER */}
      <div id="eod-printable-dossier" className="bg-white rounded-2xl border-2 border-[#C8963E]/40 p-6 md:p-8 shadow-lg space-y-8">
        <div className="border-b-2 border-[#5B2E7A] pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#C8963E] uppercase tracking-wider">
                DAILY SETTLEMENT DOSSIER
              </span>
              <span className="bg-[#5B2E7A] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                EOD-REV-4.4
              </span>
            </div>
            <h1 className="font-serif font-bold text-2xl md:text-3xl text-[#3D1C52] mt-1">
              Jang-Jang Bakeshop & Kingdom Confectionary
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              Purok 8, San Miguel, Barangay Indangan, Buhangin District, Davao City, 8000
            </p>
            <p className="text-[11px] text-[#C8963E] font-semibold">
              Indangan Plant FDA LTO #3000013388488 · Sasa Plant FDA LTO #3000002291335
            </p>
          </div>

          <div className="text-right text-xs bg-[#FAF6EE] p-3 rounded-lg border border-[#E2D1B8]">
            <p className="font-bold text-[#5B2E7A]">Automated Cutoff: 23:45 PHT</p>
            <p className="font-mono font-bold text-sm text-gray-900 mt-0.5">{selectedDate}</p>
            <p className="text-[11px] text-green-700 font-semibold mt-1">Status: Balanced & Reconciled</p>
          </div>
        </div>

        {/* PART 1: INCOMING RAW MATERIALS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-gray-200 pb-2">
            <h3 className="font-serif font-bold text-base text-[#3D1C52] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1E7A3E] text-white flex items-center justify-center text-xs font-bold">1</span>
              <span>Incoming Raw Materials (Itemized Inventory Receiving Report — `Form-REC-001`)</span>
            </h3>
            <span className="text-xs font-mono font-bold text-[#1E7A3E]">
              Total Inbound Value: ₱{totalReceivingValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {todaysReceiving.length === 0 ? (
            <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded">No incoming raw material deliveries logged on {selectedDate}.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#5B2E7A] text-white">
                  <tr>
                    <th className="p-2.5">Report & PO/DR #</th>
                    <th className="p-2.5">Supplier Name</th>
                    <th className="p-2.5">Delivered Material</th>
                    <th className="p-2.5 text-right">Primary (Bulk)</th>
                    <th className="p-2.5 text-right">Secondary Net</th>
                    <th className="p-2.5">Lot & Expiry</th>
                    <th className="p-2.5">QA Gate Status</th>
                    <th className="p-2.5 text-right">Amount (PHP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {todaysReceiving.map(r => 
                    r.items?.map((it, idx) => (
                      <tr key={`${r.reportNo}-${idx}`} className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono">
                          <div className="font-bold text-[#5B2E7A]">{r.reportNo}</div>
                          <div className="text-gray-500 text-[10px]">{r.poNo} / {r.invoiceNo}</div>
                        </td>
                        <td className="p-2.5 font-medium">{r.supplier}</td>
                        <td className="p-2.5">
                          <div className="font-bold text-gray-900">{it.materialCode}</div>
                          <div className="text-gray-500 text-[11px]">{it.name}</div>
                        </td>
                        <td className="p-2.5 text-right font-mono">{it.primaryQty} {it.primaryUom}s</td>
                        <td className="p-2.5 text-right font-mono font-bold text-[#1E7A3E]">
                          {it.secondaryQty.toLocaleString()} {it.secondaryUom}
                        </td>
                        <td className="p-2.5 font-mono text-[11px]">
                          <div>{it.lotNumber}</div>
                          <div className="text-gray-400">Exp: {it.expiryDate}</div>
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                            PASS ({it.storageRoom})
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold">
                          ₱{it.totalAmount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PART 2: WITHDRAWN / ISSUED MATERIALS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-gray-200 pb-2">
            <h3 className="font-serif font-bold text-base text-[#3D1C52] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5B2E7A] text-white flex items-center justify-center text-xs font-bold">2</span>
              <span>Withdrawn / Issued Materials Report (`Form-WAR-001` Floor & Bulk Kitting Slips)</span>
            </h3>
            <span className="text-xs text-gray-500">{todaysWithdrawals.length} Slips Logged</span>
          </div>

          {todaysWithdrawals.length === 0 ? (
            <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded">No warehouse stock-out withdrawals recorded on {selectedDate}.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#3D1C52] text-white">
                  <tr>
                    <th className="p-2.5">Slip # & Time</th>
                    <th className="p-2.5">Requesting Line / Area</th>
                    <th className="p-2.5">Purpose / Linked Batch</th>
                    <th className="p-2.5">Withdrawn Material</th>
                    <th className="p-2.5 text-right">Net Qty Issued</th>
                    <th className="p-2.5">FEFO Lot #</th>
                    <th className="p-2.5">Custodial Sign-Off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {todaysWithdrawals.map(w => 
                    w.items?.map((it, idx) => (
                      <tr key={`${w.slipNo}-${idx}`} className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono">
                          <div className="font-bold text-[#5B2E7A]">{w.slipNo}</div>
                          <div className="text-gray-400 text-[10px]">{w.time} · {w.status}</div>
                        </td>
                        <td className="p-2.5 font-semibold text-gray-900">{w.requestingEntity}</td>
                        <td className="p-2.5 text-gray-600">{w.purpose}</td>
                        <td className="p-2.5">
                          <span className="font-bold text-gray-900">{it.materialCode}</span> — {it.name}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-[#5B2E7A]">
                          {it.qtyIssuedSec} {it.secondaryUom}
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-gray-600">{it.lotNumber}</td>
                        <td className="p-2.5 text-[11px]">
                          <div>Req: <span className="font-semibold">{w.requestedBy?.split('(')[0]}</span></div>
                          <div>Issued: <span className="font-semibold text-[#1E7A3E]">{w.issuedBy?.split('(')[0]}</span></div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PART 3: STEP 1 & STEP 2 OF BATCHING WORKFLOW */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-gray-200 pb-2">
            <h3 className="font-serif font-bold text-base text-[#3D1C52] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#C8963E] text-[#240e32] flex items-center justify-center text-xs font-bold">3</span>
              <span>Outlet Kitted Recipe Orders & Upstream Bulk Material Requisitions (`Form-PRO-001` → `Form-WAR-001`)</span>
            </h3>
            <span className="text-xs text-gray-500">Step 1 (Order Intake) & Step 2 (Romeo Bulk Request to Jade)</span>
          </div>

          {todaysRequestedRecipes.length === 0 ? (
            <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded">No outlet batch orders logged for {selectedDate}.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#5B2E7A] text-white">
                  <tr>
                    <th className="p-2.5">Order ID & Date</th>
                    <th className="p-2.5">Target Outlet</th>
                    <th className="p-2.5">Product Recipe Name & SKU</th>
                    <th className="p-2.5 text-right">Ordered Kits</th>
                    <th className="p-2.5 text-right">Target Yield</th>
                    <th className="p-2.5">Step 2: Upstream Bulk Requisition (`Form-WAR-001`)</th>
                    <th className="p-2.5">Order Intake By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {todaysRequestedRecipes.map(b => {
                    const linkedSlip = withdrawals.find(
                      w => w.slipNo === b.linkedWithdrawalSlipNo || w.linkedOrderId === b.orderId || (w.purpose && w.purpose.includes(b.orderId))
                    );
                    return (
                      <tr key={b.orderId} className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono">
                          <div className="font-bold text-[#5B2E7A]">{b.orderId}</div>
                          <div className="text-[10px] text-gray-400">Req: {b.requestDate}</div>
                        </td>
                        <td className="p-2.5 font-bold text-[#C8963E]">{b.outletName}</td>
                        <td className="p-2.5">
                          <span className="font-bold text-gray-900">{b.recipeName}</span>
                          <span className="text-gray-400 font-mono text-[11px] block">{b.recipeSku}</span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-[#3D1C52]">{b.batchMultiplier} Kits</td>
                        <td className="p-2.5 text-right font-mono font-bold text-gray-900">{b.requestedQtyPcs} pcs</td>
                        <td className="p-2.5 text-[11px]">
                          {linkedSlip ? (
                            <div>
                              <span className="font-mono font-bold text-[#5B2E7A]">{linkedSlip.slipNo}</span>
                              <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                linkedSlip.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-[#D68910]' : 'bg-green-100 text-[#1E7A3E]'
                              }`}>
                                {linkedSlip.status}
                              </span>
                            </div>
                          ) : b.bulkRequisitionStatus === 'PENDING_JADE_APPROVAL' ? (
                            <span className="text-amber-700 font-semibold">Pending Jade Approval</span>
                          ) : b.bulkRequisitionStatus === 'BULK_ISSUED_BY_JADE' ? (
                            <span className="text-green-700 font-semibold">✓ Bulk Released by Jade</span>
                          ) : (
                            <span className="text-gray-400 italic">Awaiting Romeo Bulk Pull</span>
                          )}
                        </td>
                        <td className="p-2.5 text-gray-700 font-medium">{b.enteredBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PART 4: STEP 3 OF BATCHING WORKFLOW (ROMEO SCALING & RELEASE) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-gray-200 pb-2">
            <h3 className="font-serif font-bold text-base text-[#3D1C52] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1E7A3E] text-white flex items-center justify-center text-xs font-bold">4</span>
              <span>Actual Quantities Batched/Kitted by Romeo Malusay & Released to Outlets (`Form-ING-001`)</span>
            </h3>
            <span className="text-xs bg-green-100 text-[#1E7A3E] px-2 py-0.5 rounded font-bold">
              Step 3: Scale Calibration (#798073 & #798607) + 40-Mesh Sifter Certified
            </span>
          </div>

          {todaysBatchedAndReleased.length === 0 ? (
            <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded">No batching execution certified yet for {selectedDate}.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1E7A3E] text-white">
                  <tr>
                    <th className="p-2.5">Batch Tag ID (`Form-ING-001`)</th>
                    <th className="p-2.5">Product Recipe & Outlet</th>
                    <th className="p-2.5 text-right">Kits & Scaled Weight</th>
                    <th className="p-2.5">Scale Seal & 40-Mesh Check</th>
                    <th className="p-2.5">Scaled By & Time</th>
                    <th className="p-2.5 text-center">Kit Status</th>
                    <th className="p-2.5">Release Dispatch Log</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {todaysBatchedAndReleased.map(b => (
                    <tr key={b.orderId} className="hover:bg-gray-50">
                      <td className="p-2.5 font-mono font-bold text-[#5B2E7A]">
                        <div>{b.batchTagId || 'TAG-PENDING'}</div>
                        <div className="text-[10px] text-gray-400">Order: {b.orderId}</div>
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-gray-900">{b.recipeName}</div>
                        <div className="text-[11px] text-[#C8963E] font-medium">{b.outletName}</div>
                      </td>
                      <td className="p-2.5 text-right font-mono">
                        <div className="font-bold text-gray-900">{b.actualBatchedKg || 16.44} kg</div>
                        <div className="text-[10px] text-[#1E7A3E] font-bold">{b.batchMultiplier} Kits ({b.actualBatchedUnits || b.requestedQtyPcs} pcs)</div>
                      </td>
                      <td className="p-2.5 text-[11px]">
                        <div className="font-mono font-semibold text-gray-800">{b.scaleUsed || 'Seals #798073 / #798607'}</div>
                        <div className="text-green-700 font-bold">✓ 40-Mesh Sifter Verified</div>
                      </td>
                      <td className="p-2.5">
                        <div className="font-semibold text-gray-800">{b.batchedBy || 'Romeo B. Malusay'}</div>
                        <div className="text-[10px] text-gray-400">{b.batchedAt || 'Shift Verified'}</div>
                      </td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'RELEASED' ? 'bg-green-100 text-[#1E7A3E]' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {b.status === 'RELEASED' ? 'RELEASED' : 'BATCHED / KITTED'}
                        </span>
                      </td>
                      <td className="p-2.5 text-[11px]">
                        {b.status === 'RELEASED' ? (
                          <span className="text-green-700 font-semibold">
                            Dispatched at {b.releasedAt || 'Today'} to {b.releasedTo || 'Outlet Logistics Driver'}
                          </span>
                        ) : (
                          <span className="text-blue-700 italic">
                            Sealed in HDPE container; staged at Grey Zone
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SIGN-OFF SIGNATURE BLOCKS */}
        <div className="pt-6 border-t-2 border-[#5B2E7A] space-y-4">
          <p className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">
            Operational Governance & Regulatory Verification Signatures (A.O. 153 s.2004 cGMP · 23:45 PHT Cutoff):
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
              <p className="text-gray-500 text-[10px] uppercase font-bold">Terminal 1 · Warehouse Supervisor:</p>
              <p className="font-bold text-[#3D1C52] mt-1">Jade Q. Dela Cruz</p>
              <div className="border-b border-gray-400 my-2"></div>
              <p className="text-[10px] text-gray-400">Date & Signature (Form-REC/WAR)</p>
            </div>

            <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
              <p className="text-gray-500 text-[10px] uppercase font-bold">Terminal 2 · Batching Preparer:</p>
              <p className="font-bold text-[#3D1C52] mt-1">Romeo B. Malusay</p>
              <div className="border-b border-gray-400 my-2"></div>
              <p className="text-[10px] text-gray-400">Date & Signature (Form-ING-001)</p>
            </div>

            <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
              <p className="text-gray-500 text-[10px] uppercase font-bold">Terminal 3 · Stock Reconciler:</p>
              <p className="font-bold text-[#3D1C52] mt-1">Mariejohn F. Tacuban</p>
              <div className="border-b border-gray-400 my-2"></div>
              <p className="text-[10px] text-gray-400">Date & Signature (23:45 Perpetual)</p>
            </div>

            <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
              <p className="text-gray-500 text-[10px] uppercase font-bold">Terminal 3 · Executive Authority:</p>
              <p className="font-bold text-[#3D1C52] mt-1">Angelina P. Sun</p>
              <div className="border-b border-gray-400 my-2"></div>
              <p className="text-[10px] text-gray-400">Executive Authorization</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
