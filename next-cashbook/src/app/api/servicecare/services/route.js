import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import ServiceCareService from '@/models/ServiceCareService';
import ServiceCareVehicle from '@/models/ServiceCareVehicle';
import { getAuthUser } from '@/lib/getAuthUser';

export async function GET(req) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    await dbConnect();
    const services = await ServiceCareService.find({ userId: user.userId }).sort({ date: -1, createdAt: -1 });
    return NextResponse.json(services, { status: 200 });
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

    const { vehicleId, type, date, amount, showroom, tasks, details } = await req.json();
    if (!vehicleId || !type || !date || amount === undefined) {
      return NextResponse.json({ message: 'Missing required fields: vehicleId, type, date, amount' }, { status: 400 });
    }

    await dbConnect();
    const vehicle = await ServiceCareVehicle.findOne({ _id: vehicleId, userId: user.userId });
    if (!vehicle) {
      return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });
    }

    const service = new ServiceCareService({
      userId: user.userId,
      vehicleId,
      type,
      date,
      amount,
      showroom: !!showroom,
      tasks: Array.isArray(tasks) ? tasks : [],
      details: details || '',
    });

    await service.save();
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
