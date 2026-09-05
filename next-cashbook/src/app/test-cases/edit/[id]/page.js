'use client';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Save,
    Plus,
    Loader,
    ClipboardList,
    Trash2
} from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const EditTestCaseContent = () => {
    const router = useRouter();
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        status: "Not Automated",
        steps: [""],
    });

    useEffect(() => {
        const fetchTestCase = async () => {
            try {
                const response = await axiosInstance.get(`/tests/${id}`);

                setFormData({
                    title: response.data.title || "",
                    description: response.data.description || "",
                    status: response.data.status || "Not Automated",
                    steps: response.data.steps?.length ? response.data.steps : [""],
                });
            } catch (error) {
                toast.error("Failed to fetch test case");
                router.push("/test-cases");
            } finally {
                setFetching(false);
            }
        };

        if (id) {
            fetchTestCase();
        }
    }, [id, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.title.trim() ||
            !formData.status
        ) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);

        try {
            await axiosInstance.put(`/tests/${id}`, {
                title: formData.title,
                description: formData.description,
                status: formData.status,
                steps: formData.steps.map((step) => step.trim()).filter(Boolean),
            });

            toast.success("Test case updated successfully!");
            router.push("/test-cases");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to update test case"
            );
        } finally {
            setLoading(false);
        }
    };

    const updateStep = (index, value) => {
        setFormData((prev) => ({
            ...prev,
            steps: prev.steps.map((step, stepIndex) => stepIndex === index ? value : step),
        }));
    };

    const addStep = () => {
        setFormData((prev) => ({ ...prev, steps: [...prev.steps, ""] }));
    };

    const removeStep = (index) => {
        setFormData((prev) => ({
            ...prev,
            steps: prev.steps.length === 1 ? [""] : prev.steps.filter((_, stepIndex) => stepIndex !== index),
        }));
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-black flex justify-center items-center">
                <Loader className="animate-spin text-blue-500 w-10 h-10" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-4 sm:p-8">
            <div className="max-w-3xl mx-auto">

                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 mb-8 text-gray-400 hover:text-white"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800">

                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-blue-600 rounded-lg">
                            <ClipboardList className="text-white" />
                        </div>

                        <h1 className="text-2xl font-bold text-white">
                            Edit Test Case
                        </h1>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                Title
                            </label>

                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm text-gray-400">Test Steps</label>
                                <button type="button" onClick={addStep} className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
                                    <Plus size={16} /> Add step
                                </button>
                            </div>
                            <div className="space-y-3">
                                {formData.steps.map((step, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <span className="w-7 text-center text-sm text-gray-500">{index + 1}</span>
                                        <input
                                            type="text"
                                            value={step}
                                            onChange={(e) => updateStep(index, e.target.value)}
                                            placeholder="Enter the action or expected result"
                                            className="flex-1 p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-blue-500"
                                        />
                                        <button type="button" onClick={() => removeStep(index)} title="Remove step" aria-label={`Remove step ${index + 1}`} className="p-2 text-gray-500 hover:text-red-400">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                Description
                            </label>

                            <textarea
                                rows={6}
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-blue-500 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                Status
                            </label>

                            <select
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        status: e.target.value,
                                    })
                                }
                                className="w-full p-4 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-blue-500"
                            >
                                <option value="Not Automated">Not Automated</option>
                                <option value="Automated">Automated</option>
                                <option value="Partial">Partial</option>
                                <option value="Blocked">Blocked</option>
                                <option value="Obselete">Obselete</option>
                            </select>
                        </div>

                        <div className="flex gap-4">

                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 py-4 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition-all"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <Loader
                                        className="animate-spin"
                                        size={18}
                                    />
                                ) : (
                                    <Save size={18} />
                                )}

                                Save Changes
                            </button>

                        </div>

                    </form>

                </div>
            </div>
        </div>
    );
};

export default function EditTestCasePage() {
    return (
        <ProtectedRoute>
            <EditTestCaseContent />
        </ProtectedRoute>
    );
}
