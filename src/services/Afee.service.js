import { prisma } from '../../lib/prisma.js'

export const verifyPaymentSlip = async (
    paymentSlipId
) => {

    return await prisma.$transaction(
        async (tx) => {

            const slip =
                await tx.paymentSlip.findUnique({
                    where: {
                        Id: paymentSlipId
                    }
                });

            if (!slip) {
                throw new Error(
                    "Payment slip not found"
                );
            }

            const updatedSlip =
                await tx.paymentSlip.update({
                    where: {
                        Id: paymentSlipId
                    },

                    data: {
                        Status: "VERIFIED",
                        VerifiedAt: new Date()
                    }
                });

            await tx.billMember.update({
                where: {
                    Id: slip.BillMemberId
                },

                data: {
                    StatusPay: "PAID"
                }
            });

            return updatedSlip;
        }
    );
};


export const checkBillCompleted = async (
    billId
) => {

    const members =
        await prisma.billMember.findMany({
            where: {
                BillId: billId,
                StatusMember: "JOINED"
            }
        });

    if (members.length === 0) {
        return false;
    }

    const allPaid =
        members.every(
            member =>
                member.StatusPay === "PAID"
        );

    if (!allPaid) {
        return false;
    }

    await prisma.bill.update({
        where: {
            Id: billId
        },

        data: {
            StatusReceipt: "COMPLETED",
            CompletedAt: new Date()
        }
    });

    return true;
};