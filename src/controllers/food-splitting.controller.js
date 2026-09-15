import createHttpError from "http-errors";

import {
    getBillForProportionalCalculation,
    getBillMemberByUser,
    getFoodSelectionData,
    getMyFoodSplitData,
    updateFoodSelectionData,
    updateMemberAmounts
} from "../services/food-splitting.service.js";

// --- Feature 6: Food Selection & Bill Splitting ---

/**
 * Get food selection data (bill items, member selections, and members)
 */
export const getFoodSelection = async (req, res, next) => {
    try {
        const { id: billId } = req.params;
        const userId = req.user.userId;

        const bill = await getFoodSelectionData(billId);
        // const bill = await prisma.bill.findUnique({
        //     where: { Id: id },
        //     include: {
        //         BillItem: {
        //             include: {
        //                 BillItemMember: true
        //             }
        //         },
        //         Billmember: true
        //     }
        // });

        if (!bill) throw createHttpError(404, "Bill not found");

        const currentMember = bill.Billmember.find((member) =>
            member.UserId === userId && member.StatusMember === "JOINED"
        );
        if (!currentMember) throw createHttpError(403, "You are not a member of this bill");

        const data = {
            billId: bill.Id,
            shopName: bill.ShopName,
            totalAmount: Number(bill.TotalAmount || 0),

            memberId: currentMember.Id,

            items: bill.BillItem.map((item) => {
                const relation = item.BillItemMember.find((member) => member.BillMemberId === currentMember.Id);

                return {
                    id: item.Id,
                    name: item.Name,
                    price: Number(item.Price),
                    quantity: item.Quantity,
                    costTotal: Number(item.CostTotal),
                    eating: relation?.Eating ?? false
                };
            })
        };



        return res.status(200).json({
            message: "Food selection retrieved successfully",
            data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update member food selections (Eating status)
 */
export const updateFoodSelection = async (req, res, next) => {
    try {
        const { billId } = req.params;
        const { selections } = req.body;

        const userId = req.user.userId;

        if (!Array.isArray(selections)) throw createHttpError(400, "Selections must be an array")


        const bill = await getFoodSelectionData(billId)
        if (!bill) throw createHttpError(404, "Bill not found")


        const member = bill.Billmember.find((member) =>
            member.UserId === userId && member.StatusMember === "JOINED")
        if (!member) throw createHttpError(403, "You are not a member of this bill")


        if (selections.length !== bill.BillItem.length) throw createHttpError(400, "All food items must be selected");

        const itemIds = new Set(bill.BillItem.map((item) => item.Id));

        const selectionIds = new Set(selections.map((selection) => selection.billItemId));

        if (selectionIds.size !== bill.BillItem.length) throw createHttpError(400, "Invalid food selection data");

        for (const selection of selections) {
            if (!itemIds.has(selection.billItemId)) throw createHttpError(400, "Invalid bill item");
            if (typeof selection.eating !== "boolean") throw createHttpError(400, "Eating must be boolean");
        }

        await updateFoodSelectionData({ billMemberId: member.Id, selections });

        // if (!billMemberId || !selections || !Array.isArray(selections)) {
        //     throw createHttpError(400, "Invalid input data: billMemberId and selections array are required");
        // }

        // for (const selection of selections) {
        //     await prisma.billItemMember.upsert({
        //         where: {
        //             BillItemId_BillMemberId: {
        //                 BillItemId: selection.billItemId,
        //                 BillMemberId: billMemberId,
        //             }
        //         },
        //         update: { Eating: selection.eating },
        //         create: {
        //             BillItemId: selection.billItemId,
        //             BillMemberId: billMemberId,
        //             Eating: selection.eating
        //         }
        //     });
        // }

        return res.status(200).json({
            message: "Food selection submitted successfully"
        });

    } catch (error) {
        console.error("Update Food Selection Error:", error);
        next(error);
        // next(error.status ? error : createHttpError(500, "Failed to update food selection"));
    };
};

export const getFoodSelectionStatus = async (req, res, next) => {
    try {
        const { id: billId } = req.params;

        const bill = await getFoodSelectionData(billId);
        if (!bill) throw createHttpError(404, "Bill not found");


        const totalMembers = bill.Billmember.length;
        const totalItems = bill.BillItem.length;
        const members = bill.Billmember.map((member) => {
            const itemCount = bill.BillItem.filter(
                (item) => item.BillItemMember.some(
                    (relation) => relation.BillMemberId === member.Id
                )
            ).length;

            return {
                id: member.Id,
                displayName: member.DisplayName,
                submitted: itemCount === totalItems
            };
        }
        );

        const submittedMembers = members.filter((member) => member.submitted).length;

        const progress = totalMembers === 0 ? 0 : Math.round((submittedMembers / totalMembers) * 100);

        return res.status(200).json({
            message:
                "Food selection status retrieved successfully",

            data: {
                totalMembers,
                submittedMembers,
                progress,
                completed: submittedMembers === totalMembers,
                members
            }
        });
    } catch (error) {
        next(error);
    }
};




/**
 * Calculate and get the bill splitting summary for each member
*/
export const calculateProportionalSplit = async (req, res, next) => {
    try {
        const { billId } = req.params;

        // Fetch bill details, items with their eating members, and all bill members
        const bill = await getBillForProportionalCalculation(billId);
        // const bill = await prisma.bill.findUnique({
        //     where: { Id: billId },
        //     include: {
        //         BillItem: {
        //             include: {
        //                 BillItemMember: {
        //                     where: { Eating: true }
        //                 }
        //             }
        //         },
        //         Billmember: true
        //     }
        // });

        if (!bill) {
            throw createHttpError(404, "Bill not found");
        }
        if (bill.Billmember.length === 0) {
            throw createHttpError(
                400,
                "No member joined this bill"
            );
        }

        const memberAmounts = {};

        bill.Billmember.forEach((member) => {
            memberAmounts[member.Id] = 0;
        });

        for (const item of bill.BillItem) {
            const eatingMembers = item.BillItemMember;

            if (eatingMembers.length === 0) {
                continue;
            }

            const itemTotal = Number(item.CostTotal || 0);

            const amountPerPerson = itemTotal / eatingMembers.length;

            for (const relation of eatingMembers) {
                if (memberAmounts[relation.BillMemberId] !== undefined) {
                    memberAmounts[relation.BillMemberId] += amountPerPerson;
                }
            }
        }

        const updates = bill.Billmember.map((member) => ({
            memberId: member.Id,
            amountToPay: Number(memberAmounts[member.Id].toFixed(2))
        }));

        const updatedMembers = await updateMemberAmounts(updates);

        return res.status(200).json({
            message: "Proportional split calculated successfully",
            data: updatedMembers
        });

    } catch (error) {
        console.error("Get Bill Summary Error:", error);
        next(error);
        // next(error.status ? error : createHttpError(500, "Failed to calculate bill summary"));
    }
};

export const getMyFoodSplitForMe = async (req, res, next) => {
    try {
        const { billId } = req.params;
        const userId = req.user.userId;

        const member = await getBillMemberByUser({ billId, userId });

        if (!member) throw createHttpError(404, "You are not a member of this bill");


        return res.status(200).json({
            message: "My food split retrieved successfully",
            data: member
        });

    } catch (error) {
        next(error);
    }
};


export const getMyFoodSplit = async (req, res, next) => {
    try {
        const { billId } = req.params;
        const userId = req.user.userId;

        const member = await getMyFoodSplitData({ billId, userId });

        if (!member) throw createHttpError(404, "You are not a member of this bill");


        const items = member.BillItemMember.map((selection) => {
            const item = selection.BillItem;
            const eaterCount = item.BillItemMember.length;
            const itemTotal = Number(item.CostTotal || 0);
            const shareCost =
                eaterCount > 0
                    ? itemTotal / eaterCount
                    : 0;

            return {
                itemId: item.Id,
                itemName: item.Name,
                price: Number(item.Price),
                quantity: item.Quantity,
                itemTotal,
                eaterCount,
                shareCost: Number(shareCost.toFixed(2))
            };
        });

        const totalAmount = items.reduce(
            (sum, item) => sum + item.shareCost,
            0
        );

        return res.status(200).json({
            message: "My food split retrieved successfully",

            data: {
                memberId: member.Id,
                userId: member.UserId,
                displayName: member.DisplayName,

                items,

                totalAmount: Number(totalAmount.toFixed(2)),
                amountToPay: Number(member.AmountToPay || 0),
                amountPaid: Number(member.AmountPaid || 0),

                statusPay: member.StatusPay,
                paymentAccepted: member.PaymentAccepted
            }
        });

    } catch (error) {
        next(error);
    }
};