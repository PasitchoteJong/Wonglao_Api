import { prisma } from '../../lib/prisma.js'

export const getFoodSelectionData = async (billId) => {
    return await prisma.bill.findUnique({
        where: {
            Id: billId
        },
        include: {
            BillItem: {
                include: {
                    BillItemMember: true
                }
            },
            Billmember: true
        }
    });
};

export const updateFoodSelectionData = async ({
    billMemberId,
    selections
}) => {
    return await prisma.$transaction(
        selections.map((selection) =>
            prisma.billItemMember.upsert({
                where: {
                    BillItemId_BillMemberId: {
                        BillItemId: selection.billItemId,
                        BillMemberId: billMemberId
                    }
                },
                update: {
                    Eating: selection.eating
                },
                create: {
                    BillItemId: selection.billItemId,
                    BillMemberId: billMemberId,
                    Eating: selection.eating
                }
            })
        )
    );
};

export const getBillForProportionalCalculation = async (billId) => {
    return await prisma.bill.findUnique({
        where: {
            Id: billId
        },
        include: {
            BillItem: {
                include: {
                    BillItemMember: {
                        where: {
                            Eating: true
                        }
                    }
                }
            },
            Billmember: {
                where: {
                    StatusMember: "JOINED"
                }
            }
        }
    });
};

export const updateMemberAmounts = async (updates) => {
    return await prisma.$transaction(
        updates.map((member) =>
            prisma.billMember.update({
                where: {
                    Id: member.memberId
                },
                data: {
                    AmountToPay: member.amountToPay,
                    AmountPaid: 0,
                    StatusPay: "UNPAID",
                    PaymentAccepted: false
                }
            })
        )
    );
};

export const getBillMemberByUser = async ({ billId, userId }) => {
    return await prisma.billMember.findFirst({
        where: {
            BillId: billId,
            UserId: userId,
            StatusMember: "JOINED"
        },
        select: {
            Id: true,
            UserId: true,
            DisplayName: true,
            AmountToPay: true,
            AmountPaid: true,
            StatusPay: true,
            PaymentAccepted: true
        }
    });
};


export const getMyFoodSplitData = async ({ billId, userId }) => {
    return await prisma.billMember.findFirst({
        where: {
            BillId: billId,
            UserId: userId,
            StatusMember: "JOINED"
        },
        select: {
            Id: true,
            UserId: true,
            DisplayName: true,
            AmountToPay: true,
            AmountPaid: true,
            StatusPay: true,
            PaymentAccepted: true,

            BillItemMember: {
                where: { Eating: true },
                select: {
                    Id: true,
                    BillItemId: true,
                    Eating: true,

                    BillItem: {
                        select: {
                            Id: true,
                            Name: true,
                            Price: true,
                            Quantity: true,
                            CostTotal: true,

                            BillItemMember: {
                                where: { Eating: true },
                                select: { BillMemberId: true }
                            }
                        }
                    }
                }
            }
        }
    });
};