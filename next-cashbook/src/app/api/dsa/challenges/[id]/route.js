import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DSAChallenge from '@/models/DSAChallenge';
import { getAuthUser } from '@/lib/getAuthUser';

export async function PATCH(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        const { status } = await req.json();
        await dbConnect();

        const challenge = await DSAChallenge.findOne({
            _id: params.id,
            targetUserId: user.userId,
        }).populate('problemId').populate('userId', 'name').populate('targetUserId', 'name');

        if (!challenge) {
            return NextResponse.json({ message: 'Challenge not found' }, { status: 404 });
        }

        if (status) challenge.status = status;
        await challenge.save();

        return NextResponse.json(challenge, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
