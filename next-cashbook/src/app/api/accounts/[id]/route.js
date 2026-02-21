import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Account from '@/models/Account';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const account = await Account.findOne({ _id: id, userId: user.userId });
        if (!account) return NextResponse.json({ message: 'Account not found' }, { status: 404 });

        return NextResponse.json(account, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { id } = params;
        const { name, balance } = await req.json();

        await dbConnect();
        const account = await Account.findOne({ _id: id, userId: user.userId });
        if (!account) return NextResponse.json({ message: 'Account not found' }, { status: 404 });

        if (name && name !== account.name) {
            const existingAccount = await Account.findOne({ name, userId: user.userId });
            if (existingAccount) return NextResponse.json({ message: 'Account with this name already exists' }, { status: 400 });
            account.name = name;
        }

        if (balance !== undefined) {
            account.balance = balance;
        }

        const updatedAccount = await account.save();
        return NextResponse.json(updatedAccount, { status: 200 });
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
        const account = await Account.findOne({ _id: id, userId: user.userId });
        if (!account) return NextResponse.json({ message: 'Account not found' }, { status: 404 });

        await Account.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Account deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
