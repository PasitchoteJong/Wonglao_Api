import { prisma } from '../../lib/prisma.js'
import createHttpError from 'http-errors'
import { getBillByBillId } from '../services/bill.service.js'
import {
    createBillmember,
    getExistingMember,
    getJoinBillService
} from '../services/joinBill.service.js'



export const joinBill = async (req, res, next) => {
    try {
        const { billId } = req.params
        const user = req.user


        const bill = await getBillByBillId(billId)
        if (!bill) { throw createHttpError(400, "Bill not found") }

        const existingMember = await getExistingMember(billId, user.userId)
        if (existingMember) {
            return res.status(200).json({
                message: "User already joined this bill",
                data: existingMember
            });
        }


        let payloadMember = {
            billId,
            userId: user.userId,
            displayName: user.displayName
        }

        const member = await createBillmember(payloadMember)


        return res.status(200).json({
            message: "Join Bill successful",
            data: member
        });
    } catch (error) {
        next(error);
    }

}

export const getJoinBill = async (req, res, next) => {
    try {
        const { billId } = req.params;
        const bill = await getJoinBillService(billId);
        if (!bill) throw createHttpError(400, "Bill not found")

        res.status(200).json({
            message: "Get join bill successful",
            data: bill
        })
    } catch (error) {
        next(error);
    }
}