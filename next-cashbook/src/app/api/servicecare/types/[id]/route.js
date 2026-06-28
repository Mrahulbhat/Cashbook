import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import ServiceCareType from '@/models/ServiceCareType';
import ServiceCareService from '@/models/ServiceCareService';
import { getAuthUser } from '@/lib/getAuthUser';

export async function PUT(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const { id } = params;
    const { name, tasks } = await req.json();
    if (!name || !Array.isArray(tasks) || !tasks.length) {
      return NextResponse.json({ message: 'Missing required fields: name, tasks' }, { status: 400 });
    }

    await dbConnect();
    const type = await ServiceCareType.findOne({ _id: id, userId: user.userId });
    if (!type) return NextResponse.json({ message: 'Service type not found' }, { status: 404 });

    const previousName = type.name;
    type.name = name;
    type.tasks = tasks;
    await type.save();

    if (previousName !== name) {
      await ServiceCareService.updateMany(
        { userId: user.userId, type: previousName },
        { type: name }
      );
    }

    return NextResponse.json(type, { status: 200 });
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
    const type = await ServiceCareType.findOne({ _id: id, userId: user.userId });
    if (!type) return NextResponse.json({ message: 'Service type not found' }, { status: 404 });

    await ServiceCareType.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Service type deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
