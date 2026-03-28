'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, Target, PieChart, Loader, Activity, CalendarDays, Wallet, ArrowUpRight, ArrowDownRight, Award, List, DollarSign } from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    Cell, PieChart as RechartsPieChart, Pie, Legend
} from 'recharts';

const COLORS = ['#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/90 border border-gray-800 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                <p className="text-gray-300 mb-3 font-medium border-b border-gray-800 pb-2">{label}</p>
                {payload.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></div>
                        <p className="text-sm font-medium text-gray-200">
                            {p.name}: <span className="font-bold ml-1">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p.value)}</span>
                        </p>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/90 border border-gray-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                <p className="text-white font-medium mb-1">{payload[0].name}</p>
                <p className="text-sm font-bold" style={{ color: payload[0].payload.fill }}>
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

const StatisticsContent = () => {
    const router = useRouter();
    const { transactions, fetchTransactions, loading: transLoading } = useTransactionStore();
    const { categories, loadCategories, loading: catLoading } = useCategoryStore();

    const [filter, setFilter] = useState("monthly");

    useEffect(() => {
        fetchTransactions();
        loadCategories();
    }, [fetchTransactions, loadCategories]);

    const stats = useMemo(() => {
        const now = new Date();
        const filtered = transactions.filter(t => {
            if (filter === 'monthly') {
                const d = new Date(t.date);
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }
            if (filter === 'yearly') {
                return new Date(t.date).getFullYear() === now.getFullYear();
            }
            return true;
        });

        const prevFiltered = transactions.filter(t => {
            if (filter === 'monthly') {
                const d = new Date(t.date);
                return d.getMonth() === (now.getMonth() === 0 ? 11 : now.getMonth() - 1) && 
                       d.getFullYear() === (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
            }
            if (filter === 'yearly') {
                return new Date(t.date).getFullYear() === now.getFullYear() - 1;
            }
            return false;
        });

        let totalIncome = 0;
        let totalExpense = 0;
        const categoryMap = {};
        
        const chartMap = {};

        filtered.forEach(t => {
            const amount = Number(t.amount);
            const d = new Date(t.date);
            let timeKey = '';

            if (filter === 'monthly') {
                timeKey = d.getDate().toString();
            } else if (filter === 'yearly') {
                timeKey = d.toLocaleString('default', { month: 'short' });
            } else {
                timeKey = d.getFullYear().toString();
            }

            if (!chartMap[timeKey]) {
                chartMap[timeKey] = { name: timeKey, Income: 0, Expense: 0 };
            }

            if (t.type === 'income') {
                totalIncome += amount;
                chartMap[timeKey].Income += amount;
            } else {
                totalExpense += amount;
                chartMap[timeKey].Expense += amount;
                
                const catName = t.category?.name || 'Uncategorized';
                if (!categoryMap[catName]) {
                    categoryMap[catName] = { name: catName, value: 0 };
                }
                categoryMap[catName].value += amount;
            }
        });

        let finalChartData = [];
        if (filter === 'monthly') {
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const key = i.toString();
                finalChartData.push(chartMap[key] || { name: key, Income: 0, Expense: 0 });
            }
        } else if (filter === 'yearly') {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            months.forEach(m => {
                finalChartData.push(chartMap[m] || { name: m, Income: 0, Expense: 0 });
            });
        } else {
            finalChartData = Object.values(chartMap).sort((a, b) => Number(a.name) - Number(b.name));
        }

        const categoryStats = Object.values(categoryMap)
            .sort((a, b) => b.value - a.value);

        const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;
        
        let prevIncome = 0;
        let prevExpense = 0;
        prevFiltered.forEach(t => {
            const amount = Number(t.amount);
            if (t.type === 'income') prevIncome += amount;
            else prevExpense += amount;
        });

        const prevIncomeDiff = prevIncome ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0;
        const prevExpenseDiff = prevExpense ? ((totalExpense - prevExpense) / prevExpense) * 100 : 0;

        const top10Expenses = filtered.filter(t => t.type === 'expense').sort((a,b) => Number(b.amount) - Number(a.amount)).slice(0, 10);
        const largestExpense = top10Expenses[0] || null;

        return { 
            totalIncome, 
            totalExpense, 
            savingsRate, 
            categoryStats, 
            chartData: finalChartData,
            transactionCount: filtered.length,
            prevIncomeDiff,
            prevExpenseDiff,
            largestExpense,
            top10Expenses
        };
    }, [transactions, filter]);

    const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

    const renderTrend = (diff, invertColors = false) => {
        if (filter === 'lifetime' || !diff) return null;
        const isPositive = diff > 0;
        const colorClass = (isPositive !== invertColors) ? "text-green-400" : "text-red-400";
        const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
        return (
            <div className={`flex items-center text-xs font-semibold mt-2 ${colorClass}`}>
                <Icon size={14} className="mr-1" />
                <span>{Math.abs(diff).toFixed(1)}% vs last {filter.replace('ly', '')}</span>
            </div>
        );
    };

    if (transLoading || catLoading) {
        return <div className="min-h-screen bg-black flex justify-center items-center"><Loader className="animate-spin text-purple-500 w-10 h-10" /></div>;
    }

    return (
        <div id="statsContainer" className="min-h-screen bg-black p-4 sm:p-8 relative overflow-hidden font-sans">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto pb-24">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <button id="BackBtn" onClick={() => router.back()} className="flex items-center gap-2 mb-4 text-gray-400 hover:text-white transition-colors text-sm font-medium">
                            <ArrowLeft size={16} /> Dashboard
                        </button>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            Analytics
                        </h1>
                    </div>
                    
                    <div className="flex bg-gray-900/80 p-1.5 rounded-2xl border border-gray-800 backdrop-blur-md">
                        {['monthly', 'yearly', 'lifetime'].map(f => (
                            <button 
                                id={`FilterBtn-${f}`} 
                                key={f} 
                                onClick={() => setFilter(f)} 
                                className={`px-6 py-2.5 rounded-xl capitalize text-sm font-semibold transition-all duration-300 ${filter === f ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div id="statsIncomeCard" className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6 rounded-3xl relative overflow-hidden group hover:border-green-500/50 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="text-gray-400 font-medium">Total Income</span>
                            <div className="p-2 bg-green-500/20 rounded-xl"><TrendingUp size={20} className="text-green-400" /></div>
                        </div>
                        <p className="text-3xl font-bold text-white relative z-10">{formatCurrency(stats.totalIncome)}</p>
                        <div className="relative z-10">{renderTrend(stats.prevIncomeDiff)}</div>
                    </div>
                    
                    <div id="statsExpenseCard" className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6 rounded-3xl relative overflow-hidden group hover:border-red-500/50 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="text-gray-400 font-medium">Total Expense</span>
                            <div className="p-2 bg-red-500/20 rounded-xl"><TrendingUp size={20} className="text-red-400 rotate-180" /></div>
                        </div>
                        <p className="text-3xl font-bold text-white relative z-10">{formatCurrency(stats.totalExpense)}</p>
                        <div className="relative z-10">{renderTrend(stats.prevExpenseDiff, true)}</div>
                    </div>
                    
                    <div id="statsSavingsCard" className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6 rounded-3xl relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="text-gray-400 font-medium">Net Balance</span>
                            <div className="p-2 bg-blue-500/20 rounded-xl"><Wallet size={20} className="text-blue-400" /></div>
                        </div>
                        <p className={`text-3xl font-bold relative z-10 ${stats.totalIncome - stats.totalExpense >= 0 ? 'text-white' : 'text-red-400'}`}>
                            {formatCurrency(stats.totalIncome - stats.totalExpense)}
                        </p>
                        <div className="relative z-10">
                            {filter !== 'lifetime' && (
                                <p className="text-xs text-gray-500 mt-2 font-medium">For the selected period</p>
                            )}
                        </div>
                    </div>
                    
                    <div id="statsSavingsRateCard" className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6 rounded-3xl relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="text-gray-400 font-medium">Savings Rate</span>
                            <div className="p-2 bg-amber-500/20 rounded-xl"><Target size={20} className="text-amber-400" /></div>
                        </div>
                        <div className="flex items-end gap-3 relative z-10">
                            <p className="text-3xl font-bold text-white">{stats.savingsRate}%</p>
                        </div>
                        <div className="w-full bg-gray-800/50 h-1.5 rounded-full mt-4 relative z-10">
                            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]" style={{ width: `${stats.savingsRate}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    <div className="lg:col-span-2 bg-gray-900/30 border border-gray-800/60 rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl">
                        <h2 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
                            <Activity className="text-purple-400" size={20} />
                            Cashflow Overview
                        </h2>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} tickMargin={12} fontSize={12} />
                                    <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value >= 1000 ? (value/1000)+'k' : value}`} fontSize={12} />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="top" height={36} iconType="circle" />
                                    <Area type="monotone" dataKey="Income" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                    <Area type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-gray-900/30 border border-gray-800/60 rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl flex flex-col">
                        <h2 className="text-white text-xl font-bold mb-2 flex items-center gap-2">
                            <PieChart className="text-pink-400" size={20} />
                            Expenses by Category
                        </h2>
                        {stats.categoryStats.length > 0 ? (
                            <>
                                <div className="h-[220px] w-full flex-shrink-0 mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie
                                                data={stats.categoryStats}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {stats.categoryStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip content={<CustomPieTooltip />} />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                    {stats.categoryStats.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm group">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                                <span className="text-gray-300 group-hover:text-white transition-colors">{c.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-400 text-xs">{((c.value / stats.totalExpense) * 100).toFixed(1)}%</span>
                                                <span className="text-white font-medium">{formatCurrency(c.value)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                                <PieChart size={48} className="mb-4 opacity-20" />
                                <p>No expense data</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 sm:p-8 flex items-center gap-6 group hover:border-gray-700 transition-colors">
                        <div className="p-4 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500/20 transition-colors">
                            <Award className="text-purple-400 w-10 h-10" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Largest Expense</p>
                            {stats.largestExpense ? (
                                <>
                                    <p className="text-white font-bold text-2xl">{formatCurrency(stats.largestExpense.amount)}</p>
                                    <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-gray-800 rounded text-xs">{stats.largestExpense.category?.name || 'Uncategorized'}</span>
                                        <span>• {new Date(stats.largestExpense.date).toLocaleDateString()}</span>
                                    </p>
                                </>
                            ) : (
                                <p className="text-gray-500">No expenses recorded</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 sm:p-8 flex items-center gap-6 group hover:border-gray-700 transition-colors">
                        <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors">
                            <CalendarDays className="text-blue-400 w-10 h-10" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Total Transactions</p>
                            <p className="text-white font-bold text-3xl">{stats.transactionCount}</p>
                            <p className="text-gray-500 text-sm mt-1">Processed in this period</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                    <div className="bg-gray-900/30 border border-gray-800/60 rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl flex flex-col">
                        <h2 className="text-white text-xl font-bold mb-2 flex items-center gap-2">
                            <List className="text-pink-400" size={20} />
                            Top 10 Expensive Transactions
                        </h2>
                        {stats.top10Expenses && stats.top10Expenses.length > 0 ? (
                            <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar max-h-[300px]">
                                {stats.top10Expenses.map((txn, i) => (
                                    <div key={txn._id || i} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl hover:bg-gray-800 transition-colors border border-gray-800/50 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400 font-bold text-xs">{i + 1}</div>
                                            <div>
                                                <p className="text-gray-200 font-medium group-hover:text-white transition-colors">{txn.note || (txn.category?.name || 'Uncategorized')}</p>
                                                <p className="text-xs text-gray-500">{new Date(txn.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="text-white font-bold">{formatCurrency(txn.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-10">
                                <List size={48} className="mb-4 opacity-20" />
                                <p>No expenses found</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-gray-900/30 border border-gray-800/60 rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl flex flex-col">
                        <h2 className="text-white text-xl font-bold mb-2 flex items-center gap-2">
                            <PieChart className="text-blue-400" size={20} />
                            Income vs Expense Ratio
                        </h2>
                        {stats.totalIncome > 0 || stats.totalExpense > 0 ? (
                            <>
                                <div className="h-[220px] w-full flex-shrink-0 mt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Income', value: stats.totalIncome, fill: '#22c55e' },
                                                    { name: 'Expense', value: stats.totalExpense, fill: '#ef4444' }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                <Cell key="cell-income" fill="#22c55e" />
                                                <Cell key="cell-expense" fill="#ef4444" />
                                            </Pie>
                                            <RechartsTooltip content={<CustomPieTooltip />} />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-6 flex justify-center gap-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-xs">Income</span>
                                            <span className="text-white font-bold">{((stats.totalIncome / (stats.totalIncome + stats.totalExpense)) * 100 || 0).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-xs">Expense</span>
                                            <span className="text-white font-bold">{((stats.totalExpense / (stats.totalIncome + stats.totalExpense)) * 100 || 0).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-10">
                                <PieChart size={48} className="mb-4 opacity-20" />
                                <p>No data recorded</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(31, 41, 55, 0.5);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(75, 85, 99, 0.8);
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};

export default function StatisticsPage() {
    return <ProtectedRoute><StatisticsContent /></ProtectedRoute>;
}
