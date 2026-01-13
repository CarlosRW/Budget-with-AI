import React, { useState, useEffect } from 'react';
import { Wallet, PlusCircle, Trash2, TrendingUp, TrendingDown, Target, Sparkles, Calendar, MessageSquare, Sun, Moon, LineChart as ChartIcon, Bell, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import InputArea from './components/InputArea';
import { getFinancialAdvice } from './lib/gemini';
import confetti from 'canvas-confetti';

function App() {
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('expenses')) || []);
  const [initialBalance, setInitialBalance] = useState(() => Number(localStorage.getItem('initialBalance')) || 0);
  const [goals, setGoals] = useState(() => JSON.parse(localStorage.getItem('goals')) || []);
  const [subscriptions, setSubscriptions] = useState(() => JSON.parse(localStorage.getItem('subscriptions')) || []);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [advice, setAdvice] = useState("");
  const [adviceTopic, setAdviceTopic] = useState("");
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('initialBalance', initialBalance.toString());
    localStorage.setItem('goals', JSON.stringify(goals));
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [expenses, initialBalance, goals, subscriptions, darkMode]);

  const currentBalance = initialBalance + expenses.reduce((sum, item) => sum + item.amount, 0);

  const chartData = expenses.reduce((acc, curr, index) => {
    const prevBalance = index === 0 ? initialBalance : acc[index - 1].balance;
    acc.push({ name: curr.label.substring(0, 10), balance: prevBalance + curr.amount });
    return acc;
  }, [{ name: 'Inicio', balance: initialBalance }]);

  const handleNewItems = (items) => {
    const itemsWithDate = items.map(item => ({
      ...item,
      date: new Date().toLocaleDateString(),
      id: Date.now() + Math.random()
    }));
    setExpenses([...expenses, ...itemsWithDate]);
  };

  const addSubscription = () => {
    const name = prompt("Nombre de la suscripción (ej: Netflix):");
    const amount = prompt("Monto mensual:");
    if (name && amount) {
      setSubscriptions([...subscriptions, { name, amount: -Math.abs(Number(amount)), id: Date.now() }]);
    }
  };

  const paySubscription = (sub) => {
    handleNewItems([{ label: `Pago: ${sub.name}`, amount: sub.amount, category: 'suscripciones' }]);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
  };

  const deleteExpense = (id) => setExpenses(expenses.filter(e => e.id !== id));

  const groupedExpenses = expenses.reduce((groups, expense) => {
    const date = expense.date || "Antiguos";
    if (!groups[date]) groups[date] = [];
    groups[date].push(expense);
    return groups;
  }, {});

  return (
    <div className={`${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} min-h-screen transition-colors duration-500 p-4 md:p-8 font-sans`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/20"><Wallet /></div>
            <h1 className="text-xl font-black tracking-tighter uppercase">FinanceAI</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-3 rounded-2xl transition-all hover:scale-110 ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-500 shadow-sm border border-slate-200'}`}>
              {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-3 px-5 rounded-2xl border shadow-sm`}>
              <p className="text-[10px] font-black opacity-50 uppercase mb-1 text-center tracking-widest text-slate-500">Saldo Total</p>
              <h2 className="text-2xl font-black">${currentBalance.toLocaleString()}</h2>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="lg:col-span-7 space-y-8">
            <section className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 rounded-3xl border shadow-sm`}>
              <InputArea onExpensesFound={handleNewItems} />
            </section>

            {/* ACTIVIDAD RECIENTE */}
            <section className="space-y-4">
              <h3 className="flex items-center gap-2 font-black opacity-40 text-xs tracking-widest px-4 uppercase"><Calendar size={14}/> Actividad Reciente</h3>
              <div className="space-y-6">
                <AnimatePresence>
                  {Object.keys(groupedExpenses).sort((a, b) => new Date(b) - new Date(a)).map(date => (
                    <motion.div key={date} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      <div className="px-4 text-[10px] font-bold opacity-40 tracking-widest uppercase">{date}</div>
                      {[...groupedExpenses[date]].reverse().map((e) => (
                        <motion.div key={e.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                          className={`group flex justify-between items-center p-4 rounded-2xl border transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${e.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                              {e.amount > 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                            </div>
                            <div>
                              <p className="text-sm font-bold capitalize">{e.label}</p>
                              <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">{e.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm font-black">
                            <span className={e.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}>
                              {e.amount > 0 ? `+$${e.amount}` : `-$${Math.abs(e.amount)}`}
                            </span>
                            <button onClick={() => deleteExpense(e.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-500 transition-all"><Trash2 size={16}/></button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* METAS */}
            <section className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 rounded-[2.5rem] border shadow-sm`}>
              <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="font-black text-[10px] opacity-40 uppercase tracking-widest flex items-center gap-2"><Target size={16} className="text-rose-500"/> Mis Objetivos</h3>
                <button onClick={() => { const n = prompt("Meta:"); const c = prompt("Costo:"); if (n && c) setGoals([...goals, { name: n, target: Number(c), id: Date.now() }]); }}
                  className="bg-blue-500/10 text-blue-500 p-2 rounded-full"><PlusCircle size={18}/></button>
              </div>
              <div className="space-y-4">
                {goals.map(goal => (
                  <div key={goal.id} className={`${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'} p-5 rounded-3xl border relative`}>
                    <div className="flex justify-between items-center mb-3"><span className="text-sm font-bold">{goal.name}</span><span className="text-xs font-black text-blue-500">${goal.target}</span></div>
                    <div className={`w-full ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} h-1.5 rounded-full overflow-hidden`}>
                      <motion.div animate={{ width: `${Math.min((currentBalance / goal.target) * 100, 100)}%` }} className="h-full bg-blue-600" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PREGUNTA IA */}
            <section className={`${darkMode ? 'bg-blue-600/10 border-blue-500/20' : 'bg-blue-600 border-transparent'} p-8 rounded-[2.5rem] shadow-xl border text-white`}>
              <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-blue-400' : 'text-white'}`}><Sparkles size={18}/> Pregunta a tu IA</h3>
              <div className="relative mb-4">
                <input type="text" placeholder="¿Cómo ahorrar más?" value={adviceTopic} onChange={(e) => setAdviceTopic(e.target.value)}
                  className={`w-full rounded-2xl py-4 px-5 text-sm outline-none ${darkMode ? 'bg-slate-900 text-white focus:ring-1 focus:ring-blue-500' : 'bg-white/20 text-white placeholder:text-blue-100'}`} />
                <button onClick={async () => { if (!adviceTopic) return; setLoadingAdvice(true); setAdvice(await getFinancialAdvice(expenses, currentBalance, adviceTopic)); setLoadingAdvice(false); }}
                  className={`absolute right-2 top-2 p-2 rounded-xl ${darkMode ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}><MessageSquare size={20}/></button>
              </div>
              <AnimatePresence>{advice && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800 text-blue-100' : 'bg-white text-slate-600'}`}>{advice}</motion.div>}</AnimatePresence>
            </section>

            {/* GRÁFICO EVOLUCIÓN */}
            <section className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 rounded-[2.5rem] border h-64 shadow-sm`}>
               <h3 className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-4 flex items-center gap-2"><ChartIcon size={14}/> Evolución</h3>
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                   <Area type="monotone" dataKey="balance" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} strokeWidth={3} />
                 </AreaChart>
               </ResponsiveContainer>
            </section>

            {/* --- NUEVA SECCIÓN: PAGOS FIJOS (SUSCRIPCIONES) --- */}
            <section className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 rounded-[2.5rem] border shadow-sm`}>
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-black text-[10px] opacity-40 uppercase tracking-widest flex items-center gap-2"><Bell size={16} className="text-amber-500"/> Pagos Fijos</h3>
                <button onClick={addSubscription} className="text-amber-500 hover:scale-110 transition-all"><PlusCircle size={22}/></button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <AnimatePresence>
                  {subscriptions.map(sub => (
                    <motion.div key={sub.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                      className={`${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-amber-50 border-amber-100'} p-4 rounded-3xl border flex justify-between items-center group`}>
                      <div>
                        <p className="text-sm font-bold">{sub.name}</p>
                        <p className="text-xs font-black text-rose-500">-${Math.abs(sub.amount)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => paySubscription(sub)} className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 shadow-md shadow-emerald-500/20 active:scale-90 transition-all">
                          <Check size={16} strokeWidth={3} />
                        </button>
                        <button onClick={() => setSubscriptions(subscriptions.filter(s => s.id !== sub.id))} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {subscriptions.length === 0 && <p className="text-center text-[10px] opacity-40 py-4 uppercase font-black">Sin suscripciones</p>}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;