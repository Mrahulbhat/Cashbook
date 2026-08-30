import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();
        const users = await User.find({ _id: { $ne: user.userId } })
            .select('name email phone')
            .sort({ name: 1 });

        return NextResponse.json(users.map((item) => ({
            _id: item._id,
            name: item.name,
            email: item.email,
            phone: item.phone,
        })), { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
