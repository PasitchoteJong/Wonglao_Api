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
    return await prisma.bill.update({
        where: { Id: billId },
        data: {
            SplitMethod: splitMethod,
            MemberAmount: memberAmount
        }
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

