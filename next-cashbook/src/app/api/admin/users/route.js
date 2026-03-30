import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';
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

        const users = await User.find({}).sort({ createdAt: -1 }).select('-password');

        const userDataWithStats = await Promise.all(users.map(async (user) => {
            const userId = new mongoose.Types.ObjectId(user._id);

            const stats = await Transaction.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: "$type",
                        totalAmount: { $sum: "$amount" },
                        count: { $sum: 1 }
                    }
                }
            ]);

            let totalIncome = 0;
            let totalExpense = 0;
            let transactionCount = 0;

            stats.forEach(stat => {
                if (stat._id === 'income') totalIncome = stat.totalAmount;
                else if (stat._id === 'expense') totalExpense = stat.totalAmount;
                transactionCount += stat.count;
            });

            return {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                joined: user.createdAt,
                stats: {
                    totalIncome,
                    totalExpense,
                    netBalance: totalIncome - totalExpense,
                    transactionCount
                }
            };
        }));

        return NextResponse.json({ success: true, data: userDataWithStats });
    } catch (error) {
        console.error('Admin users fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
