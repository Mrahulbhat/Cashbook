import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Todo from '@/models/Todo';
import { getAuthUser } from '@/lib/getAuthUser';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        await dbConnect();
        const todos = await Todo.find({ userId: user.userId }).sort({ completed: 1, deadline: 1, createdAt: -1 });
        return NextResponse.json(todos, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { workTitle, deadline, priority } = await req.json();
        if (!workTitle?.trim() || !deadline || !priority) {
            return NextResponse.json({ message: 'Work title, deadline, and priority are required' }, { status: 400 });
        }

        await dbConnect();
        const todo = await Todo.create({
            userId: user.userId,
            workTitle: workTitle.trim(),
            deadline,
            priority,
        });
        return NextResponse.json(todo, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}