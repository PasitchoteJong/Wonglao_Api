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
                        select: {
                            Id: true,
                            DisplayName: true,
                            QRpayment: true,
                            PromptPay: true
                        }
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
        const paymentSlip = await tx.paymentSlip.create({
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

// export const updatePaymentSlipStatus = async (paymentSlipId, status) => {
//     return await prisma.paymentSlip.update({
//         where: { Id: paymentSlipId },
//         data: { StatusPay: status }
//     });
// };

// export const updateBillMemberStatus = async (billMemberId, status) => {
//     return await prisma.billMember.update({
//         where: { Id: billMemberId },
//         data: { StatusPay: status }
//     });
// };

// export const countUnpaidMembers = async (billId) => {
//     return await prisma.billMember.count({
//         where: {
//             BillId: billId,
//             StatusMember: "JOINED",
//             StatusPay: {
//                 not: "PAID"
//             }
//         }
//     });
// };

// export const completeBill = async (billId) => {
//     return await prisma.bill.update({
//         where: { Id: billId },
//         data: {
//             StatusReceipt: "COMPLETED",
//             CompletedAt: new Date()
//         }
//     })
// }

export const verifyPaymentTransaction = async ({ paymentSlipId, billMemberId, billId, amountPaid, slipStatus, memberStatus }) => {

    return await prisma.$transaction(async (tx) => {

        await tx.paymentSlip.update({
            where: { Id: paymentSlipId },
            data: { StatusPay: slipStatus }
        });

        const member = await tx.billMember.update({
            where: { Id: billMemberId },
            data: {
                AmountPaid: amountPaid,
                StatusPay: memberStatus,
                PaymentAccepted: memberStatus === "PAID"
            }
        });

        // 3. Check unpaid members
        const unpaidMember = await tx.billMember.count({
            where: {
                BillId: billId,
                StatusMember: "JOINED",
                StatusPay: { not: "PAID" }
            }
        });

        // 4. Complete bill if everyone paid
        if (unpaidMember === 0) {
            await tx.bill.update({
                where: { Id: billId },
                data: {
                    StatusReceipt: "COMPLETED",
                    CompletedAt: new Date()
                }
            });
        }

        return member;
    });
};

export const getBillOwner = async (billId) => {
    return await prisma.bill.findUnique({
        where: { Id: billId },
        select: {
            Id: true,
            MemberId: true
        }
    });
};

export const getPaymentSummaryService = async ({ userId, page, limit }) => {
    const skip = (page - 1) * limit;

    const [bills, total] = await prisma.$transaction([
        prisma.bill.findMany({
            where: { MemberId: userId },
            skip,
            take: limit,
            orderBy: { CreatedAt: "desc" },
            include: {
                Billmember: {
                    where: { StatusMember: "JOINED" },
                    select: {
                        Id: true,
                        UserId: true,
                        DisplayName: true,
                        AmountToPay: true,
                        AmountPaid: true,
                        StatusPay: true,
                        PaymentAccepted: true,
                        JoinAt: true,

                        PaymentSlip: {
                            orderBy: { CreatedAt: "desc" },
                            select: {
                                Id: true,
                                Amount: true,
                                StatusPay: true,
                                ProofImage: true,
                                CreatedAt: true
                            }
                        }
                    }
                }
            }
        }),

        prisma.bill.count({
            where: { MemberId: userId }
        })
    ]);

    return {
        bills,
        total
    };
};


export const getPendingPaymentSlipsFromDB = async (billId) => {
    return await prisma.paymentSlip.findMany({
        where: {
            BillId: billId,
            StatusPay: "PENDING_VERIFY"
        },
        include: {
            BillMember: {
                select: {
                    Id: true,
                    UserId: true,
                    DisplayName: true,
                    AmountToPay: true,
                    AmountPaid: true
                }
            }
        },
        orderBy: { CreatedAt: "desc" }
    });
};




export const getPaymentSummaryServ = async (billId) => {
    return await prisma.bill.findUnique({
        where: { Id: billId },
        select: {
            Id: true,
            ShopName: true,
            TotalAmount: true,
            MemberId: true,
            Billmember: {
                where: { StatusMember: "JOINED" },
                orderBy: { JoinAt: "asc" },
                select: {
                    Id: true,
                    UserId: true,
                    DisplayName: true,
                    AmountToPay: true,
                    AmountPaid: true,
                    PaymentAccepted: true,
                    StatusPay: true,
                    PaymentSlip: {
                        orderBy: { CreatedAt: "desc" },
                        take: 1,
                        select: { CreatedAt: true }
                    }
                }
            }
        }
    })
}

export const getPaymentMemberDetail = async (billId, billMemberId) => {
    const bill = await prisma.bill.findUnique({
        where: { Id: billId },
        select: { MemberId: true }
    });

    const member = await prisma.billMember.findFirst({
        where: {
            Id: billMemberId,
            BillId: billId,
            StatusMember: "JOINED"
        },
        select: {
            Id: true,
            DisplayName: true,
            AmountToPay: true,
            AmountPaid: true,
            PaymentAccepted: true,
            StatusPay: true,
            PaymentSlip: {
                orderBy: { CreatedAt: "desc" },
                take: 3,
                select: {
                    Id: true,
                    Amount: true,
                    StatusPay: true,
                    ProofImage: true,
                    CreatedAt: true
                }
            }
        }
    });

    return {
        bill,
        member
    };
};