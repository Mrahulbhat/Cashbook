import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(req) {
    try {
        await dbConnect();
        const { name, phone, password } = await req.json();

        if (!name || !phone || !password) {
            return NextResponse.json(
                { success: false, message: 'Please provide name, phone, and password' },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'Phone number already registered' },
                { status: 409 }
            );
        }

        const user = new User({ name, phone, password });
        await user.save();

        const token = generateToken(user._id, user.phone);

        const response = NextResponse.json(
            {
                success: true,
                message: 'User registered successfully',
                user: { id: user._id, name: user.name, phone: user.phone },
            },
            { status: 201 }
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
