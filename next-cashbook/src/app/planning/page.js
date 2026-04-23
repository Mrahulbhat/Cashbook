'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Target, Loader, ChevronRight, TrendingUp, ShoppingBag, Home, Calculator, Save, AlertCircle, List, Calendar, Plus, Trash2, CheckCircle, Tag, Activity } from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useUpcomingStore } from "@/store/useUpcomingStore";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const PlanningContent = () => {
    const router = useRouter();
    const { transactions, fetchTransactions } = useTransactionStore();
    const { categories, loadCategories } = useCategoryStore();
    
    const { upcomingExpenses, fetchUpcoming, addUpcoming, deleteUpcoming } = useUpcomingStore();

    const totalUpcomingThisMonth = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        return upcomingExpenses.reduce((sum, e) => {
            const dueDate = new Date(e.dueDate);
            if (dueDate >= startOfMonth && dueDate <= endOfMonth && e.status === 'pending') {
                return sum + Number(e.amount);
            }
            return sum;
        }, 0);
    }, [upcomingExpenses]);
    
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingTargets, setEditingTargets] = useState({}); // { bucketName: { amount: 0, yearlyAmount: 0 } }
    const [editingNotes, setEditingNotes] = useState("");
    
    const [upcomingForm, setUpcomingForm] = useState({
        amount: '',
        description: '',
        dueDate: ''
    });
    const [addingUpcoming, setAddingUpcoming] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                await Promise.all([
                    fetchTransactions(),
                    loadCategories(),
                    fetchUpcoming()
                ]);
                const planRes = await axiosInstance.get('/plan');
                setPlan(planRes.data);
                
                const targets = {};
                ['Needs', 'Wants', 'Short Term', 'Long Term'].forEach(b => {
                    const t = planRes.data.targets.find(target => target.bucket === b);
                    targets[b] = { 
                        amount: t?.amount || 0, 
                        yearlyAmount: t?.yearlyAmount || 0 
                    };
                });
                setEditingTargets(targets);
                setEditingNotes(planRes.data.notes || "");
            } catch (error) {
                toast.error("Failed to load planning data");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const bucketData = useMemo(() => {
        if (!categories) return [];

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        
        const monthlyTransactions = transactions.filter(t => {
            const d = new Date(t.date);
            return d >= firstDayOfMonth && d <= now;
        });

        const buckets = [
            { name: 'Needs', icon: Home, color: 'blue' },
            { name: 'Wants', icon: ShoppingBag, color: 'amber' },
            { name: 'Short Term', icon: TrendingUp, color: 'emerald' },
            { name: 'Long Term', icon: Target, color: 'purple' },
        ];

        // Financial Year: Calendar Year (Jan to Dec)
        let startOfCycle = new Date(currentYear, 0, 1);
        let monthsRemaining = 12 - currentMonth;

        return buckets.map(bucket => {
            const bucketCategories = categories.filter(c => c.planningBucket === bucket.name);
            const categoryIds = bucketCategories.map(c => c._id);
            
            const planTarget = plan?.targets.find(t => t.bucket === bucket.name);
            const yearlyAmount = planTarget?.yearlyAmount || 0;

            let target = 0;
            if (yearlyAmount > 0) {
                const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
                // Calculate spent in this financial year BEFORE current month for all categories in this bucket
                const pastMonthsTxns = transactions.filter(t => {
                    const d = new Date(t.date);
                    const catId = t.category?._id || t.category;
                    return d >= startOfCycle && d < startOfCurrentMonth && categoryIds.includes(catId);
                });
                const spentInPastMonths = pastMonthsTxns.reduce((sum, t) => sum + Number(t.amount), 0);
                target = Math.max(0, (yearlyAmount - spentInPastMonths) / monthsRemaining);
            }
            
            const spent = monthlyTransactions
                .filter(t => categoryIds.includes(t.category?._id || t.category))
                .reduce((sum, t) => sum + Number(t.amount), 0);
            
            return {
                ...bucket,
                target,
                spent,
                progress: target > 0 ? (spent / target) * 100 : 0
            };
        });
    }, [plan, categories, transactions]);

    const handleSaveTargets = async () => {
        try {
            setSaving(true);
            const targets = Object.keys(editingTargets).map(bucket => ({
                bucket,
                amount: 0, // Reset monthly
                yearlyAmount: Number(editingTargets[bucket]?.yearlyAmount || 0)
            }));
            
            await axiosInstance.post('/plan', { 
                targets,
                notes: editingNotes
            });
            setPlan({ ...plan, targets, notes: editingNotes });
            toast.success("Yearly targets & notes updated!");
        } catch (error) {
            toast.error("Failed to save targets");
        } finally {
            setSaving(false);
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
        } catch (error) {
            // Error handled in store
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
            {/* Background Glows */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-96 h-96 bg-green-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto">
                <header className="mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20">
                            <Target className="text-green-400 w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Financial Planning</h1>
                            <p className="text-gray-400 font-medium">Smart Yearly Budgeting (Jan-Dec Cycle)</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Yearly Targets Configuration */}
                    <section className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Calculator className="w-5 h-5 text-green-400" />
                                    Bucket Targets
                                </h2>
                                <div className="mt-2 space-y-1">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Calendar Year Cycle</p>
                                    <p className="text-xs font-bold text-green-400/80">
                                        Total Yearly: {formatCurrency(Object.values(editingTargets).reduce((sum, t) => sum + (Number(t.yearlyAmount) || 0), 0))}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={handleSaveTargets}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-900/20 active:scale-95"
                            >
                                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                            </button>
                        </div>

                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                            {['Needs', 'Wants', 'Short Term', 'Long Term'].map(bucket => (
                                <div key={bucket} className="p-4 bg-black/20 rounded-2xl border border-gray-800/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">{bucket}</label>
                                        <div className="relative w-64">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₹</span>
                                            <input 
                                                type="number"
                                                value={editingTargets[bucket]?.yearlyAmount || ''}
                                                onChange={(e) => setEditingTargets({ 
                                                    ...editingTargets, 
                                                    [bucket]: { ...editingTargets[bucket], yearlyAmount: e.target.value } 
                                                })}
                                                className="w-full bg-gray-800/30 border border-gray-700/50 rounded-xl py-2 pl-10 pr-4 text-white font-bold focus:outline-none focus:border-green-500/50 transition-all text-sm"
                                                placeholder="Yearly Budget"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Progress Overview */}
                    <div className="space-y-4">
                        {bucketData.map((bucket, idx) => (
                            <div key={idx} className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 transition-all hover:bg-gray-900/60">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 bg-${bucket.color}-500/10 rounded-2xl text-${bucket.color}-400 border border-${bucket.color}-500/20`}>
                                            <bucket.icon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg">{bucket.name}</h3>
                                            <p className="text-gray-500 text-sm font-medium">
                                                {formatCurrency(bucket.spent)} / {formatCurrency(bucket.target)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`text-2xl font-black text-${bucket.color}-400`}>
                                        {Math.round(bucket.progress)}%
                                    </div>
                                </div>
                                <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`absolute top-0 left-0 h-full bg-${bucket.color}-500 transition-all duration-1000 shadow-[0_0_15px_rgba(var(--color-rgb),0.5)]`}
                                        style={{ 
                                            width: `${Math.min(bucket.progress, 100)}%`,
                                        }}
                                    ></div>
                                </div>
                                {bucket.progress > 100 && (
                                    <div className="flex items-center gap-2 mt-3 text-red-400 text-xs font-bold uppercase tracking-wider">
                                        <AlertCircle size={14} />
                                        Exceeded target by {formatCurrency(bucket.spent - bucket.target)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Expenses Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Add Upcoming Form */}
                    <section className="lg:col-span-1 bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-8 h-fit">
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

                    {/* Upcoming List */}
                    <section className="lg:col-span-2 bg-gray-900/30 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-emerald-400" />
                                Upcoming Bills & Payments
                            </h2>
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
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
                                <p className="text-sm">Great job keeping on top of your bills!</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                                {upcomingExpenses.map((expense) => (
                                    <div key={expense._id} className="group bg-gray-800/40 border border-gray-700/50 rounded-2xl p-5 flex items-center justify-between transition-all hover:bg-gray-800/60 hover:border-gray-600">
                                        <div className="flex items-center gap-5">
                                            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-all">
                                                <Calendar className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold text-lg leading-none mb-1">{expense.description}</h3>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="text-gray-500 font-medium">Due: {new Date(expense.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <div className="text-white font-black text-xl">{formatCurrency(expense.amount)}</div>
                                            </div>
                                            <button 
                                                onClick={() => deleteUpcoming(expense._id)}
                                                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
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

                {/* Financial Notes Section */}
                <div className="bg-purple-600/5 border border-purple-500/20 rounded-[2.5rem] p-8 mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Activity className="text-purple-400" size={24} />
                            <h2 className="text-2xl font-bold text-white">Financial Notes</h2>
                        </div>
                        <button 
                            onClick={handleSaveTargets}
                            disabled={saving}
                            className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 transition-all flex items-center gap-2 text-sm"
                        >
                            {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Notes
                        </button>
                    </div>
                    <textarea 
                        value={editingNotes}
                        onChange={(e) => setEditingNotes(e.target.value)}
                        placeholder="Add your financial goals, reminders, or general planning notes here..."
                        className="w-full h-32 bg-black/20 border border-gray-800 rounded-2xl p-4 text-gray-300 focus:outline-none focus:border-purple-500/50 transition-all resize-none font-medium leading-relaxed"
                    />
                </div>

            </div>
            
            {/* Dynamic CSS for bucket colors since Tailwind might not catch dynamic classes */}
            <style jsx>{`
                /* Hide number input spinners */
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }

                .bg-blue-500 { background-color: #3b82f6; }
                .text-blue-400 { color: #60a5fa; }
                .bg-blue-500\/10 { background-color: rgba(59, 130, 246, 0.1); }
                .border-blue-500\/20 { border-color: rgba(59, 130, 246, 0.2); }
                
                .bg-amber-500 { background-color: #f59e0b; }
                .text-amber-400 { color: #fbbf24; }
                .bg-amber-500\/10 { background-color: rgba(245, 158, 11, 0.1); }
                .border-amber-500\/20 { border-color: rgba(245, 158, 11, 0.2); }
                
                .bg-emerald-500 { background-color: #10b981; }
                .text-emerald-400 { color: #34d399; }
                .bg-emerald-500\/10 { background-color: rgba(16, 185, 129, 0.1); }
                .border-emerald-500\/20 { border-color: rgba(16, 185, 129, 0.2); }
                
                .bg-purple-500 { background-color: #8b5cf6; }
                .text-purple-400 { color: #a78bfa; }
                .bg-purple-500\/10 { background-color: rgba(139, 92, 246, 0.1); }
                .border-purple-500\/20 { border-color: rgba(139, 92, 246, 0.2); }
            `}</style>
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
