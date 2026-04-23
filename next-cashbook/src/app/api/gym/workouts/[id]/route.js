import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import WorkoutLog from '@/models/WorkoutLog';
import { getAuthUser } from '@/lib/getAuthUser';

export const dynamic = 'force-dynamic';

export async function PUT(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { id } = params;
        const { date, exercises, notes } = await req.json();

        await dbConnect();
        const updatedWorkout = await WorkoutLog.findOneAndUpdate(
            { _id: id, userId: user.userId },
            { date, exercises, notes },
            { new: true }
        ).populate('exercises.exerciseId');

        if (!updatedWorkout) return NextResponse.json({ message: 'Workout not found' }, { status: 404 });

        return NextResponse.json(updatedWorkout, { status: 200 });
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
        const deletedWorkout = await WorkoutLog.findOneAndDelete({ _id: id, userId: user.userId });

        if (!deletedWorkout) return NextResponse.json({ message: 'Workout not found' }, { status: 404 });

        return NextResponse.json({ message: 'Workout deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
