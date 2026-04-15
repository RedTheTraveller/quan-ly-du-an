import React, { useState } from 'react';
import { Key } from 'lucide-react';
import { supabase } from '../supabase';

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Gọi API của Supabase để lưu mật khẩu mới
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      alert("Lỗi: " + error.message);
    } else {
      alert("Đổi mật khẩu thành công! Giờ sếp có thể đăng nhập bằng mật khẩu mới.");
      // Chuyển hướng về trang chủ/đăng nhập
      window.location.href = '/'; 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-[400px]">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-[#1B2559]">Mật Khẩu Mới</h2>
          <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">
            Nhập mật khẩu mới của bạn
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="relative group">
            <Key className="absolute left-5 top-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="password" required
              className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] transition-all uppercase tracking-widest text-sm">
            Cập Nhật Mật Khẩu
          </button>
        </form>
      </div>
    </div>
  );
}