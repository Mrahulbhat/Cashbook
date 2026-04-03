'use client';

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Users, Loader, TrendingUp, TrendingDown, Wallet,
    Calendar, Mail, Phone, Activity, Search, X, ChevronRight,
    CreditCard, ArrowUpCircle, ArrowDownCircle, LogOut, ShieldCheck,
    RefreshCw, DollarSign, Hash, Tag, Clock, PieChart, Landmark, Database, Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";

const fmt = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// ─────────────────────────────────────────────
// User Detail Drawer (Unchanged but ensuring it's here)
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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-2xl bg-[#0d0d14] border-l border-gray-800/70 h-full flex flex-col animate-slideIn overflow-hidden shadow-2xl">
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
                        <div className="p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-b border-gray-800/60">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                                    {data.user.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{data.user.name || 'Unnamed'}</h3>
                                    <p className="text-xs text-gray-500">ID: {String(data.user.id).slice(-8)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex border-b border-gray-800/60 shrink-0 px-6 pt-4 gap-1">
                            {['overview', 'accounts', 'transactions'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-t-xl text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            {activeTab === 'overview' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4">
                                            <p className="text-xs text-gray-400 mb-1">Total Income</p>
                                            <p className="text-xl font-bold text-green-400">{fmt(data.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0))}</p>
                                        </div>
                                        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4">
                                            <p className="text-xs text-gray-400 mb-1">Total Expense</p>
                                            <p className="text-xl font-bold text-red-400">{fmt(data.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0))}</p>
                                        </div>
                                        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4 col-span-2">
                                            <p className="text-xs text-gray-400 mb-1">Total Account Balance</p>
                                            <p className={`text-xl font-bold ${totalBalance >= 0 ? 'text-purple-400' : 'text-red-400'}`}>{fmt(totalBalance)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'accounts' && (
                                <div className="space-y-3">
                                    {data.accounts.map(acc => (
                                        <div key={String(acc.id)} className="bg-gray-900/50 border border-gray-800/60 rounded-2xl p-5 flex items-center justify-between">
                                            <div>
                                                <p className="text-white font-semibold">{acc.name}</p>
                                                <p className="text-xs text-gray-500">Account</p>
                                            </div>
                                            <p className={`text-lg font-bold ${acc.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(acc.balance)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'transactions' && (
                                <div className="space-y-2">
                                    {data.transactions.map(t => (
                                        <div key={String(t.id)} className="bg-gray-900/40 border border-gray-800/40 rounded-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                                                    {t.type === 'income' ? <ArrowUpCircle size={16} className="text-green-400" /> : <ArrowDownCircle size={16} className="text-red-400" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white truncate">{t.description || t.category}</p>
                                                    <p className="text-xs text-gray-500">{t.account} · {fmtDate(t.date)}</p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                                {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : <div className="p-10 text-center text-gray-500">No data found</div>}
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
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [mainTab, setMainTab] = useState('users'); // 'users' or 'accounts'
    const [dbStats, setDbStats] = useState(null);
    const [isDeletingUserId, setIsDeletingUserId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState({ id: null, name: '' });

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const [uRes, aRes] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/admin/accounts')
            ]);
            
            if (uRes.status === 401) {
                router.replace('/admin/login');
                return;
            }

            const [uData, aData] = await Promise.all([uRes.json(), aRes.json()]);
            if (uData.success) setUsers(uData.data);
            if (aData.success) setAccounts(aData.data);
            
            if (!uData.success || !aData.success) toast.error("Partial data load failure");
            
            // Also fetch DB stats
            fetch('/api/db-stats').then(r => r.json()).then(res => {
                if (res.success) setDbStats(res.data);
            }).catch(console.error);
        } catch (err) {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await fetch('/api/admin/auth', { method: 'DELETE' });
            router.push('/admin/login');
        } catch {
            router.push('/admin/login');
        }
    };

    const totalIncome = users.reduce((s, u) => s + (u.stats?.totalIncome || 0), 0);
    const totalExpense = users.reduce((s, u) => s + (u.stats?.totalExpense || 0), 0);
    const systemNetWorth = accounts.reduce((s, a) => s + (a.balance || 0), 0);
    const totalTx = users.reduce((s, u) => s + (u.stats?.transactionCount || 0), 0);

    const deleteUser = (userId, userName) => {
        setUserToDelete({ id: userId, name: userName });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        const { id, name } = userToDelete;
        if (!id) return;
        
        setIsDeleteModalOpen(false);
        setIsDeletingUserId(id);
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message || "User deleted successfully");
                setUsers(prev => prev.filter(u => u.id !== id));
            } else {
                toast.error(data.error || "Failed to delete user");
            }
        } catch (err) {
            toast.error("Network error while deleting user");
        } finally {
            setIsDeletingUserId(null);
            setUserToDelete({ id: null, name: '' });
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.toString().includes(searchTerm)
    );

    const filteredAccounts = accounts.filter(a =>
        a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col justify-center items-center gap-4">
                <Loader className="animate-spin text-purple-500 w-10 h-10" />
                <p className="text-gray-500 text-sm font-medium">Powering up admin dashboard…</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

            <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-800/50 px-6 sm:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-purple-500" size={24} />
                    <span className="font-bold text-xl tracking-tight">CASHBOOK <span className="text-gray-500 font-normal">ADMIN</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={fetchAllData} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all">
                        <RefreshCw size={18} />
                    </button>
                    <button onClick={handleLogout} className="bg-red-900/20 text-red-400 border border-red-800/30 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-900/30 transition-all">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 sm:px-8 py-10 space-y-10 relative z-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 border border-gray-800/60 rounded-3xl p-6 backdrop-blur-sm">
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">System Net Worth</p>
                        <p className={`text-3xl font-extrabold ${systemNetWorth >= 0 ? 'text-white' : 'text-red-400'}`}>{fmt(systemNetWorth)}</p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                             <Wallet size={12} className="text-purple-500" /> Across {accounts.length} accounts
                        </div>
                    </div>
                    <div className="bg-gray-900/30 border border-gray-800/60 rounded-3xl p-6">
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Total Users</p>
                        <p className="text-3xl font-extrabold text-white">{users.length}</p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                             <Users size={12} className="text-blue-500" /> Registered accounts
                        </div>
                    </div>
                    <div className="bg-gray-900/30 border border-gray-800/60 rounded-3xl p-6">
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Total Income</p>
                        <p className="text-3xl font-extrabold text-green-400">{fmt(totalIncome)}</p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                             <TrendingUp size={12} /> System-wide inflow
                        </div>
                    </div>
                    <div className="bg-gray-900/30 border border-gray-800/60 rounded-3xl p-6">
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Total Expense</p>
                        <p className="text-3xl font-extrabold text-red-400">{fmt(totalExpense)}</p>
                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                             <TrendingDown size={12} /> System-wide outflow
                        </div>
                    </div>
                    {/* DB Storage Card */}
                    <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors md:col-span-4 lg:col-span-4 xl:col-span-4">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                                <Database className="text-blue-400 w-8 h-8" />
                            </div>
                            <div className="w-full">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Database Storage (M0 Free Tier)</p>
                                    {dbStats && (
                                        <span className="text-[10px] text-gray-600 font-mono">
                                            USED: {(((dbStats.dataSize + dbStats.indexSize || 0)) / (1024 * 1024)).toFixed(2)} MB / 512 MB
                                        </span>
                                    )}
                                </div>
                                {dbStats ? (
                                    <>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-2xl font-bold text-white">
                                                {Math.max(0, ((512 * 1024 * 1024 - (dbStats.dataSize + dbStats.indexSize || 0)) / (1024 * 1024))).toFixed(1)}
                                            </p>
                                            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">MB Free</p>
                                        </div>
                                        <div className="w-full bg-gray-800/50 h-1.5 rounded-full mt-2 overflow-hidden border border-gray-800/50">
                                            <div className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" style={{ width: `${Math.min((((dbStats.dataSize + dbStats.indexSize || 0)) / (512 * 1024 * 1024)) * 100, 100)}%` }}></div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <Loader size={14} className="animate-spin text-blue-500" />
                                        <span>Syncing with MongoDB Atlas...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="bg-gray-900/20 border border-gray-800/60 rounded-[2.5rem] overflow-hidden">
                    <div className="p-6 border-b border-gray-800/60 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex bg-gray-800/40 p-1 rounded-2xl border border-gray-700/50">
                            <button 
                                onClick={() => setMainTab('users')}
                                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${mainTab === 'users' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Users size={16} /> User Directory
                            </button>
                            <button 
                                onClick={() => setMainTab('accounts')}
                                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${mainTab === 'accounts' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Landmark size={16} /> Accounts & Balances
                            </button>
                        </div>
                        
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                            <input 
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search everything..."
                                className="w-full bg-black/40 border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        {mainTab === 'users' ? (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-800/60 text-xs font-bold text-gray-500 uppercase tracking-widest text-left">
                                        <th className="px-8 py-5">User Profile</th>
                                        <th className="px-8 py-5">Contact Details</th>
                                        <th className="px-8 py-5 text-right">Activity</th>
                                        <th className="px-8 py-5 text-right">Net Worth</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr 
                                            key={user.id} 
                                            className="border-b border-gray-800/40 hover:bg-white/5 cursor-pointer transition-all group"
                                        >
                                            <td className="px-8 py-6" onClick={() => setSelectedUserId(user.id)}>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-black text-xl">
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-100 group-hover:text-purple-400 transition-colors uppercase tracking-tight">{user.name}</p>
                                                        <p className="text-xs text-gray-500 font-mono">ID: {String(user.id).slice(-6)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm text-gray-400 flex items-center gap-2"><Mail size={12} /> {user.email || 'N/A'}</p>
                                                <p className="text-xs text-gray-600 flex items-center gap-2 mt-1"><Phone size={12} /> {user.phone || 'N/A'}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="px-3 py-1 bg-gray-800/60 rounded-lg text-xs font-bold text-gray-400">{user.stats.transactionCount} TXs</span>
                                            </td>
                                            <td className="px-8 py-6 text-right" onClick={() => setSelectedUserId(user.id)}>
                                                <p className={`text-lg font-black ${user.stats.netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(user.stats.netBalance)}</p>
                                                <p className="text-xs text-gray-600">Total Account Sum</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteUser(user.id, user.name);
                                                    }}
                                                    disabled={isDeletingUserId === user.id}
                                                    className="p-3 bg-red-900/10 text-red-500 border border-red-800/20 rounded-xl hover:bg-red-900/30 transition-all disabled:opacity-50"
                                                    title="Permanently Delete User"
                                                >
                                                    {isDeletingUserId === user.id ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-800/60 text-xs font-bold text-gray-500 uppercase tracking-widest text-left">
                                        <th className="px-8 py-5">Account Name</th>
                                        <th className="px-8 py-5">Owner</th>
                                        <th className="px-8 py-5">Last Activity</th>
                                        <th className="px-8 py-5 text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAccounts.map(acc => (
                                        <tr key={acc.id} className="border-b border-gray-800/40 hover:bg-white/5 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-purple-400 border border-gray-700/50">
                                                        <CreditCard size={18} />
                                                    </div>
                                                    <p className="font-bold text-gray-100">{acc.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm text-gray-200 font-semibold">{acc.user.name}</p>
                                                <p className="text-xs text-gray-500">{acc.user.email}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs text-gray-400 flex items-center gap-2"><Clock size={12} /> {fmtDate(acc.updatedAt)}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className={`text-xl font-black ${acc.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fmt(acc.balance)}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        
                        {(mainTab === 'users' ? filteredUsers : filteredAccounts).length === 0 && (
                            <div className="py-20 text-center text-gray-600">
                                <Search size={48} className="mx-auto mb-4 opacity-10" />
                                <p className="text-lg font-bold">No results found</p>
                                <p className="text-sm">Try adjusting your search criteria</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {selectedUserId && <UserDetailDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Permanently Delete User"
                message={`Are you sure you want to permanently delete user "${userToDelete.name}"? This will delete all their transactions, accounts, and categories. This action is irreversible.`}
                confirmText="Delete User"
                type="danger"
            />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
                @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slideIn { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
};

export default function Page() {
    return <AdminDashboard />;
}
