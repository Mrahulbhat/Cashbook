'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, BookOpen, CalendarDays, Check, ClipboardCheck, Pencil, Plus, Star, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { axiosInstance } from '@/lib/axios';

const localDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
const dateKey = (value) => {
    if (!value) return '';
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
    return localDateString(new Date(value));
};
const dateFromKey = (value) => new Date(`${value}T12:00:00`);
const createInitialForm = (completed = false) => ({
    workTitle: '',
    deadline: '',
    workType: 'New Scripting',
    completed,
    completedAt: localDateString(),
    isFavorite: false,
});
const trackerViews = [
    { id: 'reminders', label: 'Reminder Features', icon: Bell },
    { id: 'daily-log', label: 'Daily Work Log', icon: BookOpen },
    { id: 'favorites', label: 'Favorites', icon: Star },
];
const workTypeStyles = {
    'New Scripting': 'bg-sky-50 text-sky-700 border-sky-200',
    'R&D': 'bg-violet-50 text-violet-700 border-violet-200',
    Regression: 'bg-rose-50 text-rose-700 border-rose-200',
    Other: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function TodoContent() {
    const [todos, setTodos] = useState([]);
    const [form, setForm] = useState(() => createInitialForm());
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('reminders');
    const [selectedMonth, setSelectedMonth] = useState(() => localDateString().slice(0, 7));
    const deadlineInputRef = useRef(null);

    const loadTodos = async () => {
        try {
            const response = await axiosInstance.get('/todo');
            setTodos(response.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to load your to-dos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadTodos(); }, []);

    const stats = useMemo(() => ({
        total: todos.length,
        open: todos.filter((todo) => !todo.completed).length,
        completed: todos.filter((todo) => todo.completed).length,
    }), [todos]);

    const pendingTodos = todos.filter((todo) => !todo.completed);
    const completedTodos = todos.filter((todo) => todo.completed);
    const favoriteTodos = completedTodos.filter((todo) => todo.isFavorite);
    const todayDateKey = localDateString();
    const dueTodayCount = pendingTodos.filter((todo) => todo.deadline && dateKey(todo.deadline) === todayDateKey).length;
    const overdueReminderCount = pendingTodos.filter((todo) => todo.deadline && dateKey(todo.deadline) < todayDateKey).length;
    const monthLogEntries = completedTodos
        .filter((todo) => {
            const completedDate = dateKey(todo.completedAt || todo.updatedAt || todo.createdAt);
            return completedDate.startsWith(selectedMonth);
        })
        .sort((first, second) => {
            const firstDate = dateKey(first.completedAt || first.updatedAt || first.createdAt);
            const secondDate = dateKey(second.completedAt || second.updatedAt || second.createdAt);
            return secondDate.localeCompare(firstDate);
        });
    const todaysLogCount = completedTodos.filter((todo) => {
        const completedDate = dateKey(todo.completedAt || todo.updatedAt || todo.createdAt);
        return completedDate === localDateString();
    }).length;
    const visibleTodos = activeView === 'reminders'
        ? pendingTodos
        : activeView === 'daily-log'
            ? monthLogEntries
            : favoriteTodos;
    const viewContent = {
        reminders: {
            title: 'Reminder Features',
            description: 'Plan upcoming work with clear deadlines and priorities.',
            countLabel: 'reminders',
            empty: 'No reminders yet. Add upcoming work to keep it on your radar.',
        },
        'daily-log': {
            title: 'Daily Work Log',
            description: 'Choose a month to review the work you recorded.',
            countLabel: 'entries',
            empty: 'Your completed work will appear here, organized by its completion date.',
        },
        favorites: {
            title: 'Favorites',
            description: 'Keep important completed work close.',
            countLabel: 'saved items',
            empty: 'Star a work-log entry to keep it here with its date.',
        },
    }[activeView];
    const selectedMonthLabel = dateFromKey(`${selectedMonth}-01`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    const resetForm = () => {
        setForm(createInitialForm(activeView === 'daily-log'));
        setEditingId(null);
        setShowForm(false);
    };

    const openCreateForm = () => {
        setEditingId(null);
        setForm(createInitialForm(activeView === 'daily-log'));
        setShowForm(true);
    };

    const submitTodo = async (event) => {
        event.preventDefault();
        try {
            const payload = {
                ...form,
                completedAt: form.completed ? form.completedAt : null,
                isFavorite: Boolean(form.completed && form.isFavorite),
            };
            const response = editingId
                ? await axiosInstance.put(`/todo/${editingId}`, payload)
                : await axiosInstance.post('/todo', payload);
            setTodos((current) => editingId
                ? current.map((todo) => todo._id === editingId ? response.data : todo)
                : [response.data, ...current]);
            if (form.completed) {
                const loggedDate = dateKey(form.completedAt);
                setSelectedMonth(loggedDate.slice(0, 7));
            }
            toast.success(editingId ? 'Work updated' : form.completed ? 'Work logged' : 'Reminder added');
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to save to-do');
        }
    };

    const editTodo = (todo) => {
        setEditingId(todo._id);
        setForm({
            workTitle: todo.workTitle,
            deadline: todo.deadline ? todo.deadline.slice(0, 10) : '',
            workType: todo.workType || 'Other',
            completed: todo.completed,
            completedAt: dateKey(todo.completedAt) || localDateString(),
            isFavorite: Boolean(todo.completed && todo.isFavorite),
        });
        setShowForm(true);
    };

    const dismissReminder = async (todo) => {
        try {
            await axiosInstance.delete(`/todo/${todo._id}`);
            setTodos((current) => current.filter((item) => item._id !== todo._id));
            toast.success('Reminder cleared');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to clear reminder');
        }
    };

    const toggleFavorite = async (todo) => {
        try {
            const response = await axiosInstance.put(`/todo/${todo._id}`, { isFavorite: !todo.isFavorite });
            setTodos((current) => current.map((item) => item._id === todo._id ? response.data : item));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to update favorite');
        }
    };

    const deleteTodo = async (id) => {
        try {
            await axiosInstance.delete(`/todo/${id}`);
            setTodos((current) => current.filter((todo) => todo._id !== id));
            toast.success('Work item deleted');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to delete to-do');
        }
    };

    const renderTodo = (todo) => (
        <article key={todo._id} className="flex items-center gap-3 border border-[#eadfce] bg-white p-4 shadow-sm transition sm:gap-5 sm:p-5">
            {todo.completed
                ? <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 border-orange-700 bg-orange-700 text-white" aria-label="Logged work"><Check size={15} /></span>
                : <button onClick={() => dismissReminder(todo)} className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#cdbca7] text-transparent hover:border-orange-700 hover:bg-orange-700 hover:text-white" aria-label="Done and remove reminder" title="Done and remove reminder"><Check size={15} /></button>}
            <div className="min-w-0 flex-1"><h2 className={`font-bold ${todo.completed ? 'whitespace-pre-wrap break-words' : 'truncate'}`}>{todo.workTitle}</h2><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays size={13} /> {todo.completed ? `Done ${dateFromKey(dateKey(todo.completedAt || todo.updatedAt || todo.createdAt)).toLocaleDateString()}` : todo.deadline ? `Due ${new Date(todo.deadline).toLocaleDateString()}` : 'No deadline'}</p></div>
            <span className={`hidden rounded-full border px-2.5 py-1 text-xs font-bold sm:inline-block ${workTypeStyles[todo.workType || 'Other']}`}>{todo.workType || 'Other'}</span>
            <div className="flex gap-1">{todo.completed && <button onClick={() => toggleFavorite(todo)} className={`rounded-lg p-2 ${todo.isFavorite ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:bg-amber-50 hover:text-amber-500'}`} aria-label={todo.isFavorite ? 'Remove from favorites' : 'Add to favorites'} title={todo.isFavorite ? 'Remove from favorites' : 'Add to favorites'}><Star size={16} fill={todo.isFavorite ? 'currentColor' : 'none'} /></button>}<button onClick={() => editTodo(todo)} className="rounded-lg p-2 text-slate-400 hover:bg-orange-50 hover:text-orange-700" aria-label="Edit work"><Pencil size={16} /></button><button onClick={() => deleteTodo(todo._id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700" aria-label="Delete work"><Trash2 size={16} /></button></div>
        </article>
    );

    const renderWorkTable = (entries) => (
        <div className="overflow-x-auto border border-[#d8d0c2] bg-white">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-[#f4f0e9] text-xs font-bold uppercase tracking-wider text-slate-600">
                    <tr>
                        <th scope="col" className="w-20 border border-[#d8d0c2] px-4 py-3 text-center">Sl. No.</th>
                        <th scope="col" className="border border-[#d8d0c2] px-4 py-3">Date</th>
                        <th scope="col" className="border border-[#d8d0c2] px-4 py-3">Work done</th>
                        <th scope="col" className="border border-[#d8d0c2] px-4 py-3">Type</th>
                        <th scope="col" className="border border-[#d8d0c2] px-4 py-3 text-center">Favorite</th>
                        <th scope="col" className="border border-[#d8d0c2] px-4 py-3 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {entries.map((todo, index) => {
                        const completedDate = dateKey(todo.completedAt || todo.updatedAt || todo.createdAt);
                        return (
                            <tr key={todo._id} className="hover:bg-orange-50/60">
                                <td className="border border-[#e5ded2] px-4 py-3 text-center font-semibold tabular-nums text-slate-500">{index + 1}</td>
                                <td className="whitespace-nowrap border border-[#e5ded2] px-4 py-3 font-semibold">{dateFromKey(completedDate).toLocaleDateString()}</td>
                                <td className="whitespace-pre-wrap break-words border border-[#e5ded2] px-4 py-3">{todo.workTitle}</td>
                                <td className="border border-[#e5ded2] px-4 py-3"><span className={`inline-block rounded-full border px-2.5 py-1 text-xs font-bold ${workTypeStyles[todo.workType || 'Other']}`}>{todo.workType || 'Other'}</span></td>
                                <td className="border border-[#e5ded2] px-4 py-3 text-center"><button onClick={() => toggleFavorite(todo)} className={`rounded-lg p-2 ${todo.isFavorite ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:bg-amber-50 hover:text-amber-500'}`} aria-label={todo.isFavorite ? 'Remove from favorites' : 'Add to favorites'} title={todo.isFavorite ? 'Remove from favorites' : 'Add to favorites'}><Star size={16} fill={todo.isFavorite ? 'currentColor' : 'none'} /></button></td>
                                <td className="border border-[#e5ded2] px-4 py-3 text-center"><div className="flex justify-center gap-1"><button onClick={() => editTodo(todo)} className="rounded-lg p-2 text-slate-400 hover:bg-orange-50 hover:text-orange-700" aria-label="Edit work"><Pencil size={16} /></button><button onClick={() => deleteTodo(todo._id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700" aria-label="Delete work"><Trash2 size={16} /></button></div></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fffaf3] px-4 py-6 text-[#21170f] md:px-8 md:py-8">
            <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[230px_minmax(0,1fr)]">
                <aside className="h-fit border-b border-[#eadfce] pb-4 lg:sticky lg:top-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
                    <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Work Tracker</p>
                    <nav aria-label="Work Tracker sections" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                        {trackerViews.map((view) => {
                            const Icon = view.icon;
                            const active = activeView === view.id;
                            return (
                                <button key={view.id} type="button" onClick={() => {
                                    setActiveView(view.id);
                                    setShowForm(false);
                                    setEditingId(null);
                                    setForm(createInitialForm(view.id === 'daily-log'));
                                }} className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-bold transition lg:w-full ${active ? 'bg-[#21170f] text-white' : 'text-slate-600 hover:bg-orange-50 hover:text-orange-800'}`}>
                                    <Icon size={17} className={active && view.id === 'favorites' ? 'text-amber-300' : ''} fill={view.id === 'favorites' && active ? 'currentColor' : 'none'} />
                                    {view.label}
                                </button>
                            );
                        })}
                    </nav>
                </aside>
                <main className="min-w-0 space-y-6">
                <header className="flex flex-col gap-5 border-b border-[#eadfce] pb-7 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-orange-700">Personal workspace</p>
                        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{viewContent.title}</h1>
                        <p className="mt-2 text-sm text-slate-500">{viewContent.description}</p>
                    </div>
                    {activeView !== 'favorites' && <button onClick={openCreateForm} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#21170f] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-950/10 transition hover:bg-orange-800">
                        <Plus size={17} /> {activeView === 'daily-log' ? 'Log completed work' : 'Add reminder'}
                    </button>}
                </header>

                {activeView === 'reminders' && <section className="grid grid-cols-3 gap-3 sm:gap-5">
                    {(activeView === 'reminders'
                        ? [['Open reminders', stats.open], ['Due today', dueTodayCount], ['Overdue', overdueReminderCount]]
                        : activeView === 'daily-log'
                            ? [['This month', monthLogEntries.length], ['Logged today', todaysLogCount], ['Favorites', favoriteTodos.length]]
                            : [['Favorites', favoriteTodos.length], ['Reminders', pendingTodos.length], ['Work log', completedTodos.length]]
                    ).map(([label, value]) => (
                        <div key={label} className="border-l-2 border-orange-400 px-3 py-1 sm:px-5">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
                            <p className="mt-1 text-3xl font-black">{value}</p>
                        </div>
                    ))}
                </section>}

                {showForm && (
                    <form onSubmit={submitTodo} className="border border-[#eadfce] bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-black">{editingId ? 'Edit work' : activeView === 'daily-log' ? 'Log completed work' : 'New reminder'}</h2>
                            <button type="button" onClick={resetForm} className="rounded-lg p-1 text-slate-400 hover:bg-orange-50 hover:text-orange-700" aria-label="Close form"><X size={18} /></button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-end">
                            {form.completed
                                ? <label className="text-sm font-semibold text-slate-600 md:col-span-2">What did you work on?<textarea value={form.workTitle} onChange={(event) => setForm({ ...form, workTitle: event.target.value })} rows={3} placeholder="Describe the work you completed..." className="mt-2 w-full resize-y rounded-lg border border-[#ddcfbd] bg-[#fffdf9] px-3 py-3 text-[#21170f] outline-none focus:border-orange-500" required /></label>
                                : <label className="text-sm font-semibold text-slate-600">Reminder title<input value={form.workTitle} onChange={(event) => setForm({ ...form, workTitle: event.target.value })} className="mt-2 w-full rounded-lg border border-[#ddcfbd] bg-[#fffdf9] px-3 py-3 text-[#21170f] outline-none focus:border-orange-500" required /></label>}
                            {!form.completed && <label className="text-sm font-semibold text-slate-600">Deadline (optional)<div className="relative mt-2"><input ref={deadlineInputRef} type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} className="w-full rounded-lg border border-[#ddcfbd] bg-[#fffdf9] px-3 py-3 pr-11 text-[#21170f] outline-none focus:border-orange-500" /><button type="button" onClick={() => { deadlineInputRef.current?.focus(); deadlineInputRef.current?.showPicker?.(); }} className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-orange-700 hover:bg-orange-100" aria-label="Open deadline date picker"><CalendarDays size={17} /></button></div></label>}
                            <label className="text-sm font-semibold text-slate-600">Type<select value={form.workType} onChange={(event) => setForm({ ...form, workType: event.target.value })} className="mt-2 w-full rounded-lg border border-[#ddcfbd] bg-[#fffdf9] px-3 py-3 text-[#21170f] outline-none focus:border-orange-500"><option>New Scripting</option><option>R&amp;D</option><option>Regression</option><option>Other</option></select></label>
                            <button type="submit" className="rounded-lg bg-orange-700 px-5 py-3 font-bold text-white hover:bg-orange-800">{editingId ? 'Save' : activeView === 'daily-log' ? 'Log work' : 'Add reminder'}</button>
                        </div>
                        <div className="mt-4 flex flex-col gap-3 border-t border-[#eadfce] pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap gap-x-6 gap-y-3">
                                <p className="text-sm font-semibold text-slate-600">{form.completed ? 'This entry will be saved in your Daily Work Log.' : 'This item will be saved as a reminder.'}</p>
                                {form.completed && <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.isFavorite} onChange={(event) => setForm({ ...form, isFavorite: event.target.checked })} className="h-4 w-4 accent-amber-500" /> Save to Favorites</label>}
                            </div>
                            {form.completed && <label className="text-sm font-semibold text-slate-600">Completed date<input type="date" value={form.completedAt} onChange={(event) => setForm({ ...form, completedAt: event.target.value })} className="ml-2 rounded-lg border border-[#ddcfbd] bg-[#fffdf9] px-3 py-2 text-[#21170f] outline-none focus:border-orange-500" required /></label>}
                        </div>
                    </form>
                )}

                {loading ? <p className="py-12 text-center text-sm text-slate-500">Loading your work...</p> : (
                    <div className="space-y-6">
                        {activeView === 'daily-log' && <div className="flex flex-col gap-3 border-y border-[#eadfce] py-4 sm:flex-row sm:items-end sm:justify-between">
                            <label className="text-sm font-bold text-slate-700">Choose month<input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="mt-1 block rounded-lg border border-[#ddcfbd] bg-white px-3 py-2 text-[#21170f] outline-none focus:border-orange-500" /></label>
                            <p className="text-sm font-semibold text-slate-500">{selectedMonthLabel} · {monthLogEntries.length} {monthLogEntries.length === 1 ? 'entry' : 'entries'}</p>
                        </div>}
                        <section className="space-y-3">
                            {activeView !== 'daily-log' && <div className="flex items-center justify-between"><h2 className="text-lg font-black">{viewContent.title}</h2><span className="text-xs font-bold uppercase tracking-widest text-slate-400">{visibleTodos.length} {viewContent.countLabel}</span></div>}
                            {activeView === 'daily-log'
                                ? monthLogEntries.length > 0 ? renderWorkTable(monthLogEntries) : <div className="border border-dashed border-[#ddcfce] px-4 py-10 text-center text-sm text-slate-500"><ClipboardCheck className="mx-auto mb-2 text-orange-400" size={24} />No work logged in {selectedMonthLabel}.</div>
                                : activeView === 'favorites'
                                    ? favoriteTodos.length > 0 ? renderWorkTable(favoriteTodos) : <div className="border border-dashed border-[#ddcfce] px-4 py-10 text-center text-sm text-slate-500"><ClipboardCheck className="mx-auto mb-2 text-orange-400" size={24} />{viewContent.empty}</div>
                                    : visibleTodos.length > 0 ? visibleTodos.map(renderTodo) : <div className="border border-dashed border-[#ddcfce] px-4 py-10 text-center text-sm text-slate-500"><ClipboardCheck className="mx-auto mb-2 text-orange-400" size={24} />{viewContent.empty}</div>}
                        </section>
                    </div>
                )}
                </main>
            </div>
        </div>
    );
}

export default function TodoPage() {
    return <ProtectedRoute><TodoContent /></ProtectedRoute>;
}