import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Auth = ({ darkMode, accentColor, t }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      toast.error('Error: ' + error.message, {
        style: {
          borderRadius: '16px',
          background: '#1e293b',
          color: '#fff',
        },
      });
    } else {
      toast.success(t.auth_check_email, {
        duration: 5000,
        icon: '✉️',
        style: {
          borderRadius: '16px',
          background: '#0f172a',
          color: '#fff',
          border: '1px solid #3b82f6'
        },
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <h2 className={`text-2xl font-black mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
        {t.auth_title}
      </h2>
      <p className="text-sm mb-8 opacity-70">
        {t.auth_subtitle}
      </p>
      
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <input
          type="email"
          id="auth-email"
          name="email"
          autoComplete="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full p-4 rounded-2xl border-2 transition-all outline-none ${
            darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' 
                     : 'bg-slate-100 border-slate-200 focus:border-blue-500'
          }`}
          required
        />
        <button
          disabled={loading}
          style={{ backgroundColor: accentColor }}
          className="w-full p-4 rounded-2xl text-white font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all"
        >
          {loading ? t.auth_sending : t.auth_button}
        </button>
      </form>
    </div>
  );
};

export default Auth;