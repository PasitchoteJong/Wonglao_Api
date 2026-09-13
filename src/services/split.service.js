import { prisma } from '../../lib/prisma.js'

export const updateSplitmethod = async (billId, splitMethod) => {
    return await prisma.bill.update({
        where: { Id: billId },
        data: { SplitMethod: splitMethod }
    })
};