import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Account from '@/models/Account';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';
import { verifyAdminToken } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

function requireAdmin(req) {
    const token = req.cookies.get('adminToken')?.value;
    if (!token) return null;
    return verifyAdminToken(token);
}

export async function GET(request, { params }) {
    try {
        const admin = requireAdmin(request);
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { userId } = await params;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        const user = await User.findById(userId).select('-password');
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const accounts = await Account.find({ userId });

        const transactions = await Transaction.find({ userId })
            .populate('category', 'name icon')
            .populate('account', 'name')
            .sort({ date: -1, createdAt: -1 })
            .limit(100);

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    joined: user.createdAt,
                },
                accounts: accounts.map(a => ({
                    id: a._id,
                    name: a.name,
                    balance: a.balance,
                })),
                transactions: transactions.map(t => ({
                    id: t._id,
                    amount: t.amount,
                    type: t.type,
                    description: t.description,
                    category: t.category?.name || 'Uncategorized',
                    categoryIcon: t.category?.icon || '📦',
                    account: t.account?.name || 'Unknown',
                    date: t.date,
                    createdAt: t.createdAt,
                })),
            }
        });
    } catch (error) {
        console.error('Admin user detail fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
    }
}
