import React, { useState } from 'react';
import { Briefcase, LogOut, PlusCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../supabase';

export default function ProjectAccess({ onAccessGranted, handleLogout }) {
  const [mode, setMode] = useState('join');
  const [joinCode, setJoinCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const handleJoinProject = async (e) => {
    e.preventDefault();
    setError('');

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) { setError('Lỗi xác thực, vui lòng đăng nhập lại!'); return; }

    const { data: projectData, error: dbError } = await supabase
      .from('Project')
      .select('*')
      .eq('project_id', joinCode.toUpperCase())
      .single();

    if (dbError || !projectData) { setError('Mã dự án không tồn tại!'); return; }

    onAccessGranted(projectData);
  };

 const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Lấy user từ Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Lỗi xác thực!'); return; }

    // 2. Lấy ID số (int8) từ bảng Users
    const { data: dbUser, error: dbUserError } = await supabase
      .from('Users')
      .select('id')
      .eq('email', user.email)
      .single();

    if (dbUserError || !dbUser) { 
      setError('Không tìm thấy thông tin nhân sự trong hệ thống!'); 
      return; 
    }

    // 3. Insert dự án mới vào DB
    const { data: newProject, error: createError } = await supabase
      .from('Project')
      .insert([
        {
          project_id: newCode.toUpperCase(),
          project_name: newName, 
          leader_id: dbUser.id,
          time_start: new Date().toISOString(),
          time_end: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (createError) {
      setError('Lỗi tạo dự án: ' + createError.message);
      return;
    }

    // 4. Cấp quyền truy cập
    onAccessGranted({ ...newProject, currentUserRole: 'PM' });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-[40px] shadow-xl w-full max-w-md relative">
        <button onClick={handleLogout} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors">
          <LogOut size={24} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1B2559] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Briefcase className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-black text-[#1B2559]">Không gian làm việc</h2>
        </div>

        <div className="flex gap-2 mb-8 bg-gray-50 p-1.5 rounded-2xl">
          <button onClick={() => {setMode('join'); setError('');}} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'join' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Tham gia</button>
          <button onClick={() => {setMode('create'); setError('');}} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'create' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Tạo mới</button>
        </div>

        {mode === 'join' ? (
          <form onSubmit={handleJoinProject} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-500 ml-2 uppercase">Mã quản lý (Project ID)</label>
              <input type="text" required className="w-full px-6 py-4 mt-1 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase" placeholder="Nhập mã dự án..." value={joinCode} onChange={e => setJoinCode(e.target.value)} />
            </div>
            {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all uppercase text-sm flex items-center justify-center gap-2">Vào dự án <ArrowRight size={18} /></button>
          </form>
        ) : (
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 ml-2 uppercase">Mã dự án mới (Viết liền, không dấu)</label>
              <input type="text" required className="w-full px-6 py-4 mt-1 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase" placeholder="VD: WIN2026" value={newCode} onChange={e => setNewCode(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 ml-2 uppercase">Tên dự án</label>
              <input type="text" required className="w-full px-6 py-4 mt-1 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: Xây dựng Website QLDA" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            {error && <p className="text-red-500 text-sm font-bold text-center pt-2">{error}</p>}
            <button type="submit" className="w-full bg-[#1B2559] text-white py-5 rounded-2xl font-black shadow-xl hover:bg-blue-900 transition-all uppercase text-sm flex items-center justify-center gap-2"><PlusCircle size={18} /> Khởi tạo ngay</button>
          </form>
        )}
      </div>
    </div>
  );
}