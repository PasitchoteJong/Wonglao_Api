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

        const winner = await tx.billMember.update({
            where: { Id: winnerId },
            data: {
                AmountToPay: totalAmount,
                AmountPaid: 0,
                StatusPay: "UNPAID",
                PaymentAccepted: false
            }
        });

        return winner;
    });
};


export const getRouletteBill = async (billId) => {
    return await prisma.bill.findUnique({
        where: { Id: billId },
        include: {
            Billmember: {
                where: {
                    StatusMember: "JOINED",
                    RouletteEligible: true
                }
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
    });
};

export const getRouletteByBillId = async (billId) => {

    return await prisma.bill.findUnique({
        where: { Id: billId },

        include: {
            BillMember: {
                include: { User: true }
            }
        }
    });
};


export const getRouletteParticipants = async (billId) => {

    const members = await prisma.billMember.findMany({
        where: {
            BillId: billId,
            RouletteEligible: true
        },

        include: { User: true }
    });

    return members;
};

export const submitRouletteToDatabase = async (billId, participants) => {

    return await prisma.roulette.create({
        data: {
            BillId: billId,
            Status: "READY"
        }
    });
};

export const createRouletteSpin = async ({ billId, winnerId }) => {

    return await prisma.roulette.update({
        where: { BillId: billId },

        data: {
            WinnerId: winnerId,
            Status: "COMPLETED"
        }
    });
};


export const updateRouletteMemberStatus = async (billId, memberId, isJoined) => {

    return await prisma.billMember.update({
        where: { Id: memberId },

        data: { isRouletteParticipant: isJoined }
    });
};