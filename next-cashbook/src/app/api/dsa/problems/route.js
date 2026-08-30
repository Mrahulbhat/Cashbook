import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DSAProblem from '@/models/DSAProblem';
import { getAuthUser } from '@/lib/getAuthUser';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();
        const problems = await DSAProblem.find({ userId: user.userId }).sort({ updatedAt: -1 });
        return NextResponse.json(problems, { status: 200 });
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

        const payload = await req.json();
        const { difficulty, title, topic, source, tags, problemUrl, solutionUrl, status, notes } = payload;

        if (!difficulty || !title || !topic || !source) {
            return NextResponse.json({ message: 'Difficulty, title, topic, and source are required' }, { status: 400 });
        }

        await dbConnect();

        const problem = await DSAProblem.create({
            userId: user.userId,
            difficulty,
            title: title.trim(),
            topic: topic.trim(),
            source: source.trim(),
            tags: Array.isArray(tags)
                ? tags.map((tag) => tag.trim()).filter(Boolean)
                : String(tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
            problemUrl: problemUrl || '',
            solutionUrl: solutionUrl || '',
            status: status || 'todo',
            notes: notes || '',
        });

        return NextResponse.json(problem, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
