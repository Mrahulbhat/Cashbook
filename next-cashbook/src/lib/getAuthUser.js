import { verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function getAuthUser(req) {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    await dbConnect();
    const user = await User.findById(decoded.userId);
    if (!user) return null;

    return { userId: user._id.toString(), phone: user.phone };
}
