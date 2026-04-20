import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UpcomingExpense from '@/models/UpcomingExpense';
import { getAuthUser } from '@/lib/getAuthUser';

export async function DELETE(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        const { id } = params;
        await dbConnect();

        const deleted = await UpcomingExpense.findOneAndDelete({ 
            _id: id, 
            userId: user.userId 
        });

        if (!deleted) {
            return NextResponse.json({ message: 'Upcoming expense not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PATCH(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        const { id } = params;
        const updates = await req.json();
        
        await dbConnect();
        const updated = await UpcomingExpense.findOneAndUpdate(
            { _id: id, userId: user.userId },
            { $set: updates },
            { new: true }
        ).populate('category');

        if (!updated) {
            return NextResponse.json({ message: 'Upcoming expense not found' }, { status: 404 });
        }

        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
