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

export async function PUT(request, { params }) {
    try {
        const admin = requireAdmin(request);
        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const title = (body.title || '').trim();
        const description = (body.description || '').trim();
        const status = (body.status || '').trim();

        if (!title || !description || !status) {
            return NextResponse.json({ success: false, error: 'Title, description, and status are required' }, { status: 400 });
        }

        const normalizedStatus = status;

        await dbConnect();
        const bug = await Bug.findById(id);
        if (!bug) {
            return NextResponse.json({ success: false, error: 'Bug not found' }, { status: 404 });
        }

        bug.title = title;
        bug.description = description;
        bug.status = normalizedStatus;

        const updated = await bug.save();

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to update bug' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const admin = requireAdmin(request);
        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        const bug = await Bug.findById(id);
        if (!bug) {
            return NextResponse.json({ success: false, error: 'Bug not found' }, { status: 404 });
        }

        await Bug.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: 'Bug deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to delete bug' }, { status: 500 });
    }
}
