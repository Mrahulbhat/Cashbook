'use client';

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Users, Loader, TrendingUp, TrendingDown, Wallet,
    Calendar, Mail, Phone, Activity, Search, X, ChevronRight,
    CreditCard, ArrowUpCircle, ArrowDownCircle, LogOut, ShieldCheck,
    RefreshCw, DollarSign, Hash, Tag, Clock
} from "lucide-react";
import toast from "react-hot-toast";

const fmt = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

// ─────────────────────────────────────────────
// User Detail Drawer
// ─────────────────────────────────────────────
function UserDetailDrawer({ userId, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        fetch(`/api/admin/users/${userId}`)
            .then(r => r.json())
            .then(res => {
                if (res.success) setData(res.data);
                else toast.error("Failed to load user details");
            })
            .catch(() => toast.error("Network error"))
            .finally(() => setLoading(false));
    }, [userId]);

    const totalBalance = data?.accounts?.reduce((s, a) => s + a.balance, 0) || 0;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer */}
            <div className="relative z-10 w-full max-w-2xl bg-[#0d0d14] border-l border-gray-800/70 h-full flex flex-col animate-slideIn overflow-hidden shadow-2xl">
                {/* Drawer header */}
                <div className="p-6 border-b border-gray-800/60 shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Users size={18} className="text-purple-400" />
                            User Details
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-white">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader className="animate-spin text-purple-500 w-8 h-8" />
                    </div>
                ) : data ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {/* User profile header */}
                        <div className="p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-b border-gray-800/60">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/30">
                                    {data.user.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{data.user.name || 'Unnamed'}</h3>
                                    <p className="text-xs text-gray-500">ID: {String(data.user.id).slice(-8)}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Calendar size={11} className="text-gray-500" />
                                        <span className="text-xs text-gray-500">Joined {fmtDate(data.user.joined)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {data.user.email && (
                                    <div className="flex items-center gap-2 bg-gray-800/60 rounded-xl px-3 py-1.5">
                                        <Mail size={12} className="text-purple-400" />
                                        <span className="text-xs text-gray-300">{data.user.email}</span>
                                    </div>
                                )}
                                {data.user.phone && (
                                    <div className="flex items-center gap-2 bg-gray-800/60 rounded-xl px-3 py-1.5">
                                        <Phone size={12} className="text-blue-400" />
                                        <span className="text-xs text-gray-300">{data.user.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-800/60 shrink-0 px-6 pt-4 gap-1">
                            {['overview', 'accounts', 'transactions'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-t-xl text-sm font-medium capitalize transition-all ${activeTab === tab
                                        ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-500'
                                        : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab content */}
                        <div className="p-6">
                            {/* OVERVIEW */}
                            {activeTab === 'overview' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp size={14} className="text-green-400" />
                                                <span className="text-xs text-gray-400">Total Income</span>
                                            </div>
                                            <p className="text-xl font-bold text-green-400">
                                                {fmt(data.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))}
                                            </p>
                                        </div>
                                        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingDown size={14} className="text-red-400" />
                                                <span className="text-xs text-gray-400">Total Expense</span>
                                            </div>
                                            <p className="text-xl font-bold text-red-400">
                                                {fmt(data.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))}
                                            </p>
                                        </div>
                                        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Wallet size={14} className="text-purple-400" />
                                                <span className="text-xs text-gray-400">Total Account Balance</span>
                                            </div>
                                            <p className={`text-xl font-bold ${totalBalance >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                                                {fmt(totalBalance)}
                                            </p>
                                        </div>
                                        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Activity size={14} className="text-blue-400" />
                                                <span className="text-xs text-gray-400">Transactions</span>
                                            </div>
                                            <p className="text-xl font-bold text-blue-400">{data.transactions.length}</p>
                                        </div>
                                    </div>

                                    {/* Recent activity */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-300 mb-3">Last 5 Transactions</h4>
                                        <div className="space-y-2">
                                            {data.transactions.slice(0, 5).map(t => (
                                                <div key={String(t.id)} className="flex items-center justify-between bg-gray-900/40 border border-gray-800/40 rounded-xl p-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">{t.categoryIcon}</span>
                                                        <div>
                                                            <p className="text-sm text-white">{t.description || t.category}</p>
                                                            <p className="text-xs text-gray-500">{fmtDate(t.date)} · {t.account}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                                                    </span>
                                                </div>
                                            ))}
                                            {data.transactions.length === 0 && (
                                                <p className="text-center text-gray-600 text-sm py-4">No transactions yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ACCOUNTS */}
                            {activeTab === 'accounts' && (
                                <div className="space-y-3">
                                    {data.accounts.length === 0 ? (
                                        <p className="text-center text-gray-600 py-8">No accounts found</p>
                                    ) : data.accounts.map(acc => (
                                        <div key={String(acc.id)} className="bg-gray-900/50 border border-gray-800/60 rounded-2xl p-5 flex items-center justify-between group hover:border-purple-500/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-xl flex items-center justify-center border border-purple-500/20">
                                                    <CreditCard size={18} className="text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold">{acc.name}</p>
                                                    <p className="text-xs text-gray-500">Account</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-bold ${acc.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {fmt(acc.balance)}
                                                </p>
                                                <p className="text-xs text-gray-600">Current Balance</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Total */}
                                    <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 rounded-2xl p-5 flex items-center justify-between mt-4">
                                        <span className="text-gray-300 font-semibold">Total Balance</span>
                                        <span className={`text-xl font-bold ${totalBalance >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                                            {fmt(totalBalance)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* TRANSACTIONS */}
                            {activeTab === 'transactions' && (
                                <div className="space-y-2">
                                    {data.transactions.length === 0 ? (
                                        <p className="text-center text-gray-600 py-8">No transactions found</p>
                                    ) : data.transactions.map(t => (
                                        <div key={String(t.id)} className="bg-gray-900/40 border border-gray-800/40 rounded-xl p-4 flex items-center justify-between hover:border-gray-700/60 transition-colors group">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.type === 'income' ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                                                    {t.type === 'income'
                                                        ? <ArrowUpCircle size={16} className="text-green-400" />
                                                        : <ArrowDownCircle size={16} className="text-red-400" />}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm text-white truncate">{t.description || '—'}</p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                                                        <span className="flex items-center gap-1"><Tag size={10} />{t.category}</span>
                                                        <span className="flex items-center gap-1"><CreditCard size={10} />{t.account}</span>
                                                        <span className="flex items-center gap-1"><Clock size={10} />{fmtDate(t.date)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-bold ml-3 shrink-0 ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                                {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-600">Failed to load data</div>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Main Admin Dashboard
// ─────────────────────────────────────────────
const AdminDashboard = () => {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            if (res.status === 401) {
                router.replace('/admin/login');
                return;
            }
            const result = await res.json();
            if (result.success) setUsers(result.data);
            else toast.error("Failed to load users");
        } catch (err) {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await fetch('/api/admin/auth', { method: 'DELETE' });
            router.push('/admin/login');
        } catch {
            router.push('/admin/login');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.toString().includes(searchTerm)
    );

    const totalIncome = users.reduce((s, u) => s + (u.stats?.totalIncome || 0), 0);
    const totalExpense = users.reduce((s, u) => s + (u.stats?.totalExpense || 0), 0);
    const totalTx = users.reduce((s, u) => s + (u.stats?.transactionCount || 0), 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col justify-center items-center gap-4">
                <Loader className="animate-spin text-purple-500 w-10 h-10" />
                <p className="text-gray-500 text-sm">Loading admin data…</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black font-sans relative overflow-hidden">
            {/* BG Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />

            {/* Top nav */}
            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-800/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <ShieldCheck size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-white text-lg">Cashbook <span className="text-purple-400 font-normal text-sm">Admin</span></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchUsers} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-colors" title="Refresh">
                            <RefreshCw size={15} />
                        </button>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex items-center gap-2 bg-gray-900 border border-gray-800 hover:border-red-500/40 hover:text-red-400 text-gray-400 rounded-xl px-3 py-1.5 text-sm transition-all"
                        >
                            <LogOut size={14} />
                            {isLoggingOut ? 'Signing out…' : 'Sign out'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 pb-24 relative z-10">
                {/* Page title */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                        System Overview
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">{users.length} registered users · Last refreshed {new Date().toLocaleTimeString()}</p>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Users', value: users.length, icon: <Users size={18} />, color: 'blue', display: String(users.length) },
                        { label: 'Platform Income', value: totalIncome, icon: <TrendingUp size={18} />, color: 'green', display: fmt(totalIncome) },
                        { label: 'Platform Expense', value: totalExpense, icon: <TrendingDown size={18} />, color: 'red', display: fmt(totalExpense) },
                        { label: 'All Transactions', value: totalTx, icon: <Activity size={18} />, color: 'purple', display: String(totalTx) },
                    ].map(({ label, icon, color, display }) => (
                        <div key={label} className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-5 hover:border-gray-700 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-500 text-xs font-medium">{label}</span>
                                <div className={`p-2 rounded-xl bg-${color}-500/10 text-${color}-400`}>{icon}</div>
                            </div>
                            <p className="text-2xl font-bold text-white truncate">{display}</p>
                        </div>
                    ))}
                </div>

                {/* User table */}
                <div className="bg-gray-900/30 border border-gray-800/60 rounded-3xl overflow-hidden backdrop-blur-xl">
                    {/* Table header */}
                    <div className="p-5 sm:p-6 border-b border-gray-800/60 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <h2 className="text-white font-bold text-lg flex items-center gap-2">
                            <Users size={18} className="text-purple-400" /> User Directory
                        </h2>
                        <div className="relative w-full sm:w-80">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone…"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-800/60 border border-gray-700/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60 transition-colors"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-800/60 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="py-3 pl-6 font-medium">User</th>
                                    <th className="py-3 px-4 font-medium">Contact</th>
                                    <th className="py-3 px-4 font-medium">Joined</th>
                                    <th className="py-3 px-4 font-medium text-right">Txns</th>
                                    <th className="py-3 px-4 font-medium text-right">Income</th>
                                    <th className="py-3 px-4 font-medium text-right">Expense</th>
                                    <th className="py-3 px-4 font-medium text-right pr-6">Net</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr
                                        key={String(user.id)}
                                        onClick={() => setSelectedUserId(String(user.id))}
                                        className="border-b border-gray-800/40 hover:bg-gray-800/25 transition-colors cursor-pointer group"
                                    >
                                        <td className="py-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                                                    {user.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium text-sm group-hover:text-purple-400 transition-colors">{user.name || 'Unnamed'}</p>
                                                    <p className="text-gray-600 text-xs">···{String(user.id).slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col gap-0.5">
                                                {user.email && (
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Mail size={10} className="text-gray-600" />{user.email}
                                                    </span>
                                                )}
                                                {user.phone && (
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Phone size={10} className="text-gray-600" />{user.phone}
                                                    </span>
                                                )}
                                                {!user.email && !user.phone && <span className="text-gray-600 text-xs italic">—</span>}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Calendar size={10} className="text-gray-600" />
                                                {fmtDate(user.joined)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span className="px-2.5 py-1 bg-gray-800 rounded-lg text-xs font-semibold text-gray-300">
                                                {user.stats.transactionCount}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span className="text-xs font-semibold text-green-400">{fmt(user.stats.totalIncome)}</span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <span className="text-xs font-semibold text-red-400">{fmt(user.stats.totalExpense)}</span>
                                        </td>
                                        <td className="py-4 px-4 pr-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className={`text-sm font-bold ${user.stats.netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {fmt(user.stats.netBalance)}
                                                </span>
                                                <ChevronRight size={14} className="text-gray-700 group-hover:text-purple-500 transition-colors" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <Users size={36} className="mx-auto mb-3 text-gray-700" />
                                            <p className="text-gray-600 text-sm">No users match your search</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-3 border-t border-gray-800/60 text-xs text-gray-600">
                        Showing {filteredUsers.length} of {users.length} users
                    </div>
                </div>
            </main>

            {/* User detail drawer */}
            {selectedUserId && (
                <UserDetailDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
            )}

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                body { font-family: 'Inter', sans-serif; }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(17,24,39,0.5); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(75,85,99,0.6); border-radius: 4px; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slideIn { animation: slideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
};

export default function Page() {
    return <AdminDashboard />;
}
