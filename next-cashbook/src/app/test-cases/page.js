'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit2, ExternalLink, Loader } from "lucide-react";
import { useTestStore } from "@/store/useTestStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import Modal from "@/components/Modal";

const TestCasesContent = () => {
    const router = useRouter();

    const {
        testCases,
        fetchTestCases,
        deleteTestCase,
        loading
    } = useTestStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchTestCases();
    }, [fetchTestCases]);

    const handleDeleteClick = (id) => {
        setSelectedTestCaseId(id);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedTestCaseId) {
            await deleteTestCase(selectedTestCaseId);
            setSelectedTestCaseId(null);
            setIsModalOpen(false);
        }
    };

    const filteredCases = testCases.filter((tc) =>
        tc.title?.toLowerCase().includes(search.toLowerCase()) ||
        tc.description?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading && testCases.length === 0) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader className="w-12 h-12 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">
                            Test Cases
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Manage your automation test cases
                        </p>
                    </div>

                    <button
                        onClick={() => router.push("/test-cases/add")}
                        className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold"
                    >
                        <Plus size={18} />
                        Create Test Case
                    </button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <p className="text-gray-400 text-sm">
                            Total Test Cases
                        </p>
                        <h2 className="text-3xl font-bold mt-2">
                            {testCases.length}
                        </h2>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <p className="text-gray-400 text-sm">
                            Automated
                        </p>
                        <h2 className="text-3xl font-bold mt-2 text-green-400">
                            {
                                testCases.filter(
                                    (tc) =>
                                        tc.status?.toLowerCase() === "automated"
                                ).length
                            }
                        </h2>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <p className="text-gray-400 text-sm">
                            Other Status
                        </p>
                        <h2 className="text-3xl font-bold mt-2 text-yellow-400">
                            {
                                testCases.filter(
                                    (tc) =>
                                        tc.status?.toLowerCase() !== "automated"
                                ).length
                            }
                        </h2>
                    </div>

                </div>

                {/* Search */}
                <div className="mb-8">
                    <input
                        type="text"
                        placeholder="Search test cases..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                    />
                </div>

                {/* Test Cases */}
                {filteredCases.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {filteredCases.map((testCase) => (
                            <div
                                key={testCase._id}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold">
                                            {testCase.title}
                                        </h3>

                                        <span
                                            className={`inline-flex mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                                testCase.status?.toLowerCase() === "automated"
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-yellow-500/20 text-yellow-400"
                                            }`}
                                        >
                                            {testCase.status}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <a
                                            href={`/test-cases/${testCase._id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="Open test case in a new tab"
                                            aria-label={`Open ${testCase.title} in a new tab`}
                                            className="p-2 rounded-lg hover:bg-slate-700"
                                        >
                                            <ExternalLink
                                                size={18}
                                                className="text-gray-300"
                                            />
                                        </a>

                                        <a
                                            href={`/test-cases/edit/${testCase._id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="Edit test case in a new tab"
                                            aria-label={`Edit ${testCase.title} in a new tab`}
                                            className="p-2 rounded-lg hover:bg-blue-500/20"
                                        >
                                            <Edit2
                                                size={18}
                                                className="text-blue-400"
                                            />
                                        </a>

                                        <button
                                            onClick={() =>
                                                handleDeleteClick(testCase._id)
                                            }
                                            className="p-2 rounded-lg hover:bg-red-500/20"
                                        >
                                            <Trash2
                                                size={18}
                                                className="text-red-400"
                                            />
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-slate-800 pt-4">
                                    <p className="text-gray-300 leading-relaxed">
                                        {testCase.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
                        <h2 className="text-2xl font-bold mb-3">
                            No Test Cases Found
                        </h2>

                        <p className="text-gray-400 mb-6">
                            Create your first automation test case.
                        </p>

                        <button
                            onClick={() => router.push("/test-cases/add")}
                            className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl"
                        >
                            Create Test Case
                        </button>
                    </div>
                )}

                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Test Case"
                    message="Are you sure you want to delete this test case?"
                    confirmText="Delete"
                    type="danger"
                />
            </div>
        </div>
    );
};

export default function TestCasesPage() {
    return (
        <ProtectedRoute>
            <TestCasesContent />
        </ProtectedRoute>
    );
}