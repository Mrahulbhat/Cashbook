import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DSAFriendship from '@/models/DSAFriendship';
import { getAuthUser } from '@/lib/getAuthUser';

export async function PATCH(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { id } = await params;
        const { action } = await req.json();
        if (!['accept', 'reject'].includes(action)) {
            return NextResponse.json({ message: 'Invalid friend request action' }, { status: 400 });
        }

        await dbConnect();
        const friendship = await DSAFriendship.findOne({
            _id: id,
            recipientId: user.userId,
            status: 'pending',
        });
        if (!friendship) {
            return NextResponse.json({ message: 'Incoming friend request not found' }, { status: 404 });
        }

        friendship.status = action === 'accept' ? 'accepted' : 'rejected';
        await friendship.save();
        return NextResponse.json({ message: action === 'accept' ? 'Friend request accepted' : 'Friend request rejected' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}