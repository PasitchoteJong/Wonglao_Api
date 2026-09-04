import { prisma } from '../../lib/prisma.js'

export const createBillInDB = async ({ memberId, shopName, receiptImage }) => {
    return await prisma.bill.create({
        data: {
            MemberId: memberId || "mock-member-id", 
            ShopName: shopName,
            ReceiptImage: receiptImage,
            TotalAmount: 0.00,
            MemberAmount: 1,
        }
    })
}