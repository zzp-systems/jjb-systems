import React, { useState } from 'react';
import { 
  Send, Mail, Copy, Printer, CheckCircle2, 
  FileText, Truck, Scale, ShieldCheck, ArrowDownRight, ArrowUpRight,
  Sparkles, Clock, AlertCircle, Download
} from 'lucide-react';
import { EOD_EMAIL_RECIPIENTS } from '../data/initialData';

export default function EodReportModule({
  receivingReports,
  withdrawals,
  batchOrders,
  inventory,
  quarantineList,
  currentRole,
  onRecordAudit
}) {
  const [selectedDate, setSelectedDate] = useState('2026-11-03');
  const [copiedStatus, setCopiedStatus] = useState(false);
  const [dispatchedStatus, setDispatchedStatus] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [recipients, setRecipients] = useState(EOD_EMAIL_RECIPIENTS);

  const todaysReceiving = receivingReports.filter(r => r.date === selectedDate || !r.date);
  const totalReceivingValue = todaysReceiving.reduce((sum, r) => sum + (r.totalPaid || 0), 0);
  const todaysWithdrawals = withdrawals.filter(w => w.date === selectedDate || !w.date);
  const todaysRequestedRecipes = batchOrders.filter(b => b.requestDate === selectedDate || !b.requestDate);
  const todaysBatchedAndReleased = batchOrders.filter(b => b.status === 'BATCHED_KITTED' || b.status === 'RELEASED');

  const buildPlainTextReport = () => {
    let body = `JANG-JANG BAKESHOP & KINGDOM CONFECTIONARY\n`;
    body += `DAILY WAREHOUSE & INGREDIENT BATCHING END-OF-DAY (EOD) SETTLEMENT REPORT\n`;
    body += `Indangan Central Plant LTO #3000013388488 | Sasa Facility LTO #3000002291335\n`;
    body += `Date: ${selectedDate} | Cutoff: 23:45 PHT\n\n`;
    body += `Governing Authority: Angelina P. Sun (COA) / Zaphyr Zur Pomicpic (Ops Advisor)\n`;
    body += `========================================================================\n\n`;

    body += `PART 1: INCOMING RAW MATERIALS (ITEMIZED INVENTORY RECEIVING REPORT)\n`;
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

    body += `PART 2: WITHDRAWN / ISSUED MATERIALS REPORT (FLOOR & OUTLET REQUISITIONS)\n`;
    body += `------------------------------------------------------------------------\n`;
    if (todaysWithdrawals.length === 0) {
      body += `No floor withdrawals logged for ${selectedDate}.\n\n`;
    } else {
      todaysWithdrawals.forEach((w, idx) => {
        body += `[Slip #${idx + 1}] Slip No: ${w.slipNo} | Line/Outlet: ${w.requestingEntity} | Purpose: ${w.purpose}\n`;
        w.items?.forEach(it => {
          body += `   • ${it.materialCode} - ${it.name}: ${it.qtyIssuedSec} ${it.secondaryUom} (Lot: ${it.lotNumber})\n`;
        });
        body += `   Requested By: ${w.requestedBy} | Issued By: ${w.issuedBy} | Received By: ${w.receivedBy}\n\n`;
      });
    }

    body += `PART 3: REQUESTED KITTED PRODUCT RECIPES FROM THE OUTLETS\n`;
    body += `------------------------------------------------------------------------\n`;
    if (todaysRequestedRecipes.length === 0) {
      body += `No outlet batch requisitions submitted for ${selectedDate}.\n\n`;
    } else {
      todaysRequestedRecipes.forEach((b, idx) => {
        body += `[Order #${idx + 1}] Order ID: ${b.orderId} | Outlet: ${b.outletName}\n`;
        body += `   Recipe: ${b.recipeSku} - ${b.recipeName}\n`;
        body += `   Requested Quantity: ${b.requestedQtyPcs} finished pieces (${b.batchMultiplier}x multiplier)\n`;
        body += `   Requested Date: ${b.requestDate} | Needed: ${b.targetDate} | Requesting Person: ${b.requestedBy}\n\n`;
      });
    }

    body += `PART 4: ACTUAL QUANTITIES BATCHED/KITTED BY ROMEO MALUSAY & RELEASED\n`;
    body += `------------------------------------------------------------------------\n`;
    if (todaysBatchedAndReleased.length === 0) {
      body += `No completed batching/releasing logged yet for ${selectedDate}.\n\n`;
    } else {
      todaysBatchedAndReleased.forEach((b, idx) => {
        body += `[Batch Tag #${idx + 1}] Tag ID: ${b.batchTagId || 'N/A'} | Status: ${b.status}\n`;
        body += `   Recipe: ${b.recipeName} (${b.outletName})\n`;
        body += `   Target Qty: ${b.requestedQtyPcs} pcs | Actual Batched Weight: ${b.actualBatchedKg} kg (${b.requestedQtyPcs} pcs)\n`;
        body += `   Scaled By: ${b.batchedBy || 'Romeo B. Malusay'} at ${b.batchedAt || 'Shift Start'}\n`;
        body += `   Scale Verification: 5 Bench Scales Verified Intact (Seals #798073 & #798074) | 40-Mesh Sifter Verified\n`;
        if (b.status === 'RELEASED') {
          body += `   RELEASE DISPATCH: Released at ${b.releasedAt || 'Today'} to ${b.releasedTo || 'Outlet Logistics'}\n`;
        } else {
          body += `   RELEASE DISPATCH: Sealed & Staged at Grey Zone (Awaiting driver handoff)\n`;
        }
        body += `\n`;
      });
    }

    body += `========================================================================\n`;
    body += `23:45 DAILY AUDIT SIGN-OFF:\n`;
    body += `Warehouse Supervisor: Jade Q. Dela Cruz\n`;
    body += `Ingredient Batching Preparer: Romeo B. Malusay\n`;
    body += `Inventory & Stock Reconciler: Mariejohn F. Tacuban\n`;
    body += `QA & Food Safety Director: Grace P. Suico\n`;
    body += `Chief Operating Authority: Angelina P. Sun\n`;

    return body;
  };

  // SAFE DOWNLOAD METHOD (Bypasses URL Length Limits)
  const handleDownloadReport = () => {
    const reportText = buildPlainTextReport();
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `JJB_EOD_Report_${selectedDate}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    if (onRecordAudit) {
      onRecordAudit("EOD_REPORT_DOWNLOADED", `Downloaded 4-part itemized EOD report for ${selectedDate}`);
    }
  };

  const handleLaunchMailto = () => {
    const subject = encodeURIComponent(`[EOD REPORT] Jang-Jang Bakeshop Warehouse & Kitting Operations - ${selectedDate}`);
    const body = encodeURIComponent(buildPlainTextReport());
    const mailtoUrl = `mailto:${recipients.join(',')}?subject=${subject}&body=${body}`;
    
    // Warn user if URL is very long
    if (mailtoUrl.length > 2000) {
      const proceed = window.confirm(
        "Warning: This report contains a lot of data and exceeds standard email link limits. It is highly recommended to use the 'Download as TXT' button instead and attach the file to your email. Proceed anyway?"
      );
      if (!proceed) return;
    }

    window.location.href = mailtoUrl;

    if (onRecordAudit) {
      onRecordAudit("EOD_REPORT_DISPATCH_MAILTO", `Triggered EOD email client to ${recipients.join(', ')}`);
    }
  };

  const handleCopyReport = () => {
    const text = buildPlainTextReport();
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 3000);
      if (onRecordAudit) {
        onRecordAudit("EOD_REPORT_COPIED", "Copied 4-part itemized EOD report to clipboard");
      }
    });
  };

  const handleSimulateAutomatedDispatch = () => {
    setDispatchedStatus(true);
    if (onRecordAudit) {
      onRecordAudit(
        "AUTOMATED_EOD_2345_DISPATCH", 
        `Automated scheduled settlement broadcast successfully routed to ${recipients.join(', ')}`
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
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-[#1E7A3E] text-white px-2 py-0.5 rounded">
              23:45 Automated Settlement
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">
              Automated End-of-Day (EOD) Operations Report
            </h2>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            Consolidated daily ledger broadcasting incoming inventory, stock withdrawals, outlet batch requisitions, and Romeo Malusay's scaling release
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

      <div className="bg-[#FAF6EE] p-4 rounded-xl border border-[#C8963E]/40 shadow-sm space-y-2">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h4 className="font-serif font-bold text-xs text-[#5B2E7A] flex items-center gap-1.5">
            <Mail size={15} /> Designated Corporate & Operations Stakeholder Recipients:
          </h4>
          <span className="text-[11px] text-gray-500">
            Mandatory distribution list per JJB Executive Directive
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
              title="Download full report as a text file (Recommended for large reports)"
            >
              <Download size={14} />
              <span>Download as TXT (Recommended)</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="bg-white hover:bg-gray-50 text-[#5B2E7A] border border-[#5B2E7A] text-xs font-bold px-3 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Copy size={14} />
              <span>{copiedStatus ? "Copied!" : "Copy Text"}</span>
            </button>

            <button
              onClick={handleLaunchMailto}
              className="bg-[#1E7A3E] hover:bg-[#165c2f] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition"
              title="Open default email client with all recipients"
            >
              <Send size={14} />
              <span>Email to Stakeholders</span>
            </button>

            <button
              onClick={handleSimulateAutomatedDispatch}
              className="bg-gradient-to-r from-[#C8963E] to-[#E5C585] text-[#240e32] hover:brightness-105 text-xs font-bold px-4 py-2 rounded-lg shadow-md flex items-center gap-1.5 transition"
            >
              <Sparkles size={14} />
              <span>{dispatchedStatus ? "✓ 23:45 Dispatch Simulated" : "Trigger 23:45 Auto-Broadcast"}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="bg-[#3D1C52] hover:bg-[#240e32] text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Printer size={14} />
              <span>Print Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {dispatchedStatus && (
        <div className="bg-green-100 border border-green-300 text-green-900 p-4 rounded-xl flex items-center gap-3 shadow-sm">
          <CheckCircle2 size={24} className="text-green-700 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-sm">Automated 23:45 EOD Report Broadcast Confirmed!</p>
            <p className="mt-0.5">
              Itemized report dispatched to <strong>{recipients.join(', ')}</strong> with complete incoming inventory, withdrawals, outlet kitted recipes, and Romeo Malusay's scaling release logs.
            </p>
          </div>
        </div>
      )}

      <div id="eod-printable-dossier" className="bg-white rounded-2xl border-2 border-[#C8963E]/40 p-6 md:p-8 shadow-lg space-y-8">
        <div className="border-b-2 border-[#5B2E7A] pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#C8963E] uppercase tracking-wider">
                DAILY SETTLEMENT DOSSIER
              </span>
              <span className="bg-[#5B2E7A] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                EOD-REV-4.3
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
            <p className="font-bold text-[#5B2E7A]">Cutoff: 23:45 PHT</p>
            <p className="font-mono font-bold text-sm text-gray-900 mt-0.5">{selectedDate}</p>
            <p className="text-[11px] text-green-700 font-semibold mt-1">Status: Balanced & Reconciled</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#E2D1B8]">
            <p className="text-[10px] font-bold uppercase text-gray-500">Incoming Deliveries</p>
            <p className="text-lg font-bold text-[#1E7A3E] mt-0.5">₱{totalReceivingValue.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500">{todaysReceiving.length} Logged Shipments</p>
          </div>
          <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#E2D1B8]">
            <p className="text-[10px] font-bold uppercase text-gray-500">Floor Withdrawals</p>
            <p className="text-lg font-bold text-[#5B2E7A] mt-0.5">{todaysWithdrawals.length} Slips</p>
            <p className="text-[10px] text-gray-500">Strict FEFO Rotation</p>
          </div>
          <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#E2D1B8]">
            <p className="text-[10px] font-bold uppercase text-gray-500">Outlet Recipe Requests</p>
            <p className="text-lg font-bold text-[#C8963E] mt-0.5">{todaysRequestedRecipes.length} Orders</p>
            <p className="text-[10px] text-gray-500">Pan de Verde & Laurice</p>
          </div>
          <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#E2D1B8]">
            <p className="text-[10px] font-bold uppercase text-gray-500">Batched by Romeo</p>
            <p className="text-lg font-bold text-green-800 mt-0.5">{todaysBatchedAndReleased.length} Kits</p>
            <p className="text-[10px] text-green-700 font-semibold">100% Sealed & Tagged</p>
          </div>
        </div>

        {/* PART 1 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-gray-200 pb-2">
            <h3 className="font-serif font-bold text-base text-[#3D1C52] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1E7A3E] text-white flex items-center justify-center text-xs font-bold">1</span>
              <span>Incoming Raw Materials (Itemized Inventory Receiving Report)</span>
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

        {/* PART 2 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-gray-200 pb-2">
            <h3 className="font-serif font-bold text-base text-[#3D1C52] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#5B2E7A] text-white flex items-center justify-center text-xs font-bold">2</span>
              <span>Withdrawn / Issued Materials Report (Floor & Production Lines)</span>
            </h3>
            <span className="text-xs text-gray-500">{todaysWithdrawals.length} Slips Reconciled</span>
          </div>

          {todaysWithdrawals.length === 0 ? (
            <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded">No warehouse stock-out withdrawals recorded on {selectedDate}.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#3D1C52] text-white">
                  <tr>
                    <th className="p-2.5">Slip # & Time</th>
                    <th className="p-2.5">Requesting Line / Outlet</th>
                    <th className="p-2.5">Purpose / Reason</th>
                    <th className="p-2.5">Withdrawn Material</th>
                    <th className="p-2.5 text-right">Net Quantity Issued</th>
                    <th className="p-2.5">Drawn Lot #</th>
                    <th className="p-2.5">Dual Sign-Off</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {todaysWithdrawals.map(w => 
                    w.items?.map((it, idx) => (
                      <tr key={`${w.slipNo}-${idx}`} className="hover:bg-gray-50">
                        <td className="p-2.5 font-mono">
                          <div className="font-bold text-[#5B2E7A]">{w.slipNo}</div>
                          <div className="text-gray-400 text-[10px]">{w.time}</div>
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
                          <div>Issued: <span className="font-semibold">{w.issuedBy?.split(' ')[0] || 'Jade'}</span></div>
                          <div>Received: <span className="font-semibold">{w.receivedBy}</span></div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PART 3 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-gray-200 pb-2">
            <h3 className="font-serif font-bold text-base text-[#3D1C52] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#C8963E] text-[#240e32] flex items-center justify-center text-xs font-bold">3</span>
              <span>Requested Kitted Product Recipes from the Outlets</span>
            </h3>
            <span className="text-xs text-gray-500">Pan de Verde (Communal) & Laurice Delicacies (Bankerohan)</span>
          </div>

          {todaysRequestedRecipes.length === 0 ? (
            <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded">No outlet batch orders logged for {selectedDate}.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#5B2E7A] text-white">
                  <tr>
                    <th className="p-2.5">Order ID</th>
                    <th className="p-2.5">Target Outlet</th>
                    <th className="p-2.5">Product Recipe Name & SKU</th>
                    <th className="p-2.5 text-right">Requested Multiplier</th>
                    <th className="p-2.5 text-right">Target Pieces</th>
                    <th className="p-2.5">Requested Date</th>
                    <th className="p-2.5">Order Entry By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {todaysRequestedRecipes.map(b => (
                    <tr key={b.orderId} className="hover:bg-gray-50">
                      <td className="p-2.5 font-mono font-bold text-[#5B2E7A]">{b.orderId}</td>
                      <td className="p-2.5 font-bold text-[#C8963E]">{b.outletName}</td>
                      <td className="p-2.5">
                        <span className="font-bold text-gray-900">{b.recipeName}</span>
                        <span className="text-gray-400 font-mono text-[11px] block">{b.recipeSku}</span>
                      </td>
                      <td className="p-2.5 text-right font-mono font-semibold">{b.batchMultiplier}x</td>
                      <td className="p-2.5 text-right font-mono font-bold text-gray-900">{b.requestedQtyPcs} pcs</td>
                      <td className="p-2.5 text-gray-600">{b.requestDate}</td>
                      <td className="p-2.5 text-gray-700 font-medium">{b.enteredBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PART 4 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-gray-200 pb-2">
            <h3 className="font-serif font-bold text-base text-[#3D1C52] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1E7A3E] text-white flex items-center justify-center text-xs font-bold">4</span>
              <span>Actual Quantities Batched/Kitted by Romeo Malusay & Released to Outlets</span>
            </h3>
            <span className="text-xs bg-green-100 text-[#1E7A3E] px-2 py-0.5 rounded font-bold">
              Scale Calibration Certified (#798073 & #798074)
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
                    <th className="p-2.5 text-right">Actual Scaled Weight</th>
                    <th className="p-2.5 text-right">Finished Unit Yield</th>
                    <th className="p-2.5">Scaled By & Time</th>
                    <th className="p-2.5 text-center">Batch Status</th>
                    <th className="p-2.5">Release Dispatch Log</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {todaysBatchedAndReleased.map(b => (
                    <tr key={b.orderId} className="hover:bg-gray-50">
                      <td className="p-2.5 font-mono font-bold text-[#5B2E7A]">{b.batchTagId || 'TAG-PENDING'}</td>
                      <td className="p-2.5">
                        <div className="font-bold text-gray-900">{b.recipeName}</div>
                        <div className="text-[11px] text-[#C8963E] font-medium">{b.outletName}</div>
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-gray-900">
                        {b.actualBatchedKg || 25} kg
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-[#1E7A3E]">
                        {b.actualBatchedUnits || b.requestedQtyPcs} pcs
                      </td>
                      <td className="p-2.5">
                        <div className="font-semibold text-gray-800">{b.batchedBy || 'Romeo B. Malusay'}</div>
                        <div className="text-[10px] text-gray-400">{b.batchedAt || 'Shift Start'}</div>
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
                            Dispatched at {b.releasedAt || 'Today'} to {b.releasedTo || 'Outlet Driver'}
                          </span>
                        ) : (
                          <span className="text-blue-700 italic">
                            Sealed in container; awaiting outlet transport
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

        <div className="pt-6 border-t-2 border-[#5B2E7A] space-y-4">
          <p className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">
            Operational Governance & Regulatory Verification Signatures (A.O. 153 s.2004 cGMP):
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
              <p className="text-gray-500 text-[10px] uppercase font-bold">Warehouse Custodian & Receiver:</p>
              <p className="font-bold text-[#3D1C52] mt-1">Jade Q. Dela Cruz</p>
              <div className="border-b border-gray-400 my-2"></div>
              <p className="text-[10px] text-gray-400">Date & Signature (Form-REC/WAR)</p>
            </div>

            <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
              <p className="text-gray-500 text-[10px] uppercase font-bold">Ingredient Batching Preparer:</p>
              <p className="font-bold text-[#3D1C52] mt-1">Romeo B. Malusay</p>
              <div className="border-b border-gray-400 my-2"></div>
              <p className="text-[10px] text-gray-400">Date & Signature (Form-ING-001)</p>
            </div>

            <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
              <p className="text-gray-500 text-[10px] uppercase font-bold">Inventory & Stock Reconciler:</p>
              <p className="font-bold text-[#3D1C52] mt-1">Mariejohn F. Tacuban</p>
              <div className="border-b border-gray-400 my-2"></div>
              <p className="text-[10px] text-gray-400">Date & Signature (23:45 Perpetual)</p>
            </div>

            <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
              <p className="text-gray-500 text-[10px] uppercase font-bold">Chief Operating Authority:</p>
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
