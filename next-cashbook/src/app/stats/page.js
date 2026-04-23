'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    Cell, PieChart as RechartsPieChart, Pie, Legend, BarChart, Bar, ResponsiveContainer as RC,
    ComposedChart, Line
} from 'recharts';
import { 
    ArrowLeft, TrendingUp, Target, PieChart, Loader, Activity, CalendarDays, Wallet, 
    ArrowUpRight, ArrowDownRight, Award, List, DollarSign, BarChart3, 
    Calendar, Zap, Clock, Info, ChevronRight, ChevronDown, CheckCircle2, AlertCircle, TrendingDown
} from "lucide-react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import ProtectedRoute from "@/components/ProtectedRoute";

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
        const data = payload[0].payload;
        return (
            <div className="bg-black/90 border border-gray-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                <p className="text-white font-medium mb-1 font-sans">{data.name}</p>
                <p className="text-sm font-bold font-mono" style={{ color: payload[0].color || payload[0].payload.fill || '#fff' }}>
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
        const currentMonthIndex = now.getMonth();
        const currentYear = now.getFullYear();
        const monthsRemaining = 12 - currentMonthIndex;

        const filtered = transactions.filter(t => {
            if (filter === 'monthly') {
                const d = new Date(t.date);
                return d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear;
            }
            if (filter === 'yearly') {
                return new Date(t.date).getFullYear() === currentYear;
            }
            return true;
        });

        const prevFiltered = transactions.filter(t => {
            if (filter === 'monthly') {
                const d = new Date(t.date);
                return d.getMonth() === (currentMonthIndex === 0 ? 11 : currentMonthIndex - 1) && 
                       d.getFullYear() === (currentMonthIndex === 0 ? currentYear - 1 : currentYear);
            }
            if (filter === 'yearly') {
                return new Date(t.date).getFullYear() === currentYear - 1;
            }
            return false;
        });

        let totalIncome = 0;
        let totalExpense = 0;
        let totalInvestment = 0;
        const categoryMap = {};
        const chartMap = {};
        const weekdayMap = { 'Sun': 0, 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0 };
        const monthMap = {}; // For multi-month comparison

        // Process all transactions for month-wise comparison (all time or current year)
        transactions.forEach(t => {
            const amount = Number(t.amount);
            const d = new Date(t.date);
            const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const mName = d.toLocaleString('default', { month: 'short', year: '2-digit' });

            if (!monthMap[mKey]) {
                monthMap[mKey] = { key: mKey, name: mName, Income: 0, Expense: 0, Savings: 0, count: 0 };
            }

            if (t.type === 'income') {
                monthMap[mKey].Income += amount;
            } else if (t.type === 'expense' || t.type === 'investment') {
                monthMap[mKey].Expense += amount;
            }
            monthMap[mKey].Savings = monthMap[mKey].Income - monthMap[mKey].Expense;
            monthMap[mKey].count += 1;
        });

        // Process active filter transactions
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
                chartMap[timeKey] = { name: timeKey, Income: 0, Expense: 0, Investment: 0 };
            }

            if (t.type === 'income') {
                totalIncome += amount;
                chartMap[timeKey].Income += amount;
            } else if (t.type === 'expense') {
                totalExpense += amount;
                chartMap[timeKey].Expense += amount;
                
                const dayName = d.toLocaleString('default', { weekday: 'short' });
                weekdayMap[dayName] = (weekdayMap[dayName] || 0) + amount;

                const catName = t.category?.name || 'Uncategorized';
                if (!categoryMap[catName]) {
                    categoryMap[catName] = { 
                        name: catName, 
                        value: 0, 
                        budget: Number(t.category?.budget) || 0,
                        yearlyBudget: Number(t.category?.yearlyBudget) || 0,
                        yearSpentTillLastMonth: 0,
                        yearSpentIncludingCurrent: 0
                    };
                }
                categoryMap[catName].value += amount;
            } else if (t.type === 'investment') {
                totalInvestment += amount;
                chartMap[timeKey].Investment += amount;

                const catName = t.category?.name || 'Uncategorized';
                if (!categoryMap[catName]) {
                    categoryMap[catName] = { 
                        name: catName, 
                        value: 0, 
                        budget: 0,
                        yearlyBudget: Number(t.category?.yearlyBudget) || 0,
                        yearSpentTillLastMonth: 0,
                        yearSpentIncludingCurrent: 0
                    };
                }
                categoryMap[catName].value += amount;
            }
        });

        // Calculate yearly spent for categories with yearly budgets
        transactions.forEach(t => {
            if (t.type === 'expense' || t.type === 'investment') {
                const d = new Date(t.date);
                if (d.getFullYear() === currentYear) {
                    const catName = t.category?.name || 'Uncategorized';
                    if (categoryMap[catName]) {
                        categoryMap[catName].yearSpentIncludingCurrent += Number(t.amount);
                        if (d.getMonth() < currentMonthIndex) {
                            categoryMap[catName].yearSpentTillLastMonth += Number(t.amount);
                        }
                    }
                }
            }
        });



        const categoryStats = Object.values(categoryMap).map(cat => {
            let suggestedMonthly = cat.budget;
            let budgetType = 'monthly';
            let remainingYearly = 0;

            if (cat.yearlyBudget > 0) {
                remainingYearly = Math.max(0, cat.yearlyBudget - cat.yearSpentIncludingCurrent);
                suggestedMonthly = Math.max(0, (cat.yearlyBudget - cat.yearSpentTillLastMonth) / monthsRemaining);
                budgetType = 'yearly-dynamic';
            }

            return {
                ...cat,
                suggestedMonthly,
                budgetType,
                remainingYearly,
                monthsRemaining
            };
        }).sort((a, b) => b.value - a.value);

        const monthWiseComparison = Object.values(monthMap)
            .sort((a, b) => a.key.localeCompare(b.key))
            .slice(-12); // Last 12 months

        let finalChartData = [];
        if (filter === 'monthly') {
            const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
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

        // Calculate totals for previous period
        let prevIncome = 0;
        let prevExpense = 0;
        let prevInvestment = 0;
        prevFiltered.forEach(t => {
            if (t.type === 'income') prevIncome += Number(t.amount);
            else if (t.type === 'expense') prevExpense += Number(t.amount);
            else if (t.type === 'investment') prevInvestment += Number(t.amount);
        });

        const prevIncomeDiff = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0;
        const prevExpenseDiff = prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense) * 100 : 0;
        const prevInvestmentDiff = prevInvestment > 0 ? ((totalInvestment - prevInvestment) / prevInvestment) * 100 : 0;
        const netSavings = totalIncome - totalExpense;
        const cashFlow = totalIncome - totalExpense - totalInvestment;
        const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

        const weekdayStats = Object.keys(weekdayMap).map(name => ({ name, value: weekdayMap[name] }));
        const topSpendingDay = Object.keys(weekdayMap).reduce((a, b) => weekdayMap[a] > weekdayMap[b] ? a : b, 'Mon');

        const expenseTransactions = filtered.filter(t => t.type === 'expense').sort((a, b) => Number(b.amount) - Number(a.amount));
        const largestExpense = expenseTransactions[0] || null;
        const top10Expenses = expenseTransactions.slice(0, 10);

        // Smart Insights
        const insights = [];
        if (savingsRate > 20) insights.push({ text: "Great job! Your savings rate is above 20%.", type: 'success' });
        else if (savingsRate < 0) insights.push({ text: "You're spending more than you earn this month.", type: 'warning' });
        else insights.push({ text: "Try to increase your savings to at least 20% of your income.", type: 'info' });

        if (totalExpense > prevExpense && prevExpense > 0) insights.push({ text: `Your spending increased by ${Math.abs(prevExpenseDiff).toFixed(1)}% vs last period.`, type: 'warning' });
        if (totalIncome > totalExpense) insights.push({ text: "You have a positive cashflow. Consider investing.", type: 'success' });

        return {
            totalIncome,
            totalExpense,
            totalInvestment,
            netSavings,
            cashFlow,
            savingsRate,
            categoryStats,
            chartData: finalChartData,
            monthWiseComparison,
            weekdayStats,
            topSpendingDay,
            transactionCount: filtered.length,
            prevIncomeDiff,
            prevExpenseDiff,
            prevInvestmentDiff,
            largestExpense,
            top10Expenses,
            insights
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
                    
                    <div className="flex bg-gray-900/80 p-1.5 rounded-2xl border border-gray-800 backdrop-blur-md overflow-x-auto no-scrollbar">
                        {['monthly', 'yearly', 'lifetime', 'comparison'].map(f => (
                            <button 
                                id={`FilterBtn-${f}`} 
                                key={f} 
                                onClick={() => setFilter(f)} 
                                className={`px-4 sm:px-6 py-2.5 rounded-xl capitalize text-sm font-semibold transition-all duration-300 whitespace-nowrap ${filter === f ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Smart Insights Panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {stats.insights.map((insight, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl border flex items-start gap-3 backdrop-blur-md transition-all hover:scale-[1.02] ${
                            insight.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                            insight.type === 'warning' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                            'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }`}>
                            <div className="mt-0.5">
                                {insight.type === 'success' ? <CheckCircle2 size={18} /> : 
                                 insight.type === 'warning' ? <TrendingDown size={18} /> : 
                                 <Info size={18} />}
                            </div>
                            <p className="text-sm font-medium leading-tight">{insight.text}</p>
                        </div>
                    ))}
                </div>

                {filter === 'comparison' ? (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Month-over-Month Comparison Chart */}
                        <div className="bg-gray-900/30 border border-gray-800/60 rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl">
                            <h2 className="text-white text-xl font-bold mb-6 flex items-center gap-2">
                                <BarChart3 className="text-purple-400" size={20} />
                                Multi-Month Growth (Income vs Expense)
                            </h2>
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.monthWiseComparison} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                        <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                                        <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={30} />
                                        <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Detailed Table & Weekday Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Monthly Summary Table */}
                            <div className="bg-gray-900/30 border border-gray-800/60 rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl">
                                <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
                                    <List className="text-blue-400" size={18} />
                                    Historical Performance
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-4 text-gray-500 text-xs font-bold uppercase tracking-wider pb-2 border-b border-gray-800">
                                        <span>Month</span>
                                        <span className="text-right">Income</span>
                                        <span className="text-right">Expense</span>
                                        <span className="text-right">Net</span>
                                    </div>
                                    {[...stats.monthWiseComparison].reverse().map((m, i) => (
                                        <div key={i} className="grid grid-cols-4 items-center py-3 border-b border-gray-800/50 hover:bg-white/5 px-2 rounded-lg transition-colors">
                                            <span className="text-gray-300 font-medium text-sm">{m.name}</span>
                                            <span className="text-green-400 text-sm text-right font-mono">{formatCurrency(m.Income)}</span>
                                            <span className="text-red-400 text-sm text-right font-mono">{formatCurrency(m.Expense)}</span>
                                            <span className={`text-sm text-right font-bold ${m.Savings >= 0 ? 'text-blue-400' : 'text-amber-500'}`}>{formatCurrency(m.Savings)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Weekday Spending Habits */}
                            <div className="bg-gray-900/30 border border-gray-800/60 rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl">
                                <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
                                    <Calendar className="text-pink-400" size={18} />
                                    Spending by Weekday
                                </h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.weekdayStats} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" stroke="#9ca3af" axisLine={false} tickLine={false} />
                                            <RechartsTooltip cursor={{fill: 'transparent'}} content={<CustomPieTooltip />} />
                                            <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 p-4 bg-pink-500/10 rounded-2xl border border-pink-500/20 text-pink-400 text-sm italic">
                                    Note: You tend to spend most on <strong>{stats.topSpendingDay}s</strong>. Plan your shopping accordingly!
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-10 animate-in fade-in duration-500">
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
                            <span className="text-gray-400 font-medium">Expenses</span>
                            <div className="p-2 bg-red-500/20 rounded-xl"><ArrowUpRight size={20} className="text-red-400" /></div>
                        </div>
                        <p id="totalExpense" className="text-3xl font-bold text-white relative z-10">{formatCurrency(stats.totalExpense)}</p>
                        <div className="relative z-10">{renderTrend(stats.prevExpenseDiff, true)}</div>
                    </div>

                    <div id="statsInvestmentCard" className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6 rounded-3xl relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="text-gray-400 font-medium">Investments</span>
                            <div className="p-2 bg-blue-500/20 rounded-xl"><TrendingUp size={20} className="text-blue-400" /></div>
                        </div>
                        <p id="totalInvestment" className="text-3xl font-bold text-white relative z-10">{formatCurrency(stats.totalInvestment)}</p>
                        <div className="relative z-10">{renderTrend(stats.prevInvestmentDiff)}</div>
                    </div>
                    
                    <div id="statsSavingsCard" className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6 rounded-3xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="text-gray-400 font-medium">Net Savings</span>
                            <div className="p-2 bg-emerald-500/20 rounded-xl"><Award size={20} className="text-emerald-400" /></div>
                        </div>
                        <p id="netSavings" className={`text-3xl font-bold relative z-10 ${stats.netSavings >= 0 ? 'text-white' : 'text-red-400'}`}>
                            {formatCurrency(stats.netSavings)}
                        </p>
                        <div className="relative z-10">
                            <p className="text-xs text-emerald-500/60 mt-2 font-medium tracking-wide uppercase text-[10px]">Wealth Increase (Inc - Exp)</p>
                        </div>
                    </div>

                    <div id="statsCashFlowCard" className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6 rounded-3xl relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="text-gray-400 font-medium">Cash Flow</span>
                            <div className="p-2 bg-amber-500/20 rounded-xl"><Wallet size={20} className="text-amber-400" /></div>
                        </div>
                        <p id="cashFlow" className={`text-3xl font-bold relative z-10 ${stats.cashFlow >= 0 ? 'text-white' : 'text-amber-400'}`}>
                            {formatCurrency(stats.cashFlow)}
                        </p>
                        <div className="relative z-10">
                            <p className="text-xs text-amber-500/60 mt-2 font-medium tracking-wide uppercase text-[10px]">Liquid Balance (Inc - Exp - Inv)</p>
                        </div>
                    </div>
                    
                    <div id="statsSavingsRateCard" className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6 rounded-3xl relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <span className="text-gray-400 font-medium">Savings Rate</span>
                            <div className="p-2 bg-purple-500/20 rounded-xl"><Target size={20} className="text-purple-400" /></div>
                        </div>
                        <div className="flex items-end gap-3 relative z-10">
                            <p className="text-3xl font-bold text-white">{stats.savingsRate}%</p>
                        </div>
                        <div className="w-full bg-gray-800/50 h-1.5 rounded-full mt-4 relative z-10">
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-full rounded-full shadow-[0_0_10px_rgba(147,51,234,0.5)]" style={{ width: `${stats.savingsRate}%` }}></div>
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
                                        <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} tickMargin={12} fontSize={12} />
                                    <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value >= 1000 ? (value/1000)+'k' : value}`} fontSize={12} />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="top" height={36} iconType="circle" />
                                    <Area type="monotone" dataKey="Income" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                    <Area type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                                    <Area type="monotone" dataKey="Investment" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorInvestment)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Yearly Budget Dynamic Tracking Section */}
                    <div className="bg-gray-900/30 border border-gray-800/60 rounded-[2rem] p-6 sm:p-8 backdrop-blur-xl mb-10">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-white text-xl font-bold flex items-center gap-2">
                                    <Clock className="text-amber-400" size={20} />
                                    Dynamic Yearly Budgets
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">Monthly targets adjusted based on remaining annual budget</p>
                            </div>
                            <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-xs font-bold uppercase tracking-widest">
                                {new Date().toLocaleString('default', { month: 'long' })} Target
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {stats.categoryStats.filter(c => c.yearlyBudget > 0).map((cat, i) => {
                                const monthsRemaining = cat.monthsRemaining;
                                const monthlyTarget = cat.suggestedMonthly;
                                const spentThisMonth = cat.value;
                                const progress = monthlyTarget > 0 ? (spentThisMonth / monthlyTarget) * 100 : 0;
                                const overspent = spentThisMonth > monthlyTarget;

                                return (
                                    <div key={i} className="bg-black/40 border border-gray-800 rounded-2xl p-6 transition-all hover:bg-black/60 group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-white font-bold text-lg group-hover:text-amber-400 transition-colors">{cat.name}</h3>
                                                <p className="text-gray-500 text-xs mt-1">Yearly: {formatCurrency(cat.yearlyBudget)}</p>
                                            </div>
                                            <div className={`text-right ${overspent ? 'text-red-400' : 'text-green-400'}`}>
                                                <p className="text-lg font-black">{Math.round(progress)}%</p>
                                                <p className="text-[10px] uppercase font-bold tracking-tighter">used this month</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={`absolute h-full transition-all duration-1000 ${overspent ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]'}`}
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                ></div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div>
                                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Suggested Monthly</p>
                                                    <p className="text-white font-bold">{formatCurrency(monthlyTarget)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Remaining Yearly</p>
                                                    <p className="text-white font-bold">{formatCurrency(cat.remainingYearly)}</p>
                                                </div>
                                            </div>

                                            {overspent && (
                                                <div className="flex items-center gap-2 text-red-400/80 text-[10px] font-bold uppercase bg-red-500/10 p-2 rounded-lg border border-red-500/10">
                                                    <AlertCircle size={12} />
                                                    Target exceeded by {formatCurrency(spentThisMonth - monthlyTarget)}
                                                </div>
                                            )}
                                            {!overspent && progress > 80 && (
                                                <div className="flex items-center gap-2 text-amber-400/80 text-[10px] font-bold uppercase bg-amber-500/10 p-2 rounded-lg border border-amber-500/10">
                                                    <AlertCircle size={12} />
                                                    Approaching monthly target
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {stats.categoryStats.filter(c => c.yearlyBudget > 0).length === 0 && (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-3xl">
                                    <Clock size={48} className="mb-4 opacity-10" />
                                    <p className="font-medium">No yearly budgets setup yet</p>
                                    <button 
                                        onClick={() => router.push('/categories')}
                                        className="mt-4 text-amber-500 hover:text-amber-400 text-sm font-bold flex items-center gap-1"
                                    >
                                        Setup in Categories <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                                        <span className={`font-bold ${txn.type === 'investment' ? 'text-blue-400' : 'text-white'}`}>{formatCurrency(txn.amount)}</span>
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
                                                    { name: 'Expense', value: stats.totalExpense, fill: '#ef4444' },
                                                    { name: 'Investment', value: stats.totalInvestment, fill: '#3b82f6' }
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
                                                <Cell key="cell-investment" fill="#3b82f6" />
                                            </Pie>
                                            <RechartsTooltip content={<CustomPieTooltip />} />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-6 grid grid-cols-3 gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-[10px] uppercase font-bold">Income</span>
                                            <span className="text-white text-xs font-bold">{((stats.totalIncome / (stats.totalIncome + stats.totalExpense + stats.totalInvestment)) * 100 || 0).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-[10px] uppercase font-bold">Expense</span>
                                            <span className="text-white text-xs font-bold">{((stats.totalExpense / (stats.totalIncome + stats.totalExpense + stats.totalInvestment)) * 100 || 0).toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-[10px] uppercase font-bold">Investment</span>
                                            <span className="text-white text-xs font-bold">{((stats.totalInvestment / (stats.totalIncome + stats.totalExpense + stats.totalInvestment)) * 100 || 0).toFixed(1)}%</span>
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
            )}
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
