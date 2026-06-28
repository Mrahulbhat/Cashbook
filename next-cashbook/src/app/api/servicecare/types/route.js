import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import ServiceCareType from '@/models/ServiceCareType';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    const types = await ServiceCareType.find({ userId: user.userId }).sort({ createdAt: -1 });
    return NextResponse.json(types, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { name, tasks } = await req.json();
    if (!name || !Array.isArray(tasks) || !tasks.length) {
      return NextResponse.json({ message: 'Missing required fields: name, tasks' }, { status: 400 });
    }

    await dbConnect();
    const type = new ServiceCareType({
      userId: user.userId,
      name,
      tasks,
    });

    await type.save();
    return NextResponse.json(type, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
