import React from 'react';
import { Lock, User } from 'lucide-react';

export default function Login({ login, setLogin, onAuth, setMode }) {
  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-[#1B2559]">Đăng Nhập</h2>
        <p className="text-gray-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Hệ thống quản lý</p>
      </div>
      <form onSubmit={onAuth} className="space-y-6">
        <div className="relative group">
          <User className="absolute left-5 top-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input type="text" required className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500" placeholder="Email đăng nhập" value={login.u} onChange={e => setLogin({ ...login, u: e.target.value })} />
        </div>
        <div className="relative group">
          <Lock className="absolute left-5 top-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input type="password" required className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-blue-500" placeholder="Mật khẩu" value={login.p} onChange={e => setLogin({ ...login, p: e.target.value })} />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] transition-all uppercase tracking-widest text-sm">
          Đăng nhập
        </button>
        <div className="flex justify-between text-sm font-bold text-gray-400 mt-4 px-2">
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => setMode('forgot')}>Quên mật khẩu?</span>
          <span className="hover:text-blue-600 cursor-pointer" onClick={() => setMode('register')}>Đăng ký ngay</span>
        </div>
      </form>
    </div>
  );
}