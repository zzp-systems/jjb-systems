import React, { useState } from 'react';
import { 
  FileCheck, Search, Filter, Download, RotateCcw, 
  ShieldCheck, Clock, User
} from 'lucide-react';

export default function AuditTrailModule({
  auditLogs,
  onResetData,
  onExportJson
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActor, setSelectedActor] = useState('ALL');

  const actors = ['ALL', ...Array.from(new Set(auditLogs.map(l => l.actor)))];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActor = selectedActor === 'ALL' || log.actor === selectedActor;

    return matchesSearch && matchesActor;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-[#3D1C52] text-white px-2 py-0.5 rounded">
              Immutable Ledger
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">
              Chronological Audit Trail &amp; Regulatory Verification Logs
            </h2>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            Tamper-Proof Audit Trail · LockService Concurrency History · Timestamped Custodial Accountability (ISO / cGMP Compliance)
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onExportJson}
            className="bg-[#5B2E7A] hover:bg-[#3D1C52] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <Download size={13} /> Export Backup (JSON)
          </button>
          <button
            onClick={onResetData}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition"
          >
            <RotateCcw size={13} /> Reset Demo Data
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-[#E2D1B8] shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search action types (e.g. INBOUND, BATCH), details, or personnel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8963E]"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <User size={14} className="text-gray-400" />
          <select
            value={selectedActor}
            onChange={(e) => setSelectedActor(e.target.value)}
            className="text-xs p-2 border rounded-lg bg-white font-medium"
          >
            {actors.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-[#E2D1B8] shadow-sm overflow-hidden">
        <div className="px-6 py-3.5 bg-[#FAF6EE] border-b border-[#E2D1B8] flex justify-between items-center">
          <h3 className="font-serif font-bold text-[#5B2E7A]">
            Sequential Event Logbook
          </h3>
          <span className="text-xs text-gray-500 font-medium">
            {filteredLogs.length} events logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#5B2E7A] text-white">
              <tr>
                <th className="p-3">Timestamp (PHT)</th>
                <th className="p-3">Actor / Custodian</th>
                <th className="p-3">Role &amp; Jurisdiction</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Event Details &amp; Data Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D1B8]">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#FAF6EE]/50">
                  <td className="p-3 font-mono text-gray-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-3 font-bold text-[#3D1C52] whitespace-nowrap">
                    {log.actor}
                  </td>
                  <td className="p-3 text-gray-600 whitespace-nowrap">
                    {log.role}
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-xs font-bold text-[#C8963E] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-gray-700 max-w-md break-words">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
