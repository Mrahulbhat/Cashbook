import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DSAProblem from '@/models/DSAProblem';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        await dbConnect();
        const problem = await DSAProblem.findOne({ _id: params.id, userId: user.userId });
        if (!problem) return NextResponse.json({ message: 'Problem not found' }, { status: 404 });

        return NextResponse.json(problem, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const payload = await req.json();
        const { difficulty, title, topic, source, tags, problemUrl, solutionUrl, status, notes } = payload;

        await dbConnect();
        const problem = await DSAProblem.findOne({ _id: params.id, userId: user.userId });
        if (!problem) return NextResponse.json({ message: 'Problem not found' }, { status: 404 });

        problem.difficulty = difficulty || problem.difficulty;
        problem.title = title?.trim() || problem.title;
        problem.topic = topic?.trim() || problem.topic;
        problem.source = source?.trim() || problem.source;
        problem.tags = Array.isArray(tags)
            ? tags.map((tag) => tag.trim()).filter(Boolean)
            : String(tags || '').split(',').map((tag) => tag.trim()).filter(Boolean);
        problem.problemUrl = problemUrl || '';
        problem.solutionUrl = solutionUrl || '';
        problem.status = status || problem.status;
        problem.notes = notes || '';

        await problem.save();
        return NextResponse.json(problem, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const payload = await req.json();
        await dbConnect();
        const problem = await DSAProblem.findOne({ _id: params.id, userId: user.userId });
        if (!problem) return NextResponse.json({ message: 'Problem not found' }, { status: 404 });

        if (payload.status) problem.status = payload.status;
        if (payload.notes !== undefined) problem.notes = payload.notes;
        await problem.save();

        return NextResponse.json(problem, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        await dbConnect();
        const deleted = await DSAProblem.findOneAndDelete({ _id: params.id, userId: user.userId });
        if (!deleted) return NextResponse.json({ message: 'Problem not found' }, { status: 404 });

        return NextResponse.json({ success: true, message: 'Problem deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
