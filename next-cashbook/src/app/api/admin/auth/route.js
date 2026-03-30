import { NextResponse } from 'next/server';
import { generateAdminToken } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cashbook@admin123';

export async function POST(req) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ success: false, message: 'Username and password required' }, { status: 400 });
        }

        if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
            return NextResponse.json({ success: false, message: 'Invalid admin credentials' }, { status: 401 });
        }

        const token = generateAdminToken();
        const response = NextResponse.json({ success: true, message: 'Admin login successful' });

        response.cookies.set('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 4 * 60 * 60, // 4 hours
            path: '/',
        });

        return response;
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    const response = NextResponse.json({ success: true, message: 'Admin logged out' });
    response.cookies.set('adminToken', '', { maxAge: 0, path: '/' });
    return response;
}
