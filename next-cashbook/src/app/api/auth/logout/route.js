import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
    const response = NextResponse.json(
        { success: true, message: 'Logged out successfully' },
        { status: 200 }
    );

    response.cookies.set('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });

    return response;
}
