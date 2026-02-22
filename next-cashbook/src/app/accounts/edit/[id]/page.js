'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const EditAccountContent = () => {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({ name: "", balance: "" });

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const response = await axiosInstance.get(`/accounts/${id}`);
                setFormData({ name: response.data.name, balance: response.data.balance });
            } catch (error) {
                toast.error("Failed to fetch account details");
                router.push("/accounts");
            } finally {
                setFetching(false);
            }
        };
        fetchAccount();
    }, [id, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.put(`/accounts/${id}`, {
                name: formData.name,
                balance: parseFloat(formData.balance),
            });
            toast.success("Account updated successfully!");
            router.push("/accounts");
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="min-h-screen bg-black flex justify-center items-center"><Loader className="animate-spin text-blue-500" /></div>;

    return (
        <div className="min-h-screen bg-black p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
                <button id="BackBtn" onClick={() => router.back()} className="flex items-center gap-2 mb-8 text-gray-400"><ArrowLeft size={18} /> Back</button>
                <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800">
                    <h1 className="text-2xl font-bold text-white mb-8">Edit Account</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Account Name</label>
                            <input id="editAccNameInputField" type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none" required />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Balance</label>
                            <input id="editBalanceInputField" type="number" value={formData.balance} onChange={e => setFormData({ ...formData, balance: e.target.value })} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none" required />
                        </div>
                        <div className="flex gap-4">
                            <button id="cancelBtn" type="button" onClick={() => router.back()} className="flex-1 py-4 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition-all">Cancel</button>
                            <button id="saveBtn" disabled={loading} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all flex justify-center items-center gap-2">
                                {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />} Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default function EditAccountPage() {
    return <ProtectedRoute><EditAccountContent /></ProtectedRoute>;
}
