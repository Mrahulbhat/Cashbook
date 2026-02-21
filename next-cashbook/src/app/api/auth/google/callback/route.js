import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import axios from 'axios';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.redirect(new URL('/login?error=no_code', req.url));
        }

        // Exchange code for tokens
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/google/callback`,
            grant_type: 'authorization_code',
        });

        const { access_token } = tokenResponse.data;

        // Get user info
        const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const profile = userRes.data;

        await dbConnect();
        let user = await User.findOne({ email: profile.email });

        if (!user) {
            user = await User.create({
                name: profile.name,
                email: profile.email,
                googleId: profile.id,
            });
        } else {
            user.googleId = profile.id;
            await user.save();
        }

        const token = generateToken(user._id, user.email || user.phone);

        const response = NextResponse.redirect(new URL(`/login?token=${token}`, req.url));

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
        });

        return response;
    } catch (error) {
        console.error('Google Auth Error:', error);
        return NextResponse.redirect(new URL('/login?error=auth_failed', req.url));
    }
}
