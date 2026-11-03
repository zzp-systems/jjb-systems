import React from 'react';
import { 
  Warehouse, Scale, Truck, FileText, CheckCircle2, 
  Wifi, WifiOff, Smartphone, Laptop, AlertOctagon, Send, BarChart3, ShoppingCart
} from 'lucide-react';

export const ROLES = [
  { id: "jade", name: "Jade Q. Dela Cruz", title: "Warehouse Supervisor", station: "Terminal 1 · Bodega & Receiving Dock" },
  { id: "romeo", name: "Romeo B. Malusay", title: "Ingredient Batching Preparer", station: "Terminal 2 · Dry Room Batching Partition" },
  { id: "mariejohn", name: "Mariejohn F. Tacuban", title: "Inventory & Purchasing Manager", station: "Terminal 3 · Inventory & Procurement" },
  { id: "grace", name: "Grace P. Suico", title: "FSCO 2 & QA Control Director", station: "Terminal 3 · QA & Quarantine Control" },
  { id: "angelina", name: "Angelina P. Sun", title: "Head of Administration / COA", station: "Terminal 3 · Executive Oversight" }
];

export default function Header({ 
  currentRole, 
  setCurrentRole, 
  activeTab, 
  setActiveTab, 
  isMobileMode, 
  setIsMobileMode,
  isOffline, 
  setIsOffline,
  queueCount,
  pendingBatchCount,
  pendingBulkApprovalCount,
  lowStockCount,
  onQuickEod
}) {
  const activeRoleObj = ROLES.find(r => r.name === currentRole) || ROLES[0];

  return (
    <header className="bg-[#3D1C52] text-white shadow-xl sticky top-0 z-30 border-b border-[#C8963E]/40 print:hidden">
      <div className="bg-[#240e32] px-3 py-1.5 text-xs text-[#E5C585] flex flex-wrap justify-between items-center border-b border-[#5B2E7A]/60">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wide">JANG-JANG BAKESHOP & KINGDOM CONFECTIONARY</span>
          <span className="hidden sm:inline text-gray-400">|</span>
          <span className="hidden sm:inline">Indangan Plant FDA LTO #3000013388488</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-gray-300">{activeRoleObj.station}</span>
          <span className="bg-[#C8963E]/20 text-[#E5C585] px-2 py-0.5 rounded font-mono border border-[#C8963E]/30">
            SOP-WAR-002 / SOP-PRO-004
          </span>
        </div>
      </div>

      <div className="px-4 py-2.5 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white p-1 border-2 border-[#C8963E] flex items-center justify-center shadow-md flex-shrink-0">
            <img 
              src="https://raw.githubusercontent.com/zzp-systems/jjb-systems/refs/heads/main/jjb-logo-transaparent.png" 
              alt="JJB Logo" 
              className="w-full h-full object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-base md:text-lg text-white leading-tight">
                JJB Warehouse & Batch Kitting OS
              </h1>
              <span className="bg-[#C8963E] text-[#240e32] font-bold text-[10px] px-1.5 py-0.5 rounded uppercase">
                v4.4 WMS
              </span>
            </div>
            <p className="text-[11px] text-[#E5C585]">
              Active Operator: <span className="font-semibold text-white">{activeRoleObj.name}</span> ({activeRoleObj.title})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsMobileMode(!isMobileMode)}
            className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition border ${
              isMobileMode ? 'bg-[#C8963E] text-[#240e32] border-[#C8963E]' : 'bg-[#5B2E7A]/60 text-gray-200 border-[#7A3F9E] hover:text-white'
            }`}
          >
            {isMobileMode ? <Smartphone size={13} /> : <Laptop size={13} />}
            <span className="hidden sm:inline">{isMobileMode ? "Tablet / Phone UI" : "Desktop UI"}</span>
          </button>

          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition border ${
              isOffline
                ? 'bg-[#C0392B] text-white border-red-400 animate-pulse'
                : queueCount > 0
                ? 'bg-[#D68910] text-white border-amber-400 animate-pulse'
                : 'bg-[#1E7A3E] text-white border-green-500'
            }`}
          >
            {isOffline ? <WifiOff size={13} /> : <Wifi size={13} />}
            <span>
              {isOffline 
                ? `OFFLINE — LOCAL QUEUE (${queueCount})` 
                : queueCount > 0 
                ? `ONLINE — QUEUED (${queueCount})` 
                : "ONLINE — SYNCED"}
            </span>
          </button>

          <div className="flex items-center bg-[#240e32] border border-[#C8963E]/60 rounded px-2 py-1">
            <span className="text-[10px] text-[#E5C585] font-bold uppercase mr-1.5 hidden md:inline">Operator:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
            >
              {ROLES.map(r => (
                <option key={r.id} value={r.name} className="bg-[#3D1C52] text-white">
                  {r.name} ({r.station.split('·')[0].trim()})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onQuickEod}
            className="bg-gradient-to-r from-[#C8963E] to-[#E5C585] hover:from-[#b58330] hover:to-[#d4b06f] text-[#240e32] font-bold text-xs px-3 py-1.5 rounded shadow flex items-center gap-1.5 transition"
          >
            <Send size={13} />
            <span className="hidden md:inline">23:45</span> EOD Report
          </button>
        </div>
      </div>

      <nav className="bg-[#240e32] px-2 flex overflow-x-auto gap-1 border-t border-[#5B2E7A]/40 scrollbar-none">
        {[
          { id: 'dashboard', label: '1. Live FEFO Inventory', icon: Warehouse, badge: lowStockCount > 0 ? `${lowStockCount} Low` : null, badgeColor: 'bg-[#D68910]' },
          { id: 'receiving', label: '2. Inbound Receiving', icon: Truck },
          { id: 'issuance', label: '3. Stock Release (Jade)', icon: FileText, badge: pendingBulkApprovalCount > 0 ? `${pendingBulkApprovalCount} Bulk Req` : null, badgeColor: 'bg-[#C0392B]' },
          { id: 'batching', label: '4. Batching & Kitting (Romeo)', icon: Scale, badge: pendingBatchCount > 0 ? `${pendingBatchCount} Orders` : null, badgeColor: 'bg-[#C8963E]' },
          { id: 'adjustments', label: '5. Adjustments & Quarantine', icon: AlertOctagon },
          { id: 'reports', label: '6. Reports & PO Generator', icon: ShoppingCart, badge: lowStockCount > 0 ? 'PO Ready' : null, badgeColor: 'bg-[#5B2E7A]' },
          { id: 'eod', label: '7. 23:45 EOD Report', icon: Send },
          { id: 'audit', label: '8. Audit Trail', icon: CheckCircle2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all relative ${
                isActive ? 'border-[#C8963E] text-[#E5C585] bg-[#3D1C52]' : 'border-transparent text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-[#C8963E]' : 'text-gray-400'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] text-white px-1.5 py-0.2 rounded-full font-bold ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
