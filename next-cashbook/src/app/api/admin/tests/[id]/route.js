import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Tests from '@/models/Testcases';
import { verifyAdminToken } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

function requireAdmin(req) {
    const token = req.cookies.get('adminToken')?.value;
    if (!token) return null;
    return verifyAdminToken(token);
}

function normalizeTestCaseId(value) {
    if (!value) return '';
    const cleanValue = value.trim().toUpperCase().replace(/[^A-Z0-9\s-]/g, '');
    const formatted = cleanValue.replace(/\s+/g, ' ').trim();
    if (!formatted) return '';

    const match = formatted.match(/\d+/);
    if (!match) {
        return formatted;
    }

    const number = Number(match[0]);
    if (!Number.isFinite(number)) return formatted;

    const prefix = formatted.replace(match[0], '').trim();
    const normalizedPrefix = prefix ? `${prefix} ` : 'TC ';
    return `${normalizedPrefix}${String(number).padStart(3, '0')}`.trim();
}

export async function GET(request, { params }) {
    try {
        const admin = requireAdmin(request);
        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        const testCase = await Tests.findById(id);
        if (!testCase) {
            return NextResponse.json({ success: false, error: 'Test case not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                _id: testCase._id,
                id: testCase.testCaseId,
                testCaseId: testCase.testCaseId,
                title: testCase.title,
                description: testCase.description,
                status: testCase.status,
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to fetch test case' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const admin = requireAdmin(request);
        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const customId = normalizeTestCaseId(body.id || '');
        const title = (body.title || '').trim();
        const description = (body.description || '').trim();
        const status = (body.status || '').trim();

        if (!customId || !title || !status) {
            return NextResponse.json({ success: false, error: 'ID, title, and status are required' }, { status: 400 });
        }

        await dbConnect();

        const testCase = await Tests.findById(id);
        if (!testCase) {
            return NextResponse.json({ success: false, error: 'Test case not found' }, { status: 404 });
        }

        const duplicate = await Tests.findOne({ testCaseId: customId, _id: { $ne: testCase._id } });
        if (duplicate) {
            return NextResponse.json({ success: false, error: 'A test case with this ID already exists' }, { status: 400 });
        }

        testCase.testCaseId = customId;
        testCase.title = title;
        testCase.description = description;
        testCase.status = status;

        const updated = await testCase.save();

        return NextResponse.json({
            success: true,
            data: {
                _id: updated._id,
                id: updated.testCaseId,
                testCaseId: updated.testCaseId,
                title: updated.title,
                description: updated.description,
                status: updated.status,
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to update test case' }, { status: 500 });
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

        const testCase = await Tests.findById(id);
        if (!testCase) {
            return NextResponse.json({ success: false, error: 'Test case not found' }, { status: 404 });
        }

        await Tests.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Test case deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message || 'Failed to delete test case' }, { status: 500 });
    }
}
