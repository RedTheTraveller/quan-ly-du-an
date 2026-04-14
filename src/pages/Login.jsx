// File: src/pages/Login.jsx
import React from 'react';
import { Lock, User } from 'lucide-react';

export default function Login({ login, setLogin, onAuth, currentUser }) {
  return (
    <div className="h-screen bg-[#F4F7FE] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-blue-200/40 rounded-full blur-[120px]"></div>
            <div className="w-full max-w-[500px] bg-white rounded-[60px] p-16 shadow-2xl relative z-10 border border-white">
                <div className="text-center mb-12">
                <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl rotate-6"><Lock size={30}/></div>
                <h2 className="text-4xl font-black text-[#1B2559] tracking-tighter mb-2">Đăng nhập.</h2>
                <p className="text-gray-400 font-bold">Quản Trị Dự Án</p>
                </div>
                <form onSubmit={onAuth} className="space-y-6">
                <input 
                    className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300" 
                    placeholder="Username" 
                    value={login.u} 
                    onChange={e => setLogin({...login, u: e.target.value})} 
                />
                <input 
                    type="password" 
                    className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300" 
                    placeholder="Password" 
                    value={login.p} 
                    onChange={e => setLogin({...login, p: e.target.value})} 
                />
              
                <div className="pt-2">
                    <p className="text-[10px] font-black text-blue-500 uppercase ml-2 mb-2">Mã Project</p>
                    <input 
                        className="w-full p-5 bg-blue-50 border-2 border-blue-100 rounded-2xl font-black text-blue-600 uppercase" 
                        // Hiển thị mã định danh tương ứng với User, nếu không có thì để trống
                        value={currentUser ? currentUser.memberId : "CHỜ NHẬP MÃ..."} 
                        readOnly 
                        />
                    </div>
              
                    <button className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-blue-100 hover:scale-[1.02] active:scale-95 transition-all mt-4 uppercase tracking-widest">
                        Vào hệ thống
                    </button>
                </form>
            </div>
        </div>
  );
}