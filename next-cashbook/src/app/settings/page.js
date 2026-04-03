'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { Settings, Trash2, UserX, ArrowLeft, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/Modal";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const SettingsPageContent = () => {
    const router = useRouter();
    const { logout } = useAuth();
    const [modalConfig, setModalConfig] = React.useState({ isOpen: false, type: '', action: null });

    const openConfirmModal = (type) => {
        setModalConfig({
            isOpen: true,
            type: type,
            title: type === 'wipe' ? 'Wipe All Data?' : 'Delete Account Forever?',
            message: type === 'wipe' 
                ? 'This will permanently delete all your transactions, financial accounts, and categories. This action cannot be reversed.'
                : 'Your entire account and all your data will be permanently erased. There is no coming back from this.',
            confirmText: type === 'wipe' ? 'Yes, wipe it all' : 'Delete my account',
            action: type === 'wipe' ? handleWipe : handleDeleteAccount
        });
    };

    const handleWipe = async () => {
        try {
            const res = await fetch('/api/user?action=wipe', { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                router.refresh();
            } else {
                toast.error(data.message || 'Something went wrong');
            }
        } catch (error) {
            toast.error('Failed to perform action');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const res = await fetch('/api/user', { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success(data.message);
                logout();
                router.push('/login');
            } else {
                toast.error(data.message || 'Something went wrong');
            }
        } catch (error) {
            toast.error('Failed to perform action');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 sm:p-12 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="mb-12">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                    </button>
                    <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-gray-900 border border-gray-800 rounded-2xl">
                            <Settings className="text-purple-500 w-8 h-8" />
                        </div>
                        Settings
                    </h1>
                    <p className="text-gray-500 mt-4 text-lg">Manage your account preferences and data safety.</p>
                </header>

                <div className="grid grid-cols-1 gap-8">
                    {/* Security & Data Section */}
                    <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] p-8 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-8">
                            <ShieldAlert className="text-amber-500" size={24} />
                            <h2 className="text-xl font-bold">Data Management & Privacy</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Wipe Data */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-gray-900/60 border border-gray-800/60 rounded-3xl group hover:border-amber-500/30 transition-all">
                                <div className="max-w-md">
                                    <h3 className="text-lg font-bold text-white mb-2">Fresh Restart (Wipe All Data)</h3>
                                    <p className="text-sm text-gray-400">Keep your login session but delete all transactions, accounts, and categories. Perfect if you want to start tracking from scratch.</p>
                                </div>
                                <button 
                                    onClick={() => openConfirmModal('wipe')}
                                    className="px-6 py-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl hover:bg-amber-500 hover:text-white transition-all font-bold flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    Wipe My Data
                                </button>
                            </div>

                            {/* Delete Account */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-gray-900/60 border border-gray-800/60 rounded-3xl group hover:border-red-500/30 transition-all">
                                <div className="max-w-md">
                                    <h3 className="text-lg font-bold text-white mb-2">Delete Account Permanently</h3>
                                    <p className="text-sm text-gray-400">This will completely remove your user profile and all associated data from our servers. This action is irreversible.</p>
                                </div>
                                <button 
                                    onClick={() => openConfirmModal('delete')}
                                    className="px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-bold flex items-center justify-center gap-2"
                                >
                                    <UserX size={18} />
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Information Footer */}
                    <div className="text-center py-6">
                        <p className="text-gray-600 text-sm">You are currently logged in. Your data is encrypted and secure.</p>
                    </div>
                </div>
            </div>

            <Modal 
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={modalConfig.action}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                type="danger"
            />
        </div>
    );
};

export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <SettingsPageContent />
        </ProtectedRoute>
    );
}
