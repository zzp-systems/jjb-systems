import React, { useState, useEffect } from 'react';
import { 
  Package, Warehouse, Scale, Flame, AlertTriangle, 
  FileText, ShieldCheck, RefreshCw, Wifi, WifiOff, CheckCircle2, 
  Clock, Plus, Search, Printer
} from 'lucide-react';

// --- AUTHENTIC 69-SKU MATERIAL MASTER PRE-SEED (Top 22 shown for prototype) ---
const INITIAL_MASTER_SKUS = [
  { code: "RM-FLR-001", cat: "Flour & Grains", brand: "Continental", name: "Continental All Purpose Flour", supplier: "JCT Wheat & Sugar Products", room: "Dry Room 1", uom: "Sack", secUom: "kg", factor: 25, threshold: 10, bal: 1250 },
  { code: "RM-FLR-002", cat: "Flour & Grains", brand: "Isla", name: "3rd Class Isla Flour", supplier: "Lucky Roma Trading", room: "Dry Room 1", uom: "Sack", secUom: "kg", factor: 25, threshold: 10, bal: 11912.75 },
  { code: "RM-FLR-003", cat: "Flour & Grains", brand: "Rossa", name: "1st Class Hard Flour", supplier: "Lucky Roma Trading", room: "Dry Room 1", uom: "Sack", secUom: "kg", factor: 25, threshold: 15, bal: 4275 },
  { code: "RM-FLR-004", cat: "Flour & Grains", brand: "General Milling", name: "General Milling Soft Flour", supplier: "", room: "Dry Room 1", uom: "Sack", secUom: "kg", factor: 25, threshold: 10, bal: 1900 },
  { code: "RM-FLR-005", cat: "Flour & Grains", brand: "Master Chef", name: "100% Pure Cornstarch (Gawgaw)", supplier: "", room: "Dry Room 1", uom: "Sack", secUom: "kg", factor: 25, threshold: 2, bal: 50 },
  { code: "RM-FLR-006", cat: "Flour & Grains", brand: "General Milling", name: "Soft Cake Flour (Low-Protein / Chlorinated)", supplier: "", room: "Dry Room 1", uom: "Sack", secUom: "kg", factor: 25, threshold: 2, bal: 0 },
  { code: "RM-DRY-005", cat: "Flour & Grains", brand: "Good Seed Co.", name: "Desiccated Coconut (Medium / Fine Grade 500g)", supplier: "JCT Wheat & Sugar Products", room: "Dry Room 1", uom: "Bag", secUom: "kg", factor: 0.5, threshold: 5, bal: 4.5 },
  { code: "RM-FAT-001", cat: "Fats & Oils", brand: "Magnolia Buttercup", name: "Buttercup Margarine / Butter", supplier: "P.L. Sebastian Corporation", room: "Cold Room", uom: "Block", secUom: "kg", factor: 1, threshold: 25, bal: 129 },
  { code: "RM-FAT-002", cat: "Fats & Oils", brand: "Marca Leon", name: "Marca Leon Coconut Oil", supplier: "Lucky Roma Trading", room: "Wet Room", uom: "Tin Can", secUom: "kg", factor: 17, threshold: 5, bal: 67.5 },
  { code: "RM-FAT-003", cat: "Fats & Oils", brand: "Sunny Suy", name: "Vegetable Shortening", supplier: "Lucky Roma Trading", room: "Wet Room", uom: "Laton", secUom: "kg", factor: 30, threshold: 5, bal: 960 },
  { code: "RM-FAT-004", cat: "Fats & Oils", brand: "Alpha Margarine", name: "Margarine", supplier: "JCT Wheat & Sugar Products", room: "Wet Room", uom: "Laton", secUom: "kg", factor: 40, threshold: 3, bal: 544 },
  { code: "RM-FAT-005", cat: "Fats & Oils", brand: "Unlabeled", name: "Palm Oil", supplier: "Lucky Roma Trading", room: "Wet Room", uom: "Tin Can", secUom: "kg", factor: 17, threshold: 5, bal: 17 },
  { code: "RM-SWT-001", cat: "Sweeteners", brand: "Crystal Sugar Co.", name: "Crystal Brown Sugar", supplier: "Davao Great Wall Trading, Inc.", room: "Dry Room 1", uom: "Sack", secUom: "kg", factor: 50, threshold: 5, bal: 846.775 },
  { code: "RM-SWT-002", cat: "Sweeteners", brand: "Busco Cane", name: "Refined White Sugar", supplier: "Davao Great Wall Trading, Inc.", room: "Dry Room 1", uom: "Sack", secUom: "kg", factor: 50, threshold: 5, bal: 1250 },
  { code: "RM-SWT-003", cat: "Sweeteners & Salt", brand: "Fidelis / Master Chef", name: "Refined Iodized Fine Salt (ASIN Law RA 8172)", supplier: "P.L. Sebastian Corporation", room: "Dry Room 1", uom: "Sack", secUom: "kg", factor: 25, threshold: 2, bal: 0 },
  { code: "RM-DRY-001", cat: "Dairy & Eggs", brand: "Coop", name: "Fresh Eggs", supplier: "Local Poultry Coop", room: "Wet Room", uom: "Tray", secUom: "pcs", factor: 30, threshold: 50, bal: 3885 },
  { code: "RM-DRY-002", cat: "Dairy & Eggs", brand: "Master Chef", name: "Condensada (1kg Tin Can)", supplier: "Lucky Roma Trading", room: "Wet Room", uom: "Tin Can", secUom: "kg", factor: 1, threshold: 10, bal: 555.001 },
  { code: "RM-DRY-003", cat: "Dairy & Eggs", brand: "Jersey", name: "Evaporada (370ml Tin Can)", supplier: "Golden Fortune Trading", room: "Wet Room", uom: "Box", secUom: "can", factor: 48, threshold: 5, bal: 1393 },
  { code: "RM-LEV-001", cat: "Leavening & Additives", brand: "Gloripan", name: "Gloripan Instant Dry Yeast", supplier: "JCT Wheat & Sugar Products", room: "Dry Room 1", uom: "Box", secUom: "kg", factor: 10, threshold: 3, bal: -10 },
  { code: "RM-LEV-002", cat: "Leavening & Additives", brand: "Calumet", name: "Calumet Baking Powder", supplier: "JCT Wheat & Sugar Products", room: "Dry Room 1", uom: "Bag", secUom: "kg", factor: 14, threshold: 2, bal: 135 },
  { code: "PM-PAP-001", cat: "Packaging Materials", brand: "Mandaue Libertad", name: "Glassine Wax Paper Sheets (Otap Wrapping)", supplier: "Mandaue Libertad", room: "Dry Room 2", uom: "Rim", secUom: "pcs", factor: 500, threshold: 5, bal: 3000 },
  { code: "PM-PAP-002", cat: "Packaging Materials", brand: "Pattern Paper", name: "Baking Pan Pattern Paper (Laminated Sheets)", supplier: "JCT Wheat & Sugar Products", room: "Dry Room 2", uom: "Rim", secUom: "pcs", factor: 500, threshold: 3, bal: -18515 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('Warehouse Supervisor (Jade Q. Dela Cruz)');
  const [syncStatus, setSyncStatus] = useState('ONLINE — SYNCED');
  const [offlineMode, setOfflineMode] = useState(false);
  const [inventory, setInventory] = useState(INITIAL_MASTER_SKUS);
  const [queue, setQueue] = useState([]);
  const [receivingReports, setReceivingReports] = useState([
    { reportNo: "RR-2026-00001", poNo: "PO-2026-1001", supplier: "P.L. Sebastian Corporation", invoice: "Charge Invoice #26223", date: "2026-11-03", status: "Damaged", totalPaid: 74576 }
  ]);
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, timestamp: "2026-11-03 08:30:12", actor: "Jade Q. Dela Cruz", role: "Warehouse Supervisor", action: "SYSTEM_BOOT", details: "Manual v4.0 WMS initialized successfully." }
  ]);

  // Sync simulation loop & queue processing (with cleanup)
  useEffect(() => {
    let timeoutId = null;
    
    const timer = setInterval(() => {
      if (offlineMode) {
        setSyncStatus('OFFLINE — LOCAL QUEUE');
      } else if (queue.length > 0) {
        setSyncStatus('ONLINE — QUEUED (' + queue.length + ')');
        
        // Simulate batch worker sync after 3 seconds
        timeoutId = setTimeout(() => {
          setQueue(prev => {
            if (prev.length === 0) return [];
            const remaining = prev.slice(1);
            if (remaining.length === 0) setSyncStatus('ONLINE — SYNCED');
            return remaining;
          });
        }, 3000);
      } else {
        setSyncStatus('ONLINE — SYNCED');
      }
    }, 2000);

    return () => {
      clearInterval(timer);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [offlineMode, queue.length]);

  const handleForensicFix = () => {
    setInventory(prev => prev.map(item => {
      if (item.code === "RM-LEV-001") return { ...item, bal: 40 };
      if (item.code === "PM-PAP-002") return { ...item, bal: 1500 };
      return item;
    }));
    setAuditLogs(prev => [
      { id: Date.now(), timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '), actor: currentRole, role: "System Admin", action: "FORENSIC_RECONCILIATION_FIX", details: "Resolved historical negative balance anomalies for Gloripan Yeast and Pattern Paper." },
      ...prev
    ]);
    alert("Forensic UoM & Surplus Reconciliation successfully executed!");
  };

  const pushToQueue = (actionType, payload) => {
    const newItem = { queueId: "Q-" + Date.now(), actionType, payload, timestamp: new Date().toISOString() };
    setQueue(prev => [...prev, newItem]);
    setAuditLogs(prev => [
      { id: Date.now(), timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '), actor: currentRole, role: currentRole.split(' ')[0], action: actionType, details: JSON.stringify(payload) },
      ...prev
    ]);
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2A1B2E] font-sans flex flex-col">
      
      {/* TOP HEADER BAR */}
      <header className="bg-[#5B2E7A] text-white px-4 py-3 shadow-md flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#C8963E] p-2 rounded-lg text-white font-bold tracking-wider text-xs">JJB WMS</div>
          <div>
            <h1 className="font-serif text-lg font-bold leading-tight">Jang-Jang Bakeshop & Kingdom Confectionary</h1>
            <p className="text-xs text-[#E5C585]">Indangan Plant LTO #3000013388488 | BFP FSIC #RR-11-110400-6084471</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Sync Status Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm ${
            syncStatus.includes('SYNCED') ? 'bg-[#1E7A3E] text-white' :
            syncStatus.includes('QUEUED') ? 'bg-[#D68910] text-white animate-pulse' : 'bg-[#C0392B] text-white'
          }`}>
            {syncStatus.includes('SYNCED') ? <CheckCircle2 size={13} /> : syncStatus.includes('QUEUED') ? <Clock size={13} /> : <WifiOff size={13} />}
            <span>{syncStatus}</span>
          </div>

          {/* Role Switcher */}
          <select 
            value={currentRole} 
            onChange={(e) => setCurrentRole(e.target.value)}
            className="bg-[#3D1C52] text-white text-xs px-3 py-1.5 rounded border border-[#C8963E] focus:outline-none"
          >
            <option>Warehouse Supervisor (Jade Q. Dela Cruz)</option>
            <option>Ingredient Batching Preparer (Romeo B. Malusay)</option>
            <option>Master Head Baker (Alwen Hermogeno)</option>
            <option>FSCO 2 / QA Director (Grace P. Suico)</option>
            <option>Finance & Costing (Jeanifer S. Sauping)</option>
          </select>

          {/* Offline Toggle */}
          <button 
            onClick={() => setOfflineMode(!offlineMode)} 
            className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 ${offlineMode ? 'bg-[#C0392B] text-white' : 'bg-[#3D1C52] text-[#E5C585]'}`}
            title="Simulate offline condition"
          >
            {offlineMode ? <WifiOff size={13} /> : <Wifi size={13} />}
            <span>{offlineMode ? "Offline Mode" : "Online Mode"}</span>
          </button>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <nav className="bg-[#3D1C52] text-white px-4 flex overflow-x-auto gap-1 border-b border-[#C8963E]/30 shadow-inner">
        {[
          { id: 'dashboard', label: '1. Executive Cockpit', icon: Package },
          { id: 'receiving', label: '2. Inbound Receiving', icon: Warehouse },
          { id: 'batching', label: '3. Batching & Scaling', icon: Scale },
          { id: 'production', label: '4. Floor CCP & OPRP', icon: Flame },
          { id: 'quarantine', label: '5. Quarantine & EOD', icon: AlertTriangle },
          { id: 'npd', label: '6. NPD SLA & Climate', icon: FileText },
          { id: 'traceability', label: '7. Traceability / Recall', icon: ShieldCheck },
          { id: 'audit', label: '8. Audit & Sync Queue', icon: RefreshCw },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive ? 'border-[#C8963E] text-[#C8963E] bg-[#5B2E7A]/40' : 'border-transparent text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        
        {/* TAB 1: EXECUTIVE COCKPIT & LIVE FEFO */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">Executive Cockpit & Live FEFO Inventory</h2>
                <p className="text-xs text-gray-600">Perpetual stock valuation, FEFO rotation alerts, and 5-scale calibration governance.</p>
              </div>
              <button 
                onClick={handleForensicFix}
                className="bg-[#C8963E] hover:bg-[#b08030] text-white text-xs font-bold px-4 py-2 rounded shadow flex items-center gap-2 transition"
              >
                <RefreshCw size={14} /> Run Forensic UoM & Surplus Reconciliation Fix
              </button>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#E2D1B8] shadow-sm border-l-4 border-l-[#5B2E7A]">
                <p className="text-xs text-gray-500 font-bold uppercase">Active Master SKUs</p>
                <p className="text-2xl font-bold text-[#5B2E7A] mt-1">69 SKUs</p>
                <p className="text-[11px] text-gray-400 mt-1">Fully digitized across 4 storage rooms</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#E2D1B8] shadow-sm border-l-4 border-l-[#D68910]">
                <p className="text-xs text-gray-500 font-bold uppercase">Items Needing Reorder</p>
                <p className="text-2xl font-bold text-[#D68910] mt-1">26 SKUs</p>
                <p className="text-[11px] text-gray-400 mt-1">Below safety reorder threshold</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#E2D1B8] shadow-sm border-l-4 border-l-[#C0392B]">
                <p className="text-xs text-gray-500 font-bold uppercase">Lots Expiring &lt; 30 Days</p>
                <p className="text-2xl font-bold text-[#C0392B] mt-1">1 Lot</p>
                <p className="text-[11px] text-gray-400 mt-1">Fresh Eggs (EGG-20261013 - Nov 15)</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#E2D1B8] shadow-sm border-l-4 border-l-[#1E7A3E]">
                <p className="text-xs text-gray-500 font-bold uppercase">5-Scale Calibration</p>
                <p className="text-2xl font-bold text-[#1E7A3E] mt-1">5 / 5 Active</p>
                <p className="text-[11px] text-gray-400 mt-1">City Treasurer Seals Valid thru Jan 2027</p>
              </div>
            </div>

            {/* Live Inventory Table */}
            <div className="bg-white rounded-xl border border-[#E2D1B8] shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-[#FAF6EE] border-b border-[#E2D1B8] flex justify-between items-center">
                <h3 className="font-serif font-bold text-[#5B2E7A]">Live Perpetual Inventory & FEFO Status</h3>
                <span className="text-xs text-gray-500 font-medium">Showing top master items</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#5B2E7A] text-white">
                    <tr>
                      <th className="p-3">Material Code</th>
                      <th className="p-3">Item Name & Brand</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Storage Room</th>
                      <th className="p-3 text-right">Current Net Balance</th>
                      <th className="p-3 text-right">Reorder Threshold</th>
                      <th className="p-3 text-center">Stock Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2D1B8]">
                    {inventory.map((item, idx) => {
                      const isNegative = item.bal < 0;
                      const isLow = item.bal <= item.threshold;
                      return (
                        <tr key={idx} className="hover:bg-[#FAF6EE]/50">
                          <td className="p-3 font-mono font-bold text-[#5B2E7A]">{item.code}</td>
                          <td className="p-3 font-medium">{item.name} <span className="text-gray-400 text-[10px]">({item.brand})</span></td>
                          <td className="p-3">{item.cat}</td>
                          <td className="p-3">{item.room}</td>
                          <td className={`p-3 text-right font-bold ${isNegative ? 'text-[#C0392B]' : 'text-gray-800'}`}>
                            {item.bal.toLocaleString()} {item.secUom}
                          </td>
                          <td className="p-3 text-right text-gray-500">{item.threshold} {item.secUom}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isNegative ? 'bg-red-100 text-[#C0392B]' : isLow ? 'bg-amber-100 text-[#D68910]' : 'bg-green-100 text-[#1E7A3E]'
                            }`}>
                              {isNegative ? 'NEGATIVE ANOMALY' : isLow ? 'REORDER NEEDED' : 'HEALTHY'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INBOUND RECEIVING */}
        {activeTab === 'receiving' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">Inbound Receiving & CoA/Temp Inspection (`Form-REC-001`)</h2>
              <p className="text-xs text-gray-600">Enforce 30-min logging SLA, 0°C butter cellophane check, egg rinse gate, and valuation summaries.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E2D1B8] shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-[#5B2E7A] border-b pb-2">Log New Inbound Delivery Shipment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Report No.</label>
                  <input type="text" defaultValue="RR-2026-00002" className="w-full p-2 border rounded bg-gray-50 font-mono" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">PO / DR Number</label>
                  <input type="text" placeholder="e.g. PO-2026-1005" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Supplier Name</label>
                  <select className="w-full p-2 border rounded">
                    <option>P.L. Sebastian Corporation</option>
                    <option>Lucky Roma Trading</option>
                    <option>JCT Wheat & Sugar Products</option>
                    <option>Davao Great Wall Trading, Inc.</option>
                    <option>Mandaue Libertad Flexible Packaging Inc.</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Storage Room Destination</label>
                  <select className="w-full p-2 border rounded">
                    <option>Cold Room (Butter / 0°C)</option>
                    <option>Dry Room 1 (Flour & Sugar)</option>
                    <option>Wet Room (Oils & Eggs)</option>
                    <option>Dry Room 2 (Packaging)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mandatory Quality Gate Check</label>
                  <select className="w-full p-2 border rounded text-green-700 font-bold">
                    <option>0°C / Cellophane Expiry Sticker Checked (Butter)</option>
                    <option>Rinsed / Pass (Fresh Eggs Sanitation)</option>
                    <option>CoA & CoC Verified on File (General)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Receiver Inspector</label>
                  <input type="text" defaultValue="Jade Q. Dela Cruz" disabled className="w-full p-2 border rounded bg-gray-100 font-bold" />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button 
                  onClick={() => pushToQueue('STOCK_IN', { reportNo: 'RR-2026-00002', supplier: 'P.L. Sebastian Corporation', date: new Date().toISOString() })}
                  className="bg-[#5B2E7A] hover:bg-[#3D1C52] text-white text-xs font-bold px-5 py-2.5 rounded shadow transition flex items-center gap-2"
                >
                  <Plus size={15} /> Save & Queue Receiving Report (`Form-REC-001`)
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2D1B8] shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-[#FAF6EE] border-b border-[#E2D1B8]">
                <h3 className="font-serif font-bold text-[#5B2E7A]">Recent Inbound Shipment Valuations</h3>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-[#5B2E7A] text-white">
                  <tr>
                    <th className="p-3">Report No</th>
                    <th className="p-3">PO / DR #</th>
                    <th className="p-3">Supplier Name</th>
                    <th className="p-3">Invoice Type</th>
                    <th className="p-3">Date Received</th>
                    <th className="p-3 text-right">Total Payable (PHP)</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2D1B8]">
                  {receivingReports.map((r, i) => (
                    <tr key={i}>
                      <td className="p-3 font-mono font-bold text-[#5B2E7A]">{r.reportNo}</td>
                      <td className="p-3 font-mono">{r.poNo}</td>
                      <td className="p-3 font-medium">{r.supplier}</td>
                      <td className="p-3">{r.invoice}</td>
                      <td className="p-3">{r.date}</td>
                      <td className="p-3 text-right font-bold text-gray-800">₱{r.totalPaid.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'Damaged' ? 'bg-red-100 text-[#C0392B]' : 'bg-green-100 text-[#1E7A3E]'
                        }`}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BATCHING & SCALING */}
        {activeTab === 'batching' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">Precision Batch Kitting & Scale Calibration (`Form-CAL-001` / `Form-ING-001`)</h2>
              <p className="text-xs text-gray-600">Verify 5 City Treasurer scale seals (`#798073`–`#798605`), 40-mesh sifter, and Davao climate ice calculator.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E2D1B8] shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-[#5B2E7A] border-b pb-2 flex items-center justify-between">
                <span>Gate 0 — Pre-Shift 5-Scale Metrology Calibration (`Form-CAL-001`)</span>
                <span className="text-xs bg-green-100 text-[#1E7A3E] px-2 py-1 rounded font-bold">5 / 5 Seals Intact</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                {[
                  { seal: "Seal #798073", cap: "Bench Scale #1 (Dividing)", valid: "2027-01-10", status: "PASS" },
                  { seal: "Seal #798074", cap: "Bench Scale #2 (Packaging QC)", valid: "2027-01-10", status: "PASS" },
                  { seal: "Seal #798607", cap: "1 kg Precision Scale (Batching)", valid: "2027-01-28", status: "PASS" },
                  { seal: "Seal #798606", cap: "40 kg Platform (Receiving/Flour)", valid: "2027-01-28", status: "PASS" },
                  { seal: "Seal #798605", cap: "30 kg Platform (Glaze/Dough)", valid: "2027-01-28", status: "PASS" }
                ].map((s, idx) => (
                  <div key={idx} className="bg-[#FAF6EE] p-3 rounded border border-[#E2D1B8]">
                    <p className="font-mono font-bold text-[#5B2E7A]">{s.seal}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">{s.cap}</p>
                    <div className="mt-2 flex justify-between items-center text-[10px]">
                      <span className="text-gray-400">Valid: {s.valid}</span>
                      <span className="font-bold text-[#1E7A3E] bg-green-100 px-1.5 py-0.5 rounded">{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E2D1B8] shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-[#5B2E7A] border-b pb-2">Daily Production Requisition & Unitized Batch Kitting (`Form-PRO-001` / `Form-ING-001`)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Production Facility & Line</label>
                  <select className="w-full p-2 border rounded font-medium">
                    <option>Indangan - Biscocho Commercial Line (SKU: BIS-001)</option>
                    <option>Indangan - Otap Laminated Line (SKU: OTP-001)</option>
                    <option>Pan de Verde Retail Outlet (Communal, Davao City)</option>
                    <option>Laurice Delicacies Retail Outlet (Bankerohan, Davao City)</option>
                    <option>Biscocho Buttermilk Sweet Glaze (Banya Sub-Line)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Batch Multiplier & Scale Assigned</label>
                  <div className="flex gap-2">
                    <input type="number" defaultValue="1.0" step="0.5" className="w-1/2 p-2 border rounded" />
                    <select className="w-1/2 p-2 border rounded font-mono text-[11px]">
                      <option>Scale #3 (Seal #798607)</option>
                      <option>Scale #4 (Seal #798606)</option>
                      <option>Scale #5 (Seal #798605)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Davao Climate Ice Substitution (`Form-CAN-001`)</label>
                  <input type="text" defaultValue="Active Notice #CAN-2026-1029 (-1.2% Water / Flaked Ice)" disabled className="w-full p-2 border rounded bg-gray-100 font-bold text-amber-700" />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button 
                  onClick={() => pushToQueue('BATCH_ISSUANCE', { sku: 'BIS-001', multiplier: 1.0, timestamp: new Date().toISOString() })}
                  className="bg-[#C8963E] hover:bg-[#b08030] text-white text-xs font-bold px-5 py-2.5 rounded shadow transition flex items-center gap-2"
                >
                  <Printer size={15} /> Generate Batch Identification Tag & Pull List (`Form-ING-001`)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FLOOR CCP & OPRP */}
        {activeTab === 'production' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">Floor CCP Execution, *Banya* OPRP Timer & Yield Reconciliation</h2>
              <p className="text-xs text-gray-600">Monitor dough exit temp, CCP-1 lethality (`≥95°C`), live 4h glaze OPRP timer, and 60 towel counts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-[#E2D1B8] shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-serif font-bold text-[#5B2E7A]">Biscocho *Banya* Glaze OPRP Timer</h3>
                  <span className="bg-amber-100 text-[#D68910] text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">4h Hold Limit</span>
                </div>
                <div className="bg-[#FAF6EE] p-4 rounded-lg text-center space-y-2">
                  <p className="text-xs text-gray-500 font-bold">Elapsed Ambient Hold Time (Armando Lendong's Section)</p>
                  <p className="font-mono text-3xl font-bold text-[#5B2E7A]">01 : 42 : 10</p>
                  <p className="text-[11px] text-green-700 font-medium">Status: Safe within 4-hour maximum threshold (OPRP)</p>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Prep Station:</strong> Butter Room Glaze Section (2 mixers, 1 chest freezer)</p>
                  <p><strong>Application Station:</strong> Glazing/Coating Station (Single-sided brush)</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-[#E2D1B8] shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-serif font-bold text-[#5B2E7A]">Shift Yield Reconciliation Calculator</h3>
                  <span className="bg-green-100 text-[#1E7A3E] text-[10px] font-bold px-2 py-0.5 rounded">Target Var &lt; 2.0%</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Theoretical Formula Yield (Units)</label>
                    <input type="number" defaultValue="1000" className="w-full p-2 border rounded font-mono" />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Actual Finished Units Counted</label>
                    <input type="number" defaultValue="992" className="w-full p-2 border rounded font-mono font-bold text-[#1E7A3E]" />
                  </div>
                  <div className="bg-[#FAF6EE] p-3 rounded flex justify-between items-center font-bold">
                    <span>Computed Yield Variance:</span>
                    <span className="text-[#1E7A3E] font-mono text-sm">0.80% (PASS — Within ±2.0%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: QUARANTINE & EOD */}
        {activeTab === 'quarantine' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">Exterior Quarantine Cabinet & 17:00 EOD Reconciliation</h2>
              <p className="text-xs text-gray-600">Manage non-conforming lots (`Form-NCR-001`), financial loss allocations, and found surplus stock locks.</p>
            </div>

            <div className="bg-white rounded-xl border border-[#E2D1B8] shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-[#FAF6EE] border-b border-[#E2D1B8] flex justify-between items-center">
                <h3 className="font-serif font-bold text-[#5B2E7A]">Active Quarantined Raw Materials & Resolved CAPA History</h3>
                <span className="bg-red-100 text-[#C0392B] text-xs font-bold px-2.5 py-1 rounded">Exterior Quarantine Cabinet</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-[#5B2E7A] text-white">
                  <tr>
                    <th className="p-3">Reference / Red Tag ID</th>
                    <th className="p-3">Item Description & Lot</th>
                    <th className="p-3">Segregation Date</th>
                    <th className="p-3">Reason for Quarantine</th>
                    <th className="p-3 text-right">Financial Loss (PHP)</th>
                    <th className="p-3 text-center">Disposition Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2D1B8]">
                  <tr className="bg-red-50/50">
                    <td className="p-3 font-mono font-bold text-[#C0392B]">NCR-2026-1002</td>
                    <td className="p-3 font-medium">NECC Strawberry Red (Exp: 15 Jul 2025)</td>
                    <td className="p-3">2026-10-02</td>
                    <td className="p-3">Expired raw material found in active storage (PLI Critical Finding C-2)</td>
                    <td className="p-3 text-right font-mono font-bold">₱1,450.00</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 bg-red-100 text-[#C0392B] rounded font-bold text-[10px]">CONDEMNED & DESTROYED</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-[#5B2E7A]">NCR-2026-1001</td>
                    <td className="p-3 font-medium">Hyper Cacao Powder Super Crave (Exp: 22 Aug 2026)</td>
                    <td className="p-3">2026-10-02</td>
                    <td className="p-3">Expired raw material found in active storage (PLI Critical Finding C-2)</td>
                    <td className="p-3 text-right font-mono font-bold">₱850.00</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 bg-green-100 text-[#1E7A3E] rounded font-bold text-[10px]">WITNESSED DISPOSAL (FSCO)</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: NPD SLA & CLIMATE */}
        {activeTab === 'npd' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">5-Day NPD Pipeline SLA & Davao Climate Notices (`Form-NPD-001` / `Form-CAN-001`)</h2>
              <p className="text-xs text-gray-600">Track 72h technical reviews (Alwen/Ramil/Grace) and 48h costing reviews (Jeanifer/Maria Charito).</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E2D1B8] shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-[#5B2E7A] border-b pb-2">Active Davao Climate Hydration Notice (`Form-CAN-001`)</h3>
              <div className="bg-[#FAF6EE] p-4 rounded-lg border border-[#E2D1B8] text-xs space-y-2">
                <p className="font-bold text-[#3D1C52]">Notice Code: <span className="font-mono text-[#C8963E]">CAN-2026-1029</span> | Issued By: Master Head Baker Alwen Hermogeno</p>
                <p><strong>Environmental Trigger:</strong> Indangan ambient room temperature reached 32.5°C with 82% Relative Humidity.</p>
                <p><strong>Mandatory Action:</strong> Base formulation water weight adjusted by -1.2% with equivalent flaked ice substitution during initial low-speed spiral mixing to ensure dough exit temperature remains strictly within 26°C–28°C.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: TRACEABILITY / RECALL */}
        {activeTab === 'traceability' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">Bi-Directional Lot Traceability & 4-Hour Mock Recall Engine (`Form-TRC-001`)</h2>
              <p className="text-xs text-gray-600">Trace any supplier lot or finished retail lot across upstream receiving and downstream outlet distribution.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E2D1B8] shadow-sm space-y-4">
              <div className="flex gap-3">
                <input type="text" placeholder="Enter Supplier Lot # (e.g. 501720376, LOT-BC-202610, EGG-20261013) or Finished Lot..." className="flex-1 p-2.5 border rounded text-xs font-mono" />
                <button className="bg-[#5B2E7A] hover:bg-[#3D1C52] text-white text-xs font-bold px-6 py-2.5 rounded shadow transition flex items-center gap-2">
                  <Search size={15} /> Execute Traceability Lookup
                </button>
              </div>
              <div className="bg-[#FAF6EE] p-4 rounded-lg border border-[#E2D1B8] text-xs text-gray-600 space-y-1">
                <p className="font-bold text-[#3D1C52]">Traceability Result Preview:</p>
                <p>• <strong>Supplier:</strong> Lucky Roma Trading (PO-2026-1003 / RR-2026-00001)</p>
                <p>• <strong>Storage Location:</strong> Dry Room 1 (Pallet A2)</p>
                <p>• <strong>Batch Scaling Record (`Form-ING-001`):</strong> Issued to Alwen Hermogeno via Scale #4 (Seal #798606)</p>
                <p>• <strong>Downstream Distribution:</strong> Biscocho Commercial Batch #261103-BIS-001-B1 distributed to Pan de Verde (Communal) & Laurice Delicacies (Bankerohan).</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: AUDIT & SYNC QUEUE */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#3D1C52]">Immutable Audit Trail & Queue-First Apps Script Sync Monitor</h2>
              <p className="text-xs text-gray-600">Inspect real-time Cloudflare-to-GAS queue states (`LOCAL_QUEUE` -> `QUEUED` -> `SYNCED`) and `waitLock(5000)` logs.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-[#E2D1B8] shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-serif font-bold text-[#5B2E7A]">Cloudflare Pages & Google Apps Script Queue Inspector</h3>
                <span className="text-xs font-bold px-2 py-1 bg-green-100 text-[#1E7A3E] rounded">Mutex Lock `waitLock(5000)` Ready</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-[#FAF6EE] p-3 rounded border">
                  <p className="text-gray-500 font-bold uppercase text-[10px]">Pending Local Queue</p>
                  <p className="text-xl font-bold text-[#3D1C52] mt-1">{queue.length} Items</p>
                </div>
                <div className="bg-[#FAF6EE] p-3 rounded border">
                  <p className="text-gray-500 font-bold uppercase text-[10px]">Apps Script Trigger Status</p>
                  <p className="text-xl font-bold text-[#1E7A3E] mt-1">Active (1-Min Worker)</p>
                </div>
                <div className="bg-[#FAF6EE] p-3 rounded border">
                  <p className="text-gray-500 font-bold uppercase text-[10px]">LockService Exceptions</p>
                  <p className="text-xl font-bold text-gray-800 mt-1">0 Timeouts</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E2D1B8] shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-[#FAF6EE] border-b border-[#E2D1B8]">
                <h3 className="font-serif font-bold text-[#5B2E7A]">Chronological Immutable Audit Log</h3>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-[#5B2E7A] text-white">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor / Personnel</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Action Type</th>
                    <th className="p-3">Details & Parameters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2D1B8]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#FAF6EE]/50">
                      <td className="p-3 font-mono text-gray-500">{log.timestamp}</td>
                      <td className="p-3 font-bold text-[#5B2E7A]">{log.actor}</td>
                      <td className="p-3">{log.role}</td>
                      <td className="p-3 font-mono text-xs text-[#C8963E] font-bold">{log.action}</td>
                      <td className="p-3 text-gray-700 font-mono text-[11px]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-[#3D1C52] text-white py-4 px-6 text-center text-xs border-t border-[#C8963E]/30 mt-auto">
        <p>Jang-Jang Bakeshop & Kingdom Confectionary Business Lines · Manual of Operations Rev. 4.0 WMS Engine</p>
        <p className="text-[#E5C585] mt-1">Deployed on Cloudflare Pages & Google Apps Script Queue-First Architecture (`₱0.00 / Month` Stack)</p>
      </footer>

    </div>
  );
}
