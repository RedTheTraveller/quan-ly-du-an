import React, { useState } from 'react';
import { User, Mail, Key, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabase';

export default function Register({ setMode }) {
  const [regData, setRegData] = useState({ name: '', email: '', password: '' });

  const handleRegister = async (e) => {
    e.preventDefault();
  
    // 1. Tạo tài khoản mã hóa trên hệ thống bảo mật của Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regData.email,
        password: regData.password,
    });

    if (authError) {
        alert("Lỗi đăng ký: " + authError.message);
        return;
    }

    // 2. Lưu tên và Role vào bảng Users của sếp để sau này còn giao việc (Task)
    const { error: dbError } = await supabase.from('Users').insert([{
        email: regData.email,
        name: regData.name,
        role: 'Member'
    }]);

    if (dbError) {
        console.error("Lỗi đồng bộ hồ sơ:", dbError);
    }

    alert("Đăng ký thành công! (Nếu Supabase yêu cầu, hãy kiểm tra email để xác thực)");
    setMode('login');
  };

  // ĐÂY LÀ PHẦN GIAO DIỆN (UI) MÀ SẾP LỠ TAY XÓA MẤT NÀY 👇
  return (
    <div className="relative">
      <button onClick={() => setMode('login')} className="absolute -top-4 -left-4 text-gray-400 hover:text-blue-600 transition-colors">
        <ArrowLeft size={24} />
      </button>
      
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-[#1B2559]">Đăng Ký</h2>
        <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Tạo tài khoản mới</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-6">
        <div className="relative group">
          <User className="absolute left-5 top-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text" required
            className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Họ và tên"
            value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})}
          />
        </div>

        <div className="relative group">
          <Mail className="absolute left-5 top-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="email" required
            className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Nhập Gmail của bạn"
            value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})}
          />
        </div>

        <div className="relative group">
          <Key className="absolute left-5 top-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="password" required
            className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Mật khẩu"
            value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})}
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] transition-all uppercase tracking-widest text-sm">
          Đăng Ký
        </button>
      </form>
    </div>
  );
}