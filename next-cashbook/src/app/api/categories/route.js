import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        await dbConnect();
        const categories = await Category.find({ userId: user.userId });
        return NextResponse.json(categories, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { name, type, parentCategory, budget } = await req.json();
        if (!name || !type) return NextResponse.json({ message: 'Name and type are required' }, { status: 400 });

        await dbConnect();
        const existingCategory = await Category.findOne({ name, userId: user.userId });
        if (existingCategory) return NextResponse.json({ message: 'Category with this name already exists' }, { status: 400 });

        const newCategory = new Category({
            name,
            type,
            parentCategory: parentCategory || 'System',
            budget: budget || 0,
            userId: user.userId
        });

        await newCategory.save();
        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
