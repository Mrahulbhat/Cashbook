import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader } from "lucide-react";
import { useAccountStore } from "../store/useAccountStore";
import toast from "react-hot-toast";

const EditAccount = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { accounts, fetchAccounts, updateAccount, loading } = useAccountStore();

    const [accountData, setAccountData] = useState({ name: "", balance: 0 });
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const loadAccount = async () => {
            try {
                // Fetch all accounts if not already loaded
                if (!accounts.length) {
                    await fetchAccounts();
                }

                const account = accounts.find((acc) => acc._id === id);
                if (!account) {
                    toast.error("Account not found");
                    return navigate("/accounts");
                }

                setAccountData({ name: account.name, balance: account.balance });
            } catch (error) {
                console.error("Failed to load account:", error);
                toast.error("Failed to load account");
                navigate("/accounts");
            } finally {
                setLoadingData(false);
            }
        };

        loadAccount();
    }, [id, accounts, fetchAccounts, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAccountData((prev) => ({
            ...prev,
            [name]: name === "balance" ? value : value, // keep as string for input
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const balanceNumber = Number(accountData.balance);
        if (!accountData.name || isNaN(balanceNumber) || balanceNumber < 0) {
            toast.error("Please provide valid name and balance");
            return;
        }

        try {
            await updateAccount(id, { ...accountData, balance: balanceNumber });
            navigate("/accounts");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update account");
        }
    };


    if (loadingData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex justify-center items-center">
                <div className="text-center space-y-4">
                    <Loader className="w-12 h-12 animate-spin text-green-400 mx-auto" />
                    <p className="text-white text-lg">Loading account...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 p-4 pb-20">
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-3 mb-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-700/50 hover:border-blue-500/30 text-white px-6 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm transform hover:scale-105"
                >
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
                    <span className="font-medium">Back</span>
                </button>

                <div className="max-w-2xl mx-auto">
                    <div className="bg-gradient-to-br from-white via-gray-50 to-white text-black rounded-3xl shadow-2xl p-8 border border-gray-200/50 backdrop-blur-sm">
                        <h1 className="text-3xl font-bold mb-6">Edit Account</h1>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Account Name *
                                </label>
                                <input
                                id="editAccNameInputField"
                                    type="text"
                                    name="name"
                                    value={accountData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border-2 border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Balance *
                                </label>
                                <input
                                id="editBalanceInputField"
                                    type="number"
                                    name="balance"
                                    value={accountData.balance}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-3 border-2 border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                id="saveBtn"
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : "Update Account"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditAccount;
