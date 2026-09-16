'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Check, ClipboardCheck, Pencil, Plus, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { axiosInstance } from '@/lib/axios';

const initialForm = { workTitle: '', deadline: '', priority: 'Medium' };
const priorityStyles = {
    High: 'bg-rose-50 text-rose-700 border-rose-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function TodoContent() {
    const [todos, setTodos] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
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

    const resetForm = () => {
        setForm(initialForm);
        setEditingId(null);
        setShowForm(false);
    };

    const submitTodo = async (event) => {
        event.preventDefault();
        try {
            const response = editingId
                ? await axiosInstance.put(`/todo/${editingId}`, form)
                : await axiosInstance.post('/todo', form);
            setTodos((current) => editingId
                ? current.map((todo) => todo._id === editingId ? response.data : todo)
                : [response.data, ...current]);
            toast.success(editingId ? 'To-do updated' : 'To-do added');
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to save to-do');
        }
    };

    const editTodo = (todo) => {
        setEditingId(todo._id);
        setForm({ workTitle: todo.workTitle, deadline: todo.deadline.slice(0, 10), priority: todo.priority });
        setShowForm(true);
    };

    const toggleTodo = async (todo) => {
        try {
            const response = await axiosInstance.put(`/todo/${todo._id}`, { completed: !todo.completed });
            setTodos((current) => current.map((item) => item._id === todo._id ? response.data : item));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to update to-do');
        }
    };

    const deleteTodo = async (id) => {
        try {
            await axiosInstance.delete(`/todo/${id}`);
            setTodos((current) => current.filter((todo) => todo._id !== id));
            toast.success('To-do deleted');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to delete to-do');
        }
    };

    const renderTodo = (todo) => (
        <article key={todo._id} className={`flex items-center gap-3 border border-[#eadfce] bg-white p-4 shadow-sm transition sm:gap-5 sm:p-5 ${todo.completed ? 'opacity-60' : ''}`}>
            <button onClick={() => toggleTodo(todo)} className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 ${todo.completed ? 'border-orange-700 bg-orange-700 text-white' : 'border-[#cdbca7] text-transparent hover:border-orange-700'}`} aria-label={todo.completed ? 'Move to pending' : 'Mark as complete'}><Check size={15} /></button>
            <div className="min-w-0 flex-1"><h2 className={`truncate font-bold ${todo.completed ? 'line-through' : ''}`}>{todo.workTitle}</h2><p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays size={13} /> {new Date(todo.deadline).toLocaleDateString()}</p></div>
            <span className={`hidden rounded-full border px-2.5 py-1 text-xs font-bold sm:inline-block ${priorityStyles[todo.priority]}`}>{todo.priority}</span>
            <div className="flex gap-1"><button onClick={() => editTodo(todo)} className="rounded-lg p-2 text-slate-400 hover:bg-orange-50 hover:text-orange-700" aria-label="Edit to-do"><Pencil size={16} /></button><button onClick={() => deleteTodo(todo._id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700" aria-label="Delete to-do"><Trash2 size={16} /></button></div>
        </article>
    );

    return (
        <div className="min-h-screen bg-[#fffaf3] px-4 py-8 text-[#21170f] md:px-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <header className="flex flex-col gap-5 border-b border-[#eadfce] pb-7 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-orange-700">Personal workspace</p>
                        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">To-Do List</h1>
                        <p className="mt-2 text-sm text-slate-500">Keep the next important thing close.</p>
                    </div>
                    <button onClick={() => { setEditingId(null); setForm(initialForm); setShowForm(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#21170f] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-950/10 transition hover:bg-orange-800">
                        <Plus size={17} /> Add work
                    </button>
                </header>

                <section className="grid grid-cols-3 gap-3 sm:gap-5">
                    {[['Open', stats.open], ['Completed', stats.completed], ['Total', stats.total]].map(([label, value]) => (
                        <div key={label} className="border-l-2 border-orange-400 px-3 py-1 sm:px-5">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
                            <p className="mt-1 text-3xl font-black">{value}</p>
                        </div>
                    ))}
                </section>

                {showForm && (
                    <form onSubmit={submitTodo} className="border border-[#eadfce] bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-black">{editingId ? 'Edit work' : 'New work'}</h2>
                            <button type="button" onClick={resetForm} className="rounded-lg p-1 text-slate-400 hover:bg-orange-50 hover:text-orange-700" aria-label="Close form"><X size={18} /></button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_auto] md:items-end">
                            <label className="text-sm font-semibold text-slate-600">Work Title<input value={form.workTitle} onChange={(event) => setForm({ ...form, workTitle: event.target.value })} className="mt-2 w-full rounded-lg border border-[#ddcfbd] bg-[#fffdf9] px-3 py-3 text-[#21170f] outline-none focus:border-orange-500" required /></label>
                            <label className="text-sm font-semibold text-slate-600">Deadline<div className="relative mt-2"><input ref={deadlineInputRef} type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} className="w-full rounded-lg border border-[#ddcfbd] bg-[#fffdf9] px-3 py-3 pr-11 text-[#21170f] outline-none focus:border-orange-500" required /><button type="button" onClick={() => { deadlineInputRef.current?.focus(); deadlineInputRef.current?.showPicker?.(); }} className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-orange-700 hover:bg-orange-100" aria-label="Open deadline date picker"><CalendarDays size={17} /></button></div></label>
                            <label className="text-sm font-semibold text-slate-600">Priority<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="mt-2 w-full rounded-lg border border-[#ddcfbd] bg-[#fffdf9] px-3 py-3 text-[#21170f] outline-none focus:border-orange-500"><option>High</option><option>Medium</option><option>Low</option></select></label>
                            <button type="submit" className="rounded-lg bg-orange-700 px-5 py-3 font-bold text-white hover:bg-orange-800">{editingId ? 'Save' : 'Add'}</button>
                        </div>
                    </form>
                )}

                {loading ? <p className="py-12 text-center text-sm text-slate-500">Loading your work...</p> : (
                    <div className="space-y-8">
                        <section className="space-y-3">
                            <div className="flex items-center justify-between"><h2 className="text-lg font-black">Pending</h2><span className="text-xs font-bold uppercase tracking-widest text-slate-400">{pendingTodos.length} {pendingTodos.length === 1 ? 'item' : 'items'}</span></div>
                            {pendingTodos.length > 0 ? pendingTodos.map(renderTodo) : <div className="border border-dashed border-[#ddcfbd] px-4 py-8 text-center text-sm text-slate-500">No pending work. You are all caught up.</div>}
                        </section>
                        <section className="space-y-3">
                            <div className="flex items-center justify-between"><h2 className="text-lg font-black">Completed</h2><span className="text-xs font-bold uppercase tracking-widest text-slate-400">{completedTodos.length} {completedTodos.length === 1 ? 'item' : 'items'}</span></div>
                            {completedTodos.length > 0 ? completedTodos.map(renderTodo) : <div className="border border-dashed border-[#ddcfbd] px-4 py-8 text-center text-sm text-slate-500"><ClipboardCheck className="mx-auto mb-2 text-orange-400" size={24} />Completed work will stay here.</div>}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TodoPage() {
    return <ProtectedRoute><TodoContent /></ProtectedRoute>;
}