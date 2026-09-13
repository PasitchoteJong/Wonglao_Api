import { prisma } from '../../lib/prisma.js'

export const updateSplitmethod = async (billId, splitMethod) => {
    return await prisma.bill.update({
        where: { Id: billId },
        data: { SplitMethod: splitMethod }
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
                    AmountPaid: member.AmountPaid,
                    StatusPay: "UNPAID"
                }
            })
        )
    )
}

