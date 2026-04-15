import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabase';

export default function ForgotPassword({ setMode }) {
  const [email, setEmail] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // GỌI API SUPABASE ĐỂ GỬI MAIL THẬT
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/update-password', // Link quay lại web sau khi bấm vào email
    });

    if (error) {
      alert("Có lỗi xảy ra: " + error.message);
    } else {
      alert("Hệ thống đã gửi một email khôi phục mật khẩu. Vui lòng kiểm tra Hộp thư đến (hoặc Spam) của bạn!");
      setMode('login');
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setMode('login')} className="absolute -top-4 -left-4 text-gray-400 hover:text-blue-600 transition-colors">
        <ArrowLeft size={24} />
      </button>
      
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-[#1B2559]">Quên Mật Khẩu</h2>
        <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Bảo mật cấp cấp</p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-6">
        <p className="text-sm font-bold text-gray-400 text-center mb-4">Nhập email để nhận liên kết cài lại mật khẩu</p>
        <div className="relative group">
          <Mail className="absolute left-5 top-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="email" required
            className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập Gmail của bạn"
            value={email} onChange={e => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] transition-all uppercase tracking-widest text-sm">
          Gửi Email Khôi Phục
        </button>
      </form>
    </div>
  );
}