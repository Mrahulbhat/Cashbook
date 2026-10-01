import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Todo from '@/models/Todo';
import { getAuthUser } from '@/lib/getAuthUser';

const validWorkTypes = ['New Scripting', 'R&D', 'Regression', 'Other'];

export async function PUT(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { id } = await params;
        const payload = await req.json();
        if (payload.workType !== undefined && !validWorkTypes.includes(payload.workType)) {
            return NextResponse.json({ message: 'Invalid work type' }, { status: 400 });
        }
        await dbConnect();
        const todo = await Todo.findOne({ _id: id, userId: user.userId });
        if (!todo) return NextResponse.json({ message: 'To-do item not found' }, { status: 404 });
        if (payload.completed !== undefined && payload.completed !== todo.completed) {
            return NextResponse.json({ message: 'Reminders are cleared when done; add completed work from the Daily Work Log' }, { status: 400 });
        }

        if (payload.workTitle !== undefined) todo.workTitle = payload.workTitle.trim();
        if (payload.deadline !== undefined) todo.deadline = payload.deadline || null;
        if (payload.workType !== undefined) todo.workType = payload.workType;
        if (payload.completed !== undefined) {
            todo.completedAt = payload.completed
                ? (payload.completedAt || todo.completedAt || new Date())
                : null;
        } else if (payload.completedAt !== undefined) {
            todo.completedAt = payload.completedAt || null;
        }
        if (payload.isFavorite !== undefined) todo.isFavorite = Boolean(todo.completed && payload.isFavorite);

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