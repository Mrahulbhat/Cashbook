import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await dbConnect();

        // Check if connection is ready
        if (mongoose.connection.readyState !== 1) {
            return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
        }

        // Get database statistics
        const stats = await mongoose.connection.db.command({ dbStats: 1 });

        return NextResponse.json({
            success: true,
            data: {
                db: stats.db,
                collections: stats.collections,
                objects: stats.objects,
                avgObjSize: stats.avgObjSize,
                dataSize: stats.dataSize,
                storageSize: stats.storageSize,
                indexSize: stats.indexSize,
            }
        });
    } catch (error) {
        console.error('Database stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch database statistics' }, { status: 500 });
    }
}
