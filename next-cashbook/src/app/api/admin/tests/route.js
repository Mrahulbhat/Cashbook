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

function generateTestCaseId(existingCount = 0) {
    return `TC ${String(existingCount + 1).padStart(3, '0')}`;
}

export async function GET(request) {
    try {
        const admin = requireAdmin(request);
        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const tests = await Tests.find({}).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: tests.map((test) => ({
                _id: test._id,
                id: test.testCaseId || test._id.toString(),
                testCaseId: test.testCaseId || test._id.toString(),
                title: test.title,
                description: test.description,
                status: test.status,
                createdAt: test.createdAt,
                updatedAt: test.updatedAt,
            })),
        });
    } catch (error) {
        console.error('Admin test cases fetch error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch test cases' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const admin = requireAdmin(request);
        if (!admin) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const trimmedId = normalizeTestCaseId(body.id || '');
        const title = (body.title || '').trim();
        const description = (body.description || '').trim();
        const status = (body.status || '').trim();

        if (!trimmedId || !title || !status) {
            return NextResponse.json({ success: false, error: 'ID, title, and status are required' }, { status: 400 });
        }

        await dbConnect();

        const existing = await Tests.findOne({ testCaseId: trimmedId });
        if (existing) {
            return NextResponse.json({ success: false, error: 'A test case with this ID already exists' }, { status: 400 });
        }

        let testCaseId = trimmedId;
        let counter = await Tests.countDocuments();

        while (await Tests.exists({ testCaseId })) {
            counter += 1;
            testCaseId = generateTestCaseId(counter);
        }

        const test = await Tests.create({
            testCaseId,
            title,
            description,
            status,
        });

        return NextResponse.json({ success: true, data: test }, { status: 201 });
    } catch (error) {
        console.error('Admin test case create error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to create test case' }, { status: 500 });
    }
}
