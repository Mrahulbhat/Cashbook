'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Target, Loader, ChevronRight, TrendingUp, ShoppingBag, Home, Calculator, Save, AlertCircle, List } from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const PlanningContent = () => {
    const router = useRouter();
    const { transactions, fetchTransactions } = useTransactionStore();
    const { categories, loadCategories } = useCategoryStore();
    
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingTargets, setEditingTargets] = useState({});

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                await Promise.all([
                    fetchTransactions(),
                    loadCategories()
                ]);
                const planRes = await axiosInstance.get('/plan');
                setPlan(planRes.data);
                
                const targets = {};
                planRes.data.targets.forEach(t => {
                    targets[t.bucket] = t.amount;
                });
                setEditingTargets(targets);
            } catch (error) {
                toast.error("Failed to load planning data");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const bucketData = useMemo(() => {
        if (!plan || !categories) return [];

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
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

        return buckets.map(bucket => {
            const target = plan.targets.find(t => t.bucket === bucket.name)?.amount || 0;
            const bucketCategories = categories.filter(c => c.planningBucket === bucket.name);
            const categoryIds = bucketCategories.map(c => c._id);
            
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
                amount: Number(editingTargets[bucket])
            }));
            
            await axiosInstance.post('/plan', { targets });
            setPlan({ ...plan, targets });
            toast.success("Targets updated successfully!");
        } catch (error) {
            toast.error("Failed to save targets");
        } finally {
            setSaving(false);
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
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-green-500/10 rounded-2xl border border-green-500/20">
                            <Target className="text-green-400 w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Financial Planning</h1>
                            <p className="text-gray-400 font-medium">Monthly budget targets and bucket tracking</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Targets Configuration */}
                    <section className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-gray-400" />
                                Set Monthly Targets
                            </h2>
                            <button 
                                onClick={handleSaveTargets}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-900/20 active:scale-95"
                            >
                                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                            </button>
                        </div>

                        <div className="space-y-6">
                            {['Needs', 'Wants', 'Short Term', 'Long Term'].map(bucket => (
                                <div key={bucket} className="space-y-2">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">{bucket}</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">₹</span>
                                        <input 
                                            type="number"
                                            value={editingTargets[bucket] || ''}
                                            onChange={(e) => setEditingTargets({ ...editingTargets, [bucket]: e.target.value })}
                                            className="w-full bg-gray-800/50 border border-gray-700/50 rounded-2xl py-4 pl-10 pr-6 text-white font-bold text-xl focus:outline-none focus:border-green-500/50 focus:ring-4 focus:ring-green-500/5 transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Progress Overview */}
                    <div className="space-y-6">
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

                {/* Category Mapping Info */}
                <div className="bg-green-600/5 border border-green-500/20 rounded-[2.5rem] p-10 text-center mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4">How it works</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        To track your progress, assign your categories to one of the four buckets (Needs, Wants, Short Term, or Long Term) in the <span className="text-green-400 font-bold cursor-pointer hover:underline" onClick={() => router.push('/categories')}>Categories</span> section. Every transaction will then automatically contribute to your monthly targets.
                    </p>
                </div>

                {/* Financial Plan Table Section */}
                <section className="bg-gray-900/30 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-8 mb-12 overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <List className="text-blue-400" />
                                Category-wise Financial Plan
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">Detailed breakdown and end-of-month projections</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="py-4 px-4 text-gray-500 text-xs font-bold uppercase tracking-widest">Category</th>
                                    <th className="py-4 px-4 text-gray-500 text-xs font-bold uppercase tracking-widest">Bucket</th>
                                    <th className="py-4 px-4 text-gray-500 text-xs font-bold uppercase tracking-widest">Target Budget</th>
                                    <th className="py-4 px-4 text-gray-500 text-xs font-bold uppercase tracking-widest">Current Use</th>
                                    <th className="py-4 px-4 text-gray-500 text-xs font-bold uppercase tracking-widest">Pro-rata Projection</th>
                                    <th className="py-4 px-4 text-gray-500 text-xs font-bold uppercase tracking-widest text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.filter(c => c.type === 'expense').map(cat => {
                                    const now = new Date();
                                    const currentYear = now.getFullYear();
                                    const currentMonth = now.getMonth();
                                    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
                                    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                                    const daysPassed = now.getDate();

                                    const monthlyTxns = transactions.filter(t => {
                                        const d = new Date(t.date);
                                        return d >= firstDayOfMonth && d <= now && (t.category?._id === cat._id || t.category === cat._id);
                                    });

                                    const spent = monthlyTxns.reduce((sum, t) => sum + Number(t.amount), 0);
                                    
                                    // Estimation: Pro-rata projection
                                    const estimation = daysPassed > 0 ? (spent / daysPassed) * daysInMonth : 0;
                                    
                                    const monthlyBudget = Number(cat.budget) || 0;
                                    const yearlyBudgetProRata = cat.yearlyBudget ? (cat.yearlyBudget / 12) : 0;
                                    const targetBudget = monthlyBudget || yearlyBudgetProRata;
                                    
                                    const isAtRisk = estimation > targetBudget && targetBudget > 0;
                                    const isExceeded = spent > targetBudget && targetBudget > 0;

                                    return (
                                        <tr key={cat._id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors group">
                                            <td className="py-5 px-4">
                                                <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{cat.name}</div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded bg-gray-800 text-gray-400`}>
                                                    {cat.planningBucket || 'None'}
                                                </span>
                                            </td>
                                            <td className="py-5 px-4 text-gray-300 font-mono">
                                                {targetBudget > 0 ? formatCurrency(targetBudget) : <span className="text-gray-600 text-xs italic">Not set</span>}
                                            </td>
                                            <td className="py-5 px-4 font-bold text-white font-mono">
                                                {formatCurrency(spent)}
                                            </td>
                                            <td className="py-5 px-4 font-mono">
                                                <div className={isAtRisk ? 'text-amber-400' : 'text-gray-400'}>
                                                    {formatCurrency(estimation)}
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 text-right">
                                                {targetBudget === 0 ? (
                                                    <span className="text-gray-600 text-[10px] font-bold uppercase">No Budget</span>
                                                ) : isExceeded ? (
                                                    <span className="inline-flex items-center gap-1 text-red-400 text-[10px] font-black uppercase bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                                                        <AlertCircle size={10} /> Exceeded
                                                    </span>
                                                ) : isAtRisk ? (
                                                    <span className="inline-flex items-center gap-1 text-amber-500 text-[10px] font-black uppercase bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                                                        <TrendingUp size={10} /> At Risk
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-green-400 text-[10px] font-black uppercase bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                                                        On Track
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
            
            {/* Dynamic CSS for bucket colors since Tailwind might not catch dynamic classes */}
            <style jsx>{`
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
