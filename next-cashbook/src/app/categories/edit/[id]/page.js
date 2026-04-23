'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader, ChevronRight } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const EditCategoryContent = () => {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({ name: "", type: "expense", planningBucket: "None" });

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await axiosInstance.get(`/categories/${id}`);
                setFormData({
                    name: response.data.name,
                    type: response.data.type,
                    planningBucket: response.data.planningBucket || "None",
                });
            } catch (error) {
                toast.error("Failed to fetch category");
                router.push("/categories");
            } finally {
                setFetching(false);
            }
        };
        fetchCategory();
    }, [id, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.put(`/categories/${id}`, formData);
            toast.success("Category updated!");
            router.push("/categories");
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="min-h-screen bg-black flex justify-center items-center"><Loader className="animate-spin text-purple-500" /></div>;

    return (
        <div className="min-h-screen bg-black p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
                <button id="BackBtn" onClick={() => router.back()} className="flex items-center gap-2 mb-8 text-gray-400"><ArrowLeft size={18} /> Back</button>
                <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800">
                    <h1 className="text-2xl font-bold text-white mb-8">Edit Category</h1>
                    <form id="EditCategoryForm" onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Category Name</label>
                            <input id="NameInput" type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none" required />
                        </div>
                        <div className="flex gap-4">
                            {['income', 'expense', 'investment'].map(t => (
                                <label key={t} className="flex items-center gap-2 text-gray-300 capitalize cursor-pointer">
                                    <input id={`TypeRadio-${t}`} type="radio" checked={formData.type === t} onChange={() => setFormData({ ...formData, type: t })} /> {t}
                                </label>
                            ))}
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Planning Bucket</label>
                            <div className="relative">
                                <select
                                    id="PlanningBucketDropdown"
                                    value={formData.planningBucket}
                                    onChange={e => setFormData({ ...formData, planningBucket: e.target.value })}
                                    className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none appearance-none cursor-pointer"
                                >
                                    {['None', 'Needs', 'Wants', 'Short Term', 'Long Term'].map(bucket => (
                                        <option key={bucket} value={bucket}>{bucket}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <ChevronRight size={18} className="rotate-90" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Assign this category to a financial bucket for tracking.</p>
                        </div>
                        <button id="SaveBtn" disabled={loading} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 transition-all flex justify-center items-center gap-2">
                            {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />} Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default function EditCategoryPage() {
    return <ProtectedRoute><EditCategoryContent /></ProtectedRoute>;
}
