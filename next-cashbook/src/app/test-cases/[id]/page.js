'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList, Edit2, Loader } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import ProtectedRoute from "@/components/ProtectedRoute";

const TestCaseDetailContent = () => {
    const { id } = useParams();
    const router = useRouter();
    const [testCase, setTestCase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTestCase = async () => {
            try {
                const response = await axiosInstance.get(`/tests/${id}`);
                setTestCase(response.data);
            } catch (fetchError) {
                setError(fetchError.response?.data?.message || "Failed to load test case");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchTestCase();
    }, [id]);

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center"><Loader className="animate-spin text-blue-500" /></div>;
    }

    if (error || !testCase) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center"><p>{error || "Test case not found"}</p></div>;
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => window.close()} className="flex items-center gap-2 text-gray-400 hover:text-white">
                        <ArrowLeft size={18} /> Close tab
                    </button>
                    <button onClick={() => router.push(`/test-cases/edit/${testCase._id}`)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">
                        <Edit2 size={16} /> Edit
                    </button>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8">
                    <div className="flex items-start gap-4 mb-8">
                        <div className="p-3 bg-blue-600 rounded-lg"><ClipboardList /></div>
                        <div>
                            <h1 className="text-3xl font-bold">{testCase.title}</h1>
                            <span className="inline-flex mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">{testCase.status}</span>
                        </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-8">{testCase.description}</p>
                    <h2 className="text-lg font-semibold mb-4">Test Steps</h2>
                    {testCase.steps?.length ? (
                        <ol className="space-y-3">
                            {testCase.steps.map((step, index) => <li key={`${step}-${index}`} className="flex gap-3 bg-gray-800 rounded-xl p-4"><span className="text-blue-400 font-semibold">{index + 1}.</span><span className="text-gray-200">{step}</span></li>)}
                        </ol>
                    ) : <p className="text-gray-500">No steps added yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default function TestCaseDetailPage() {
    return <ProtectedRoute><TestCaseDetailContent /></ProtectedRoute>;
}