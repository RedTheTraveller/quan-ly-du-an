import React, { useState } from 'react';
import { Calculator, X } from 'lucide-react';

export default function TaskModal({ task, close, onSave, usersList }) {
  const [f, setF] = useState(task || { title: '', assigneeId: '', day: 1, o: 0, m: 0, p: 0, priority: 'Medium' });
  return (
    <div className="fixed inset-0 bg-[#1B2559]/30 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl p-12 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-2xl font-black flex items-center gap-3"><Calculator className="text-blue-600"/> {task ? 'Cập nhật Task' : 'Thiết lập PERT'}</h3>
          <button onClick={close} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"><X/></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(f); }} className="space-y-6">
          <input required className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300" placeholder="Tên công việc" value={f.title} onChange={e => setF({...f, title: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <select className="p-5 bg-gray-50 rounded-2xl font-bold" value={f.assigneeId} onChange={e => setF({...f, assigneeId: e.target.value})} required>
              <option value="">Giao cho...</option>
              {usersList.filter(u => u.role !== 'PM').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <input type="number" className="p-5 bg-gray-50 rounded-2xl font-bold" placeholder="Ngày hạn (1-31)" value={f.day} onChange={e => setF({...f, day: e.target.value})} />
          </div>
          <div className="bg-[#1B2559] p-8 rounded-[32px] text-white">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 text-center">Tham số ước lượng (Giờ công)</p>
            <div className="grid grid-cols-3 gap-6">
               <div className="space-y-2 text-center"><label className="text-[10px] font-bold opacity-60">Lạc quan (O)</label><input type="number" className="w-full bg-white/10 p-4 rounded-2xl font-black text-center" value={f.o} onChange={e => setF({...f, o: e.target.value})} /></div>
               <div className="space-y-2 text-center"><label className="text-[10px] font-bold opacity-60">Khả thi (M)</label><input type="number" className="w-full bg-white/10 p-4 rounded-2xl font-black text-center" value={f.m} onChange={e => setF({...f, m: e.target.value})} /></div>
               <div className="space-y-2 text-center"><label className="text-[10px] font-bold opacity-60">Bi quan (P)</label><input type="number" className="w-full bg-white/10 p-4 rounded-2xl font-black text-center" value={f.p} onChange={e => setF({...f, p: e.target.value})} /></div>
            </div>
          </div>
          <div className="flex gap-4 justify-end pt-4">
            <button type="button" onClick={close} className="px-8 py-4 font-black text-gray-400">Hủy</button>
            <button type="submit" className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:scale-105 transition-all">LƯU CÔNG VIỆC</button>
          </div>
        </form>
      </div>
    </div>
  );
}