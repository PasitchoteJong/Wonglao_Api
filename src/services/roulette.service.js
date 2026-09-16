import { prisma } from '../../lib/prisma.js'

export const getBillOwner = async (billId) => {
    return await prisma.bill.findUnique({
        where: { Id: billId },
        select: {
            Id: true,
            MemberId: true
        }
    });
};

export const getBillMemberForRoulette = async ({ billId, billMemberId }) => {
    return await prisma.billMember.findFirst({
        where: {
            Id: billMemberId,
            BillId: billId,
            StatusMember: "JOINED"
        }
    });
};

export const updateRouletteEligible = async ({ billMemberId, rouletteEligible }) => {
    return await prisma.billMember.update({
        where: { Id: billMemberId },
        data: { RouletteEligible: rouletteEligible }
    });
};

export const updateRouletteResult = async ({ billId, winnerId, totalAmount }) => {
    return await prisma.$transaction(async (tx) => {

        await tx.billMember.updateMany({
            where: {
                BillId: billId,
                StatusMember: "JOINED"
            },
            data: {
                AmountToPay: 0,
                AmountPaid: 0,
                StatusPay: "UNPAID",
                PaymentAccepted: false
            }
        });

        return await tx.billMember.update({
            where: { Id: winnerId },
            data: {
                AmountToPay: totalAmount,
                AmountPaid: 0,
                StatusPay: "UNPAID",
                PaymentAccepted: false
            },
            include: { User: true }
        });
    }
    );
};


export const getRouletteBill = async (billId) => {
    return await prisma.bill.findUnique({
        where: { Id: billId },
        include: {
            Billmember: {
                where: { StatusMember: "JOINED" },
                include: { User: true }
            }
        }
    });
};


export const confirmRoulettePayment = async ({ billId, billMemberId, amountPaid }) => {
    return await prisma.$transaction(async (tx) => {

        const member = await tx.billMember.update({
            where: { Id: billMemberId },
            data: {
                StatusPay: "PAID",
                PaymentAccepted: true,
                AmountPaid: amountPaid
            }
        });

        await tx.bill.update({
            where: { Id: billId },
            data: {
                StatusReceipt: "COMPLETED",
                CompletedAt: new Date()
            }
        });

        return member;
    }
    );
};

export const getRouletteByBillId = async (billId) => {
    return await prisma.bill.findUnique({
        where: { Id: billId },
        include: {
            Billmember: {
                where: { StatusMember: "JOINED" },
                include: { User: true }
            }
        }
    });
};


export const getRouletteParticipants = async (billId) => {
    return await prisma.billMember.findMany({
        where: {
            BillId: billId,
            StatusMember: "JOINED",
            RouletteEligible: true
        },
        include: { User: true }
    });
};







