import React from 'react';
import { LayoutDashboard, KanbanSquare, Layers, User2 } from 'lucide-react';

function Menu({ active, icon, label, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-gray-400 hover:bg-gray-50'}`}>
      {React.cloneElement(icon, { size: 18 })} {label}
    </button>
  );
}

export default function Sidebar({ view, setView, user, setUser }) {
  return (
    <aside className="w-72 bg-white flex flex-col p-8 shadow-2xl shadow-gray-100 z-50">
      <div className="flex items-center gap-4 mb-14 px-2">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">D.IT</div>
        <h1 className="text-xl font-black tracking-tight text-gray-800">DựÁn.PRO</h1>
      </div>

      <nav className="flex-1 space-y-2">
        <Menu active={view === 'dashboard'} icon={<LayoutDashboard/>} label="Dashboard" onClick={() => setView('dashboard')} />
        <Menu active={view === 'kanban'} icon={<KanbanSquare/>} label="Bảng Kanban" onClick={() => setView('kanban')} />
        <Menu active={view === 'timeline'} icon={<Layers/>} label="Dòng thời gian" onClick={() => setView('timeline')} />
        <Menu active={view === 'resource'} icon={<User2/>} label="Nhân sự & Chi phí" onClick={() => setView('resource')} />
      </nav>

      <div className="mt-auto bg-gray-50 rounded-3xl p-6 border border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-2xl">{user.avatar}</div>
          <div className="overflow-hidden">
            <p className="text-sm font-black truncate">{user.name}</p>
            <p className="text-[10px] font-bold text-blue-500 uppercase">{user.role}</p>
          </div>
        </div>
        <button onClick={() => setUser(null)} className="w-full py-3 bg-white text-red-500 rounded-xl font-bold text-[11px] uppercase border border-red-50 hover:bg-red-50 transition-all">Đăng xuất</button>
      </div>
    </aside>
  );
}