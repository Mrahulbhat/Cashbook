import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import Account from '@/models/Account';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();
        const accounts = await Account.find({ userId: user.userId });
        return NextResponse.json(accounts, { status: 200 });
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

        const { name, balance } = await req.json();

        if (!name || balance === undefined) {
            return NextResponse.json({ message: 'Missing required fields: name, balance' }, { status: 400 });
        }

        await dbConnect();
        const existingAccount = await Account.findOne({ name, userId: user.userId });
        if (existingAccount) {
            return NextResponse.json({ message: 'Account with this name already exists' }, { status: 400 });
        }

        const account = new Account({ userId: user.userId, name, balance });
        const savedAccount = await account.save();

        return NextResponse.json(savedAccount, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
