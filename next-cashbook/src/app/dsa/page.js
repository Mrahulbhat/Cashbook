'use client';

import { useEffect, useMemo, useState } from 'react';
import { axiosInstance } from '@/lib/axios';
import { Trophy, ListTodo, Swords, Settings, Plus, Link2, ExternalLink, Pencil, Trash2, Medal, Target, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';

const difficultyColors = {
  Easy: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Hard: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

const emptyForm = {
  difficulty: 'Easy',
  title: '',
  topic: '',
  source: '',
  tags: '',
  problemUrl: '',
  solutionUrl: '',
  status: 'todo',
  notes: '',
};

function DSATrackerContent() {
  const [problems, setProblems] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [challengeProblemId, setChallengeProblemId] = useState('');
  const [challengeMessage, setChallengeMessage] = useState('Let\'s solve this together.');

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [problemsRes, leaderboardRes, challengesRes, usersRes] = await Promise.all([
        axiosInstance.get('/dsa/problems'),
        axiosInstance.get('/dsa/leaderboard'),
        axiosInstance.get('/dsa/challenges'),
        axiosInstance.get('/dsa/users'),
      ]);
      setProblems(problemsRes.data || []);
      setLeaderboard(leaderboardRes.data || []);
      setChallenges(challengesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load DSA data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (problems.length > 0 && !challengeProblemId) {
      setChallengeProblemId(problems[0]._id);
    }
  }, [problems, challengeProblemId]);

  const totals = useMemo(() => {
    const solved = problems.filter((p) => p.status === 'solved').length;
    const easy = problems.filter((p) => p.difficulty === 'Easy').length;
    const medium = problems.filter((p) => p.difficulty === 'Medium').length;
    const hard = problems.filter((p) => p.difficulty === 'Hard').length;
    return { total: problems.length, solved, easy, medium, hard };
  }, [problems]);

  const submitProblem = async (e) => {
    e.preventDefault();
    try {
      if (!form.title.trim() || !form.topic.trim() || !form.source.trim()) {
        toast.error('Title, topic, and source are required');
        return;
      }

      if (editingId) {
        const response = await axiosInstance.put(`/dsa/problems/${editingId}`, form);
        setProblems((prev) => prev.map((item) => item._id === editingId ? response.data : item));
        toast.success('Problem updated');
      } else {
        const response = await axiosInstance.post('/dsa/problems', form);
        setProblems((prev) => [response.data, ...prev]);
        toast.success('Problem added');
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save problem');
    }
  };

  const deleteProblem = async (id) => {
    try {
      await axiosInstance.delete(`/dsa/problems/${id}`);
      setProblems((prev) => prev.filter((item) => item._id !== id));
      toast.success('Problem deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete problem');
    }
  };

  const toggleSolved = async (problem) => {
    try {
      const nextStatus = problem.status === 'solved' ? 'todo' : 'solved';
      const response = await axiosInstance.patch(`/dsa/problems/${problem._id}`, { status: nextStatus });
      setProblems((prev) => prev.map((item) => item._id === problem._id ? response.data : item));
      toast.success(`Marked as ${nextStatus}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const openEdit = (problem) => {
    setEditingId(problem._id);
    setForm({
      difficulty: problem.difficulty,
      title: problem.title,
      topic: problem.topic,
      source: problem.source,
      tags: problem.tags?.join(', ') || '',
      problemUrl: problem.problemUrl || '',
      solutionUrl: problem.solutionUrl || '',
      status: problem.status,
      notes: problem.notes || '',
    });
    setShowForm(true);
  };

  const challengeUser = async (targetUserId) => {
    try {
      if (!challengeProblemId) {
        toast.error('Select a problem to challenge');
        return;
      }

      const response = await axiosInstance.post('/dsa/challenges', {
        problemId: challengeProblemId,
        targetUserId,
        message: challengeMessage,
      });
      setChallenges((prev) => [response.data, ...prev]);
      toast.success('Challenge sent');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send challenge');
    }
  };

  const acceptChallenge = async (challengeId) => {
    try {
      const response = await axiosInstance.patch(`/dsa/challenges/${challengeId}`, { status: 'accepted' });
      setChallenges((prev) => prev.map((item) => item._id === challengeId ? response.data : item));
      toast.success('Challenge accepted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept challenge');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1020] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-900/60 to-slate-900/90 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-violet-500/15 border border-violet-500/30">
                <Target className="w-7 h-7 text-violet-300" />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.28em] text-violet-300 uppercase">DSA Tracker</p>
                <h1 className="text-3xl font-black tracking-tight">Problem growth dashboard</h1>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setShowForm((prev) => !prev);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-violet-500/20"
            >
              <Plus className="w-4 h-4" />
              {showForm ? 'Close form' : 'Add problem'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total" value={totals.total} icon={<ListTodo className="w-5 h-5" />} color="violet" />
          <StatCard label="Solved" value={totals.solved} icon={<Medal className="w-5 h-5" />} color="emerald" />
          <StatCard label="Medium" value={totals.medium} icon={<Sparkles className="w-5 h-5" />} color="amber" />
          <StatCard label="Hard" value={totals.hard} icon={<Trophy className="w-5 h-5" />} color="rose" />
        </div>

        <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-2">
          {['dashboard', 'leaderboard', 'challenge', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${activeTab === tab ? 'bg-violet-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {showForm && (
          <form onSubmit={submitProblem} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 md:p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <SelectField label="Difficulty" value={form.difficulty} onChange={(value) => setForm({ ...form, difficulty: value })} options={['Easy', 'Medium', 'Hard']} />
              <TextField label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="Two Sum" />
              <TextField label="Topic" value={form.topic} onChange={(value) => setForm({ ...form, topic: value })} placeholder="Arrays, DP" />
              <TextField label="Source" value={form.source} onChange={(value) => setForm({ ...form, source: value })} placeholder="LeetCode, Codeforces" />
              <TextField label="Tags" value={form.tags} onChange={(value) => setForm({ ...form, tags: value })} placeholder="array, hashmap" />
              <SelectField label="Status" value={form.status} onChange={(value) => setForm({ ...form, status: value })} options={['todo', 'solved']} />
              <TextField label="Problem URL" value={form.problemUrl} onChange={(value) => setForm({ ...form, problemUrl: value })} placeholder="https://..." />
              <TextField label="Solution URL" value={form.solutionUrl} onChange={(value) => setForm({ ...form, solutionUrl: value })} placeholder="https://..." />
            </div>
            <TextField label="Notes" value={form.notes} onChange={(value) => setForm({ ...form, notes: value })} placeholder="Approach, edge cases, mistakes" />
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} className="rounded-xl border border-slate-700 px-4 py-2 text-slate-200">Cancel</button>
              <button type="submit" className="rounded-xl bg-violet-500 px-4 py-2 font-semibold text-white">{editingId ? 'Update problem' : 'Save problem'}</button>
            </div>
          </form>
        )}

        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            {loading ? <LoadingState /> : problems.length === 0 ? <EmptyState /> : problems.map((problem) => (
              <div key={problem._id} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${difficultyColors[problem.difficulty] || difficultyColors.Easy}`}>
                        {problem.difficulty}
                      </span>
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{problem.topic}</span>
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{problem.status}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{problem.title}</h3>
                    <p className="text-sm text-slate-400">Source: {problem.source}</p>
                    {problem.tags?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {problem.tags.map((tag, idx) => (
                          <span key={`${tag}-${idx}`} className="rounded-full bg-violet-500/10 px-2 py-1 text-xs text-violet-200">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    <button onClick={() => toggleSolved(problem)} className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                      {problem.status === 'solved' ? 'Mark todo' : 'Mark solved'}
                    </button>
                    {problem.problemUrl && (
                      <a href={problem.problemUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200">
                        <Link2 className="w-4 h-4" /> Problem
                      </a>
                    )}
                    {problem.solutionUrl && (
                      <a href={problem.solutionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200">
                        <ExternalLink className="w-4 h-4" /> Solution
                      </a>
                    )}
                    <button onClick={() => openEdit(problem)} className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => deleteProblem(problem._id)} className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                {problem.notes && <p className="mt-4 text-sm text-slate-300">Notes: {problem.notes}</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="mb-4 flex items-center gap-3">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold">Leaderboard</h2>
            </div>
            <div className="space-y-3">
              {leaderboard.map((entry, idx) => (
                <div key={entry._id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/15 font-bold text-violet-200">#{idx + 1}</div>
                    <div>
                      <p className="font-semibold text-white">{entry.name}</p>
                      <p className="text-xs text-slate-400">{entry.email || 'No email'}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-300">
                    <div>Score: <span className="font-bold text-white">{entry.score}</span></div>
                    <div>Solved: {entry.solved}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'challenge' && (
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="mb-4 flex items-center gap-3">
                <Swords className="w-5 h-5 text-violet-400" />
                <h2 className="text-xl font-bold">Challenges</h2>
              </div>
              <div className="space-y-3">
                {challenges.length === 0 ? <p className="text-slate-400">No challenges yet.</p> : challenges.map((challenge) => (
                  <div key={challenge._id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{challenge.problemId?.title || 'Problem'}</p>
                        <p className="text-xs text-slate-400">From {challenge.userId?.name} to {challenge.targetUserId?.name}</p>
                      </div>
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-200">{challenge.status}</span>
                    </div>
                    {challenge.message && <p className="mt-2 text-sm text-slate-300">{challenge.message}</p>}
                    {challenge.status === 'pending' && challenge.targetUserId?._id && (
                      <button onClick={() => acceptChallenge(challenge._id)} className="mt-3 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-white">Accept challenge</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
              <h3 className="text-lg font-bold mb-3">Send a challenge</h3>
              <div className="space-y-3">
                <label className="block text-sm text-slate-300">
                  <span className="mb-1 block">Choose problem</span>
                  <select value={challengeProblemId} onChange={(e) => setChallengeProblemId(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white">
                    {problems.map((problem) => (
                      <option key={problem._id} value={problem._id}>{problem.title}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm text-slate-300">
                  <span className="mb-1 block">Message</span>
                  <textarea value={challengeMessage} onChange={(e) => setChallengeMessage(e.target.value)} rows={3} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white" />
                </label>

                {users.map((user) => (
                  <div key={user._id} className="flex items-center justify-between rounded-2xl border border-slate-800 p-3">
                    <div>
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email || 'No email'}</p>
                    </div>
                    <button onClick={() => challengeUser(user._id)} disabled={!problems.length} className="rounded-xl bg-violet-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">Challenge</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="rounded-3xl border border-rose-500/20 bg-slate-900/80 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-rose-400" />
              <h2 className="text-xl font-bold">Settings</h2>
            </div>
            <button onClick={async () => {
              try {
                const res = await axiosInstance.delete('/user');
                toast.success(res.data.message || 'Account deleted');
                window.location.href = '/login';
              } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete account');
              }
            }} className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">Delete my account</button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const tone = {
    violet: 'from-violet-500/20 to-violet-500/5 text-violet-200 border-violet-500/20',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-200 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-200 border-amber-500/20',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-200 border-rose-500/20',
  }[color];

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${tone}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-slate-300">{label}</span>
        <div className="rounded-lg bg-slate-900/60 p-2">{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-black">{value}</p>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <label className="block text-sm text-slate-300">
      <span className="mb-1 block">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-0 placeholder:text-slate-500"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block text-sm text-slate-300">
      <span className="mb-1 block">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none">
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function LoadingState() { return <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center text-slate-400">Loading DSA tracker…</div>; }
function EmptyState() { return <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-10 text-center text-slate-400">No problems yet. Add your first problem to get started.</div>; }

export default function DSATrackerPage() {
  return (
    <ProtectedRoute>
      <DSATrackerContent />
    </ProtectedRoute>
  );
}
