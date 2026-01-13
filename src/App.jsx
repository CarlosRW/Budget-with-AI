import React, { useState, useEffect, useRef } from 'react';
import {
    Wallet, PlusCircle, Trash2, TrendingUp, TrendingDown,
    Target, Sparkles, Calendar, MessageSquare, Sun,
    Moon, LineChart as ChartIcon, Bell, Check, Download, Coins, Palette, Menu, X, Edit3, CreditCard, Settings,
    Heart, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';
import * as XLSX from 'xlsx';
import InputArea from './components/InputArea';
import { getFinancialAdvice } from './lib/gemini';
import confetti from 'canvas-confetti';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';

const CURRENCIES = [
    { symbol: '$', code: 'USD', country: 'EE.UU.' }, { symbol: '€', code: 'EUR', country: 'Europa' },
    { symbol: 'MXN', code: 'MXN', country: 'México' }, { symbol: '¥', code: 'JPY', country: 'Japón' },
    { symbol: '£', code: 'GBP', country: 'Reino Unido' }, { symbol: '₡', code: 'CRC', country: 'Costa Rica' },
    { symbol: 'S/', code: 'PEN', country: 'Perú' }, { symbol: 'Bs', code: 'BOB', country: 'Bolivia' },
    { symbol: 'R$', code: 'BRL', country: 'Brasil' }, { symbol: '₩', code: 'KRW', country: 'Corea del Sur' }
];

const THEMES = [
    { name: 'Azul', color: '#3b82f6' }, { name: 'Morado', color: '#8b5cf6' },
    { name: 'Rosa', color: '#ec4899' }, { name: 'Naranja', color: '#f97316' }, { name: 'Esmeralda', color: '#10b981' },
];

// Lenguajes soportados
const LANGUAGES = {
    es: {
        name: 'Español',
        flag: '🇪🇸',
        balance: 'Saldo Total',
        activity: 'Actividad',
        goals: 'Metas',
        subs: 'Suscripciones',
        ia_ask: 'Pregunta a tu IA',
        ia_placeholder: '¿Cómo ahorrar más?',
        export: 'Exportar Reporte',
        clear: 'Limpiar Historial',
        settings: 'Configuración',
        initial_balance: 'Saldo Inicial',
        select_currency: 'Seleccionar Divisa',
        interface: 'Interfaz',
        light_mode: 'Clara',
        dark_mode: 'Oscura',
        theme: 'Tema',
        language: 'Idioma / Language',
        evolution: 'Evolución',
        system_status: 'Estado del Sistema',
        system_ok: 'Operativo',
        privacy: 'Privacidad',
        privacy_note: 'Datos Locales (Solo tú los ves)',
        terms: 'Términos',
        support: 'Soporte',
        optimized: 'Optimizado para Navegadores Modernos',
        back_to_top: 'Volver arriba ↑',
        tagline: 'Tu asistente inteligente para una libertad financiera total. Diseñado para ser simple, privado y potente.',
        old_entries: 'Antiguos',
        input_placeholder: 'Ej: Cobré mi salario de 2000 y pagué 50 de internet...',
        analyze_btn: 'Analizar con IA',
        balance_prompt: '¿Cuál es tu saldo actual de partida?',
        clear_history_confirm: '¿Borrar todo el historial de actividad?',
        edit_expense_label: 'Editar descripción:',
        edit_expense_amount: 'Editar monto (negativo para gastos):',
        add_sub_name: 'Nombre del servicio (ej: Netflix):',
        add_sub_cost: 'Costo mensual:',
        edit_sub_name: 'Editar nombre del servicio:',
        edit_sub_cost: 'Editar costo mensual:',
        add_goal_name: 'Meta:',
        add_goal_cost: 'Costo:',
        edit_goal_name: 'Editar nombre de la meta:',
        edit_goal_target: 'Editar monto objetivo:',
        goal_revert_confirm: '¿Quieres revertir esta meta? El dinero se devolverá a tu saldo y se borrará el registro del gasto.',
        made_with: 'Hecho con'
    },
    en: {
        name: 'English',
        flag: '🇺🇸',
        balance: 'Total Balance',
        activity: 'Activity',
        goals: 'Goals',
        subs: 'Subscriptions',
        ia_ask: 'Ask your AI',
        ia_placeholder: 'How to save more?',
        export: 'Export Report',
        clear: 'Clear History',
        settings: 'Settings',
        initial_balance: 'Initial Balance',
        select_currency: 'Select Currency',
        interface: 'Interface',
        light_mode: 'Light',
        dark_mode: 'Dark',
        theme: 'Theme',
        language: 'Language',
        evolution: 'Trend',
        system_status: 'System Status',
        system_ok: 'System Live',
        privacy: 'Privacy',
        privacy_note: 'Local Data (Private to you)',
        terms: 'Terms',
        support: 'Support',
        optimized: 'Optimized for Modern Browsers',
        back_to_top: 'Back to top ↑',
        tagline: 'Your smart assistant for total financial freedom. Designed to be simple, private, and powerful.',
        old_entries: 'Previous',
        input_placeholder: 'e.g., I got my salary of 2000 and paid 50 for internet...',
        analyze_btn: 'Analyze with AI',
        balance_prompt: 'What is your starting balance?',
        clear_history_confirm: 'Clear all activity history?',
        edit_expense_label: 'Edit description:',
        edit_expense_amount: 'Edit amount (negative for expenses):',
        add_sub_name: 'Service name (e.g., Netflix):',
        add_sub_cost: 'Monthly cost:',
        edit_sub_name: 'Edit service name:',
        edit_sub_cost: 'Edit monthly cost:',
        add_goal_name: 'Goal:',
        add_goal_cost: 'Target amount:',
        edit_goal_name: 'Edit goal name:',
        edit_goal_target: 'Edit target amount:',
        goal_revert_confirm: 'Revert this goal? Funds will be returned and the record removed.',
        made_with: 'Made with'
    },
    de: {
        name: 'Deutsch',
        flag: '🇩🇪',
        balance: 'Gesamtguthaben',
        activity: 'Aktivität',
        goals: 'Ziele',
        subs: 'Abonnements',
        ia_ask: 'Frag deine KI',
        ia_placeholder: 'Wie spare ich mehr?',
        export: 'Bericht Exportieren',
        clear: 'Verlauf Löschen',
        settings: 'Einstellungen',
        initial_balance: 'Startguthaben',
        select_currency: 'Währung wählen',
        interface: 'Interface',
        light_mode: 'Hell',
        dark_mode: 'Dunkel',
        theme: 'Thema',
        language: 'Sprache',
        evolution: 'Entwicklung',
        system_status: 'Systemstatus',
        system_ok: 'Betriebsbereit',
        privacy: 'Datenschutz',
        privacy_note: 'Lokale Daten (Nur für Sie)',
        terms: 'AGB',
        support: 'Support',
        optimized: 'Optimiert für moderne Browser',
        back_to_top: 'Nach oben ↑',
        tagline: 'Dein smarter Assistent für finanzielle Freiheit. Einfach, privat und leistungsstark.',
        old_entries: 'Alt',
        input_placeholder: 'z.B. Gehalt von 2000 erhalten und 50 für Internet bezahlt...',
        analyze_btn: 'Mit KI analysieren',
        balance_prompt: 'Wie hoch ist dein Startguthaben?',
        clear_history_confirm: 'Gesamten Verlauf löschen?',
        edit_expense_label: 'Beschreibung bearbeiten:',
        edit_expense_amount: 'Betrag bearbeiten (negativ für Ausgaben):',
        add_sub_name: 'Name des Dienstes (z.B. Netflix):',
        add_sub_cost: 'Monatliche Kosten:',
        edit_sub_name: 'Dienstnamen bearbeiten:',
        edit_sub_cost: 'Monatliche Kosten bearbeiten:',
        add_goal_name: 'Ziel:',
        add_goal_cost: 'Zielbetrag:',
        edit_goal_name: 'Zielnamen bearbeiten:',
        edit_goal_target: 'Zielbetrag bearbeiten:',
        goal_revert_confirm: 'Ziel rückgängig machen? Geld wird zurückgebucht und Eintrag entfernt.',
        made_with: 'Erstellt mit'
    },
    zh: {
        name: '中文',
        flag: '🇨🇳',
        balance: '总余额',
        activity: '活动',
        goals: '目标',
        subs: '订阅',
        ia_ask: '咨询人工智能',
        ia_placeholder: '如何节省更多？',
        export: '导出报告',
        clear: '清除历史',
        settings: '设置',
        initial_balance: '初始余额',
        select_currency: '选择货币',
        interface: '界面',
        light_mode: '浅色',
        dark_mode: '深色',
        theme: '主题',
        language: '语言',
        evolution: '趋势',
        system_status: '系统状态',
        system_ok: '运行正常',
        privacy: '隐私',
        privacy_note: '本地数据（仅限个人使用）',
        terms: '条款',
        support: '支持',
        optimized: '为现代浏览器优化',
        back_to_top: '回到顶部 ↑',
        tagline: '您的智能理财助手，简单、私密且强大。',
        old_entries: '旧记录',
        input_placeholder: '例如：我收到2000工资并支付了50的网费...',
        analyze_btn: '用AI分析',
        balance_prompt: '你的起始余额是多少？',
        clear_history_confirm: '清空所有活动记录？',
        edit_expense_label: '编辑描述：',
        edit_expense_amount: '编辑金额（支出为负）：',
        add_sub_name: '服务名称（例：Netflix）：',
        add_sub_cost: '月费：',
        edit_sub_name: '编辑服务名称：',
        edit_sub_cost: '编辑月费：',
        add_goal_name: '目标：',
        add_goal_cost: '目标金额：',
        edit_goal_name: '编辑目标名称：',
        edit_goal_target: '编辑目标金额：',
        goal_revert_confirm: '要撤销此目标吗？资金将返还并删除记录。',
        made_with: '用心制作'
    }
};

function App() {
    const [session, setSession] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('expenses')) || []);
    const [initialBalance, setInitialBalance] = useState(() => Number(localStorage.getItem('initialBalance')) || 0);
    const [goals, setGoals] = useState(() => JSON.parse(localStorage.getItem('goals')) || []);
    const [subscriptions, setSubscriptions] = useState(() => JSON.parse(localStorage.getItem('subscriptions')) || []);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
    const [currency, setCurrency] = useState(() => JSON.parse(localStorage.getItem('currency')) || CURRENCIES[0]);
    const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || '#3b82f6');
    const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'es');
    const [advice, setAdvice] = useState("");
    const [adviceTopic, setAdviceTopic] = useState("");
    const [loadingAdvice, setLoadingAdvice] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isPcSettingsOpen, setIsPcSettingsOpen] = useState(false);
    const settingsRef = useRef(null);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            if (session) setShowAuthModal(false);

            // Si el evento es un inicio de sesión exitoso (SIGNED_IN)
            if (event === 'SIGNED_IN' && session) {
                await migrateLocalStorageToCloud(session.user.id);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const fetchExpenses = async () => {
            if (session) {
                // Si hay sesión, traemos los datos de Supabase
                const { data, error } = await supabase
                    .from('expenses')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (!error) setExpenses(data);
            } else {
                // Si no hay sesión, usamos localStorage como siempre
                const localData = JSON.parse(localStorage.getItem('expenses')) || [];
                setExpenses(localData);
            }
        };

        fetchExpenses();
    }, [session]); // Se vuelve a ejecutar cada vez que la sesión cambie

    useEffect(() => {
        localStorage.setItem('expenses', JSON.stringify(expenses));
        localStorage.setItem('initialBalance', initialBalance.toString());
        localStorage.setItem('goals', JSON.stringify(goals));
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
        localStorage.setItem('currency', JSON.stringify(currency));
        localStorage.setItem('accentColor', accentColor);
        localStorage.setItem('lang', lang);
    }, [expenses, initialBalance, goals, subscriptions, darkMode, currency, accentColor, lang]);

    // Cerrar menú de PC al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (settingsRef.current && !settingsRef.current.contains(e.target)) {
                setIsPcSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const t = LANGUAGES[lang] || LANGUAGES.es;

    const currentBalance = initialBalance + expenses.reduce((sum, item) => sum + item.amount, 0);

    const formatMoney = (amount) => {
        const value = Math.abs(amount).toLocaleString();
        return amount < 0 ? `-${currency.symbol}${value}` : `${currency.symbol}${value}`;
    };

    // --- LÓGICA DE SALDO ---
    const adjustInitialBalance = () => {
        const newVal = prompt(t.balance_prompt, initialBalance);
        if (newVal !== null && !isNaN(newVal)) {
            setInitialBalance(Number(newVal));
            confetti({ particleCount: 30, spread: 50 });
        }
    };

    // --- LÓGICA DE GASTOS Y EDICIÓN ---
    const handleNewItems = (items) => {
        const today = new Date();
        // Formato estándar DD/MM/YYYY
        const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

        const itemsWithDate = items.map(item => ({
            ...item,
            date: dateStr,
            id: Date.now() + Math.random()
        }));
        setExpenses([...expenses, ...itemsWithDate]);
    };

    const deleteExpense = (id) => setExpenses(expenses.filter(e => e.id !== id));

    const clearActivity = () => {
        if (window.confirm(t.clear_history_confirm)) {
            setExpenses([]);
            confetti({ particleCount: 40, spread: 50 });
        }
    };

    const editExpense = (id) => {
        const item = expenses.find(e => e.id === id);
        const newLabel = prompt(t.edit_expense_label, item.label);
        const newAmount = prompt(t.edit_expense_amount, item.amount);
        if (newLabel && !isNaN(newAmount)) {
            setExpenses(expenses.map(e => e.id === id ? { ...e, label: newLabel, amount: Number(newAmount) } : e));
        }
    };

    // --- LÓGICA DE SUSCRIPCIONES ---
    const editSubscription = (sub) => {
        const newName = prompt(t.edit_sub_name, sub.name);
        const newCost = prompt(t.edit_sub_cost, sub.cost);
        if (newName && !isNaN(newCost)) {
            setSubscriptions(subscriptions.map(s =>
                s.id === sub.id ? { ...s, name: newName, cost: Number(newCost) } : s
            ));
        }
    };

    const addSubscription = () => {
        const name = prompt(t.add_sub_name);
        const cost = prompt(t.add_sub_cost);
        if (name && !isNaN(cost)) {
            setSubscriptions([...subscriptions, { id: Date.now(), name, cost: Number(cost) }]);
        }
    };

    const paySubscription = (sub) => {
        handleNewItems([{ label: `Pago ${sub.name}`, amount: -sub.cost, category: 'Suscripciones' }]);
        confetti({ particleCount: 40, colors: [accentColor, '#ffffff'] });
    };

    const deleteSubscription = (id) => setSubscriptions(subscriptions.filter(s => s.id !== id));

    // --- LÓGICA DE METAS ---
    const editGoal = (goal) => {
        const newName = prompt(t.edit_goal_name, goal.name);
        const newTarget = prompt(t.edit_goal_target, goal.target);
        if (newName && !isNaN(newTarget)) {
            setGoals(goals.map(g =>
                g.id === goal.id ? { ...g, name: newName, target: Number(newTarget) } : g
            ));
        }
    };

    const toggleGoal = (id) => {
        const goal = goals.find(g => g.id === id);

        // Si la meta NO está completada y queremos completarla
        if (!goal.completed) {
            // Validación de saldo suficiente
            if (currentBalance < goal.target) {
                alert(`Saldo insuficiente. Te faltan ${formatMoney(goal.target - currentBalance)} para cumplir esta meta.`);
                return;
            }

            // 1. Marcamos como completada
            setGoals(goals.map(g => g.id === id ? { ...g, completed: true } : g));

            // 2. Creamos un gasto automático vinculado a esta meta
            const completionExpense = {
                label: `Meta Cumplida: ${goal.name}`,
                amount: -goal.target,
                category: 'Metas',
                goalId: id // Importante para poder revertirlo luego
            };
            handleNewItems([completionExpense]);

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: [accentColor, '#10b981', '#ffffff']
            });

        } else {
            // Si ya estaba completada y el usuario la desmarca (REVERTIR)
            if (window.confirm(t.goal_revert_confirm)) {
                // 1. Desmarcamos la meta
                setGoals(goals.map(g => g.id === id ? { ...g, completed: false } : g));

                // 2. Buscamos y eliminamos el gasto que se generó automáticamente
                setExpenses(expenses.filter(e => e.goalId !== id));
            }
        }
    };

    const deleteGoal = (id) => setGoals(goals.filter(g => g.id !== id));

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            // Opcional: Puedes recargar la página para limpiar estados
            window.location.reload();
        }
    };

    const exportToExcel = () => {
        const historyData = expenses.map(e => ({
            Fecha: e.date, Descripción: e.label, Categoría: e.category, Monto: e.amount, Tipo: e.amount > 0 ? 'Ingreso' : 'Gasto'
        }));
        const wb = XLSX.utils.book_new();
        const wsHistory = XLSX.utils.json_to_sheet(historyData);
        XLSX.utils.book_append_sheet(wb, wsHistory, "Historial");
        XLSX.writeFile(wb, `Reporte_${currency.code}_${new Date().toLocaleDateString()}.xlsx`);
        confetti({ particleCount: 100, spread: 70 });
    };

    const groupedExpenses = expenses.reduce((groups, expense) => {
        const date = expense.date || t.old_entries;
        if (!groups[date]) groups[date] = [];
        groups[date].push(expense);
        return groups;
    }, {});

    // --- LÓGICA DEL GRÁFICO CORREGIDA ---
    // Usamos useMemo para que no procese datos cada vez que muevas el mouse
    const chartData = React.useMemo(() => {
        // 1. Ordenamos por fecha (de más antigua a más reciente)
        const sortedExpenses = [...expenses].sort((a, b) => {
            const [dayA, monthA, yearA] = a.date.split('/').map(Number);
            const [dayB, monthB, yearB] = b.date.split('/').map(Number);
            return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
        });

        // 2. Calculamos el acumulado empezando desde el saldo inicial
        let runningBalance = initialBalance;
        const data = sortedExpenses.map((curr) => {
            runningBalance += curr.amount;
            return {
                name: curr.label.substring(0, 10),
                balance: runningBalance
            };
        });

        // 3. El punto de inicio del gráfico
        return [{ name: 'Inicio', balance: initialBalance }, ...data];
    }, [expenses, initialBalance]);

    return (
        <div className={`${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} min-h-screen transition-colors duration-500 font-sans`}>

            {/* --- SIDEBAR MÓVIL --- */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden" />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            className={`fixed right-0 top-0 h-full w-[280px] z-[70] shadow-2xl p-6 lg:hidden overflow-y-auto ${darkMode ? 'bg-slate-900 border-l border-slate-800' : 'bg-white'}`}>
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-[10px] font-black uppercase opacity-50 tracking-widest">{t.settings}</span>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2"><X /></button>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold opacity-50 uppercase flex items-center gap-2"><Wallet size={14} /> {t.initial_balance}</label>
                                    <button onClick={adjustInitialBalance} className={`w-full p-3 rounded-xl border text-base font-bold flex justify-between items-center ${darkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                                        <span>{currency.symbol}{initialBalance}</span>
                                        <PlusCircle size={14} style={{ color: accentColor }} />
                                    </button>
                                </div>
                                {/* --- SECCIÓN DE CONFIGURACIÓN EN EL SIDEBAR --- */}
                                <div className="space-y-6">
                                    {/* Selector de Moneda Visual */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold opacity-50 uppercase tracking-widest flex items-center gap-2">
                                            <Coins size={14} /> {t.select_currency}
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {CURRENCIES.map(c => (
                                                <button
                                                    key={c.code}
                                                    onClick={() => setCurrency(c)}
                                                    style={{ 
                                                        borderColor: currency.code === c.code ? accentColor : 'transparent',
                                                        backgroundColor: currency.code === c.code ? `${accentColor}15` : (darkMode ? '#1e293b' : '#f1f5f9')
                                                    }}
                                                    className="flex flex-col items-center p-3 rounded-2xl border-2 transition-all hover:scale-105"
                                                >
                                                    <span className="text-xl font-black" style={{ color: currency.code === c.code ? accentColor : 'inherit' }}>
                                                        {c.symbol}
                                                    </span>
                                                    <span className="text-xs font-bold opacity-60">{c.code}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Botón de Modo Oscuro Corregido */}
                                    <button 
                                        onClick={() => setDarkMode(!darkMode)} 
                                        style={{ 
                                            backgroundColor: darkMode ? `${accentColor}20` : '#f1f5f9',
                                            color: darkMode ? accentColor : '#64748b'
                                        }}
                                        className="flex items-center justify-between w-full p-4 rounded-2xl transition-all active:scale-95 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                                            <span className="font-bold text-base">{t.interface} {darkMode ? t.light_mode : t.dark_mode}</span>
                                        </div>
                                        <div 
                                            style={{ backgroundColor: darkMode ? accentColor : '#cbd5e1' }}
                                            className="w-10 h-5 rounded-full relative transition-colors"
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${darkMode ? 'right-1' : 'left-1'}`} />
                                        </div>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold opacity-50 uppercase flex items-center gap-2"><Palette size={14} /> {t.theme}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {THEMES.map(t => (
                                            <button key={t.name} onClick={() => setAccentColor(t.color)} className="w-8 h-8 rounded-full border-2 border-white/20 shadow-sm" style={{ backgroundColor: t.color }} />
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-2">
                                        {t.language}
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.keys(LANGUAGES).map((key) => (
                                            <button
                                                key={key}
                                                onClick={() => setLang(key)}
                                                style={{
                                                    borderColor: lang === key ? accentColor : 'transparent',
                                                    backgroundColor: lang === key ? `${accentColor}15` : (darkMode ? '#1e293b' : '#f1f5f9')
                                                }}
                                                className="flex items-center justify-between p-2 rounded-xl border-2 transition-all"
                                            >
                                                <span className="text-lg">{LANGUAGES[key].flag}</span>
                                                <span className="text-xs font-bold">{LANGUAGES[key].name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={exportToExcel} style={{ backgroundColor: `${accentColor}10`, color: accentColor }} className="flex items-center gap-3 w-full p-3 rounded-xl font-bold text-base">
                                    <Download size={20} /> {t.export}
                                </button>
                                {!session ? (
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        style={{
                                            backgroundColor: `${accentColor}15`,
                                            color: accentColor
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 mt-auto hover:brightness-110"
                                    >
                                        <div style={{ backgroundColor: `${accentColor}20` }} className="p-2 rounded-xl">
                                            <Wallet size={20} />
                                        </div>
                                        <span className="font-bold text-sm">Iniciar Sesión</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleLogout}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 mt-auto ${
                                            darkMode 
                                                ? 'text-red-400 hover:bg-red-500/10' 
                                                : 'text-red-600 hover:bg-red-50'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-xl ${darkMode ? 'bg-red-500/10' : 'bg-red-100'}`}>
                                            <LogOut size={20} />
                                        </div>
                                        <span className="font-bold text-sm">Sign Out</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                {/* HEADER CON ALERTA DE SALDO */}
                <header className="flex justify-between items-center sticky top-0 z-50 py-2 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div style={{ backgroundColor: accentColor }} className="p-3 rounded-2xl text-white shadow-lg transition-all"><Wallet /></div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase">Fince</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={adjustInitialBalance} className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-2 px-5 rounded-2xl border shadow-sm group transition-all active:scale-95`}>
                            <p className="text-[9px] font-black opacity-50 uppercase text-center tracking-widest leading-tight transition-colors" style={{ color: 'inherit' }} onMouseEnter={(e) => e.currentTarget.style.color = accentColor} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>{t.balance}</p>
                            <h2 className={`text-2xl md:text-3xl font-black leading-tight ${currentBalance < 0 ? 'text-rose-500 animate-pulse' : ''}`}>
                                {formatMoney(currentBalance)}
                            </h2>
                        </button>
                        <div className="hidden lg:flex items-center gap-3">
                            <div className="relative" ref={settingsRef}>
                                <button 
                                    onClick={() => setIsPcSettingsOpen(!isPcSettingsOpen)}
                                    className={`p-3 rounded-2xl border transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                                >
                                    <Settings size={20} style={{ color: isPcSettingsOpen ? accentColor : 'inherit' }} />
                                </button>
                                
                                <AnimatePresence>
                                    {isPcSettingsOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }} 
                                            animate={{ opacity: 1, y: 0 }} 
                                            exit={{ opacity: 0, y: 10 }}
                                            className={`absolute right-0 mt-3 p-6 rounded-[2rem] border shadow-2xl z-[100] min-w-[280px] ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
                                        >
                                            <div className="space-y-6">
                                                {/* MONEDA */}
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-2">
                                                        <Coins size={14} /> {t.select_currency}
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {CURRENCIES.map(c => (
                                                            <button
                                                                key={c.code}
                                                                onClick={() => setCurrency(c)}
                                                                style={{ 
                                                                    borderColor: currency.code === c.code ? accentColor : 'transparent',
                                                                    backgroundColor: currency.code === c.code ? `${accentColor}15` : (darkMode ? '#1e293b' : '#f1f5f9')
                                                                }}
                                                                className="flex flex-col items-center p-2 rounded-xl border-2 transition-all hover:scale-105"
                                                            >
                                                                <span className="text-sm font-black" style={{ color: currency.code === c.code ? accentColor : 'inherit' }}>
                                                                    {c.symbol}
                                                                </span>
                                                                <span className="text-[8px] font-bold opacity-50 uppercase">{c.code}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* COLORES */}
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-2">
                                                        <Palette size={14} /> {t.theme}
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {THEMES.map(t => (
                                                            <button
                                                                key={t.name}
                                                                onClick={() => setAccentColor(t.color)}
                                                                className={`w-8 h-8 rounded-full border-4 transition-transform hover:scale-110 ${accentColor === t.color ? 'border-white dark:border-slate-700 shadow-lg' : 'border-transparent'}`}
                                                                style={{ backgroundColor: t.color }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* IDIOMA */}
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest flex items-center gap-2">
                                                        {t.language}
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {Object.keys(LANGUAGES).map((key) => (
                                                            <button
                                                                key={key}
                                                                onClick={() => setLang(key)}
                                                                style={{
                                                                    borderColor: lang === key ? accentColor : 'transparent',
                                                                    backgroundColor: lang === key ? `${accentColor}15` : (darkMode ? '#1e293b' : '#f1f5f9')
                                                                }}
                                                                className="flex items-center justify-between p-2 rounded-xl border-2 transition-all"
                                                            >
                                                                <span className="text-lg">{LANGUAGES[key].flag}</span>
                                                                <span className="text-xs font-bold">{LANGUAGES[key].name}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* MODO OSCURO */}
                                                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                                    <button 
                                                        onClick={() => setDarkMode(!darkMode)}
                                                        style={{ backgroundColor: darkMode ? `${accentColor}20` : '#f1f5f9', color: darkMode ? accentColor : '#64748b' }}
                                                        className="flex items-center justify-between w-full p-3 rounded-2xl transition-all"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                                                            <span className="font-bold text-[10px]">{t.interface} {darkMode ? t.light_mode : t.dark_mode}</span>
                                                        </div>
                                                        <div style={{ backgroundColor: darkMode ? accentColor : '#cbd5e1' }} className="w-8 h-4 rounded-full relative">
                                                            <motion.div animate={{ x: darkMode ? 16 : 2 }} className="absolute top-1 w-2.5 h-2.5 bg-white rounded-full" />
                                                        </div>
                                                    </button>
                                                </div>

                                                {/* EXPORTAR */}
                                                <button onClick={exportToExcel} className="w-full p-2.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 text-[9px] font-black opacity-50 hover:opacity-100 transition-all uppercase">
                                                    <Download size={12} /> {t.export}
                                                </button>

                                                {/* AUTH BUTTON */}
                                                {!session ? (
                                                    <button
                                                        onClick={() => setShowAuthModal(true)}
                                                        style={{
                                                            backgroundColor: `${accentColor}15`,
                                                            color: accentColor
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 mt-2 hover:brightness-110"
                                                    >
                                                        <div style={{ backgroundColor: `${accentColor}20` }} className="p-1.5 rounded-lg">
                                                            <Wallet size={16} />
                                                        </div>
                                                        <span className="font-bold text-xs">Iniciar Sesión</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handleLogout}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 mt-2 ${
                                                            darkMode 
                                                                ? 'text-red-400 hover:bg-red-500/10' 
                                                                : 'text-red-600 hover:bg-red-50'
                                                        }`}
                                                    >
                                                        <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-red-500/10' : 'bg-red-100'}`}>
                                                            <LogOut size={16} />
                                                        </div>
                                                        <span className="font-bold text-xs">Sign Out</span>
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-3 rounded-2xl border shadow-sm" style={{ color: accentColor }}><Menu size={20} /></button>
                    </div>
                </header>

                {!session && (
                  <div 
                    className="mx-4 mb-6 p-4 rounded-2xl flex items-center justify-between border transition-all"
                    style={{
                      backgroundColor: `${accentColor}15`,
                      borderColor: `${accentColor}30`
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold" style={{ color: accentColor }}>¿Quieres guardar tus datos?</span>
                      <span className="text-xs opacity-70">Inicia sesión para no perder tus gastos si cambias de navegador.</span>
                    </div>
                    <button 
                      onClick={() => setShowAuthModal(true)}
                      style={{ backgroundColor: accentColor }}
                      className="text-white text-xs px-4 py-2 rounded-full font-bold hover:brightness-110 transition-all active:scale-95"
                    >
                      Iniciar Sesión
                    </button>
                  </div>
                )}

                <div className="grid lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-8">
                        <section className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 rounded-3xl border shadow-sm`}>
                            <InputArea onExpensesFound={handleNewItems} accentColor={accentColor} t={t} />
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-4">
                                <h3 className="flex items-center gap-2 font-black opacity-40 text-sm tracking-widest uppercase"><Calendar size={14} /> {t.activity}</h3>
                                <button
                                    onClick={clearActivity}
                                    className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${darkMode ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                                >
                                    {t.clear}
                                </button>
                            </div>
                            <div className="space-y-6">
                                <AnimatePresence>
                                    {Object.keys(groupedExpenses).sort((a, b) => new Date(b) - new Date(a)).map(date => (
                                        <motion.div key={date} layout className="space-y-2">
                                            <div className="px-4 text-xs font-bold opacity-40 tracking-widest uppercase">{date}</div>
                                            {[...groupedExpenses[date]].reverse().map((e) => (
                                                <div key={e.id} className={`flex justify-between items-center p-4 rounded-2xl border group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-lg ${e.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                            {e.amount > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                        </div>
                                                        <div>
                                                        <p className="text-base font-bold capitalize">{e.label}</p>
                                                        <p className="text-xs font-bold opacity-40 uppercase">{e.category}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`font-black text-base ${e.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatMoney(e.amount)}</span>
                                                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => editExpense(e.id)} style={{ color: accentColor }} className="p-2 hover:scale-110 transition-transform"><Edit3 size={16} /></button>
                                                            <button onClick={() => deleteExpense(e.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </section>
                    </div>

                    <div className="lg:col-span-5 space-y-8">
                        {/* IA SECTION */}
                        <section style={{ backgroundColor: darkMode ? `${accentColor}15` : accentColor, borderColor: `${accentColor}30` }} className="p-8 rounded-[2.5rem] shadow-xl border text-white relative overflow-hidden">
                            <h3 className="font-bold mb-4 text-lg flex items-center gap-2"><Sparkles size={18} /> {t.ia_ask}</h3>
                            <div className="relative mb-4">
                                <input type="text" placeholder={t.ia_placeholder} value={adviceTopic} onChange={(e) => setAdviceTopic(e.target.value)}
                                    className={`w-full rounded-2xl py-4 pl-5 pr-14 text-sm outline-none transition-all ${darkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-slate-900 shadow-inner'}`} />
                                <button
                                    onClick={async () => { if (!adviceTopic) return; setLoadingAdvice(true); setAdvice(await getFinancialAdvice(expenses, currentBalance, adviceTopic, lang)); setLoadingAdvice(false); }}
                                    style={{ backgroundColor: accentColor }} className="absolute right-2 top-2 p-2.5 rounded-xl text-white transition-all active:scale-90 hover:brightness-110 shadow-lg">
                                    {loadingAdvice ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : <MessageSquare size={20} />}
                                </button>
                            </div>
                            <AnimatePresence>{advice && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className={`p-4 rounded-2xl border text-xs leading-relaxed ${darkMode ? 'bg-slate-900/50 border-slate-700 text-blue-100' : 'bg-white/20 border-white/30 text-white'}`}>{advice}</motion.div>}</AnimatePresence>
                        </section>

                        {/* GRAFICO */}
                        <section className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 rounded-[2.5rem] border h-64 shadow-sm`}>
                            <h3 className="text-xs font-black opacity-40 uppercase mb-4 flex items-center gap-2"><ChartIcon size={14} /> {t.evolution}</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <XAxis dataKey="name" hide />
                                    <YAxis hide domain={['auto', 'auto']} />
                                    <RechartsTooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} p-3 rounded-2xl border shadow-xl`}>
                                                        <p className="text-[10px] font-bold opacity-50 uppercase mb-1">{payload[0].payload.name}</p>
                                                        <p className="text-sm font-black" style={{ color: accentColor }}>{formatMoney(payload[0].value)}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area type="monotone" dataKey="balance" stroke={accentColor} fill={accentColor} fillOpacity={0.1} strokeWidth={4} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </section>

                        {/* SUSCRIPCIONES */}
                        <section className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 rounded-[2.5rem] border shadow-sm`}>
                            <div className="flex justify-between items-center mb-4 px-2">
                                <h3 className="font-black text-xs opacity-40 uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard size={14} /> {t.subs}
                                </h3>
                                <button
                                    onClick={addSubscription}
                                    style={{ backgroundColor: `${accentColor}20`, color: accentColor }} // Fondo con 20% opacidad
                                    className="p-2 rounded-full hover:brightness-90 transition-all"
                                >
                                    <PlusCircle size={18} />
                                </button>
                            </div>
                            <div className="space-y-3">
                                {subscriptions.map(sub => (
                                    <div key={sub.id} className={`${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'} p-4 rounded-2xl flex justify-between items-center group border`}>
                                        <div>
                                            <p className="text-xs font-bold">{sub.name}</p>
                                            <p className="text-[10px] font-black mt-0.5" style={{ color: accentColor }}>{formatMoney(sub.cost)}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => editSubscription(sub)} style={{ color: accentColor }} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 size={14} /></button>
                                            <button onClick={() => paySubscription(sub)} className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg active:scale-90 transition-transform"><Check size={14} /></button>
                                            <button onClick={() => deleteSubscription(sub.id)} className="p-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* OBJETIVOS */}
                        <section className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 rounded-[2.5rem] border shadow-sm`}>
                            <div className="flex justify-between items-center mb-6 px-2">
                                <h3 className="font-black text-[10px] opacity-40 uppercase tracking-widest flex items-center gap-2">
                                    <Target size={16} className="text-rose-500" /> {t.goals}
                                </h3>
                                <button
                                    onClick={() => { const n = prompt(t.add_goal_name); const c = prompt(t.add_goal_cost); if (n && c) setGoals([...goals, { name: n, target: Number(c), id: Date.now(), completed: false }]); }}
                                    style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                                    className="p-2 rounded-full hover:brightness-90 transition-all"
                                >
                                    <PlusCircle size={18} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {goals.map(goal => (
                                    <div key={goal.id} className={`${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'} p-5 rounded-3xl border relative group`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className={`text-xs font-bold ${goal.completed ? 'text-emerald-500' : ''}`}>
                                                    {goal.completed ? '✨ ' : ''}{goal.name}
                                                </span>
                                                <p className="text-[10px] font-black mt-1" style={{ color: accentColor }}>
                                                    {goal.completed ? '¡Completado!' : `Faltan: ${formatMoney(Math.max(0, goal.target - currentBalance))}`}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => editGoal(goal)} style={{ color: accentColor }} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 size={14} /></button>
                                                <button onClick={() => toggleGoal(goal.id)} className={`p-2 rounded-xl transition-all ${goal.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}><Check size={14} /></button>
                                                <button onClick={() => deleteGoal(goal.id)} className="p-2 rounded-xl bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                        <div className={`w-full ${darkMode ? 'bg-slate-800' : 'bg-slate-200'} h-1.5 rounded-full overflow-hidden`}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((currentBalance / goal.target) * 100, 100)}%` }} style={{ backgroundColor: goal.completed ? '#10b981' : accentColor }} className="h-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* --- FOOTER MODERNO --- */}
            <footer className={`mt-20 pb-10 px-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <div className={`max-w-7xl mx-auto p-8 rounded-[2.5rem] border transition-all ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
                        {/* Logo y Eslogan */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div style={{ backgroundColor: accentColor }} className="p-2 rounded-xl text-white">
                                    <Wallet size={18} />
                                </div>
                                <span className={`text-xl font-black tracking-tighter uppercase ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                    Fince
                                </span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed">
                                {t.tagline}
                            </p>
                        </div>

                        {/* Stats Rápidos o Info */}
                        <div className="flex flex-col gap-2 border-l border-r border-slate-200/20 px-0 md:px-10">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-widest">{t.system_status}</span>
                                <span className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> {t.system_ok}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-widest">{t.privacy}</span>
                                <span className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {t.privacy_note}
                                </span>
                            </div>
                        </div>

                        {/* Créditos y Versión */}
                        <div className="text-right space-y-2">
                            <p className="text-sm font-black">
                                © {new Date().getFullYear()} — Carlos Ramírez Wong — {t.made_with} <Heart size={14} className="inline text-red-500" />
                            </p>
                            <div className="flex justify-end gap-3">
                                <span className={`text-[10px] px-3 py-1 rounded-full border ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                                    v2.0.26
                                </span>
                                <button
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    style={{ color: accentColor }}
                                    className="text-[10px] font-black uppercase tracking-tighter hover:underline"
                                >
                                    {t.back_to_top}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Línea decorativa inferior */}
                    <div className="mt-8 pt-8 border-t border-slate-200/10 flex flex-wrap justify-between gap-4 text-[10px] font-bold uppercase tracking-widest opacity-60">
                        <div className="flex gap-6">
                            <a href="#" style={{ '--hover-color': accentColor }} className="transition-colors hover:opacity-100" onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}>{t.terms}</a>
                            <a href="#" style={{ '--hover-color': accentColor }} className="transition-colors hover:opacity-100" onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}>{t.privacy}</a>
                            <a href="#" style={{ '--hover-color': accentColor }} className="transition-colors hover:opacity-100" onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}>{t.support}</a>
                        </div>
                        <p>{t.optimized}</p>
                    </div>
                </div>
            </footer>

            {/* Modal de Auth */}
            {showAuthModal && (
              <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className={`relative w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
                  <button 
                    onClick={() => setShowAuthModal(false)}
                    className="absolute top-6 right-6 opacity-50 hover:opacity-100"
                  >
                    <X size={24} />
                  </button>
                  
                  <Auth darkMode={darkMode} accentColor={accentColor} />
                </div>
              </div>
            )}
        </div>
    );
}

export default App;