import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/dbConnect';
import ServiceCareVehicle from '@/models/ServiceCareVehicle';
import ServiceCareService from '@/models/ServiceCareService';
import { getAuthUser } from '@/lib/getAuthUser';

export async function PUT(req, { params }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

    const { id } = params;
    const { name, model, year, registration } = await req.json();
    if (!name || !model) {
      return NextResponse.json({ message: 'Missing required fields: name, model' }, { status: 400 });
    }

    await dbConnect();
    const vehicle = await ServiceCareVehicle.findOne({ _id: id, userId: user.userId });
    if (!vehicle) return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });

    vehicle.name = name;
    vehicle.model = model;
    vehicle.year = year || '';
    vehicle.registration = registration || '';
    await vehicle.save();

    return NextResponse.json(vehicle, { status: 200 });
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
    const vehicle = await ServiceCareVehicle.findOne({ _id: id, userId: user.userId });
    if (!vehicle) return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });

    await ServiceCareService.deleteMany({ vehicleId: id, userId: user.userId });
    await ServiceCareVehicle.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Vehicle deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
