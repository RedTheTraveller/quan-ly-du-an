import React from 'react';
import { Search, Download, Bell } from 'lucide-react';

export default function Header({ view, search, setSearch, exportData, user }) {
  return (
    <header className="h-24 px-10 flex items-center justify-between bg-[#F4F7FE]/80 backdrop-blur-md">
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Trang chủ / {view}</p>
        <h2 className="text-2xl font-black text-[#1B2559] capitalize">{view === 'kanban' ? 'Quản lý Task' : view}</h2>
      </div>
      <div className="flex items-center gap-6 bg-white p-2 rounded-3xl shadow-sm border border-gray-50">
        <div className="flex items-center bg-gray-50 px-4 py-2 rounded-2xl w-64 border border-gray-100">
          <Search size={16} className="text-gray-400" />
          <input placeholder="Tìm kiếm công việc..." className="ml-3 bg-transparent border-none outline-none text-xs font-bold w-full" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={exportData} className="p-3 text-gray-400 hover:text-blue-600 transition-colors"><Download size={20}/></button>
        <button className="p-3 text-gray-400 hover:text-blue-600 transition-colors"><Bell size={20}/></button>
        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-black">{user.name[0]}</div>
      </div>
    </header>
  );
}