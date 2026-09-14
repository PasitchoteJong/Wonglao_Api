import { prisma } from '../../lib/prisma.js'


export const getBillMembers = async (billId) => {
    return await prisma.billMember.findMany({
        where: {
            BillId: billId,
            StatusMember: "JOINED"
        }
    });
};
export const updateSplitmethod = async (billId, splitMethod, memberAmount) => {
    return await prisma.$transaction(async (tx) => {
        const bill = await tx.bill.update({
            where: { Id: billId },
            data: {
                SplitMethod: splitMethod,
                MemberAmount: memberAmount
            }
        });

        if (splitMethod === "ROULETTE") {
            await tx.billMember.updateMany({
                where: {
                    BillId: billId,
                    StatusMember: "JOINED"
                },
                data: { RouletteEligible: true }
            });
        }

        return bill;
    })

};

export const getBillWithJoinedMember = async (billId) => {
    return await prisma.bill.findUnique({
        where: { Id: billId },
        include: {
            Billmember: {
                where: { StatusMember: "JOINED" }
            }
        }
    })
};

export const updateBillMembers = async (member) => {
    return await prisma.$transaction(
        member.map((member) =>
            prisma.billMember.update({
                where: { Id: member.Id },
                data: {
                    AmountToPay: member.AmountToPay,
                    AmountPaid: 0,
                    StatusPay: "UNPAID"
                }
            })
        )
    )
}

