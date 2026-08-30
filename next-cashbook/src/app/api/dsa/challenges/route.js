import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DSAChallenge from '@/models/DSAChallenge';
import DSAProblem from '@/models/DSAProblem';
import User from '@/models/User';
import { getAuthUser } from '@/lib/getAuthUser';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();
        const challenges = await DSAChallenge.find({
            $or: [{ userId: user.userId }, { targetUserId: user.userId }],
        })
            .populate('problemId')
            .populate('userId', 'name email')
            .populate('targetUserId', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json(challenges, { status: 200 });
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
        const { problemId, targetUserId, targetEmail, message } = payload;

        if (!problemId) {
            return NextResponse.json({ message: 'Problem is required' }, { status: 400 });
        }

        await dbConnect();

        const problem = await DSAProblem.findOne({ _id: problemId, userId: user.userId });
        if (!problem) {
            return NextResponse.json({ message: 'Problem not found for your account' }, { status: 404 });
        }

        let finalTargetUserId = targetUserId;
        if (!finalTargetUserId && targetEmail) {
            const targetUser = await User.findOne({ email: targetEmail.trim().toLowerCase() });
            if (!targetUser) {
                return NextResponse.json({ message: 'Target user with that email was not found' }, { status: 404 });
            }
            finalTargetUserId = targetUser._id;
        }

        if (!finalTargetUserId) {
            return NextResponse.json({ message: 'Target user is required' }, { status: 400 });
        }

        if (finalTargetUserId.toString() === user.userId.toString()) {
            return NextResponse.json({ message: 'You cannot challenge yourself' }, { status: 400 });
        }

        const challenge = await DSAChallenge.create({
            userId: user.userId,
            targetUserId: finalTargetUserId,
            problemId,
            message: message || '',
            status: 'pending',
        });

        return NextResponse.json(challenge, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
