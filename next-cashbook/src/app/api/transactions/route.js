import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import Account from '@/models/Account';
import Category from '@/models/Category';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();
        const transactions = await Transaction.find({ userId: user.userId })
            .populate('account')
            .populate('category')
            .sort({ date: -1 });

        return NextResponse.json(transactions, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        const { amount, type, description, category, date, account } = await req.json();

        if (!amount || !type || !category || !date || !account) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();
        const accountExists = await Account.findOne({ _id: account, userId: user.userId });
        if (!accountExists) {
            return NextResponse.json({ message: 'Account not found' }, { status: 404 });
        }

        const transaction = new Transaction({
            userId: user.userId,
            amount,
            type: type.toLowerCase(),
            description,
            category,
            date,
            account,
        });

        await transaction.save();

        const numAmount = Number(amount);
        if (transaction.type === 'income') {
            accountExists.balance += numAmount;
        } else {
            accountExists.balance -= numAmount;
        }

        await accountExists.save();

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
