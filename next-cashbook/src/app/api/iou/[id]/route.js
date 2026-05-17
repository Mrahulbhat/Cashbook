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

        const { id } = await params;
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

        // When friend pays back, reduce the original linked expense transaction
        // so the user's net expense goes down by that amount.
        if (iou.linkedTransactionId) {
            const linkedTx = await Transaction.findOne({ _id: iou.linkedTransactionId, userId: user.userId });
            if (linkedTx && linkedTx.type === "expense") {
                const newAmount = Math.max(0, linkedTx.amount - actual);
                const diff = linkedTx.amount - newAmount; // actual reduction applied

                // Restore that amount to the original transaction's account
                const originalAccount = await Account.findOne({ _id: linkedTx.account, userId: user.userId });
                if (originalAccount) {
                    originalAccount.balance += diff;
                    await originalAccount.save();
                }

                linkedTx.amount = newAmount;
                await linkedTx.save();
            }
        }

        // Also add the received cash to the selected (receiving) account
        account.balance += actual;
        await account.save();

        // Update IOU
        iou.paidBack += actual;
        if (iou.paidBack >= iou.amount) {
            iou.status = "settled";
        } else {
            iou.status = "partially_paid";
        }
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
        const { id } = await params;
        const iou = await Iou.findOneAndDelete({ _id: id, userId: user.userId });
        if (!iou) return NextResponse.json({ message: "IOU not found" }, { status: 404 });

        return NextResponse.json({ message: "IOU deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
