import React, { useEffect, useState } from 'react';
import { axiosInstance as axios } from '../lib/axios';
import toast from 'react-hot-toast';

const Transfer = () => {
  const [accounts, setAccounts] = useState([]);
  const [sourceAccount, setSourceAccount] = useState('');
  const [destinationAccount, setDestinationAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get('/account');
        setAccounts(res.data || []);
      } catch (err) {
        console.error('Failed to load accounts', err);
        toast.error('Failed to load accounts');
      }
    };

    fetchAccounts();
  }, []);

  const getBalance = (accountId) => {
    const acc = accounts.find((a) => a._id === accountId);
    return acc ? acc.balance : null;
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!sourceAccount || !destinationAccount) {
      toast.error('Please select both accounts');
      return;
    }
    if (sourceAccount === destinationAccount) {
      toast.error('Source and destination must be different');
      return;
    }

    const amountNum = Number(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    const sourceBalance = getBalance(sourceAccount);
    if (sourceBalance !== null && amountNum > sourceBalance) {
      toast.error('Insufficient balance in source account');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/transaction/transfer', {
        fromAccountId: sourceAccount,
        toAccountId: destinationAccount,
        amount: amountNum,
      });

      toast.success(response.data.message || 'Transfer successful');

      // Optionally show created transactions returned by API
      if (response.data.expense && response.data.income) {
        toast.success(`Expense created (${response.data.expense.amount}) and Income created (${response.data.income.amount})`);
      }

      // Refresh accounts list to update balances
      const res = await axios.get('/account');
      setAccounts(res.data || []);

      // Reset form
      setSourceAccount('');
      setDestinationAccount('');
      setAmount('');
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-8 bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Transfer Amount</h2>

      <form onSubmit={handleTransfer} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">From (source)</label>
          <select
            value={sourceAccount}
            onChange={(e) => setSourceAccount(e.target.value)}
            className="w-full p-2 rounded bg-black/40 border border-gray-700 text-white"
            required
          >
            <option value="">Select source account</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.name} — balance: {acc.balance}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">To (destination)</label>
          <select
            value={destinationAccount}
            onChange={(e) => setDestinationAccount(e.target.value)}
            className="w-full p-2 rounded bg-black/40 border border-gray-700 text-white"
            required
          >
            <option value="">Select destination account</option>
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.name} — balance: {acc.balance}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Amount</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 rounded bg-black/40 border border-gray-700 text-white"
            placeholder="Enter amount"
            required
          />
        </div>

        {sourceAccount && (
          <div className="text-sm text-gray-300">Source balance: {getBalance(sourceAccount)}</div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            {loading ? 'Transferring...' : 'Transfer'}
          </button>

          <button
            type="button"
            onClick={() => { setSourceAccount(''); setDestinationAccount(''); setAmount(''); }}
            className="px-4 py-2 rounded bg-gray-800 text-gray-200"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default Transfer;