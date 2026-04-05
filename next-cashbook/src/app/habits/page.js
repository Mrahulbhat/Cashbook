'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Edit2, CheckCircle2, TrendingUp, Calendar as CalendarIcon, Trophy, Zap, ChevronLeft, ChevronRight, Grid as GridIcon, List as ListIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

const HabitTracker = () => {
    const [habits, setHabits] = useState([]);
    const [newHabitName, setNewHabitName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHabitId, setEditingHabitId] = useState(null);
    const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'monthly'
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [habitName, setHabitName] = useState('');
    const [selectedColor, setSelectedColor] = useState('emerald');
    const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]); // Default Weekdays
    const [stats, setStats] = useState({ totalCompletions: 0, currentStreak: 0 });

    const weekDays = [
        { label: 'S', value: 0 },
        { label: 'M', value: 1 },
        { label: 'T', value: 2 },
        { label: 'W', value: 3 },
        { label: 'T', value: 4 },
        { label: 'F', value: 5 },
        { label: 'S', value: 6 }
    ];

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

    const dailyFulfillment = useMemo(() => {
        if (!habits.length) return 0;
        const currentDay = new Date().getDay();
        const activeToday = habits.filter(h => (h.activeDays || [0,1,2,3,4,5,6]).includes(currentDay));
        if (activeToday.length === 0) return 0;
        
        const completed = activeToday.filter(h => h.completedDays.includes(today)).length;
        return Math.round((completed / activeToday.length) * 100);
    }, [habits, today]);

    const moveHabit = (index, direction) => {
        const newHabits = [...habits];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= habits.length) return;
        
        [newHabits[index], newHabits[newIndex]] = [newHabits[newIndex], newHabits[index]];
        setHabits(newHabits);
    };

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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!habitName.trim()) return;

        if (editingHabitId) {
            // Edit existing habit
            setHabits(prev => prev.map(h => 
                h.id === editingHabitId 
                ? { ...h, name: habitName.trim(), color: selectedColor, activeDays: selectedDays } 
                : h
            ));
            toast.success('Habit updated!');
        } else {
            // Add new habit
            const newHabit = {
                id: Date.now(),
                name: habitName.trim(),
                completedDays: [],
                color: selectedColor,
                activeDays: selectedDays,
                createdAt: new Date().toISOString()
            };
            setHabits([...habits, newHabit]);
            toast.success('New habit added!');
        }

        closeModal();
    };

    const openAddModal = () => {
        setEditingHabitId(null);
        setHabitName('');
        setSelectedColor('emerald');
        setSelectedDays([1, 2, 3, 4, 5]);
        setIsModalOpen(true);
    };

    const openEditModal = (habit) => {
        setEditingHabitId(habit.id);
        setHabitName(habit.name);
        setSelectedColor(habit.color || 'emerald');
        setSelectedDays(habit.activeDays || [0, 1, 2, 3, 4, 5, 6]);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingHabitId(null);
    };

    const deleteHabit = (id) => {
        if (confirm('Delete this habit? This cannot be undone.')) {
            setHabits(habits.filter(h => h.id !== id));
            toast.error('Habit removed');
        }
    };

    const calculateStreak = (habit) => {
        const { completedDays, activeDays = [0, 1, 2, 3, 4, 5, 6] } = habit;
        if (!completedDays.length) return 0;
        
        let streak = 0;
        let checkDate = new Date();
        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const dayOfWeek = checkDate.getDay();
            
            if (completedDays.includes(dateStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (!activeDays.includes(dayOfWeek)) {
                // Skip inactive day, don't break streak
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                if (dateStr === today) {
                    checkDate.setDate(checkDate.getDate() - 1);
                    continue; 
                }
                break;
            }
            
            // Safety break to prevent infinite loop
            if (streak > 5000) break;
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
                    
                    {/* Motivational Quote - Quick Feature */}
                    <div className="hidden lg:block bg-gray-900/40 border border-gray-800/40 px-6 py-3 rounded-2xl backdrop-blur-sm">
                        <p className="text-sm font-medium italic text-gray-400">
                            "Success is the sum of small efforts, repeated day in and day out."
                        </p>
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
                            onClick={openAddModal}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                        >
                            <Plus size={20} />
                            Add
                        </button>
                    </div>
                </div>

                {/* Progress & Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-900/40 border border-gray-800/60 rounded-[2.5rem] p-8 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-200">Today's Fulfillment</h3>
                            <span className="text-3xl font-black text-blue-400">{dailyFulfillment}%</span>
                        </div>
                        <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700/50">
                            <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-1000 ease-out"
                                style={{ width: `${dailyFulfillment}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between mt-3 text-sm font-medium">
                            <span className="text-gray-500">
                                {habits.filter(h => (h.activeDays || [0,1,2,3,4,5,6]).includes(new Date().getDay()) && h.completedDays.includes(today)).length}/{habits.filter(h => (h.activeDays || [0,1,2,3,4,5,6]).includes(new Date().getDay())).length} active habits today
                            </span>
                            <span className="text-blue-400/70">
                                {dailyFulfillment === 100 ? 'Perfect day! 🔥' : dailyFulfillment > 50 ? 'Keep it up! 🚀' : 'Start your first habit! ✨'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-900/20 to-gray-900/40 border border-gray-800/60 rounded-[2.5rem] p-8 backdrop-blur-md flex flex-col justify-center">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-blue-600/20 rounded-2xl text-blue-400">
                                <Trophy size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Best Streak</p>
                                <h3 className="text-3xl font-black text-white">
                                    {Math.max(...habits.map(h => calculateStreak(h)), 0)} <span className="text-sm font-medium text-gray-400">Days</span>
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                {viewMode === 'weekly' ? (
                    <div className="grid gap-6">
                        <div className="flex items-center gap-3 mb-2">
                            <CalendarIcon className="text-blue-400" size={20} />
                            <h2 className="text-xl font-bold text-gray-300">Habits List</h2>
                        </div>
                        {habits.map((habit, index) => (
                            <div key={habit.id} className="bg-gray-900/30 border border-gray-800/50 rounded-3xl p-6 backdrop-blur-sm group hover:bg-gray-900/50 transition-all">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex items-center justify-between lg:w-1/3">
                                        <div className="flex items-center gap-3">
                                            {/* Reorder Buttons */}
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-1">
                                                <button onClick={() => moveHabit(index, 'up')} disabled={index === 0} className="hover:text-blue-400 disabled:opacity-30 disabled:hover:text-gray-500"><ChevronLeft size={20} className="rotate-90" /></button>
                                                <button onClick={() => moveHabit(index, 'down')} disabled={index === habits.length - 1} className="hover:text-blue-400 disabled:opacity-30 disabled:hover:text-gray-500"><ChevronRight size={20} className="rotate-90" /></button>
                                            </div>
                                            <div className={`w-3 h-12 rounded-full ${getProgressColor(habit.color)}`}></div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-xl font-bold text-gray-100">{habit.name}</h3>
                                                    <button 
                                                        onClick={() => openEditModal(habit)}
                                                        className="p-1 text-gray-500 hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1 text-amber-400 text-sm font-medium mt-1">
                                                    <Zap size={14} fill="currentColor" />
                                                    <span>{calculateStreak(habit)} day streak</span>
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
                                            const isActive = (habit.activeDays || [0,1,2,3,4,5,6]).includes(new Date(day.date).getDay());
                                            
                                            return (
                                                <div 
                                                    key={idx} 
                                                    className={`flex flex-col items-center gap-3 cursor-pointer group/day ${!isActive ? 'opacity-40 grayscale-[0.5]' : ''}`}
                                                    onClick={() => isActive && toggleHabit(habit.id, day.date)}
                                                >
                                                    <span className={`text-xs font-bold uppercase tracking-tighter ${isToday ? 'text-blue-400' : 'text-gray-500'}`}>
                                                        {day.label}
                                                    </span>
                                                    <div className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${isCompleted ? getProgressColor(habit.color) + ' shadow-lg scale-110 border-transparent' : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700'}`}>
                                                        {!isActive && !isCompleted ? (
                                                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-tighter">OFF</span>
                                                        ) : isCompleted ? (
                                                            <CheckCircle2 size={24} className="text-white" />
                                                        ) : (
                                                            <span className="text-sm font-bold text-gray-500">{day.dayNum}</span>
                                                        )}
                                                        {isToday && !isCompleted && isActive && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse border-2 border-[#050505]"></div>}
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
                            {habits.map((habit, index) => (
                                <div key={habit.id} className="bg-gray-900/20 border border-gray-800/40 rounded-[2.5rem] p-8 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {/* Reorder Buttons in Monthly */}
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-1">
                                                <button onClick={() => moveHabit(index, 'up')} disabled={index === 0} className="hover:text-blue-400 disabled:opacity-30 disabled:hover:text-gray-500"><ChevronLeft size={18} className="rotate-90" /></button>
                                                <button onClick={() => moveHabit(index, 'down')} disabled={index === habits.length - 1} className="hover:text-blue-400 disabled:opacity-30 disabled:hover:text-gray-500"><ChevronRight size={18} className="rotate-90" /></button>
                                            </div>
                                            <div className={`w-4 h-4 rounded-full ${getProgressColor(habit.color)} shadow-[0_0_10px_currentColor]`}></div>
                                            <div className="flex items-center gap-3 group/title">
                                                <h3 className="text-2xl font-bold text-gray-100">{habit.name}</h3>
                                                <button 
                                                    onClick={() => openEditModal(habit)}
                                                    className="p-1.5 text-gray-500 hover:text-blue-400 transition-colors opacity-0 group-hover/title:opacity-100"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="px-5 py-2 bg-gray-800/50 rounded-2xl text-amber-400 font-bold flex items-center gap-2 border border-gray-700/50">
                                            <Zap size={18} fill="currentColor" />
                                            {calculateStreak(habit)} Day Streak
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
                                                        ${!(habit.activeDays || [0,1,2,3,4,5,6]).includes(new Date(day.date).getDay()) && !isCompleted ? 'opacity-30 grayscale-[0.5]' : ''}
                                                    `}
                                                >
                                                    <span className={`text-sm font-bold ${isCompleted ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                                        {day.dayNum}
                                                    </span>
                                                    {isCompleted ? (
                                                        <div className="absolute top-1 right-1">
                                                            <CheckCircle2 size={12} className="text-white/50" />
                                                        </div>
                                                    ) : !(habit.activeDays || [0,1,2,3,4,5,6]).includes(new Date(day.date).getDay()) && (
                                                        <div className="absolute -top-1 -right-1 text-[8px] bg-gray-800 text-gray-500 px-1 rounded-full font-bold">OFF</div>
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

            {/* Habit Modal (Add/Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#0f0f0f] border border-gray-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold mb-6">{editingHabitId ? 'Edit Habit' : 'Create New Habit'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Habit Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={habitName}
                                    onChange={(e) => setHabitName(e.target.value)}
                                    placeholder="e.g. Morning Run"
                                    className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-lg"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-3">Choose Theme</label>
                                <div className="flex flex-wrap gap-4">
                                    {['emerald', 'blue', 'purple', 'rose', 'amber', 'cyan'].map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setSelectedColor(color)}
                                            className={`
                                                w-10 h-10 rounded-full transition-all transform hover:scale-110 active:scale-95
                                                ${getProgressColor(color)}
                                                ${selectedColor === color ? 'ring-4 ring-white ring-offset-4 ring-offset-black' : 'opacity-40 hover:opacity-100'}
                                            `}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-3">Active Days (Skip logic)</label>
                                <div className="flex gap-1 sm:gap-2">
                                    {weekDays.map((day) => (
                                        <button
                                            key={day.value}
                                            type="button"
                                            onClick={() => {
                                                if (selectedDays.includes(day.value)) {
                                                    setSelectedDays(selectedDays.filter(d => d !== day.value));
                                                } else {
                                                    setSelectedDays([...selectedDays, day.value]);
                                                }
                                            }}
                                            className={`
                                                flex-1 py-3 rounded-xl font-bold transition-all text-xs sm:text-base
                                                ${selectedDays.includes(day.value) ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-600 border border-gray-800'}
                                            `}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 px-6 py-4 rounded-2xl bg-gray-800 hover:bg-gray-700 font-bold transition-all">Cancel</button>
                                <button type="submit" disabled={!habitName.trim()} className="flex-1 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                                    {editingHabitId ? 'Save' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HabitTracker;
