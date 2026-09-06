import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';
import Account from '@/models/Account';
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
            .populate('toAccount')
            .populate('category')
            .sort({ date: -1, createdAt: -1 });

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

        const {
            amount,
            type,
            purchaseImportance,
            description,
            category,
            date,
            account,
            toAccount
        } = await req.json();

        if (!amount || !type || !date || !account) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        if (type !== "investment" && !category) {
            return NextResponse.json(
                { message: "Category is required" },
                { status: 400 }
            );
        }

        if (type.toLowerCase() === "expense" && !purchaseImportance) {
            return NextResponse.json(
                { message: "Purchase importance is required" },
                { status: 400 }
            );
        }

        if (type === "investment" && !toAccount) {
            return NextResponse.json(
                { message: "Destination account required" },
                { status: 400 }
            );
        }

        await dbConnect();

        const accountExists = await Account.findOne({
            _id: account,
            userId: user.userId
        });

        if (!accountExists) {
            return NextResponse.json(
                { message: "Account not found" },
                { status: 404 }
            );
        }

        let destinationAccount = null;

        if (type === "investment") {
            destinationAccount = await Account.findOne({
                _id: toAccount,
                userId: user.userId
            });

            if (!destinationAccount) {
                return NextResponse.json(
                    { message: "Destination account not found" },
                    { status: 404 }
                );
            }
        }


        const transaction = new Transaction({
            userId: user.userId,
            amount,
            type: type.toLowerCase(),
            purchaseImportance: type.toLowerCase() === "expense" ? purchaseImportance : undefined,
            description,
            category: type === "investment" ? undefined : category,
            date,
            account,
            toAccount
        });

        await transaction.save();

        const numAmount = Number(amount);

        if (transaction.type === "income") {
            accountExists.balance += numAmount;
        }
        else if (transaction.type === "expense") {
            accountExists.balance -= numAmount;
        }
        else if (transaction.type === "investment") {
            accountExists.balance -= numAmount;
            destinationAccount.balance += numAmount;

            await destinationAccount.save();
        }

        await accountExists.save();

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
