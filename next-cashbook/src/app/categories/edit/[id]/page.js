'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const EditCategoryContent = () => {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({ name: "", type: "expense", parentCategory: "Needs", budget: "" });

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await axiosInstance.get(`/categories/${id}`);
                setFormData({
                    name: response.data.name,
                    type: response.data.type,
                    parentCategory: response.data.parentCategory,
                    budget: response.data.budget || "",
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
            await axiosInstance.put(`/categories/${id}`, {
                ...formData,
                budget: formData.budget ? parseFloat(formData.budget) : undefined,
            });
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
                <button onClick={() => router.back()} className="flex items-center gap-2 mb-8 text-gray-400"><ArrowLeft size={18} /> Back</button>
                <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800">
                    <h1 className="text-2xl font-bold text-white mb-8">Edit Category</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Category Name</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none" required />
                        </div>
                        <div className="flex gap-4">
                            {['income', 'expense'].map(t => (
                                <label key={t} className="flex items-center gap-2 text-gray-300 capitalize cursor-pointer">
                                    <input type="radio" checked={formData.type === t} onChange={() => setFormData({ ...formData, type: t })} /> {t}
                                </label>
                            ))}
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Budget (Optional)</label>
                            <input type="number" value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none" />
                        </div>
                        <button disabled={loading} className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 transition-all flex justify-center items-center gap-2">
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
