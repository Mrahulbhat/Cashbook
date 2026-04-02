import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Account from '@/models/Account';
import User from '@/models/User';
import { verifyAdminToken } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

function requireAdmin(req) {
    const token = req.cookies.get('adminToken')?.value;
    if (!token) return null;
    return verifyAdminToken(token);
}

export async function GET(request) {
    try {
        const admin = requireAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Fetch all accounts and populate user name
        const accounts = await Account.find({}).populate('userId', 'name email');

        const accountData = accounts.map(acc => ({
            id: acc._id,
            name: acc.name,
            balance: acc.balance,
            user: {
                id: acc.userId?._id,
                name: acc.userId?.name || 'Unknown User',
                email: acc.userId?.email || ''
            },
            updatedAt: acc.updatedAt
        }));

        return NextResponse.json({ success: true, data: accountData });
    } catch (error) {
        console.error('Admin accounts fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
    }
}
