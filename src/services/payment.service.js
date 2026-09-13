import { prisma } from "../../lib/prisma.js";

export const getMyPayment = async (billId, userId) => {
    return await prisma.billMember.findFirst({
        where: {
            BillId: billId,
            UserId: userId,
            StatusMember: "JOINED"
        },
        include: {
            Bill: {
                select: {
                    Id: true,
                    ShopName: true,
                    TotalAmount: true,
                    MemberId: true,
                    user: {
                        Id: true,
                        DisplayName: true,
                        QRPayment: true,
                        PromptPay: true
                    }
                }
            }, PaymentSlip: {
                orderBy: { CreatedAt: "desc" }
            }
        }
    });
};

export const getBillMember = async ({ billId, userId }) => {
    return await prisma.billMember.findFirst({
        where: {
            BillId: billId,
            UserId: userId,
            StatusMember: "JOINED"
        }
    })
}

export const createPaymentSlip = async ({ billId, memberId, amount, proofImage }) => {
    return await prisma.$transaction(async (tx) => {
        const PaymentSlip = await tx.paymentSlip.create({
            data: {
                BillId: billId,
                BillMemberId: memberId,
                Amount: amount,
                StatusPay: "PENDING_VERIFY",
                ProofImage: proofImage
            }
        });

        await tx.billMember.update({
            where: { Id: memberId },
            data: { StatusPay: "PENDING_VERIFY" }
        });

        return paymentSlip;
    });
};

export const getPaymentSlipById = async (paymentSlipId) => {
    return await prisma.paymentSlip.findUnique({
        where: { Id: paymentSlipId },
        include: {
            Bill: true,
            BillMember: true
        }
    });
};

export const updatePaymentSlipStatus = async (paymentSlipId, status) => {
    return await prisma.paymentSlip.update({
        where: { Id: paymentSlipId },
        data: { StatusPay: status }
    });
};

export const updateBillMemberStatus = async (billMemberId, status) => {
    return await prisma.billMember.update({
        where: { Id: billMemberId },
        data: { StatusPay: status }
    });
};

export const countUnpaidMembers = async (billId)=>{
    return await prisma.billMember.count({
        where:{
            BillId:billId,
            StatusMember:"JOINED",
            StatusPay:{
                not:"PAID"
            }
        }
    });
};

export const completeBill = async (billId)=>{
    return await prisma.bill.update({
        where:{Id:billId},
        data:{
            StatusReceipt:"COMPLETED",
            CompletedAt: new Date()
        }
    })
}

