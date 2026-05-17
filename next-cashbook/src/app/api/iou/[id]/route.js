import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import dbConnect from "@/lib/dbConnect";
import Iou from "@/models/Iou";
import Transaction from "@/models/Transaction";
import Account from "@/models/Account";
import { getAuthUser } from "@/lib/getAuthUser";

// PUT /api/iou/[id]/settle — record a partial or full payment
export async function PUT(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

        const { id } = params;
        const { amountReceived, accountId } = await req.json();

        if (!amountReceived || !accountId) {
            return NextResponse.json({ message: "amountReceived and accountId are required" }, { status: 400 });
        }

        await dbConnect();

        const iou = await Iou.findOne({ _id: id, userId: user.userId });
        if (!iou) return NextResponse.json({ message: "IOU not found" }, { status: 404 });

        const account = await Account.findOne({ _id: accountId, userId: user.userId });
        if (!account) return NextResponse.json({ message: "Account not found" }, { status: 404 });

        const remaining = iou.amount - iou.paidBack;
        const actual = Math.min(Number(amountReceived), remaining);

        // Settlement is always income — friend is paying you back
        const tx = new Transaction({
            userId: user.userId,
            amount: actual,
            type: "income",
            description: `IOU repayment from ${iou.friendName}`,
            category: iou.linkedTransactionId
                ? (await Transaction.findById(iou.linkedTransactionId))?.category || null
                : null,
            date: new Date(),
            account: accountId,
        });

        // If we still don't have a category, we skip creating the transaction
        // but still update the IOU (manual mode)
        let settlementTxId = null;
        if (tx.category) {
            await tx.save();
            // Update account balance
            account.balance += actual;
            await account.save();
            settlementTxId = tx._id;
        }

        // Update IOU
        iou.paidBack += actual;
        if (iou.paidBack >= iou.amount) {
            iou.status = "settled";
        } else {
            iou.status = "partially_paid";
        }
        if (settlementTxId) iou.settlementTransactionIds.push(settlementTxId);
        await iou.save();

        return NextResponse.json(iou, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// DELETE /api/iou/[id]
export async function DELETE(req, { params }) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

        await dbConnect();
        const iou = await Iou.findOneAndDelete({ _id: params.id, userId: user.userId });
        if (!iou) return NextResponse.json({ message: "IOU not found" }, { status: 404 });

        return NextResponse.json({ message: "IOU deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
