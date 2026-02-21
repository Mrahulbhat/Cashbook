import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(req) {
    try {
        await dbConnect();
        const { phone, password } = await req.json();

        if (!phone || !password) {
            return NextResponse.json(
                { success: false, message: 'Please provide phone and password' },
                { status: 400 }
            );
        }

        const user = await User.findOne({ phone }).select('+password');
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid phone or password' },
                { status: 401 }
            );
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: 'Invalid phone or password' },
                { status: 401 }
            );
        }

        const token = generateToken(user._id, user.phone);

        const response = NextResponse.json(
            {
                success: true,
                message: 'Login successful',
                user: { id: user._id, name: user.name, phone: user.phone },
            },
            { status: 200 }
        );

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
