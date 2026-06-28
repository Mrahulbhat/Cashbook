'use client';

import React, { useEffect, useMemo, useState } from "react";
import { Activity, Calendar, Loader, Plus, Save, Target, Trash2 } from "lucide-react";
import { useUpcomingStore } from "@/store/useUpcomingStore";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const PlanningContent = () => {
    const { upcomingExpenses, fetchUpcoming, addUpcoming, deleteUpcoming } = useUpcomingStore();
    const [loading, setLoading] = useState(true);
    const [savingNotes, setSavingNotes] = useState(false);
    const [editingNotes, setEditingNotes] = useState("");
    const [planTargets, setPlanTargets] = useState([]);
    const [upcomingForm, setUpcomingForm] = useState({
        amount: '',
        description: '',
        dueDate: ''
    });
    const [addingUpcoming, setAddingUpcoming] = useState(false);

    const totalUpcomingThisMonth = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return upcomingExpenses.reduce((sum, expense) => {
            const dueDate = new Date(expense.dueDate);
            if (dueDate >= startOfMonth && dueDate <= endOfMonth && expense.status === 'pending') {
                return sum + Number(expense.amount);
            }
            return sum;
        }, 0);
    }, [upcomingExpenses]);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const [, planRes] = await Promise.all([
                    fetchUpcoming(),
                    axiosInstance.get('/plan')
                ]);
                setEditingNotes(planRes.data.notes || "");
                setPlanTargets(planRes.data.targets || []);
            } catch (error) {
                toast.error("Failed to load planning data");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [fetchUpcoming]);

    const handleSaveNotes = async () => {
        try {
            setSavingNotes(true);
            await axiosInstance.post('/plan', {
                targets: planTargets,
                notes: editingNotes
            });
            toast.success("Financial notes updated!");
        } catch (error) {
            toast.error("Failed to save notes");
        } finally {
            setSavingNotes(false);
        }
    };

    const handleAddUpcoming = async (e) => {
        e.preventDefault();
        try {
            setAddingUpcoming(true);
            await addUpcoming(upcomingForm);
            setUpcomingForm({
                amount: '',
                description: '',
                dueDate: ''
            });
        } finally {
            setAddingUpcoming(false);
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex justify-center items-center">
                <Loader className="w-12 h-12 animate-spin text-green-400" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-black overflow-hidden p-4 sm:p-8">
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-96 h-96 bg-green-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto">
                <header className="mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20">
                            <Target className="text-green-400 w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Financial Planning</h1>
                            <p className="text-gray-400 font-medium">Notes and upcoming expenses</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <section className="lg:col-span-1 bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 h-fit">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                            <Plus className="w-5 h-5 text-blue-400" />
                            Add Upcoming
                        </h2>
                        <form onSubmit={handleAddUpcoming} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Amount</label>
                                <input
                                    type="number"
                                    required
                                    value={upcomingForm.amount}
                                    onChange={(e) => setUpcomingForm({ ...upcomingForm, amount: e.target.value })}
                                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Description</label>
                                <input
                                    type="text"
                                    value={upcomingForm.description}
                                    onChange={(e) => setUpcomingForm({ ...upcomingForm, description: e.target.value })}
                                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all"
                                    placeholder="Rent, Insurance, etc."
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Due Date</label>
                                <input
                                    type="date"
                                    required
                                    value={upcomingForm.dueDate}
                                    onChange={(e) => setUpcomingForm({ ...upcomingForm, dueDate: e.target.value })}
                                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-blue-500/50 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={addingUpcoming}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex justify-center items-center gap-2 mt-4"
                            >
                                {addingUpcoming ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Schedule Expense
                            </button>
                        </form>
                    </section>

                    <section className="lg:col-span-2 bg-gray-900/30 backdrop-blur-xl border border-gray-800 rounded-3xl p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-emerald-400" />
                                Upcoming Bills & Payments
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Monthly Total</p>
                                    <p className="text-emerald-400 font-bold leading-none">{formatCurrency(totalUpcomingThisMonth)}</p>
                                </div>
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-black rounded-full border border-emerald-500/20 uppercase tracking-wider">
                                    {upcomingExpenses.length} Pending
                                </span>
                            </div>
                        </div>

                        {upcomingExpenses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                                <div className="p-4 bg-gray-800/30 rounded-full mb-4">
                                    <Calendar className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="font-bold">No upcoming expenses scheduled</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                                {upcomingExpenses.map((expense) => (
                                    <div key={expense._id} className="group bg-gray-800/40 border border-gray-700/50 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all hover:bg-gray-800/60 hover:border-gray-600">
                                        <div className="flex items-center gap-5 min-w-0">
                                            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-all">
                                                <Calendar className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-white font-bold text-lg leading-tight mb-1 truncate">{expense.description || "Upcoming Expense"}</h3>
                                                <span className="text-gray-500 font-medium text-sm">
                                                    Due: {new Date(expense.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-white font-black text-xl whitespace-nowrap">{formatCurrency(expense.amount)}</div>
                                            <button
                                                onClick={() => deleteUpcoming(expense._id)}
                                                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <section className="bg-purple-600/5 border border-purple-500/20 rounded-3xl p-6 mb-12">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Activity className="text-purple-400" size={24} />
                            <h2 className="text-2xl font-bold text-white">Financial Notes</h2>
                        </div>
                        <button
                            onClick={handleSaveNotes}
                            disabled={savingNotes}
                            className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            {savingNotes ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Notes
                        </button>
                    </div>
                    <textarea
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        placeholder="Add your financial goals, reminders, or general planning notes here..."
                        className="w-full h-40 bg-black/20 border border-gray-800 rounded-2xl p-4 text-gray-300 focus:outline-none focus:border-purple-500/50 transition-all resize-none font-medium leading-relaxed"
                    />
                </section>
            </div>
        </div>
    );
};

export default function PlanningPage() {
    return (
        <ProtectedRoute>
            <PlanningContent />
        </ProtectedRoute>
    );
}
