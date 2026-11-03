'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Bot, LoaderCircle, LockKeyhole, Send, Sparkles, Wallet } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import ProtectedRoute from '@/components/ProtectedRoute';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount || 0);

const suggestedQuestions = [
    'How much did I spend this month?',
    'Where did my money go this month?',
    'What was my largest expense this month?',
    'How much did I invest this year?',
];

function InsightsContent() {
    const [summary, setSummary] = useState(null);
    const [summaryError, setSummaryError] = useState('');
    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(true);
    const [isAsking, setIsAsking] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        let active = true;
        axiosInstance.get('/insights')
            .then(({ data }) => {
                if (active) setSummary(data);
            })
            .catch((error) => {
                if (active) setSummaryError(error.response?.data?.message || 'Could not load your financial insights.');
            })
            .finally(() => {
                if (active) setIsLoadingSummary(false);
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, isAsking]);

    const askQuestion = async (text = question) => {
        const trimmedQuestion = text.trim();
        if (!trimmedQuestion || isAsking) return;

        setQuestion('');
        setMessages((current) => [...current, { role: 'user', text: trimmedQuestion }]);
        setIsAsking(true);
        try {
            const { data } = await axiosInstance.post('/insights', { question: trimmedQuestion });
            setMessages((current) => [...current, { role: 'assistant', text: data.answer }]);
        } catch (error) {
            setMessages((current) => [...current, {
                role: 'assistant',
                text: error.response?.data?.message || 'I couldn’t answer that right now. Please try again.',
                error: true,
            }]);
        } finally {
            setIsAsking(false);
        }
    };

    const month = summary?.month;
    const net = month ? month.income - month.expenses - month.investments : 0;
    const maxCategorySpend = Math.max(1, ...(month?.categories || []).map((category) => category.amount));

    return (
        <div className="min-h-full px-4 py-8 text-slate-100 sm:px-8">
            <div className="mx-auto max-w-6xl space-y-8 pb-12">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-200">
                            <Sparkles className="size-3.5" />
                            Private, transaction-based insights
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Financial insights</h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
                            Get a clear picture of your cash flow, then ask questions about your transactions.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs text-slate-400">
                        <LockKeyhole className="size-4 text-emerald-400" />
                        Your financial data stays in Cashbook
                    </div>
                </header>

                {summaryError && (
                    <div role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                        {summaryError}
                    </div>
                )}

                <section aria-label="This month's summary">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white">This month</h2>
                            <p className="text-sm text-slate-400">Based on {month?.transactionCount || 0} transactions</p>
                        </div>
                        <Wallet className="hidden size-5 text-slate-500 sm:block" />
                    </div>
                    {isLoadingSummary ? (
                        <div className="flex min-h-36 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70">
                            <LoaderCircle className="size-6 animate-spin text-violet-300" />
                        </div>
                    ) : !summaryError && (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {[
                                { label: 'Income', amount: month?.income, color: 'text-emerald-300' },
                                { label: 'Expenses', amount: month?.expenses, color: 'text-rose-300' },
                                { label: 'Investments', amount: month?.investments, color: 'text-sky-300' },
                                { label: 'Net cash flow', amount: net, color: net < 0 ? 'text-rose-300' : 'text-violet-200' },
                            ].map((item) => (
                                <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 shadow-lg shadow-black/10">
                                    <p className="text-sm text-slate-400">{item.label}</p>
                                    <p className={`mt-3 text-2xl font-semibold ${item.color}`}>{formatCurrency(item.amount)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {!isLoadingSummary && !summaryError && (
                    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                        <section className="rounded-2xl border border-slate-800 bg-slate-900/75 p-5 sm:p-6">
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold text-white">Where your money went</h2>
                                <p className="mt-1 text-sm text-slate-400">Top expense categories this month</p>
                            </div>
                            {month?.categories?.length ? (
                                <ul className="space-y-4">
                                    {month.categories.map((category) => (
                                        <li key={category.name}>
                                            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                                <span className="truncate text-slate-200">{category.name}</span>
                                                <span className="shrink-0 font-medium text-white">{formatCurrency(category.amount)}</span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400"
                                                    style={{ width: `${Math.max(4, (category.amount / maxCategorySpend) * 100)}%` }}
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-400">
                                    No expense transactions recorded this month yet.
                                </p>
                            )}
                            {month?.largestExpense && (
                                <div className="mt-6 flex items-start justify-between gap-4 border-t border-slate-800 pt-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-slate-500">Largest expense</p>
                                        <p className="mt-1 text-sm text-slate-200">
                                            {month.largestExpense.description || month.largestExpense.category}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-sm font-semibold text-white">
                                        {formatCurrency(month.largestExpense.amount)}
                                    </p>
                                </div>
                            )}
                        </section>

                        <section className="flex min-h-[430px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/75">
                            <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4 sm:px-6">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-violet-400/10 text-violet-200">
                                    <Bot className="size-5" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-white">Ask your finances</h2>
                                    <p className="text-xs text-slate-400">Answers are calculated from your Cashbook transactions</p>
                                </div>
                            </div>

                            <div aria-live="polite" className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
                                {!messages.length && (
                                    <div className="py-2">
                                        <p className="mb-4 text-sm text-slate-300">Try asking about your spending, income, investments, or cash flow.</p>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestedQuestions.map((suggestion) => (
                                                <button
                                                    type="button"
                                                    key={suggestion}
                                                    onClick={() => askQuestion(suggestion)}
                                                    disabled={isAsking}
                                                    className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-left text-xs text-slate-300 transition hover:border-violet-400/50 hover:text-white disabled:opacity-50"
                                                >
                                                    {suggestion}
                                                    <ArrowUpRight className="size-3 shrink-0 text-slate-500 group-hover:text-violet-300" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {messages.map((message, index) => (
                                    <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                                            message.role === 'user'
                                                ? 'bg-violet-500 text-white'
                                                : message.error
                                                    ? 'border border-rose-400/30 bg-rose-400/10 text-rose-200'
                                                    : 'border border-slate-700 bg-slate-950/75 text-slate-200'
                                        }`}>
                                            {message.text}
                                        </div>
                                    </div>
                                ))}
                                {isAsking && (
                                    <div className="flex justify-start">
                                        <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/75 px-4 py-3 text-sm text-slate-400">
                                            <LoaderCircle className="size-4 animate-spin" />
                                            Checking your transactions…
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    askQuestion();
                                }}
                                className="border-t border-slate-800 p-4 sm:p-5"
                            >
                                <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/80 p-2 focus-within:border-violet-400/60">
                                    <label htmlFor="finance-question" className="sr-only">Ask a question about your transactions</label>
                                    <input
                                        id="finance-question"
                                        type="text"
                                        maxLength={300}
                                        value={question}
                                        onChange={(event) => setQuestion(event.target.value)}
                                        placeholder="e.g. How much did I spend on food last month?"
                                        disabled={isAsking}
                                        className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500 disabled:opacity-60"
                                    />
                                    <button
                                        type="submit"
                                        aria-label="Send question"
                                        disabled={isAsking || !question.trim()}
                                        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-500 text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <Send className="size-4" />
                                    </button>
                                </div>
                                <p className="mt-2 text-center text-[11px] text-slate-500">
                                    Answers use your recorded transactions, not external financial data.
                                </p>
                            </form>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function InsightsPage() {
    return <ProtectedRoute><InsightsContent /></ProtectedRoute>;
}
