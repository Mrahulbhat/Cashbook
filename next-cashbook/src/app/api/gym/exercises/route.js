import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Exercise from '@/models/Exercise';
import { getAuthUser } from '@/lib/getAuthUser';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        await dbConnect();
        const exercises = await Exercise.find({ userId: user.userId }).sort({ name: 1 });
        return NextResponse.json(exercises, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { name, category } = await req.json();
        if (!name || !category) return NextResponse.json({ message: 'Name and category are required' }, { status: 400 });

        await dbConnect();
        const existingExercise = await Exercise.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, userId: user.userId });
        if (existingExercise) return NextResponse.json({ message: 'Exercise already exists' }, { status: 400 });

        const newExercise = new Exercise({
            name,
            category,
            userId: user.userId
        });

        await newExercise.save();
        return NextResponse.json(newExercise, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
