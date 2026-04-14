import React from 'react';

export default function Timeline({ data }) {
  const all = Object.values(data).flatMap(c => c.items).sort((a,b) => a.day - b.day);
  return (
    <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-50 overflow-x-auto">
      <div className="min-w-[1000px] space-y-6">
        <div className="flex border-b pb-4 text-[10px] font-black text-gray-300 uppercase">
          <div className="w-64">Công việc</div>
          <div className="flex-1 flex justify-between px-4">{Array.from({length: 15}).map(i => <div key={i}>Ngày {i*2+1}</div>)}</div>
        </div>
        {all.map(t => (
          <div key={t.id} className="flex items-center group">
            <div className="w-64 font-bold text-sm truncate pr-6">{t.avatar} {t.title}</div>
            <div className="flex-1 h-10 bg-gray-50 rounded-2xl relative">
              <div className="absolute h-full bg-blue-600 rounded-2xl shadow-lg flex items-center px-4 text-[9px] font-black text-white" style={{ left: `${(t.day-1)*3.2}%`, width: `${Math.max(10, t.time*2)}%` }}>{t.time}h</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}