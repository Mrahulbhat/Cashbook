import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Todo from '@/models/Todo';
import { getAuthUser } from '@/lib/getAuthUser';

export async function PUT(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { id } = await params;
        const payload = await req.json();
        await dbConnect();
        const todo = await Todo.findOne({ _id: id, userId: user.userId });
        if (!todo) return NextResponse.json({ message: 'To-do item not found' }, { status: 404 });

        if (payload.workTitle !== undefined) todo.workTitle = payload.workTitle.trim();
        if (payload.deadline !== undefined) todo.deadline = payload.deadline;
        if (payload.priority !== undefined) todo.priority = payload.priority;
        if (payload.completed !== undefined) todo.completed = payload.completed;

        await todo.save();
        return NextResponse.json(todo, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { id } = await params;
        await dbConnect();
        const deleted = await Todo.findOneAndDelete({ _id: id, userId: user.userId });
        if (!deleted) return NextResponse.json({ message: 'To-do item not found' }, { status: 404 });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}