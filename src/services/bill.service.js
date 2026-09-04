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
export const saveOCRResultToBill = async (billId, data) => {
    return await prisma.$transaction(async (tx) => {

        // 1. ตรวจสอบ Bill
        const bill = await tx.bill.findUnique({
            where: {
                Id: billId
            }
        });

        if (!bill) {
            throw new Error("Bill not found");
        }

        // 2. Update Bill
        const updatedBill = await tx.bill.update({
            where: {
                Id: billId
            },
            data: {
                ShopName: data.shopName ?? null,
                TotalAmount: data.totalAmount ?? null,
                StatusReceipt: "CHECKING"
            }
        });

        // 3. สร้าง BillItem
        if (data.items && data.items.length > 0) {

            await tx.billItem.createMany({
                data: data.items.map((item) => ({
                    BillId: billId,
                    Name: item.name,
                    Price: item.unitPrice ?? 0,
                    Quantity: item.quantity ?? 1,
                    CostTotal: item.totalPrice ?? 0
                }))
            });

        }

        // 4. Return Bill พร้อม Items
        return await tx.bill.findUnique({
            where: {
                Id: billId
            },
            include: {
                BillItem: true
            }
        });
    });
};
