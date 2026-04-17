import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Plan from '@/models/Plan';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        await dbConnect();
        let plan = await Plan.findOne({ userId: user.userId });
        
        if (!plan) {
            // Create default plan if none exists
            plan = new Plan({
                userId: user.userId,
                targets: [
                    { bucket: 'Long Term', amount: 0 },
                    { bucket: 'Short Term', amount: 0 },
                    { bucket: 'Wants', amount: 0 },
                    { bucket: 'Needs', amount: 0 },
                ]
            });
            await plan.save();
        }
        
        return NextResponse.json(plan, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { targets } = await req.json();
        await dbConnect();

        let plan = await Plan.findOne({ userId: user.userId });
        if (plan) {
            plan.targets = targets;
            await plan.save();
        } else {
            plan = new Plan({
                userId: user.userId,
                targets
            });
            await plan.save();
        }

        return NextResponse.json(plan, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
