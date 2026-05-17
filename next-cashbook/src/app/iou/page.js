'use client';

import React, { useState, useEffect } from "react";
import {
    Users, Plus, CheckCircle2, Clock, ChevronDown, ChevronUp,
    Trash2, X, Loader, HandCoins, AlertCircle, ArrowDownCircle
} from "lucide-react";
import { useIouStore } from "@/store/useIouStore";
import { useAccountStore } from "@/store/useAccountStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

// ── Helpers ─────────────────────────────────────────────────────
function daysAgo(date) {
    const diff = Math.floor((Date.now() - new Date(date)) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return `${diff}d ago`;
}

function fmt(n) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

// ── Settle Modal ──────────────────────────────────────────────────
function SettleModal({ iou, accounts, onClose, onSettle, loading }) {
    const [amount, setAmount] = useState(iou.amount - iou.paidBack);
    const [accountId, setAccountId] = useState(accounts[0]?._id || "");
    const remaining = iou.amount - iou.paidBack;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!accountId) { toast.error("Select an account"); return; }
        if (amount <= 0) { toast.error("Amount must be positive"); return; }
        await onSettle(iou._id, { amountReceived: parseFloat(amount), accountId });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <CheckCircle2 size={20} className="text-green-500" /> Record Payback
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                <div className="bg-gray-800/60 rounded-2xl p-4 mb-5 border border-gray-700/50">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Friend</p>
                    <p className="text-white font-bold text-lg">{iou.friendName}</p>
                    {iou.description && <p className="text-gray-400 text-sm mt-1">{iou.description}</p>}
                    <div className="flex gap-4 mt-3 text-sm">
                        <div>
                            <span className="text-gray-500">Total lent</span>
                            <p className="text-white font-semibold">{fmt(iou.amount)}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Received so far</span>
                            <p className="text-green-400 font-semibold">{fmt(iou.paidBack)}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Still owed</span>
                            <p className="text-yellow-400 font-semibold">{fmt(remaining)}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Amount Received</label>
                        <input
                            id="SettleAmountInput"
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            max={remaining}
                            min={1}
                            step="0.01"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Max: {fmt(remaining)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Add to Account</label>
                        <select
                            id="SettleAccountSelect"
                            value={accountId}
                            onChange={e => setAccountId(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500"
                            required
                        >
                            <option value="">Select Account</option>
                            {accounts.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                        </select>
                    </div>
                    <button
                        id="SettleConfirmBtn"
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                        {loading ? <Loader className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                        Confirm Payment Received
                    </button>
                </form>
            </div>
        </div>
    );
}

// ── Add IOU Modal ─────────────────────────────────────────────────
function AddIouModal({ onClose, onAdd, loading }) {
    const [form, setForm] = useState({
        friendName: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.friendName || !form.amount) { toast.error("Fill all required fields"); return; }
        await onAdd({ ...form, amount: parseFloat(form.amount), date: new Date(form.date) });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <HandCoins size={20} className="text-yellow-500" /> New IOU
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>
                <p className="text-xs text-gray-500 mb-5">You paid for a friend — they owe you.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Friend's Name *</label>
                        <input
                            id="IouFriendName"
                            type="text"
                            value={form.friendName}
                            onChange={e => setForm(f => ({ ...f, friendName: e.target.value }))}
                            placeholder="e.g. Priya, Karan"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 placeholder-gray-600"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Amount *</label>
                        <input
                            id="IouAmount"
                            type="number"
                            value={form.amount}
                            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                            placeholder="0"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 placeholder-gray-600"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">What was it for?</label>
                        <input
                            id="IouDescription"
                            type="text"
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="e.g. Dinner, Movie tickets"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500 placeholder-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Date</label>
                        <input
                            id="IouDate"
                            type="date"
                            value={form.date}
                            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                        />
                    </div>
                    <button
                        id="AddIouSubmit"
                        type="submit"
                        disabled={loading}
                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all mt-2"
                    >
                        {loading ? <Loader className="animate-spin" size={18} /> : <Plus size={18} />}
                        Add IOU
                    </button>
                </form>
            </div>
        </div>
    );
}

// ── IOU Card ──────────────────────────────────────────────────────
function IouCard({ iou, accounts, onSettle, onDelete, loading }) {
    const [expanded, setExpanded] = useState(false);
    const [showSettle, setShowSettle] = useState(false);

    const remaining = iou.amount - iou.paidBack;
    const progress = (iou.paidBack / iou.amount) * 100;

    const statusColors = {
        pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
        partially_paid: "text-blue-400 bg-blue-400/10 border-blue-400/30",
        settled: "text-green-400 bg-green-400/10 border-green-400/30",
    };

    return (
        <>
            {showSettle && (
                <SettleModal
                    iou={iou}
                    accounts={accounts}
                    onClose={() => setShowSettle(false)}
                    onSettle={onSettle}
                    loading={loading}
                />
            )}
            <div className={`bg-gray-900 border rounded-2xl overflow-hidden transition-all duration-300 ${iou.status === "settled" ? "border-gray-800/50 opacity-70" : "border-gray-800 hover:border-gray-700"}`}>
                <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                        {/* Avatar + Info */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                                {iou.friendName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-white font-bold text-base">{iou.friendName}</p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[iou.status]} capitalize`}>
                                        {iou.status.replace("_", " ")}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-xs mt-0.5 truncate">{iou.description || "No description"}</p>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right flex-shrink-0">
                            <div className="flex items-center gap-1 justify-end font-bold text-lg text-green-400">
                                <ArrowDownCircle size={16} />
                                {fmt(iou.amount)}
                            </div>
                            <p className="text-gray-500 text-xs">{daysAgo(iou.date)}</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    {iou.paidBack > 0 && (
                        <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Received: {fmt(iou.paidBack)}</span>
                                <span>Still owed: {fmt(remaining)}</span>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {iou.status !== "settled" && (
                        <div className="flex gap-2 mt-3">
                            <button
                                id={`SettleBtn-${iou._id}`}
                                onClick={() => setShowSettle(true)}
                                className="flex-1 py-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 hover:text-green-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-green-600/30"
                            >
                                <CheckCircle2 size={13} /> They Paid Back
                            </button>
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg text-xs transition-all"
                            >
                                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            <button
                                id={`DeleteIouBtn-${iou._id}`}
                                onClick={() => onDelete(iou._id)}
                                className="px-3 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded-lg text-xs transition-all border border-red-800/30"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}

                    {iou.status === "settled" && (
                        <div className="flex justify-end mt-3">
                            <button
                                id={`DeleteIouBtn-${iou._id}`}
                                onClick={() => onDelete(iou._id)}
                                className="px-3 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded-lg text-xs transition-all border border-red-800/30 flex items-center gap-1"
                            >
                                <Trash2 size={12} /> Remove
                            </button>
                        </div>
                    )}
                </div>

                {/* Expanded details */}
                {expanded && (
                    <div className="border-t border-gray-800 px-4 py-3 bg-gray-900/50 text-xs text-gray-400 space-y-1">
                        <div className="flex justify-between">
                            <span>Date</span>
                            <span>{new Date(iou.date).toLocaleDateString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Payments received</span>
                            <span>{iou.settlementTransactionIds?.length || 0}</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

// ── Main Page ─────────────────────────────────────────────────────
const IouContent = () => {
    const { ious, loading, fetchIous, addIou, settleIou, deleteIou } = useIouStore();
    const { accounts, fetchAccounts } = useAccountStore();
    const [showAdd, setShowAdd] = useState(false);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchIous();
        fetchAccounts();
    }, [fetchIous, fetchAccounts]);

    // ── Stats ──────────────────────────────────────────────────────
    const totalOwedToMe = ious
        .filter(i => i.status !== "settled")
        .reduce((sum, i) => sum + (i.amount - i.paidBack), 0);

    const pendingCount = ious.filter(i => i.status !== "settled").length;
    const settledCount = ious.filter(i => i.status === "settled").length;

    // ── Filtered & grouped ─────────────────────────────────────────
    const filtered = ious.filter(i => {
        if (filter === "pending") return i.status !== "settled";
        if (filter === "settled") return i.status === "settled";
        return true;
    });

    const pending = filtered.filter(i => i.status !== "settled");
    const settled = filtered.filter(i => i.status === "settled");

    return (
        <div className="min-h-screen bg-black p-4 sm:p-6 pb-24 relative overflow-hidden">
            {/* Ambient blobs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-2">
                            <Users size={24} className="text-yellow-500" /> IOU Tracker
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">Track money you've lent to friends</p>
                    </div>
                    <button
                        id="AddIouBtn"
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-xl transition-all hover:scale-105 text-sm shadow-lg shadow-yellow-600/20"
                    >
                        <Plus size={16} /> New IOU
                    </button>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Total Owed</p>
                        <p className="text-green-400 font-black text-lg">{fmt(totalOwedToMe)}</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Pending</p>
                        <p className="text-yellow-400 font-black text-lg">{pendingCount}</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1">Settled</p>
                        <p className="text-gray-400 font-black text-lg">{settledCount}</p>
                    </div>
                </div>

                {/* Callout */}
                {totalOwedToMe > 0 && (
                    <div className="rounded-2xl p-4 mb-5 border bg-green-900/20 border-green-800/40 flex items-center gap-3">
                        <AlertCircle size={18} className="text-green-400 flex-shrink-0" />
                        <p className="text-sm text-gray-300">
                            Friends owe you a total of <span className="text-green-400 font-bold">{fmt(totalOwedToMe)}</span>
                        </p>
                    </div>
                )}

                {/* Filter tabs */}
                <div className="flex gap-2 mb-5 p-1 bg-gray-900 border border-gray-800 rounded-xl">
                    {[["all", "All"], ["pending", "Pending"], ["settled", "Settled"]].map(([val, label]) => (
                        <button
                            key={val}
                            id={`FilterTab-${val}`}
                            onClick={() => setFilter(val)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${filter === val ? "bg-yellow-600 text-black" : "text-gray-500 hover:text-gray-300"}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && ious.length === 0 && (
                    <div className="flex justify-center py-12">
                        <Loader className="animate-spin text-yellow-500" size={28} />
                    </div>
                )}

                {/* Empty state */}
                {!loading && ious.length === 0 && (
                    <div className="text-center py-16">
                        <HandCoins size={48} className="text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 font-semibold text-lg">No IOUs yet</p>
                        <p className="text-gray-600 text-sm mt-1">When you pay for a friend, add an IOU to track it</p>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="mt-5 px-6 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-xl text-sm transition-all"
                        >
                            Add First IOU
                        </button>
                    </div>
                )}

                {/* Pending IOUs */}
                {pending.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock size={14} className="text-yellow-500" />
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending ({pending.length})</h2>
                        </div>
                        <div className="space-y-3">
                            {pending.map(iou => (
                                <IouCard key={iou._id} iou={iou} accounts={accounts} onSettle={settleIou} onDelete={deleteIou} loading={loading} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Settled IOUs */}
                {settled.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 size={14} className="text-green-500" />
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Settled ({settled.length})</h2>
                        </div>
                        <div className="space-y-3">
                            {settled.map(iou => (
                                <IouCard key={iou._id} iou={iou} accounts={accounts} onSettle={settleIou} onDelete={deleteIou} loading={loading} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showAdd && (
                <AddIouModal onClose={() => setShowAdd(false)} onAdd={addIou} loading={loading} />
            )}
        </div>
    );
};

export default function IouPage() {
    return (
        <ProtectedRoute>
            <IouContent />
        </ProtectedRoute>
    );
}
