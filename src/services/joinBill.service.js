import { prisma } from '../../lib/prisma.js'


export const getExistingMember = async (billId, userId) => {
    return await prisma.billMember.findFirst({
        where: {
            BillId: billId,
            UserId: userId
        }
    })
}

export const createBillmember = async ({ billId, userId, displayName }) => {
    return await prisma.billMember.create({
        data: {
            BillId: billId,
            UserId: userId,
            DisplayName: displayName
        }
    })
}
export const getJoinBillService = async (billId) => {
    return await prisma.bill.findUnique({
        where: { Id: billId },
        select: {
            Id: true,
            ShopName: true,
            TotalAmount: true,
            StatusReceipt: true,
            CreatedAt: true,

            Billmember: {
                select: {
                    Id: true,
                    UserId: true,
                    DisplayName: true,
                    StatusMember: true,
                    JoinAt: true
                }
            },
            _count: {
                select: { Billmember: true }
            }
        }
    })
}

export const joinBillMember = async ({ billId, userId, displayName }) => {
    const existingMember = await getExistingMember(billId, userId);
    if (existingMember) {
        return existingMember;
    }

    return await createBillmember({
        billId,
        userId,
        displayName
    })
}