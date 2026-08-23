import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import Tests from '@/models/Testcases';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { id } = await params;
        await dbConnect();
        const test = await Tests.findOne({ _id: id});
        if (!test) return NextResponse.json({ message: 'Test case not found' }, { status: 404 });

        return NextResponse.json(test, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { id } = await params;
        const { title, description, status } = await req.json();

        await dbConnect();
        const test = await Tests.findOne({ $or: [{ _id: id }, { testCaseId: id }] });
        if (!test) return NextResponse.json({ message: 'Test case not found' }, { status: 404 });

        if (title && title !== test.title) {
            const existingTest = await Tests.findOne({ title });
            if (existingTest) return NextResponse.json({ message: 'Test case with this title already exists' }, { status: 400 });
            test.title = title;
        }

        if (description !== undefined) {
            test.description = description;
        }

        if (status !== undefined) {
            test.status = status;
        }

        const updatedTest = await test.save();
        return NextResponse.json(updatedTest, { status: 200 });
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
        const test = await Tests.findOne({ $or: [{ _id: id }, { testCaseId: id }] });
        if (!test) return NextResponse.json({ message: 'Test case not found' }, { status: 404 });

        await Tests.findByIdAndDelete(test._id);
        return NextResponse.json({ message: 'Test case deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
