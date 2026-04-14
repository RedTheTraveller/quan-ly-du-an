import React from 'react';
import { Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/constants';

export default function ResourceView({ stats, usersList }) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="bg-white p-10 rounded-[40px] shadow-sm">
        <h3 className="font-black mb-8 text-blue-600">Phân bổ nhân sự</h3>
        <div className="space-y-8">
          {usersList.filter(u => u.role !== 'PM').map(u => {
            const h = stats.userWork[u.id] || 0;
            const p = stats.time > 0 ? (h / stats.time) * 100 : 0;
            return (
              <div key={u.id}>
                <div className="flex justify-between font-black text-xs mb-3"><span>{u.avatar} {u.name}</span><span className="text-gray-400">{h}h ({p.toFixed(0)}%)</span></div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 transition-all duration-700" style={{width: `${p}%`}}></div></div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-[#1B2559] p-10 rounded-[40px] text-white flex flex-col justify-center items-center text-center">
        <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl rotate-12"><Wallet size={40}/></div>
        <h3 className="text-3xl font-black mb-2">{new Intl.NumberFormat('vi-VN').format(stats.cost)}đ</h3>
        <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">Tổng chi phí nhân công dự toán</p>
      </div>
    </div>
  );
}