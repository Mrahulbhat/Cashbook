'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Plus,
    Loader,
    ClipboardList
} from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const AddTestCaseContent = () => {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "Active",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.title.trim() ||
            !formData.description.trim() ||
            !formData.status
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);

        try {
            await axiosInstance.post("/tests", {
                title: formData.title,
                description: formData.description,
                status: formData.status,
            });

            toast.success("Test case created successfully!");

            router.push("/test-cases");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to create test case"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black p-4 pb-20 relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">

                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 mb-6 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">

                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-blue-600 rounded-lg">
                            <ClipboardList className="text-white" />
                        </div>

                        <h1 className="text-2xl font-bold text-white">
                            Add New Test Case
                        </h1>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                Title *
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Login Validation Test"
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                Description *
                            </label>

                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={6}
                                placeholder="Describe the test scenario..."
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white resize-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-400 mb-2">
                                Status *
                            </label>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                            >
                                <option value="Active">Active</option>
                                <option value="Draft">Draft</option>
                                <option value="Blocked">Blocked</option>
                                <option value="Deprecated">Deprecated</option>
                            </select>
                        </div>

                        <div className="flex gap-4">

                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-500 flex items-center justify-center gap-2 transition-transform transform hover:scale-105"
                            >
                                {loading ? (
                                    <Loader
                                        className="animate-spin"
                                        size={18}
                                    />
                                ) : (
                                    <Plus size={18} />
                                )}

                                Create Test Case
                            </button>

                        </div>

                    </form>

                </div>
            </div>
        </div>
    );
};

export default function AddTestCasePage() {
    return (
        <ProtectedRoute>
            <AddTestCaseContent />
        </ProtectedRoute>
    );
}