'use client';

import React, { useState, useEffect, useMemo } from "react";
import { 
    Dumbbell, Plus, Trash2, Edit2, CheckCircle, 
    ChevronRight, History, Activity, Save, X, 
    Search, Filter, Calendar, Loader, Trash, List,
    ChevronDown, ChevronUp, MoreVertical, PlusCircle
} from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useSearchParams, useRouter } from "next/navigation";

const EXERCISE_CATEGORIES = [
    "chest", "legs", "back", "shoulders", "biceps", "triceps", "arms", "pushups", "cardio"
];

const GymTrackerContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabParam = searchParams.get('tab') || 'workout';
    
    const [activeTab, setActiveTab] = useState(tabParam);
    const [exercises, setExercises] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setActiveTab(tabParam);
    }, [tabParam]);

    const handleTabChange = (newTab) => {
        router.push(`/gym?tab=${newTab}`);
    };

    // Exercise form state
    const [showExerciseForm, setShowExerciseForm] = useState(false);
    const [editingExercise, setEditingExercise] = useState(null);
    const [exerciseForm, setExerciseForm] = useState({ name: "", category: "chest" });

    // Workout logging state
    const [currentWorkout, setCurrentWorkout] = useState({
        date: new Date().toISOString().split('T')[0],
        exercises: [],
        notes: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [exRes, workoutRes] = await Promise.all([
                axiosInstance.get("/gym/exercises"),
                axiosInstance.get("/gym/workouts")
            ]);
            setExercises(exRes.data);
            setWorkouts(workoutRes.data);
        } catch (error) {
            toast.error("Failed to load gym data");
        } finally {
            setLoading(false);
        }
    };

    const handleExerciseSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            if (editingExercise) {
                const res = await axiosInstance.put(`/gym/exercises/${editingExercise._id}`, exerciseForm);
                setExercises(exercises.map(ex => ex._id === editingExercise._id ? res.data : ex));
                toast.success("Exercise updated");
            } else {
                const res = await axiosInstance.post("/gym/exercises", exerciseForm);
                setExercises([...exercises, res.data]);
                toast.success("Exercise added");
            }
            setShowExerciseForm(false);
            setEditingExercise(null);
            setExerciseForm({ name: "", category: "chest" });
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    const deleteExercise = async (id) => {
        if (!confirm("Are you sure? This will not delete past workout logs but will remove it from future selections.")) return;
        try {
            await axiosInstance.delete(`/gym/exercises/${id}`);
            setExercises(exercises.filter(ex => ex._id !== id));
            toast.success("Exercise deleted");
        } catch (error) {
            toast.error("Failed to delete exercise");
        }
    };

    const addExerciseToWorkout = (exercise) => {
        const alreadyExists = currentWorkout.exercises.find(e => e.exerciseId?._id === exercise._id || e.exerciseId === exercise._id);
        if (alreadyExists) {
            toast.error("Exercise already added to this workout");
            return;
        }

        setCurrentWorkout({
            ...currentWorkout,
            exercises: [
                ...currentWorkout.exercises,
                {
                    exerciseId: exercise,
                    sets: [{ reps: "", weight: "", notes: "" }]
                }
            ]
        });
    };

    const updateSet = (exerciseIndex, setIndex, field, value) => {
        const updatedExercises = [...currentWorkout.exercises];
        updatedExercises[exerciseIndex].sets[setIndex][field] = value;
        setCurrentWorkout({ ...currentWorkout, exercises: updatedExercises });
    };

    const addSet = (exerciseIndex) => {
        const updatedExercises = [...currentWorkout.exercises];
        const lastSet = updatedExercises[exerciseIndex].sets[updatedExercises[exerciseIndex].sets.length - 1];
        updatedExercises[exerciseIndex].sets.push({ 
            reps: lastSet?.reps || "", 
            weight: lastSet?.weight || "", 
            notes: "" 
        });
        setCurrentWorkout({ ...currentWorkout, exercises: updatedExercises });
    };

    const removeSet = (exerciseIndex, setIndex) => {
        const updatedExercises = [...currentWorkout.exercises];
        if (updatedExercises[exerciseIndex].sets.length === 1) return;
        updatedExercises[exerciseIndex].sets.splice(setIndex, 1);
        setCurrentWorkout({ ...currentWorkout, exercises: updatedExercises });
    };

    const removeExerciseFromWorkout = (index) => {
        const updatedExercises = [...currentWorkout.exercises];
        updatedExercises.splice(index, 1);
        setCurrentWorkout({ ...currentWorkout, exercises: updatedExercises });
    };

    const saveWorkout = async () => {
        if (currentWorkout.exercises.length === 0) {
            toast.error("Add at least one exercise");
            return;
        }

        // Validate sets
        for (const ex of currentWorkout.exercises) {
            for (const set of ex.sets) {
                if (!set.reps || !set.weight) {
                    toast.error("Please fill all reps and weight fields");
                    return;
                }
            }
        }

        try {
            setSaving(true);
            const payload = {
                ...currentWorkout,
                exercises: currentWorkout.exercises.map(ex => ({
                    exerciseId: ex.exerciseId._id || ex.exerciseId,
                    sets: ex.sets
                }))
            };
            const res = await axiosInstance.post("/gym/workouts", payload);
            setWorkouts([res.data, ...workouts]);
            setCurrentWorkout({
                date: new Date().toISOString().split('T')[0],
                exercises: [],
                notes: ""
            });
            toast.success("Workout logged successfully!");
            handleTabChange("history");
        } catch (error) {
            toast.error("Failed to save workout");
        } finally {
            setSaving(false);
        }
    };

    const deleteWorkout = async (id) => {
        if (!confirm("Are you sure you want to delete this workout log?")) return;
        try {
            await axiosInstance.delete(`/gym/workouts/${id}`);
            setWorkouts(workouts.filter(w => w._id !== id));
            toast.success("Workout deleted");
        } catch (error) {
            toast.error("Failed to delete workout");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex justify-center items-center">
                <Loader className="w-12 h-12 animate-spin text-orange-400" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-black overflow-hidden pb-20">
            {/* Background Glows */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[150px]"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
                <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                            <Dumbbell className="text-orange-400 w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Gym Tracker</h1>
                            <p className="text-gray-400 font-medium">Track your gains and consistency</p>
                        </div>
                    </div>

                    <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-800">
                        {[
                            { id: "workout", icon: Activity, label: "Log" },
                            { id: "exercises", icon: List, label: "Exercises" },
                            { id: "history", icon: History, label: "History" }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    activeTab === tab.id 
                                    ? "bg-orange-500 text-white shadow-lg shadow-orange-900/20" 
                                    : "text-gray-400 hover:text-white"
                                }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Exercises Tab */}
                {activeTab === "exercises" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">My Exercises</h2>
                            <button 
                                onClick={() => {
                                    setEditingExercise(null);
                                    setExerciseForm({ name: "", category: "chest" });
                                    setShowExerciseForm(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold transition-all"
                            >
                                <Plus size={18} /> Add Exercise
                            </button>
                        </div>

                        {showExerciseForm && (
                            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 mb-8">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                                    {editingExercise ? "Edit Exercise" : "New Exercise"}
                                    <button onClick={() => setShowExerciseForm(false)} className="text-gray-500 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </h3>
                                <form onSubmit={handleExerciseSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Name</label>
                                        <input 
                                            type="text"
                                            required
                                            value={exerciseForm.name}
                                            onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })}
                                            className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-orange-500/50 transition-all"
                                            placeholder="e.g. Bench Press"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Category</label>
                                        <select 
                                            value={exerciseForm.category}
                                            onChange={(e) => setExerciseForm({ ...exerciseForm, category: e.target.value })}
                                            className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl py-3 px-4 text-white font-bold focus:outline-none focus:border-orange-500/50 transition-all appearance-none"
                                        >
                                            {EXERCISE_CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <button 
                                            type="submit"
                                            disabled={saving}
                                            className="w-full py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-lg shadow-orange-900/20 active:scale-95 flex justify-center items-center gap-2"
                                        >
                                            {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            {editingExercise ? "Update Exercise" : "Create Exercise"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {exercises.length === 0 ? (
                                <div className="col-span-full py-20 text-center text-gray-500">
                                    <Dumbbell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p className="text-lg font-bold">No exercises added yet</p>
                                    <p>Start by adding some of your favorite exercises</p>
                                </div>
                            ) : (
                                exercises.map(ex => (
                                    <div key={ex._id} className="bg-gray-900/40 border border-gray-800/50 rounded-2xl p-5 flex items-center justify-between group hover:bg-gray-900/60 transition-all">
                                        <div>
                                            <h3 className="text-white font-bold text-lg">{ex.name}</h3>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20">
                                                {ex.category}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => {
                                                    setEditingExercise(ex);
                                                    setExerciseForm({ name: ex.name, category: ex.category });
                                                    setShowExerciseForm(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => deleteExercise(ex._id)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Workout Tab */}
                {activeTab === "workout" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Activity className="text-orange-400" />
                                    New Session
                                </h2>
                                <input 
                                    type="date"
                                    value={currentWorkout.date}
                                    onChange={(e) => setCurrentWorkout({ ...currentWorkout, date: e.target.value })}
                                    className="bg-gray-800/50 border border-gray-700/50 rounded-xl py-2 px-4 text-white font-bold focus:outline-none focus:border-orange-500/50"
                                />
                            </div>

                            {/* Exercise Selector */}
                            <div className="mb-8">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-4 px-1">Add Exercise to session</label>
                                <div className="flex flex-wrap gap-2">
                                    {exercises.map(ex => (
                                        <button
                                            key={ex._id}
                                            onClick={() => addExerciseToWorkout(ex)}
                                            className="px-4 py-2 bg-gray-800/50 hover:bg-orange-500/20 border border-gray-700/50 hover:border-orange-500/30 rounded-xl text-gray-300 hover:text-white text-sm font-bold transition-all"
                                        >
                                            + {ex.name}
                                        </button>
                                    ))}
                                    <button 
                                        onClick={() => setActiveTab("exercises")}
                                        className="px-4 py-2 border border-dashed border-gray-700 rounded-xl text-gray-500 text-sm font-bold hover:border-gray-500 hover:text-gray-300 transition-all"
                                    >
                                        Create New
                                    </button>
                                </div>
                            </div>

                            {/* Session Exercises */}
                            <div className="space-y-6">
                                {currentWorkout.exercises.length === 0 ? (
                                    <div className="py-12 text-center text-gray-600 bg-gray-900/30 rounded-3xl border border-dashed border-gray-800">
                                        <PlusCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p className="font-bold">Session is empty</p>
                                        <p className="text-sm">Select exercises above to start logging</p>
                                    </div>
                                ) : (
                                    currentWorkout.exercises.map((ex, exIdx) => (
                                        <div key={exIdx} className="bg-gray-900/60 border border-gray-800 rounded-3xl overflow-hidden">
                                            <div className="bg-gray-800/40 p-4 px-6 flex items-center justify-between border-b border-gray-800">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 font-bold text-xs">
                                                        {exIdx + 1}
                                                    </span>
                                                    <h3 className="text-white font-bold">{ex.exerciseId.name}</h3>
                                                    <span className="text-[10px] font-black uppercase text-gray-500">{ex.exerciseId.category}</span>
                                                </div>
                                                <button 
                                                    onClick={() => removeExerciseFromWorkout(exIdx)}
                                                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                            <div className="p-6">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="text-left">
                                                            <th className="text-[10px] font-black text-gray-500 uppercase tracking-widest pb-3 px-2">Set</th>
                                                            <th className="text-[10px] font-black text-gray-500 uppercase tracking-widest pb-3 px-2">Weight (kg)</th>
                                                            <th className="text-[10px] font-black text-gray-500 uppercase tracking-widest pb-3 px-2">Reps</th>
                                                            <th className="text-[10px] font-black text-gray-500 uppercase tracking-widest pb-3 px-2">Notes</th>
                                                            <th className="w-10 pb-3"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="space-y-2">
                                                        {ex.sets.map((set, setIdx) => (
                                                            <tr key={setIdx} className="group">
                                                                <td className="py-2 px-2">
                                                                    <div className="w-6 h-6 rounded-md bg-gray-800 flex items-center justify-center text-gray-500 font-bold text-[10px]">
                                                                        {setIdx + 1}
                                                                    </div>
                                                                </td>
                                                                <td className="py-2 px-2">
                                                                    <input 
                                                                        type="number"
                                                                        value={set.weight}
                                                                        onChange={(e) => updateSet(exIdx, setIdx, "weight", e.target.value)}
                                                                        placeholder="0"
                                                                        className="w-20 bg-gray-800/50 border border-gray-700/50 rounded-lg py-2 px-3 text-white font-bold focus:outline-none focus:border-orange-500/30"
                                                                    />
                                                                </td>
                                                                <td className="py-2 px-2">
                                                                    <input 
                                                                        type="number"
                                                                        value={set.reps}
                                                                        onChange={(e) => updateSet(exIdx, setIdx, "reps", e.target.value)}
                                                                        placeholder="0"
                                                                        className="w-20 bg-gray-800/50 border border-gray-700/50 rounded-lg py-2 px-3 text-white font-bold focus:outline-none focus:border-orange-500/30"
                                                                    />
                                                                </td>
                                                                <td className="py-2 px-2">
                                                                    <input 
                                                                        type="text"
                                                                        value={set.notes}
                                                                        onChange={(e) => updateSet(exIdx, setIdx, "notes", e.target.value)}
                                                                        placeholder="Optional"
                                                                        className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-orange-500/30"
                                                                    />
                                                                </td>
                                                                <td className="py-2 px-2 text-right">
                                                                    <button 
                                                                        onClick={() => removeSet(exIdx, setIdx)}
                                                                        className="p-1.5 text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                                    >
                                                                        <Trash size={14} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                <button 
                                                    onClick={() => addSet(exIdx)}
                                                    className="mt-4 flex items-center gap-2 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
                                                >
                                                    <PlusCircle size={14} /> Add Set
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-800">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 px-1">Session Notes</label>
                                <textarea 
                                    value={currentWorkout.notes}
                                    onChange={(e) => setCurrentWorkout({ ...currentWorkout, notes: e.target.value })}
                                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-2xl py-4 px-6 text-white font-medium focus:outline-none focus:border-orange-500/50 transition-all min-h-[100px]"
                                    placeholder="How was the workout today?"
                                />
                                
                                <button 
                                    onClick={saveWorkout}
                                    disabled={saving || currentWorkout.exercises.length === 0}
                                    className="w-full mt-6 py-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 text-white rounded-2xl font-black text-lg tracking-tight transition-all shadow-xl shadow-orange-900/40 active:scale-95 flex justify-center items-center gap-3"
                                >
                                    {saving ? <Loader className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
                                    Finish Workout
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* History Tab */}
                {activeTab === "history" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">Workout History</h2>
                            <div className="bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-2 text-sm text-gray-400 font-bold">
                                {workouts.length} Sessions Total
                            </div>
                        </div>

                        {workouts.length === 0 ? (
                            <div className="py-20 text-center text-gray-500 bg-gray-900/20 rounded-[2.5rem] border border-gray-800/50">
                                <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="text-lg font-bold">No sessions logged yet</p>
                                <p>Your gainz will appear here once you finish a workout</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {workouts.map((workout) => (
                                    <div key={workout._id} className="bg-gray-900/40 border border-gray-800 rounded-[2rem] overflow-hidden">
                                        <div className="p-6 pb-2 flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                                    <Calendar size={20} className="text-gray-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold text-xl">
                                                        {new Date(workout.date).toLocaleDateString('en-IN', { 
                                                            weekday: 'long', 
                                                            day: 'numeric', 
                                                            month: 'long' 
                                                        })}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                                                        <Activity size={12} className="text-orange-500" />
                                                        {workout.exercises.length} Exercises
                                                        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                                                        {workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)} Total Sets
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => deleteWorkout(workout._id)}
                                                className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                        <div className="p-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {workout.exercises.map((ex, idx) => (
                                                    <div key={idx} className="bg-black/40 rounded-2xl p-4 border border-gray-800/50">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-white font-bold text-sm">{ex.exerciseId?.name || "Exercise Deleted"}</span>
                                                            <span className="text-[10px] font-black uppercase text-gray-600 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
                                                                {ex.exerciseId?.category}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            {ex.sets.map((set, sIdx) => (
                                                                <div key={sIdx} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                                                                    <span className="text-gray-500">Set {sIdx + 1}</span>
                                                                    <span className="text-gray-300 font-bold">
                                                                        {set.weight}kg <span className="text-gray-600">x</span> {set.reps}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {workout.notes && (
                                                <div className="mt-6 p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl">
                                                    <p className="text-xs font-black text-orange-500/50 uppercase tracking-widest mb-1">Notes</p>
                                                    <p className="text-sm text-gray-400 italic">"{workout.notes}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default function GymTrackerPage() {
    return (
        <ProtectedRoute>
            <GymTrackerContent />
        </ProtectedRoute>
    );
}
