import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, AlertTriangle, Package, Clock, Warehouse, 
  ArrowUpRight, ArrowDownRight, Layers, Eye, RefreshCw
} from 'lucide-react';

export default function ExecutiveDashboard({ 
  inventory, 
  isMobileMode, 
  onQuickAction,
  storageRooms 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, LOW_STOCK, EXPIRING_SOON, HEALTHY
  const [selectedItemLots, setSelectedItemLots] = useState(null);

  const categories = useMemo(() => {
    const set = new Set(inventory.map(i => i.category));
    return ['ALL', ...Array.from(set)];
  }, [inventory]);

  // DYNAMIC DATE FIX: Compares against actual system time, with seed date fallback
  const isExpiringSoon = (lots) => {
    if (!lots || lots.length === 0) return false;
    const systemNow = new Date().getTime();
    const demoNow = new Date("2026-11-03").getTime(); 
    const referenceDate = systemNow > demoNow ? systemNow : demoNow; 

    return lots.some(lot => {
      const exp = new Date(lot.expiryDate).getTime();
      const diffDays = (exp - referenceDate) / (1000 * 60 * 60 * 24);
      return diffDays <= 30;
    });
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRoom = selectedRoom === 'ALL' || item.room === selectedRoom;
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;

      const isLow = item.currentBalance <= item.threshold;
      const isExpiring = isExpiringSoon(item.lots);

      let matchesStatus = true;
      if (statusFilter === 'LOW_STOCK') matchesStatus = isLow;
      if (statusFilter === 'EXPIRING_SOON') matchesStatus = isExpiring;
      if (statusFilter === 'HEALTHY') matchesStatus = !isLow && !isExpiring;

      return matchesSearch && matchesRoom && matchesCategory && matchesStatus;
    });
  }, [inventory, searchTerm, selectedRoom, selectedCategory, statusFilter]);

  const totalValuation = useMemo(() => {
    return inventory.reduce((sum, item) => {
      const primaryUnits = item.currentBalance / (item.conversionFactor || 1);
      return sum + (primaryUnits * (item.unitCost || 0));
    }, 0);
  }, [inventory]);

  const lowStockCount = useMemo(() => {
    return inventory.filter(i => i.currentBalance <= i.threshold).length;
  }, [inventory]);

  const expiringCount = useMemo(() => {
    return inventory.filter(i => isExpiringSoon(i.lots)).length;
  }, [inventory]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E2D1B8] shadow-sm border-l-4 border-l-[#5B2E7A] flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Perpetual Stock Valuation</p>
            <h3 className="text-xl md:text-2xl font-bold font-serif text-[#3D1C52] mt-0.5">
              ₱{totalValuation.toLocaleString('en-PH', { maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">Across 4 Indangan bodega chambers</p>
          </div>
          <div className="bg-[#5B2E7A]/10 p-3 rounded-lg text-[#5B2E7A]">
            <Package size={24} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2D1B8] shadow-sm border-l-4 border-l-[#C8963E] flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Active Master Catalog</p>
            <h3 className="text-xl md:text-2xl font-bold font-serif text-[#C8963E] mt-0.5">
              {inventory.length} SKUs
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">Dual-UoM conversion active</p>
          </div>
          <div className="bg-[#C8963E]/10 p-3 rounded-lg text-[#C8963E]">
            <Layers size={24} />
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'LOW_STOCK' ? 'ALL' : 'LOW_STOCK')}
          className={`bg-white p-4 rounded-xl border border-[#E2D1B8] shadow-sm border-l-4 border-l-[#D68910] flex items-center justify-between cursor-pointer transition hover:shadow-md ${statusFilter === 'LOW_STOCK' ? 'ring-2 ring-[#D68910]' : ''}`}
        >
          <div>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Reorder Alerts (&lt; Safe Threshold)</p>
            <h3 className="text-xl md:text-2xl font-bold font-serif text-[#D68910] mt-0.5">
              {lowStockCount} Items
            </h3>
            <p className="text-[11px] text-[#D68910] font-medium mt-1">
              {statusFilter === 'LOW_STOCK' ? 'Filter active (click to clear)' : 'Click to filter low stock items'}
            </p>
          </div>
          <div className="bg-[#D68910]/10 p-3 rounded-lg text-[#D68910]">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'EXPIRING_SOON' ? 'ALL' : 'EXPIRING_SOON')}
          className={`bg-white p-4 rounded-xl border border-[#E2D1B8] shadow-sm border-l-4 border-l-[#C0392B] flex items-center justify-between cursor-pointer transition hover:shadow-md ${statusFilter === 'EXPIRING_SOON' ? 'ring-2 ring-[#C0392B]' : ''}`}
        >
          <div>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Lots Expiring < 30 Days</p>
            <h3 className="text-xl md:text-2xl font-bold font-serif text-[#C0392B] mt-0.5">
              {expiringCount} Lots
            </h3>
            <p className="text-[11px] text-[#C0392B] font-medium mt-1">
              {statusFilter === 'EXPIRING_SOON' ? 'Filter active (click to clear)' : 'Priority FEFO issuance required'}
            </p>
          </div>
          <div className="bg-[#C0392B]/10 p-3 rounded-lg text-[#C0392B]">
            <Clock size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-[#E2D1B8] shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-gray-500 mr-2 flex items-center gap-1">
            <Warehouse size={14} /> Chamber:
          </span>
          <button
            onClick={() => setSelectedRoom('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedRoom === 'ALL' ? 'bg-[#3D1C52] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Chambers ({inventory.length})
          </button>
          {storageRooms.map(room => {
            const count = inventory.filter(i => i.room === room.id).length;
            const isSelected = selectedRoom === room.id;
            return (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isSelected ? 'bg-[#5B2E7A] text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {room.name} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onQuickAction('receiving')}
            className="bg-[#1E7A3E] hover:bg-[#165c2f] text-white text-xs font-bold px-3 py-1.5 rounded shadow flex items-center gap-1 transition"
          >
            <ArrowDownRight size={14} /> Receive Goods
          </button>
          <button
            onClick={() => onQuickAction('issuance')}
            className="bg-[#5B2E7A] hover:bg-[#3D1C52] text-white text-xs font-bold px-3 py-1.5 rounded shadow flex items-center gap-1 transition"
          >
            <ArrowUpRight size={14} /> Issue Stock
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#E2D1B8] shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search material code (e.g. RM-FLR-001), item name, brand, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8963E]"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Filter size={14} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs p-2 border border-gray-300 rounded-lg bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#C8963E]"
            >
              <option value="ALL">All Categories</option>
              {categories.filter(c => c !== 'ALL').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 border border-gray-300 rounded-lg bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#C8963E]"
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="LOW_STOCK">⚠️ Low Stock / Reorder Needed</option>
            <option value="EXPIRING_SOON">⏱ Expiring Soon (< 30 Days)</option>
            <option value="HEALTHY">✅ Healthy Balance</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2D1B8] shadow-sm overflow-hidden">
        <div className="px-6 py-3.5 bg-[#FAF6EE] border-b border-[#E2D1B8] flex justify-between items-center">
          <h3 className="font-serif font-bold text-[#3D1C52]">
            Live Perpetual Inventory & FEFO Status
          </h3>
          <span className="text-xs bg-[#5B2E7A]/10 text-[#5B2E7A] px-2 py-0.5 rounded-full font-bold">
            {filteredInventory.length} of {inventory.length} SKUs shown
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#5B2E7A] text-white">
              <tr>
                <th className="p-3">Material Code</th>
                <th className="p-3">Item Description & Brand</th>
                <th className="p-3">Storage Chamber</th>
                <th className="p-3 text-right">Primary UoM (Bulk)</th>
                <th className="p-3 text-right">Secondary Net Balance</th>
                <th className="p-3 text-right">Reorder Threshold</th>
                <th className="p-3">Oldest FEFO Lot</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2D1B8]">
              {filteredInventory.map((item) => {
                const isLow = item.currentBalance <= item.threshold;
                const isExp = isExpiringSoon(item.lots);
                const primaryBulk = (item.currentBalance / item.conversionFactor).toFixed(1);
                const oldestLot = item.lots && item.lots.length > 0 ? item.lots[0] : null;

                return (
                  <tr key={item.code} className="hover:bg-[#FAF6EE]/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#5B2E7A]">{item.code}</td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      <div className="text-[11px] text-gray-500">{item.brand ? `Brand: ${item.brand} · ` : ''}{item.category}</div>
                    </td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-800">{item.room}</span></td>
                    <td className="p-3 text-right font-mono font-semibold text-gray-700">{primaryBulk} {item.primaryUom}s</td>
                    <td className={`p-3 text-right font-mono font-bold ${item.currentBalance < 0 ? 'text-[#C0392B]' : isLow ? 'text-[#D68910]' : 'text-gray-900'}`}>
                      {item.currentBalance.toLocaleString('en-PH', { maximumFractionDigits: 2 })} {item.secondaryUom}
                    </td>
                    <td className="p-3 text-right text-gray-500 font-mono">{item.threshold.toLocaleString()} {item.secondaryUom}</td>
                    <td className="p-3 font-mono text-[11px]">
                      {oldestLot ? (
                        <div>
                          <span className="font-semibold text-gray-800">{oldestLot.lotNumber}</span>
                          <div className={isExp ? 'text-[#C0392B] font-bold' : 'text-gray-500'}>Exp: {oldestLot.expiryDate}</div>
                        </div>
                      ) : <span className="text-gray-400">Standard Shelf</span>}
                    </td>
                    <td className="p-3 text-center">
                      {isLow ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-[#D68910]">REORDER NEEDED</span>
                      ) : isExp ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-[#C0392B] animate-pulse">EXPIRING SOON</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-[#1E7A3E]">HEALTHY</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setSelectedItemLots(item)} className="p-1 text-gray-500 hover:text-[#5B2E7A] rounded" title="View Lots">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => onQuickAction('issuance', item)} className="px-2 py-1 bg-[#5B2E7A] text-white rounded text-[11px] font-bold hover:bg-[#3D1C52]">
                          Issue
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
