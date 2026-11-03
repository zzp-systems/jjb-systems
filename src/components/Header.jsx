import React from 'react';
import { 
  Warehouse, Scale, Truck, FileText, CheckCircle2, 
  Wifi, WifiOff, Smartphone, Laptop, AlertOctagon, Send
} from 'lucide-react';

export const ROLES = [
  { id: "jade", name: "Jade Q. Dela Cruz", title: "Warehouse Supervisor", station: "Receiving Dock & Bodega Storage" },
  { id: "romeo", name: "Romeo B. Malusay", title: "Ingredient Batching Preparer", station: "Dry Room 2 & Batching Workbench" },
  { id: "mariejohn", name: "Mariejohn F. Tacuban", title: "Inventory & Purchasing Manager", station: "Admin & Reconciliation" },
  { id: "grace", name: "Grace P. Suico", title: "FSCO & QA Control Director", station: "QA Bench & Quarantine Control" },
  { id: "angelina", name: "Angelina P. Sun", title: "Head of Administration / COA", station: "Executive Office" }
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
  lowStockCount,
  onQuickEod
}) {
  const activeRoleObj = ROLES.find(r => r.name === currentRole) || ROLES[0];

  return (
    <header className="bg-[#3D1C52] text-white shadow-xl sticky top-0 z-30 border-b border-[#C8963E]/40">
      {/* Top Corporate Strip */}
      <div className="bg-[#240e32] px-3 py-1.5 text-xs text-[#E5C585] flex flex-wrap justify-between items-center border-b border-[#5B2E7A]/60">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wide">JANG-JANG BAKESHOP & KINGDOM CONFECTIONARY</span>
          <span className="hidden sm:inline text-gray-400">|</span>
          <span className="hidden sm:inline">Indangan Plant FDA LTO #3000013388488 · Valid to Dec 2026</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-gray-300">Davao City Bodega Central</span>
          <span className="bg-[#C8963E]/20 text-[#E5C585] px-2 py-0.5 rounded font-mono border border-[#C8963E]/30">
            SOP-WAR-002 / SOP-PRO-004
          </span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="px-4 py-2.5 flex flex-wrap justify-between items-center gap-3">
        {/* Brand & Facility Info */}
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
                JJB Warehouse &amp; Kitting OS
              </h1>
              <span className="bg-[#C8963E] text-[#240e32] font-bold text-[10px] px-1.5 py-0.5 rounded uppercase">
                v4.2 WMS
              </span>
            </div>
            <p className="text-[11px] text-[#E5C585]">
              Active User: <span className="font-semibold text-white">{activeRoleObj.name}</span> ({activeRoleObj.title})
            </p>
          </div>
        </div>

        {/* Control Badges & Role Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Tablet/Mobile Mode Toggle */}
          <button
            onClick={() => setIsMobileMode(!isMobileMode)}
            className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition border ${
              isMobileMode 
                ? 'bg-[#C8963E] text-[#240e32] border-[#C8963E]' 
                : 'bg-[#5B2E7A]/60 text-gray-200 border-[#7A3F9E] hover:text-white'
            }`}
            title="Toggle Mobile/Tablet Touch-Optimized Layout for Floor Tasks"
          >
            {isMobileMode ? <Smartphone size={13} /> : <Laptop size={13} />}
            <span className="hidden sm:inline">{isMobileMode ? "Tablet Mode" : "Desktop Mode"}</span>
          </button>

          {/* Offline / Online Queue Toggle */}
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`px-2.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition border ${
              isOffline
                ? 'bg-[#C0392B] text-white border-red-400 animate-pulse'
                : 'bg-[#1E7A3E] text-white border-green-500'
            }`}
            title="Simulate Local Queue vs Online Sync"
          >
            {isOffline ? <WifiOff size={13} /> : <Wifi size={13} />}
            <span>{isOffline ? "Offline Queue" : "Live Synced"}</span>
            {queueCount > 0 && (
              <span className="bg-white/20 px-1 rounded text-[10px]">({queueCount})</span>
            )}
          </button>

          {/* Role Switcher */}
          <div className="flex items-center bg-[#240e32] border border-[#C8963E]/60 rounded px-2 py-1">
            <span className="text-[10px] text-[#E5C585] font-bold uppercase mr-1.5 hidden md:inline">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer"
            >
              {ROLES.map(r => (
                <option key={r.id} value={r.name} className="bg-[#3D1C52] text-white">
                  {r.name} · {r.title}
                </option>
              ))}
            </select>
          </div>

          {/* Quick EOD Action */}
        <button
          onClick={onQuickEod}
          className="bg-gradient-to-r from-[#C8963E] to-[#E5C585] hover:from-[#b58330] hover:to-[#d4b06f] text-[#240e32] font-bold text-xs px-3 py-1.5 rounded shadow flex items-center gap-1.5 transition"
          title="Open Automated 23:45 End-of-Day Settlement Report"
        >
          <Send size={13} />
          <span className="hidden md:inline">23:45</span> EOD Report
        </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <nav className="bg-[#240e32] px-2 flex overflow-x-auto gap-1 border-t border-[#5B2E7A]/40 scrollbar-none">
        {[
          { id: 'dashboard', label: '1. Live FEFO Inventory', icon: Warehouse, badge: lowStockCount > 0 ? `${lowStockCount} Low` : null, badgeColor: 'bg-[#D68910]' },
          { id: 'receiving', label: '2. Inbound Receiving', icon: Truck, roleHighlight: 'Jade Q. Dela Cruz' },
          { id: 'issuance', label: '3. Stock Release & Issuance', icon: FileText, roleHighlight: 'Jade Q. Dela Cruz' },
          { id: 'batching', label: '4. Outlet Kitting & Batching', icon: Scale, badge: pendingBatchCount > 0 ? `${pendingBatchCount} Pending` : null, badgeColor: 'bg-[#C8963E]', roleHighlight: 'Romeo B. Malusay' },
          { id: 'adjustments', label: '5. Adjustments & Quarantine', icon: AlertOctagon },
          { id: 'eod', label: '6. Automated EOD Report', icon: Send, badge: 'Daily 17:00', badgeColor: 'bg-[#1E7A3E]' },
          { id: 'audit', label: '7. Audit Trail', icon: CheckCircle2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isHighlighted = tab.roleHighlight === currentRole;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all relative ${
                isActive 
                  ? 'border-[#C8963E] text-[#E5C585] bg-[#3D1C52]' 
                  : 'border-transparent text-gray-300 hover:text-white hover:bg-white/5'
              } ${isHighlighted ? 'ring-1 ring-[#C8963E]/40' : ''}`}
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
