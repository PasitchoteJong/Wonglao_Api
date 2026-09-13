import createHttpError from "http-errors";
import { updateSplitmethod } from "../services/split.service.js";


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