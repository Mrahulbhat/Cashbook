import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import WorkoutLog from '@/models/WorkoutLog';
import { getAuthUser } from '@/lib/getAuthUser';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');

        await dbConnect();
        let query = { userId: user.userId };
        
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const workouts = await WorkoutLog.find(query)
            .populate('exercises.exerciseId')
            .sort({ date: -1 });
            
        return NextResponse.json(workouts, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { date, exercises, notes } = await req.json();

        await dbConnect();
        const newWorkout = new WorkoutLog({
            userId: user.userId,
            date: date || new Date(),
            exercises,
            notes
        });

        await newWorkout.save();
        
        const populatedWorkout = await WorkoutLog.findById(newWorkout._id).populate('exercises.exerciseId');
        
        return NextResponse.json(populatedWorkout, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
