import createHttpError from "http-errors";
import { getBillWithJoinedMember, updateBillMembers, updateSplitmethod } from "../services/split.service.js";


export const selectSplitMethod = async (req, res, next) => {
    try {
        const { billId } = req.params;
        const { splitMethod } = req.body;

        const allowedMethods = ["EQUAL", "PROPORTIONAL", "ROULETTE"];

        if (!allowedMethods.includes(splitMethod)) {
            throw createHttpError(400, "Invalid split method")
        }

        const bill = await updateSplitmethod(billId, splitMethod)

        return res.status(200).json({
            message: "Split method selected successful",
            data: bill
        })
    } catch (error) {
        next(error)
    }
}

export const calculateEqual = async (req, res, next) => {
    try {
        const { billId } = req.params;

        const bill = await getBillWithJoinedMember(billId);

        if (!bill) throw createHttpError(400,"Bill not found");
        if (!bill.TotalAmount) throw createHttpError(400,"Bill total amount is missing");

        const members = bill.Billmember;
        if (members.length === 0) throw createHttpError(400,"No member joined");

        //cal
        const totalAmount = Number(bill.TotalAmount);
        const memberCount = members.length;
        const baseAmount = Math.floor((totalAmount / memberCount) * 100) / 100;

        const totalBase = baseAmount * memberCount;
        const remainder = Math.round((totalAmount - totalBase) * 100);


        const updates = members.map((member, index) => {
            const amount = baseAmount + (index < remainder ? 0.01 : 0);

            return {
                Id: member.Id,
                AmountToPay: amount
            }
        });

        const updatedMember = await updateBillMembers(updates);

        return res.status(200).json({
            message: "Equal split calculated successful",
            data: updatedMember
        })
    } catch (error) {
        next(error)
    }

}