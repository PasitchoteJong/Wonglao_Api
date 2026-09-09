import createHttpError from "http-errors";
import { createBillInDB, saveOCRResultToBill } from "../services/bill.service.js";
import { extractTextFromReceipt } from "../services/ocr.service.js";
import { structureReceiptText } from "../services/gemini.service.js";
import { prisma } from "../../lib/prisma.js";
import path from "path";

/**
 * Create a new bill and automatically process receipt OCR in the background
 */
export const createBill = async (req, res, next) => {
    try {
        const { billName } = req.body;
        const receiptImage = req.file
            ? `/uploads/receipts/${req.file.filename}`
            : null;

        if (!billName) {
            throw createHttpError(400, "Bill name is required");
        }

        if (!receiptImage) {
            throw createHttpError(400, "Receipt image is required");
        }

        // 1. Create initial bill record in the database
        const newBill = await createBillInDB({
            memberId: req.user?.userId || req.user?.id,
            shopName: billName,
            receiptImage: receiptImage,
        });

        // 2. If receipt image exists, process OCR and structure text via Gemini in the background
        try {
            const absolutePath = path.join(process.cwd(), receiptImage);
            const ocrText = await extractTextFromReceipt(absolutePath);
            
            if (ocrText) {
                const structureData = await structureReceiptText(ocrText);
                
                // 3. Save OCR results (shop name, total amount, items) to the bill
                if (structureData) {
                    await saveOCRResultToBill(newBill.Id, {
                        shopName: structureData.shopName || billName,
                        totalAmount: structureData.totalAmount || 0,
                        items: structureData.items || []
                    });
                }
            }
        } catch (ocrError) {
            console.error("Auto OCR Processing Warning:", ocrError);
            // Skip OCR errors to prevent blocking bill creation
        }

        // Retrieve the latest bill data including updated OCR items
        const finalBill = await prisma.bill.findUnique({
            where: { Id: newBill.Id },
            include: { BillItem: true }
        });

        return res.status(201).json({
            message: "Bill created and processed with OCR",
            bill: finalBill
        });

    } catch (error) {
        console.error("Create Bill Error:", error);
        next(error.status ? error : createHttpError(500, "Failed to create bill"));
    }
};

/**
 * Get bill details by ID including its items
 */
export const getBillById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const bill = await prisma.bill.findUnique({
            where: { Id: id },
            include: { BillItem: true }
        });

        if (!bill) {
            throw createHttpError(404, "Bill not found");
        }

        return res.status(200).json({ bill });
    } catch (error) {
        console.error("Get Bill Error:", error);
        next(error.status ? error : createHttpError(500, "Failed to get bill"));
    }
};

/**
 * Verify and update bill details manually
 */
export const verifyBill = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { shopName, totalAmount } = req.body;

        const updatedBill = await saveOCRResultToBill(id, {
            shopName,
            totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
            items: []
        });

        return res.status(200).json({
            message: "Bill verified successfully",
            bill: updatedBill
        });
    } catch (error) {
        console.error("Verify Bill Error:", error);
        next(error.status ? error : createHttpError(500, "Failed to verify bill"));
    }
};

// --- Feature 6: Food Selection & Bill Splitting ---

/**
 * Get food selection data (bill items, member selections, and members)
 */
export const getFoodSelection = async (req, res, next) => {
    try {
        const { id } = req.params;

        const bill = await prisma.bill.findUnique({
            where: { Id: id },
            include: {
                BillItem: {
                    include: {
                        BillItemMember: true
                    }
                },
                Billmember: true
            }
        });

        if (!bill) {
            throw createHttpError(404, "Bill not found");
        }

        return res.status(200).json({ bill });
    } catch (error) {
        console.error("Get Food Selection Error:", error);
        next(createHttpError(500, "Failed to get food selection data"));
    }
};

/**
 * Update member food selections (Eating status)
 */
export const updateFoodSelection = async (req, res, next) => {
    try {
        const { id: billId } = req.params;
        const { billMemberId, selections } = req.body; 

        if (!billMemberId || !selections || !Array.isArray(selections)) {
            throw createHttpError(400, "Invalid input data: billMemberId and selections array are required");
        }

        for (const selection of selections) {
            await prisma.billItemMember.upsert({
                where: {
                    BillItemId_BillMemberId: {
                        BillItemId: selection.billItemId,
                        BillMemberId: billMemberId,
                    }
                },
                update: { Eating: selection.eating },
                create: {
                    BillItemId: selection.billItemId,
                    BillMemberId: billMemberId,
                    Eating: selection.eating
                }
            });
        }

        return res.status(200).json({
            message: "Food selection updated successfully"
        });
    } catch (error) {
        console.error("Update Food Selection Error:", error);
        next(error.status ? error : createHttpError(500, "Failed to update food selection"));
    }
};

/**
 * Update/Edit bill items manually (useful for correcting incorrect OCR data)
 */
export const updateBillItems = async (req, res, next) => {
    try {
        const { id: billId } = req.params;
        const { items } = req.body; 

        if (!items || !Array.isArray(items)) {
            throw createHttpError(400, "Items array is required");
        }

        const bill = await prisma.bill.findUnique({ where: { Id: billId } });
        if (!bill) {
            throw createHttpError(404, "Bill not found");
        }

        // Use transaction to replace old items with the corrected ones safely
        await prisma.$transaction(async (tx) => {
            await tx.billItem.deleteMany({
                where: { BillId: billId }
            });

            if (items.length > 0) {
                const newItemsData = items.map(item => ({
                    BillId: billId,
                    Name: item.name,
                    Price: parseFloat(item.price) || 0,
                    Quantity: parseInt(item.quantity) || 1,
                    CostTotal: (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)
                }));

                await tx.billItem.createMany({
                    data: newItemsData
                });
            }
        });

        const updatedBill = await prisma.bill.findUnique({
            where: { Id: billId },
            include: { BillItem: true }
        });

        return res.status(200).json({
            message: "Bill items updated successfully",
            bill: updatedBill
        });
    } catch (error) {
        console.error("Update Bill Items Error:", error);
        next(error.status ? error : createHttpError(500, "Failed to update bill items"));
    }
};

/**
 * Calculate and get the bill splitting summary for each member
 */
export const getBillSummary = async (req, res, next) => {
    try {
        const { id: billId } = req.params;

        // Fetch bill details, items with their eating members, and all bill members
        const bill = await prisma.bill.findUnique({
            where: { Id: billId },
            include: {
                BillItem: {
                    include: {
                        BillItemMember: {
                            where: { Eating: true }
                        }
                    }
                },
                Billmember: true
            }
        });

        if (!bill) {
            throw createHttpError(404, "Bill not found");
        }

        // Initialize summary structure for each member in the bill
        const memberSummaries = {};
        bill.Billmember.forEach(member => {
            memberSummaries[member.Id] = {
                memberId: member.Id,
                displayName: member.DisplayName || "Unnamed Member",
                items: [],
                totalAmount: 0
            };
        });

        // Calculate item costs split evenly among eating members
        bill.BillItem.forEach(item => {
            const eatingMembers = item.BillItemMember;
            const eaterCount = eatingMembers.length;

            if (eaterCount > 0) {
                const itemTotal = parseFloat(item.CostTotal || (item.Price * item.Quantity) || 0);
                const costPerPerson = itemTotal / eaterCount;

                eatingMembers.forEach(relation => {
                    const memberId = relation.BillMemberId;
                    if (memberSummaries[memberId]) {
                        memberSummaries[memberId].items.push({
                            itemName: item.Name,
                            shareCost: parseFloat(costPerPerson.toFixed(2))
                        });
                        memberSummaries[memberId].totalAmount += costPerPerson;
                    }
                });
            }
        });

        // Format final totals to 2 decimal places
        const summaryResult = Object.values(memberSummaries).map(summary => ({
            ...summary,
            totalAmount: parseFloat(summary.totalAmount.toFixed(2))
        }));

        return res.status(200).json({
            shopName: bill.ShopName,
            grandTotal: bill.TotalAmount,
            summary: summaryResult
        });

    } catch (error) {
        console.error("Get Bill Summary Error:", error);
        next(error.status ? error : createHttpError(500, "Failed to calculate bill summary"));
    }
};