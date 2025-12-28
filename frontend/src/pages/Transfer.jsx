import React, { useState } from 'react';
import { axiosInstance as axios } from '../lib/axios';

const Transfer = () => {
  const [sourceAccount, setSourceAccount] = useState('');
  const [destinationAccount, setDestinationAccount] = useState('');
  const [amount, setAmount] = useState('');

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/transaction/transfer', {
        fromAccountId: sourceAccount,
        toAccountId: destinationAccount,
        amount,
      });
      alert(response.data.message);
    } catch (error) {
      console.error(error);
      alert('Transfer failed');
    }
  }; 

  return (
    <form onSubmit={handleTransfer}>
      <h2>Transfer Amount</h2>
      <input
        type="text"
        placeholder="Source Account ID"
        value={sourceAccount}
        onChange={(e) => setSourceAccount(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Destination Account ID"
        value={destinationAccount}
        onChange={(e) => setDestinationAccount(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <button type="submit">Transfer</button>
    </form>
  );
};

export default Transfer;