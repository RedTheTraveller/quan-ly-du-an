import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';

export default function Auth({ login, setLogin, onAuth }) {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center p-4">
      <div className="bg-white p-12 rounded-[48px] shadow-xl w-full max-w-md border border-gray-100">
        
        {/* Cái logo ổ khóa dùng chung cho cả 3 trang cho đẹp */}
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-12">
          <Lock className="text-white" size={40} />
        </div>

        {/* Gọi component tương ứng dựa vào biến mode */}
        {mode === 'login' && <Login login={login} setLogin={setLogin} onAuth={onAuth} setMode={setMode} />}
        {mode === 'register' && <Register setMode={setMode} />}
        {mode === 'forgot' && <ForgotPassword setMode={setMode} />}

        <p className="text-center mt-8 text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
          © 2026 QUAN LY DU AN V1.0
        </p>
      </div>
    </div>
  );
}