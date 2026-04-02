'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, CheckCircle2, TrendingUp, Calendar as CalendarIcon, Trophy, Zap, ChevronLeft, ChevronRight, Grid as GridIcon, List as ListIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

const HabitTracker = () => {
    const [habits, setHabits] = useState([]);
    const [newHabitName, setNewHabitName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'monthly'
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Load habits from localStorage
    useEffect(() => {
        const savedHabits = localStorage.getItem('cashbook-habits');
        if (savedHabits) {
            setHabits(JSON.parse(savedHabits));
        } else {
            const defaultHabits = [
                { id: 1, name: 'Read for 30 mins', completedDays: [], color: 'emerald', createdAt: new Date().toISOString() },
                { id: 2, name: 'Workout', completedDays: [], color: 'blue', createdAt: new Date().toISOString() },
                { id: 3, name: 'Meditate', completedDays: [], color: 'purple', createdAt: new Date().toISOString() }
            ];
            setHabits(defaultHabits);
            localStorage.setItem('cashbook-habits', JSON.stringify(defaultHabits));
        }
    }, []);

    // Save habits
    useEffect(() => {
        if (habits.length > 0) {
            localStorage.setItem('cashbook-habits', JSON.stringify(habits));
        }
    }, [habits]);

    const today = useMemo(() => new Date().toISOString().split('T')[0], []);

    // FIXED: Properly calculate days of current week without mutation
    const daysOfWeek = useMemo(() => {
        const now = new Date();
        const currentDay = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - currentDay); // Sunday as start
        
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push({
                date: day.toISOString().split('T')[0],
                label: day.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNum: day.getDate()
            });
        }
        return days;
    }, []);

    const calendarData = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const calendarGrid = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarGrid.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            calendarGrid.push({
                date: date.toISOString().split('T')[0],
                dayNum: i
            });
        }
        return calendarGrid;
    }, [currentMonth]);

    const toggleHabit = (habitId, date) => {
        setHabits(prevHabits => {
            return prevHabits.map(habit => {
                if (habit.id === habitId) {
                    const completedDays = [...habit.completedDays];
                    if (completedDays.includes(date)) {
                        return { ...habit, completedDays: completedDays.filter(d => d !== date) };
                    } else {
                        return { ...habit, completedDays: [...completedDays, date] };
                    }
                }
                return habit;
            });
        });
    };

    const addHabit = (e) => {
        e.preventDefault();
        if (!newHabitName.trim()) return;

        const colors = ['emerald', 'blue', 'purple', 'rose', 'amber', 'cyan'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newHabit = {
            id: Date.now(),
            name: newHabitName,
            completedDays: [],
            color: randomColor,
            createdAt: new Date().toISOString()
        };

        setHabits([...habits, newHabit]);
        setNewHabitName('');
        setIsAdding(false);
        toast.success('New habit added!');
    };

    const deleteHabit = (id) => {
        setHabits(habits.filter(h => h.id !== id));
        toast.error('Habit removed');
    };

    const calculateStreak = (completedDays) => {
        if (!completedDays.length) return 0;
        let streak = 0;
        let checkDate = new Date();
        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (completedDays.includes(dateStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                if (dateStr === today) {
                    checkDate.setDate(checkDate.getDate() - 1);
                    continue; 
                }
                break;
            }
        }
        return streak;
    };

    const getProgressColor = (color) => {
        const colors = {
            emerald: 'bg-emerald-500',
            blue: 'bg-blue-500',
            purple: 'bg-purple-500',
            rose: 'bg-rose-500',
            amber: 'bg-amber-500',
            cyan: 'bg-cyan-500'
        };
        return colors[color] || 'bg-blue-500';
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 sm:p-10 font-sans">
            <div className="max-w-6xl mx-auto space-y-10">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-white via-blue-200 to-gray-500 bg-clip-text text-transparent">
                            Habit Tracker
                        </h1>
                        <p className="text-gray-400 mt-2 text-lg">Master your routines, master your life.</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex bg-gray-900/60 p-1 rounded-2xl border border-gray-800">
                            <button 
                                onClick={() => setViewMode('weekly')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${viewMode === 'weekly' ? 'bg-gray-800 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <ListIcon size={18} />
                                <span className="text-sm font-bold">Weekly</span>
                            </button>
                            <button 
                                onClick={() => setViewMode('monthly')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${viewMode === 'monthly' ? 'bg-gray-800 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <GridIcon size={18} />
                                <span className="text-sm font-bold">Monthly</span>
                            </button>
                        </div>
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                        >
                            <Plus size={20} />
                            Add
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                {viewMode === 'weekly' ? (
                    <div className="grid gap-6">
                        <div className="flex items-center gap-3 mb-2">
                            <CalendarIcon className="text-blue-400" size={20} />
                            <h2 className="text-xl font-bold text-gray-300">This Week</h2>
                        </div>
                        {habits.map(habit => (
                            <div key={habit.id} className="bg-gray-900/30 border border-gray-800/50 rounded-3xl p-6 backdrop-blur-sm group hover:bg-gray-900/50 transition-all">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex items-center justify-between lg:w-1/3">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-12 rounded-full ${getProgressColor(habit.color)}`}></div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-100">{habit.name}</h3>
                                                <div className="flex items-center gap-1 text-amber-400 text-sm font-medium mt-1">
                                                    <Zap size={14} fill="currentColor" />
                                                    <span>{calculateStreak(habit.completedDays)} day streak</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => deleteHabit(habit.id)}
                                            className="p-2 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl lg:w-2/3">
                                        {daysOfWeek.map((day, idx) => {
                                            const isToday = day.date === today;
                                            const isCompleted = habit.completedDays.includes(day.date);
                                            return (
                                                <div 
                                                    key={idx} 
                                                    className="flex flex-col items-center gap-3 cursor-pointer group/day"
                                                    onClick={() => toggleHabit(habit.id, day.date)}
                                                >
                                                    <span className={`text-xs font-bold uppercase tracking-tighter ${isToday ? 'text-blue-400' : 'text-gray-500'}`}>
                                                        {day.label}
                                                    </span>
                                                    <div className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${isCompleted ? getProgressColor(habit.color) + ' shadow-lg scale-110 border-transparent' : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'}`}>
                                                        {isCompleted ? <CheckCircle2 size={24} className="text-white" /> : <span className="text-sm font-bold text-gray-500">{day.dayNum}</span>}
                                                        {isToday && !isCompleted && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse border-2 border-[#050505]"></div>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Month Selector */}
                        <div className="flex items-center justify-center gap-8 bg-gray-900/20 border border-gray-800 p-4 rounded-3xl">
                            <button 
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-2xl transition-all"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <h2 className="text-2xl font-bold min-w-[200px] text-center">
                                {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                            <button 
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-2xl transition-all"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* Habits Calendar List */}
                        <div className="grid gap-10">
                            {habits.map(habit => (
                                <div key={habit.id} className="bg-gray-900/20 border border-gray-800/40 rounded-[2.5rem] p-8 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-4 h-4 rounded-full ${getProgressColor(habit.color)} shadow-[0_0_10px_currentColor]`}></div>
                                            <h3 className="text-2xl font-bold text-gray-100">{habit.name}</h3>
                                        </div>
                                        <div className="px-5 py-2 bg-gray-800/50 rounded-2xl text-amber-400 font-bold flex items-center gap-2 border border-gray-700/50">
                                            <Zap size={18} fill="currentColor" />
                                            {calculateStreak(habit.completedDays)} Day Streak
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-7 gap-3 sm:gap-4">
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                            <div key={d} className="text-center text-xs font-bold text-gray-600 uppercase tracking-widest pb-2">
                                                {d}
                                            </div>
                                        ))}
                                        {calendarData.map((day, idx) => {
                                            if (!day) return <div key={`empty-${idx}`} className="aspect-square opacity-0"></div>;
                                            const isToday = day.date === today;
                                            const isCompleted = habit.completedDays.includes(day.date);
                                            return (
                                                <div 
                                                    key={day.date}
                                                    onClick={() => toggleHabit(habit.id, day.date)}
                                                    className={`
                                                        relative aspect-square flex items-center justify-center rounded-2xl cursor-pointer transition-all duration-300 group
                                                        ${isCompleted ? getProgressColor(habit.color) + ' shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'bg-gray-800/30 border border-gray-800/50 hover:bg-gray-800/50 hover:border-gray-700'}
                                                        ${isToday ? 'outline outline-2 outline-blue-500 outline-offset-4' : ''}
                                                    `}
                                                >
                                                    <span className={`text-sm font-bold ${isCompleted ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                                        {day.dayNum}
                                                    </span>
                                                    {isCompleted && (
                                                        <div className="absolute top-1 right-1">
                                                            <CheckCircle2 size={12} className="text-white/50" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Habit Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#0f0f0f] border border-gray-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold mb-6">Create New Habit</h2>
                        <form onSubmit={addHabit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Habit Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newHabitName}
                                    onChange={(e) => setNewHabitName(e.target.value)}
                                    placeholder="e.g. Morning Run"
                                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-lg"
                                />
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 px-6 py-4 rounded-2xl bg-gray-800 hover:bg-gray-700 font-bold transition-all">Cancel</button>
                                <button type="submit" disabled={!newHabitName.trim()} className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HabitTracker;
