import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/dbConnect";
import Iou from "@/models/Iou";
import { getAuthUser } from "@/lib/getAuthUser";

// GET /api/iou — fetch all IOUs for the authenticated user
export async function GET(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

        await dbConnect();
        const ious = await Iou.find({ userId: user.userId }).sort({ date: -1, createdAt: -1 });
        return NextResponse.json(ious, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST /api/iou — create a new IOU
export async function POST(req) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

        const { friendName, amount, description, date, linkedTransactionId } = await req.json();

        if (!friendName || !amount || !date) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();
        const iou = new Iou({
            userId: user.userId,
            friendName,
            amount,
            paidBack: 0,
            direction: "i_paid",
            description,
            date,
            status: "pending",
            linkedTransactionId: linkedTransactionId || null,
        });

        await iou.save();
        return NextResponse.json(iou, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
