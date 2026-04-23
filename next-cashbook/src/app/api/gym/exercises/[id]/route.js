import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Exercise from '@/models/Exercise';
import { getAuthUser } from '@/lib/getAuthUser';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { id } = params;
        const { name, category } = await req.json();

        await dbConnect();
        const updatedExercise = await Exercise.findOneAndUpdate(
            { _id: id, userId: user.userId },
            { name, category },
            { new: true }
        );

        if (!updatedExercise) return NextResponse.json({ message: 'Exercise not found' }, { status: 404 });

        return NextResponse.json(updatedExercise, { status: 200 });
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
        const deletedExercise = await Exercise.findOneAndDelete({ _id: id, userId: user.userId });

        if (!deletedExercise) return NextResponse.json({ message: 'Exercise not found' }, { status: 404 });

        return NextResponse.json({ message: 'Exercise deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
