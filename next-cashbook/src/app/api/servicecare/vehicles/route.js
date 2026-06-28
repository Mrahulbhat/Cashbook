import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import ServiceCareVehicle from '@/models/ServiceCareVehicle';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    const vehicles = await ServiceCareVehicle.find({ userId: user.userId }).sort({ createdAt: -1 });
    return NextResponse.json(vehicles, { status: 200 });
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

    const { name, model, year, registration } = await req.json();
    if (!name || !model) {
      return NextResponse.json({ message: 'Missing required fields: name, model' }, { status: 400 });
    }

    await dbConnect();
    const vehicle = new ServiceCareVehicle({
      userId: user.userId,
      name,
      model,
      year: year || '',
      registration: registration || '',
    });

    await vehicle.save();
    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
