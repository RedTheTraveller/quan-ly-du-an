import React, { useState } from 'react';
import { Briefcase, LogOut, PlusCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../supabase';

export default function ProjectAccess({ onAccessGranted, handleLogout }) {
  const [mode, setMode] = useState('join'); // 'join' hoặc 'create'
  
  // State cho Form Join
  const [joinCode, setJoinCode] = useState('');
  
  // State cho Form Create
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  
  const [error, setError] = useState('');

  // HÀM 1: VÀO DỰ ÁN ĐÃ CÓ
  const handleJoinProject = async (e) => {
    e.preventDefault();
    setError('');
    
    const { data, error: dbError } = await supabase
      .from('Project') 
      .select('*')
      .eq('project_id', joinCode)
      .single();

    if (dbError || !data) {
      setError('Mã dự án không tồn tại!');
    } else {
      onAccessGranted(data);
    }
  };

  // HÀM 2: TẠO DỰ ÁN MỚI
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra xem mã dự án mới này đã có ai xài chưa
    const { data: checkExist } = await supabase.from('Project').select('id').eq('project_id', newCode).single();
    if (checkExist) {
      setError('Mã dự án này đã tồn tại, vui lòng chọn mã khác!');
      return;
    }

    // Thêm dự án mới vào Database
    const { data, error: dbError } = await supabase
      .from('Project')
      .insert([{ 
        project_id: newCode.toUpperCase(), 
        project_name: newName 
      }])
      .select()
      .single();

    if (dbError) {
      setError('Lỗi khi tạo dự án: ' + dbError.message);
    } else {
      alert("Tạo dự án thành công!");
      onAccessGranted(data); // Tạo xong thì tự động đẩy vào dự án đó luôn
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <button onClick={handleLogout} className="absolute top-6 right-6 flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors font-bold">
        <LogOut size={20} /> Thoát tài khoản
      </button>

      <div className="bg-white p-10 rounded-3xl shadow-xl w-[450px]">
        {/* THANH ĐIỀU HƯỚNG CHUYỂN ĐỔI 2 CHẾ ĐỘ */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
          <button 
            onClick={() => { setMode('join'); setError(''); }}
            className={`flex-1 py-3 font-bold rounded-xl transition-all ${mode === 'join' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Vào Dự Án
          </button>
          <button 
            onClick={() => { setMode('create'); setError(''); }}
            className={`flex-1 py-3 font-bold rounded-xl transition-all ${mode === 'create' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Tạo Mới
          </button>
        </div>

        {/* ================= FORM VÀO DỰ ÁN ================= */}
        {mode === 'join' ? (
          <form onSubmit={handleJoinProject} className="space-y-6 animate-fade-in">
             <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-[#1B2559]">Tham Gia Dự Án</h2>
                <p className="text-gray-400 text-sm mt-1">Nhập mã để quản lý tiến độ</p>
            </div>
            <div className="relative group">
              <Briefcase className="absolute left-5 top-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text" required
                className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                placeholder="Mã dự án (VD: DA001)"
                value={joinCode} onChange={e => setJoinCode(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all uppercase flex justify-center items-center gap-2">
              Truy cập <ArrowRight size={20} />
            </button>
          </form>
        ) : (
          /* ================= FORM TẠO DỰ ÁN MỚI ================= */
          <form onSubmit={handleCreateProject} className="space-y-4 animate-fade-in">
             <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-[#1B2559]">Khởi Tạo Dự Án</h2>
                <p className="text-gray-400 text-sm mt-1">Cấp mã mới cho đội ngũ của bạn</p>
            </div>
            
            <div>
              <label className="text-xs font-bold text-gray-500 ml-2 uppercase">Mã quản lý (Project ID)</label>
              <input
                type="text" required
                className="w-full px-6 py-4 mt-1 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                placeholder="VD: WIN2026"
                value={newCode} onChange={e => setNewCode(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 ml-2 uppercase">Tên dự án</label>
              <input
                type="text" required
                className="w-full px-6 py-4 mt-1 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="VD: Xây dựng Website QLDA"
                value={newName} onChange={e => setNewName(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm font-bold text-center pt-2">{error}</p>}
            
            <button type="submit" className="w-full bg-[#1B2559] text-white py-5 rounded-2xl font-black shadow-xl hover:bg-gray-800 transition-all uppercase flex justify-center items-center gap-2 mt-4">
              <PlusCircle size={20} /> Tạo & Bắt đầu ngay
            </button>
          </form>
        )}
      </div>
    </div>
  );
}