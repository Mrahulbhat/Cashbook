import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import UpcomingExpense from '@/models/UpcomingExpense';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();
        const upcoming = await UpcomingExpense.find({ 
            userId: user.userId,
            status: 'pending'
        })
        .populate('category')
        .sort({ dueDate: 1 });

        return NextResponse.json(upcoming, { status: 200 });
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

        const { amount, description, category, dueDate } = await req.json();

        if (!amount || !category || !dueDate) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();
        const upcomingExpense = new UpcomingExpense({
            userId: user.userId,
            amount,
            description,
            category,
            dueDate,
            status: 'pending'
        });

        await upcomingExpense.save();

        return NextResponse.json(upcomingExpense, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
