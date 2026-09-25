import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DSAFriendship from '@/models/DSAFriendship';
import User from '@/models/User';
import { getAuthUser } from '@/lib/getAuthUser';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        await dbConnect();
        const [users, relationships] = await Promise.all([
            User.find({ _id: { $ne: user.userId } }).select('name email').sort({ name: 1 }),
            DSAFriendship.find({
                $or: [{ requesterId: user.userId }, { recipientId: user.userId }],
            })
                .populate('requesterId', 'name email')
                .populate('recipientId', 'name email')
                .sort({ createdAt: -1 }),
        ]);

        const friends = [];
        const incomingRequests = [];
        const outgoingRequests = [];
        const userStates = new Map();

        for (const relationship of relationships) {
            const requester = relationship.requesterId;
            const recipient = relationship.recipientId;
            const isRequester = requester._id.toString() === user.userId;
            const otherUser = isRequester ? recipient : requester;

            if (relationship.status === 'accepted') {
                friends.push(otherUser);
                userStates.set(otherUser._id.toString(), 'friend');
            } else if (relationship.status === 'pending' && isRequester) {
                outgoingRequests.push({ _id: relationship._id, user: otherUser });
                userStates.set(otherUser._id.toString(), 'outgoing');
            } else if (relationship.status === 'pending') {
                incomingRequests.push({ _id: relationship._id, user: otherUser });
                userStates.set(otherUser._id.toString(), 'incoming');
            }
        }

        return NextResponse.json({
            friends,
            incomingRequests,
            outgoingRequests,
            users: users.map((item) => ({
                _id: item._id,
                name: item.name,
                email: item.email,
                relationship: userStates.get(item._id.toString()) || 'none',
            })),
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { targetUserId } = await req.json();
        if (!targetUserId) {
            return NextResponse.json({ message: 'User is required' }, { status: 400 });
        }
        if (targetUserId.toString() === user.userId) {
            return NextResponse.json({ message: 'You cannot add yourself as a friend' }, { status: 400 });
        }

        await dbConnect();
        const targetUser = await User.findById(targetUserId).select('_id');
        if (!targetUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const existing = await DSAFriendship.findOne({
            $or: [
                { requesterId: user.userId, recipientId: targetUserId },
                { requesterId: targetUserId, recipientId: user.userId },
            ],
        });

        if (existing?.status === 'accepted') {
            return NextResponse.json({ message: 'You are already friends' }, { status: 409 });
        }
        if (existing?.status === 'pending') {
            return NextResponse.json({ message: 'A friend request is already pending' }, { status: 409 });
        }

        if (existing) {
            existing.requesterId = user.userId;
            existing.recipientId = targetUserId;
            existing.status = 'pending';
            await existing.save();
            return NextResponse.json({ message: 'Friend request sent' }, { status: 200 });
        }

        await DSAFriendship.create({ requesterId: user.userId, recipientId: targetUserId });
        return NextResponse.json({ message: 'Friend request sent' }, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ message: 'A friend request is already pending' }, { status: 409 });
        }
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}