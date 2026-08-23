'use client';

import { useEffect, useState } from 'react';
import { ClipboardX, Loader, Plus, CheckCircle2, Pencil, Trash2 } from 'lucide-react';

const BUG_STATUS_OPTIONS = ['Not Started', 'In Progress', 'In Review', 'Fixed'];

const getStatusClasses = (status) => {
    switch (status) {
        case 'Not Started':
            return 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20';
        case 'In Progress':
            return 'bg-blue-500/15 text-blue-300 border border-blue-500/20';
        case 'In Review':
            return 'bg-purple-500/15 text-purple-300 border border-purple-500/20';
        case 'Fixed':
            return 'bg-green-500/15 text-green-400 border border-green-500/20';
        default:
            return 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20';
    }
};

export default function AdminBugsPage() {
    const [bugs, setBugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const [expanded, setExpanded] = useState({});
    const [editingBugId, setEditingBugId] = useState(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        status: 'Not Started',
    });

    const fetchBugs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/bugs', { credentials: 'include' });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch bugs');
            setBugs(data.data || []);
        } catch (error) {
            console.error(error);
            alert(error.message || 'Failed to fetch bugs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBugs();
    }, []);

    const filteredBugs = bugs.filter((bug) => {
        return statusFilter === 'All' || bug.status === statusFilter;
    });

    const truncate = (text, maxWords = 30) => {
        if (!text) return '';
        const words = text.split(/\s+/);
        if (words.length <= maxWords) return text;
        return `${words.slice(0, maxWords).join(' ')}...`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim() || !form.description.trim()) {
            alert('Please complete the title and description');
            return;
        }

        const payload = {
            ...form,
            status: editingBugId ? form.status : 'Not Started',
        };

        setSaving(true);

        try {
            const method = editingBugId ? 'PUT' : 'POST';
            const url = editingBugId ? `/api/admin/bugs/${editingBugId}` : '/api/admin/bugs';

            const res = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save bug');

            setForm({ title: '', description: '', status: 'Not Started' });
            setEditingBugId(null);
            fetchBugs();
        } catch (error) {
            alert(error.message || 'Failed to save bug');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (bug) => {
        setEditingBugId(bug._id);
        setForm({
            title: bug.title,
            description: bug.description,
            status: bug.status,
        });
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`/api/admin/bugs/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete bug');
            fetchBugs();
            if (editingBugId === id) {
                setEditingBugId(null);
                setForm({ title: '', description: '', status: 'Not Started' });
            }
        } catch (error) {
            alert(error.message || 'Failed to delete bug');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex items-center gap-3">
                    <div className="p-3 bg-red-500/10 rounded-2xl text-red-400">
                        <ClipboardX size={26} />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Admin</p>
                        <h1 className="text-3xl font-bold">Bug Tracker</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
                    <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">Bug list</h2>
                            <div className="flex items-center gap-3">
                                <label className="text-xs uppercase tracking-wider text-gray-400">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-sm text-white"
                                >
                                    <option value="All">All</option>
                                    {BUG_STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16 text-gray-400">
                                <Loader className="animate-spin mr-2" size={20} />
                                Loading bugs...
                            </div>
                        ) : (
                            <div className="overflow-hidden border border-gray-800 rounded-2xl">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-950/80">
                                        <tr className="text-xs uppercase tracking-wider text-gray-500">
                                            <th className="px-4 py-3">Title</th>
                                            <th className="px-4 py-3">Description</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBugs.length > 0 ? filteredBugs.map((bug) => {
                                            const isExpanded = !!expanded[bug._id];
                                            return (
                                                <tr key={bug._id} className="border-t border-gray-800 hover:bg-white/5">
                                                    <td className="px-4 py-3 font-semibold text-white">{bug.title}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-400 max-w-lg">
                                                        <div className="leading-6">
                                                            {isExpanded ? bug.description : truncate(bug.description)}
                                                            {bug.description && bug.description.split(/\s+/).length > 30 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setExpanded((prev) => ({ ...prev, [bug._id]: !prev[bug._id] }))}
                                                                    className="ml-2 text-xs font-semibold text-red-300 underline"
                                                                >
                                                                    {isExpanded ? 'Collapse' : 'Expand'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(bug.status)}`}>
                                                            {bug.status || 'Not Started'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEdit(bug)}
                                                                className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-300"
                                                            >
                                                                <span className="inline-flex items-center gap-1"><Pencil size={12} /> Edit</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(bug._id)}
                                                                className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-300"
                                                            >
                                                                <span className="inline-flex items-center gap-1"><Trash2 size={12} /> Delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                                                    No bugs found for this filter.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="bg-gray-950/70 border border-gray-800 rounded-3xl p-5 h-fit">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-3 bg-red-500/10 rounded-2xl text-red-400">
                                <Plus size={20} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-[0.2em] font-bold">{editingBugId ? 'Edit bug' : 'Add bug'}</p>
                                <h3 className="text-xl font-bold text-white">{editingBugId ? 'Update issue' : 'New issue record'}</h3>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Login button does not respond"
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-red-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    rows={6}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Describe the bug, steps to reproduce, and expected behavior..."
                                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-red-500 resize-none"
                                    required
                                />
                            </div>

                            {editingBugId && (
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500"
                                    >
                                        {BUG_STATUS_OPTIONS.map((status) => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {editingBugId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingBugId(null);
                                        setForm({ title: '', description: '', status: 'Not Started' });
                                    }}
                                    className="w-full border border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800 font-bold py-3 rounded-xl"
                                >
                                    Cancel edit
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                {saving ? (editingBugId ? 'Updating...' : 'Saving...') : (editingBugId ? 'Update bug' : 'Save bug')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
