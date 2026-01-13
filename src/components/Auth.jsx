import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const Auth = ({ darkMode, accentColor }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) alert(error.message);
    else alert('¡Revisa tu email! Te enviamos un enlace mágico de acceso.');
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <h2 className={`text-2xl font-black mb-4 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
        Bienvenido a Fince
      </h2>
      <p className="text-sm mb-8 opacity-70">
        Tus datos se sincronizarán en la nube de forma segura.
      </p>
      
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <input
          type="email"
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
          {loading ? 'Enviando...' : 'Entrar con Email Mágico'}
        </button>
      </form>
    </div>
  );
};

export default Auth;