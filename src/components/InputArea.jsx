import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { analyzeExpense } from '../lib/gemini';

const InputArea = ({ onExpensesFound }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const results = await analyzeExpense(text);
    
    if (results && results.length > 0) {
      onExpensesFound(results);
      setText("");
    } else {
      alert("La IA no detectó movimientos claros. Ej: 'Gané 500' o 'Gasté 20 en café'");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe tus movimientos... (ej: Gasté 50 en gasolina y me pagaron 200)"
          className="w-full p-5 rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner h-32 resize-none text-sm"
        />
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 ${
              loading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
            }`}
          >
            {loading ? "Procesando..." : (
              <>
                <Sparkles size={16} />
                Analizar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputArea;