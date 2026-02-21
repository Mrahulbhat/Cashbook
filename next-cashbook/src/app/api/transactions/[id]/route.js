import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import Account from '@/models/Account';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const transaction = await Transaction.findOne({ _id: id, userId: user.userId })
            .populate('account')
            .populate('category');

        if (!transaction) return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });

        return NextResponse.json(transaction, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { id } = params;
        const body = await req.json();
        const { amount, type, description, category, date, account } = body;

        await dbConnect();
        const transaction = await Transaction.findOne({ _id: id, userId: user.userId });
        if (!transaction) return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });

        let oldAccount = await Account.findOne({ _id: transaction.account, userId: user.userId });
        const oldAmount = Number(transaction.amount);

        // Revert old balance
        if (transaction.type === 'income') {
            oldAccount.balance -= oldAmount;
        } else {
            oldAccount.balance += oldAmount;
        }

        if (account && account !== transaction.account.toString()) {
            const newAccount = await Account.findOne({ _id: account, userId: user.userId });
            if (!newAccount) return NextResponse.json({ message: 'New account not found' }, { status: 404 });
            await oldAccount.save();
            oldAccount = newAccount;
        }

        transaction.amount = amount ?? transaction.amount;
        transaction.type = type ? type.toLowerCase() : transaction.type;
        transaction.description = description ?? transaction.description;
        transaction.category = category ?? transaction.category;
        transaction.date = date ?? transaction.date;
        transaction.account = account ?? transaction.account;

        const newAmount = Number(transaction.amount);
        if (transaction.type === 'income') {
            oldAccount.balance += newAmount;
        } else {
            oldAccount.balance -= newAmount;
        }

        await transaction.save();
        await oldAccount.save();

        return NextResponse.json(transaction, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const transaction = await Transaction.findOne({ _id: id, userId: user.userId });
        if (!transaction) return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });

        const account = await Account.findById(transaction.account);
        const amount = Number(transaction.amount);

        if (transaction.type === 'income') {
            account.balance -= amount;
        } else {
            account.balance += amount;
        }

        await account.save();
        await Transaction.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Transaction deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
