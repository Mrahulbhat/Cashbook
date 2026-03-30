'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Loader, Sparkles, MessageCircle, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAccountStore } from '@/store/useAccountStore';
import { useCategoryStore } from '@/store/useCategoryStore';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your Cashbook AI assistant. I can help you analyze your spending, suggest budgets, or answer questions about your finances. How can I help today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    
    const messagesEndRef = useRef(null);
    const { transactions } = useTransactionStore();
    const { accounts } = useAccountStore();
    const { categories } = useCategoryStore();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare financial context
            const financialContext = {
                transactionCount: transactions.length,
                accountCount: accounts.length,
                totalBalance: accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0),
                recentTransactions: transactions.slice(0, 5).map(t => ({
                    amount: t.amount,
                    type: t.type,
                    category: t.category?.name || 'Unknown',
                    description: t.description,
                    date: new Date(t.date).toLocaleDateString()
                }))
            };

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: [...messages, userMessage],
                    context: financialContext
                }),
            });

            if (!res.ok) throw new Error("Failed to get AI response");

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please make sure your AI API key is configured correctly in the backend." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 active:scale-95"
                >
                    <Bot className="text-white w-8 h-8 group-hover:rotate-12 transition-transform" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse" />
                    
                    {/* Tooltip */}
                    <div className="absolute right-20 bg-gray-900 border border-gray-800 text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                       Financial AI Assistant
                    </div>
                </button>
            ) : (
                <div className="flex flex-col w-[380px] h-[550px] bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="p-4 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-600/20 rounded-xl border border-purple-500/30">
                                <Bot className="text-purple-400 w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-sm">Cashbook AI</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Online</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-auto p-4 space-y-4 scrollbar-hide">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm ${
                                    m.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                        : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none shadow-sm'
                                }`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-900 border border-gray-800 p-3.5 rounded-2xl rounded-tl-none">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Context Hints */}
                    {messages.length < 3 && !isLoading && (
                        <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
                            <button 
                                onClick={() => setInput("How's my spending this month?")}
                                className="flex-shrink-0 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-[11px] text-gray-400 hover:border-purple-500/50 hover:text-white transition-all"
                            >
                                Analysis
                            </button>
                            <button 
                                onClick={() => setInput("Top expenses by category?")}
                                className="flex-shrink-0 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-[11px] text-gray-400 hover:border-purple-500/50 hover:text-white transition-all"
                            >
                                Categories
                            </button>
                            <button 
                                onClick={() => setInput("Help me save money")}
                                className="flex-shrink-0 px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-[11px] text-gray-400 hover:border-purple-500/50 hover:text-white transition-all"
                            >
                                Tips
                            </button>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 bg-gray-900/30 border-t border-gray-800">
                        <form onSubmit={handleSend} className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Message Cashbook AI..."
                                className="w-full bg-gray-800 border border-gray-700/60 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 transition-all shadow-inner"
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-800 text-white rounded-lg transition-all shadow-lg active:scale-95"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                        <p className="text-[10px] text-center text-gray-600 mt-2">
                           Fin AI can make mistakes. Verify your accounting.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAssistant;
