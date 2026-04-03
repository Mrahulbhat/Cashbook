import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Account from '@/models/Account';
import Category from '@/models/Category';
import Transaction from '@/models/Transaction';
import { getAuthUser } from '@/lib/getAuthUser';

export async function DELETE(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action'); // 'wipe' or null (delete account)

        await dbConnect();

        // 1. Delete all transactions
        await Transaction.deleteMany({ userId: user.userId });
        
        // 3. Delete all accounts
        await Account.deleteMany({ userId: user.userId });

        // 2. Delete all categories
        await Category.deleteMany({ userId: user.userId });

        if (action === 'wipe') {
            return NextResponse.json({ success: true, message: 'All data wiped successfully' });
        }

        // 4. Delete the user
        await User.findByIdAndDelete(user.userId);
        
        // 5. Clear session cookie
        const response = NextResponse.json({ success: true, message: 'Account deleted successfully' });
        response.cookies.set('token', '', { expires: new Date(0), path: '/' });
        return response;

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
