import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Bug from '@/models/Bug';
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
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const bugs = await Bug.find({}).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: bugs.map((bug) => ({
                _id: bug._id,
                title: bug.title,
                description: bug.description,
                status: bug.status,
                createdAt: bug.createdAt,
                updatedAt: bug.updatedAt,
            })),
        });
    } catch (error) {
        console.error('Admin bugs fetch error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch bugs' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const admin = requireAdmin(request);
        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const title = (body.title || '').trim();
        const description = (body.description || '').trim();
        const status = (body.status || '').trim();

        if (!title || !description || !status) {
            return NextResponse.json({ success: false, error: 'Title, description, and status are required' }, { status: 400 });
        }

        const normalizedStatus = status;

        await dbConnect();
        const bug = await Bug.create({ title, description, status: normalizedStatus });

        return NextResponse.json({ success: true, data: bug }, { status: 201 });
    } catch (error) {
        console.error('Admin bug create error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to create bug' }, { status: 500 });
    }
}
