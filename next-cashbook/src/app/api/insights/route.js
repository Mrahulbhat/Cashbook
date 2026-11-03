import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { getAuthUser } from '@/lib/getAuthUser';
import Transaction from '@/models/Transaction';

export const dynamic = 'force-dynamic';

const startOfMonth = (date, offset = 0) =>
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));

const getTransactions = async (userId) => {
    await dbConnect();
    return Transaction.find({ userId })
        .select('amount type date description purchaseImportance category')
        .populate({ path: 'category', select: 'name' })
        .sort({ date: -1, createdAt: -1 })
        .lean();
};

const getSummary = (transactions, now = new Date()) => {
    const currentMonthStart = startOfMonth(now);
    const nextMonthStart = startOfMonth(now, 1);
    const monthTransactions = transactions.filter((transaction) => {
        const date = new Date(transaction.date);
        return date >= currentMonthStart && date < nextMonthStart;
    });

    const sumType = (items, type) =>
        items.reduce((sum, transaction) =>
            transaction.type === type ? sum + Number(transaction.amount || 0) : sum, 0);

    const categoryTotals = new Map();
    for (const transaction of monthTransactions) {
        if (transaction.type !== 'expense') continue;
        const name = transaction.category?.name || 'Uncategorized';
        categoryTotals.set(name, (categoryTotals.get(name) || 0) + Number(transaction.amount || 0));
    }

    const categories = [...categoryTotals.entries()]
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount);

    const largestExpense = monthTransactions
        .filter((transaction) => transaction.type === 'expense')
        .sort((a, b) => Number(b.amount) - Number(a.amount))[0];

    return {
        transactionCount: transactions.length,
        month: {
            income: sumType(monthTransactions, 'income'),
            expenses: sumType(monthTransactions, 'expense'),
            investments: sumType(monthTransactions, 'investment'),
            transactionCount: monthTransactions.length,
            categories: categories.slice(0, 5),
            largestExpense: largestExpense ? {
                amount: Number(largestExpense.amount),
                description: largestExpense.description || '',
                category: largestExpense.category?.name || 'Uncategorized',
                date: largestExpense.date,
            } : null,
        },
    };
};

const getPeriod = (question, now = new Date()) => {
    const normalized = question.toLowerCase();
    if (/\ball[\s-]?time\b|\boverall\b|\bever\b|\bso far\b/.test(normalized)) {
        return { label: 'all time', start: null, end: null };
    }
    if (/\blast month\b|\bprevious month\b/.test(normalized)) {
        return { label: 'last month', start: startOfMonth(now, -1), end: startOfMonth(now) };
    }
    if (/\blast year\b|\bprevious year\b/.test(normalized)) {
        return {
            label: 'last year',
            start: new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1)),
            end: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)),
        };
    }
    if (/\bthis year\b|\byear to date\b/.test(normalized)) {
        return { label: 'this year', start: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)), end: null };
    }
    const daysMatch = normalized.match(/\b(?:last|past)\s+(\d{1,3})\s+days?\b/);
    if (daysMatch) {
        const days = Math.min(Number(daysMatch[1]), 3650);
        const end = new Date(now);
        return { label: `the last ${days} days`, start: new Date(end.getTime() - days * 86400000), end };
    }
    return { label: 'this month', start: startOfMonth(now), end: startOfMonth(now, 1) };
};

const formatMoney = (amount) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);

const getAnswer = (question, transactions, now = new Date()) => {
    const normalized = question.toLowerCase();
    const period = getPeriod(normalized, now);
    const inPeriod = transactions.filter((transaction) => {
        const date = new Date(transaction.date);
        return (!period.start || date >= period.start) && (!period.end || date < period.end);
    });

    let type = null;
    if (/\binvest(?:ment|ments|ing)?\b/.test(normalized)) type = 'investment';
    else if (/\bincome\b|\bearn(?:ing|ings)?\b|\bsalary\b/.test(normalized)) type = 'income';
    else if (/\bexpense(?:s)?\b|\bspend(?:ing)?\b|\bspent\b|\bpurchase(?:s)?\b|\bbuy\b|\bbought\b/.test(normalized)) {
        type = 'expense';
    }

    let matching = inPeriod.filter((transaction) => !type || transaction.type === type);
    const categoryNames = [...new Set(
        transactions.map((transaction) => transaction.category?.name).filter(Boolean)
    )].sort((a, b) => b.length - a.length);
    const categoryMatch = categoryNames.find((name) => normalized.includes(name.toLowerCase()));
    if (categoryMatch) {
        matching = matching.filter((transaction) =>
            transaction.category?.name?.toLowerCase() === categoryMatch.toLowerCase());
    } else {
        const ignoredWords = new Set([
            'a', 'about', 'all', 'and', 'are', 'average', 'breakdown', 'by', 'category',
            'compare', 'did', 'do', 'does', 'for', 'from', 'give', 'how', 'i', 'in',
            'income', 'invest', 'investment', 'investments', 'investing', 'is', 'it',
            'last', 'list', 'me', 'month', 'much', 'my', 'of', 'on', 'or', 'overall',
            'past', 'purchase', 'purchases', 'show', 'spend', 'spending', 'spent',
            'this', 'those', 'to', 'total', 'transaction', 'transactions', 'where',
            'what', 'which', 'year', 'ytd', 'days', 'day', 'ever', 'so', 'far',
            'expense', 'expenses', 'earning', 'earnings', 'salary', 'buy', 'bought',
            'highest', 'largest', 'biggest', 'most', 'expensive', 'many', 'count',
            'net', 'saved', 'save', 'savings', 'money',
        ]);
        const terms = normalized.match(/[a-z0-9]+/g)?.filter((word) =>
            word.length > 2 && !ignoredWords.has(word));
        if (terms?.length) {
            matching = matching.filter((transaction) => {
                const searchableText = `${transaction.description || ''} ${transaction.category?.name || ''}`.toLowerCase();
                return terms.some((term) => searchableText.includes(term));
            });
        }
    }

    const sum = matching.reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
    const label = categoryMatch ? `${categoryMatch} ` : '';
    const typeLabel = type === 'income' ? 'income' : type === 'investment' ? 'investments' : 'spending';

    if (/\b(highest|largest|biggest|most expensive|top)\b/.test(normalized) && !/\bcategories?\b/.test(normalized)) {
        const largest = matching.reduce((highest, transaction) =>
            !highest || Number(transaction.amount) > Number(highest.amount) ? transaction : highest, null);
        if (!largest) return `I couldn't find any matching transactions for ${period.label}.`;
        const date = new Date(largest.date).toLocaleDateString('en-IN', { dateStyle: 'medium', timeZone: 'UTC' });
        return `Your largest ${type === 'income' ? 'income' : type === 'investment' ? 'investment' : 'expense'}${label ? ` in ${categoryMatch}` : ''} ${period.label === 'all time' ? 'all time' : `for ${period.label}`} was ${formatMoney(Number(largest.amount))}${largest.description ? ` for "${largest.description}"` : ''} (${largest.category?.name || 'Uncategorized'}, ${date}).`;
    }

    if (/\bhow many\b|\bcount\b|\bnumber of\b/.test(normalized)) {
        return `You have ${matching.length} matching ${matching.length === 1 ? 'transaction' : 'transactions'} for ${period.label}.`;
    }

    if (/\blist\b|\bshow\b|\bwhat did i\b|\btransactions\b/.test(normalized) && matching.length) {
        const recent = matching.slice(0, 5).map((transaction) => {
            const date = new Date(transaction.date).toLocaleDateString('en-IN', { dateStyle: 'medium', timeZone: 'UTC' });
            const description = transaction.description ? ` — ${transaction.description}` : '';
            return `${date}: ${formatMoney(Number(transaction.amount))}${description}`;
        });
        const suffix = matching.length > recent.length ? ` Showing the ${recent.length} most recent of ${matching.length}.` : '';
        return `${recent.join('; ')}.${suffix}`;
    }

    if (/\bsav(?:e|ed|ings)\b|\bnet\b|\bcash flow\b/.test(normalized)) {
        const income = inPeriod.filter((transaction) => transaction.type === 'income')
            .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
        const expenses = inPeriod.filter((transaction) => transaction.type === 'expense')
            .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
        const investments = inPeriod.filter((transaction) => transaction.type === 'investment')
            .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
        return `For ${period.label}, income was ${formatMoney(income)}, expenses were ${formatMoney(expenses)}, and investments were ${formatMoney(investments)}. Your net cash flow after expenses and investments was ${formatMoney(income - expenses - investments)}.`;
    }

    if (/\bwhere\b|\bcategory\b|\bcategories\b|\bbreakdown\b/.test(normalized)) {
        const totals = new Map();
        for (const transaction of inPeriod.filter((item) => item.type === 'expense')) {
            const name = transaction.category?.name || 'Uncategorized';
            totals.set(name, (totals.get(name) || 0) + Number(transaction.amount || 0));
        }
        const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
        if (!ranked.length) return `There are no expenses to break down for ${period.label}.`;
        return `Your top spending categories for ${period.label} are ${ranked.map(([name, amount]) => `${name} (${formatMoney(amount)})`).join(', ')}.`;
    }

    if (/\baverage\b|\bavg\b/.test(normalized)) {
        if (!matching.length) return `I couldn't find any matching transactions for ${period.label}.`;
        return `Your average ${typeLabel} transaction${categoryMatch ? ` in ${categoryMatch}` : ''} for ${period.label} was ${formatMoney(sum / matching.length)} across ${matching.length} transactions.`;
    }

    if (type || categoryMatch || /\bhow much\b|\btotal\b|\bspend\b|\bspent\b|\bincome\b|\binvestment\b/.test(normalized)) {
        if (!matching.length) return `You have no matching transactions for ${period.label}.`;
        return `Your ${label}${typeLabel} for ${period.label} totals ${formatMoney(sum)} across ${matching.length} transaction${matching.length === 1 ? '' : 's'}.`;
    }

    return 'I can answer questions about your spending, income, investments, category breakdowns, largest transactions, transaction counts, and net cash flow. Try asking “How much did I spend this month?” or “Where did my money go last month?”';
};

export async function GET(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const transactions = await getTransactions(user.userId);
        return NextResponse.json(getSummary(transactions), { status: 200 });
    } catch (error) {
        console.error('Failed to generate transaction insights:', error);
        return NextResponse.json({ message: 'Failed to generate insights' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ message: 'Request body must be valid JSON' }, { status: 400 });
        }

        const question = typeof body?.question === 'string' ? body.question.trim() : '';
        if (!question || question.length > 300) {
            return NextResponse.json({ message: 'Question must be between 1 and 300 characters' }, { status: 400 });
        }

        const transactions = await getTransactions(user.userId);
        return NextResponse.json({ answer: getAnswer(question, transactions) }, { status: 200 });
    } catch (error) {
        console.error('Failed to answer transaction question:', error);
        return NextResponse.json({ message: 'Failed to answer your question' }, { status: 500 });
    }
}
