import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import Tests from '@/models/Testcases';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();
        const tests = await Tests.find({});
        return NextResponse.json(tests, { status: 200 });
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

        const { title, description, status, steps = [] } = await req.json();

        if (!title || !description || !status) {
            return NextResponse.json({ message: 'Missing required fields: title, description, status' }, { status: 400 });
        }

        await dbConnect();
        const existingTest = await Tests.findOne({ title });
        if (existingTest) {
            return NextResponse.json({ message: 'Test case with this title already exists' }, { status: 400 });
        }

        const count = await Tests.countDocuments();
        const testCaseId = `TC-${String(count + 1).padStart(3, '0')}`;

        const test = new Tests({ testCaseId, title, description, status, steps });
        const savedTest = await test.save();

        return NextResponse.json(savedTest, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
