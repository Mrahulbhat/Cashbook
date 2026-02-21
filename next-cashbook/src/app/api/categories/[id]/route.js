import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const category = await Category.findOne({ _id: id, userId: user.userId });
        if (!category) return NextResponse.json({ message: 'Category not found' }, { status: 404 });

        return NextResponse.json(category, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { id } = params;
        const { name, type, parentCategory, budget } = await req.json();

        await dbConnect();
        const category = await Category.findOne({ _id: id, userId: user.userId });
        if (!category) return NextResponse.json({ message: 'Category not found' }, { status: 404 });

        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ name, userId: user.userId });
            if (existingCategory) return NextResponse.json({ message: 'Category with this name already exists' }, { status: 400 });
            category.name = name;
        }

        category.type = type || category.type;
        category.parentCategory = parentCategory || category.parentCategory;
        category.budget = budget !== undefined ? budget : category.budget;

        const updatedCategory = await category.save();
        return NextResponse.json(updatedCategory, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

        const { id } = params;
        await dbConnect();
        const category = await Category.findOne({ _id: id, userId: user.userId });
        if (!category) return NextResponse.json({ message: 'Category not found' }, { status: 404 });

        await Category.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
