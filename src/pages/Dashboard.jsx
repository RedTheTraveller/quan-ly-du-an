import React from 'react';
import { Wallet, Clock, TrendingUp, ListTodo, BarChart3 } from 'lucide-react';

function StatCard({ label, val, icon, color }) {
  return (
    <div className="bg-white p-7 rounded-[40px] shadow-sm border border-gray-50 flex items-center gap-5 hover:scale-105 transition-transform">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl shadow-inner">{icon}</div>
      <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p><p className="text-xl font-black text-[#1B2559]">{val}</p></div>
    </div>
  );
}

export default function Dashboard({ stats }) {
  return (
    <div className="grid grid-cols-4 gap-6 animate-in fade-in duration-500">
      <StatCard label="Tổng ngân sách" val={new Intl.NumberFormat('vi-VN').format(stats.cost) + 'đ'} icon={<Wallet className="text-blue-500"/>} color="blue" />
      <StatCard label="Tổng giờ làm" val={stats.time + 'h'} icon={<Clock className="text-purple-500"/>} color="purple" />
      <StatCard label="Tiến độ dự án" val={stats.percent + '%'} icon={<TrendingUp className="text-emerald-500"/>} color="emerald" />
      <StatCard label="Số lượng Task" val={stats.total} icon={<ListTodo className="text-orange-500"/>} color="orange" />
      
      <div className="col-span-3 bg-white p-8 rounded-[40px] shadow-sm border border-gray-50 flex flex-col justify-center">
        <h3 className="text-lg font-black mb-6 flex items-center gap-2"><BarChart3 size={20} className="text-blue-600"/> Tóm lược dự án</h3>
        <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
          <div className="absolute h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000 shadow-lg" style={{width: `${stats.percent}%`}}></div>
        </div>
        <div className="flex justify-between mt-4 text-xs font-black text-gray-400 uppercase tracking-widest">
          <span>Khởi động</span>
          <span>Đang thực hiện ({stats.percent}%)</span>
          <span>Hoàn thành</span>
        </div>
      </div>
      
      <div className="col-span-1 bg-blue-600 p-8 rounded-[40px] text-white shadow-xl shadow-blue-100">
        <h3 className="font-black text-sm uppercase opacity-60 mb-8">Trình trạng Rủi ro</h3>
        <div className="text-5xl font-black mb-2">Thấp</div>
        <p className="text-xs font-bold opacity-80 leading-relaxed">Dựa trên thuật toán PERT, các task bi quan (Pessimistic) đang ở mức kiểm soát được.</p>
      </div>
    </div>
  );
}