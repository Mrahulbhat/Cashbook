import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import ServiceCareService from '@/models/ServiceCareService';
import ServiceCareVehicle from '@/models/ServiceCareVehicle';
import { getAuthUser } from '@/lib/getAuthUser';

export async function PUT(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const { id } = params;
    const { vehicleId, type, date, amount, showroom, tasks, details } = await req.json();
    if (!vehicleId || !type || !date || amount === undefined) {
      return NextResponse.json({ message: 'Missing required fields: vehicleId, type, date, amount' }, { status: 400 });
    }

    await dbConnect();
    const service = await ServiceCareService.findOne({ _id: id, userId: user.userId });
    if (!service) return NextResponse.json({ message: 'Service not found' }, { status: 404 });

    const vehicle = await ServiceCareVehicle.findOne({ _id: vehicleId, userId: user.userId });
    if (!vehicle) return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });

    service.vehicleId = vehicleId;
    service.type = type;
    service.date = date;
    service.amount = amount;
    service.showroom = !!showroom;
    service.tasks = Array.isArray(tasks) ? tasks : [];
    service.details = details || '';
    await service.save();

    return NextResponse.json(service, { status: 200 });
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
    const service = await ServiceCareService.findOne({ _id: id, userId: user.userId });
    if (!service) return NextResponse.json({ message: 'Service not found' }, { status: 404 });

    await ServiceCareService.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Service deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
