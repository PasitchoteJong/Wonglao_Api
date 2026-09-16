import { prisma } from "../../lib/prisma.js";

export const getBillOwner = async (billId) => {
    return await prisma.bill.findUnique({
        where: { Id: billId },
        select: {
            Id: true,
            MemberId: true
        }
    });
};