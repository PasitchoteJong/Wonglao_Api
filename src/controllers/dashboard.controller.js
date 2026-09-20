import createHttpError from "http-errors";

import {
    getPersonalExpenseRecords,
    getTeamExpenseRecords,
} from "../services/dashboard.service.js";


// ======================================================
// HELPER : แปลง Date เป็น YYYY-MM-DD ตามเวลาไทย
// ======================================================

const getBangkokDateKey = (date) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;
    return `${year}-${month}-${day}`;
};


// ======================================================
// GET WEEKLY EXPENSES
// ======================================================

export const getWeeklyExpenses = async (req, res, next) => {
    try {
        // ========================================
        // USER
        // ========================================

        const userId = req.user.userId;

        // ========================================
        // QUERY
        // ========================================
        const { startDate } = req.query;
        if (!startDate) throw createHttpError(400, "startDate is required");
        /*
  FE ส่งมาเช่น
 
  2026-09-20
 
  หมายถึง:
  Sunday 00:00:00 เวลาไทย
*/

        const weekStart = new Date(`${startDate}T00:00:00.000+07:00`);

        if (Number.isNaN(weekStart.getTime())) throw createHttpError(400, "Invalid startDate");


        // ========================================
        // CHECK ว่าเป็น Sunday จริงหรือไม่
        // ========================================

        const bangkokDayName = new Intl.DateTimeFormat("en-US",
            {
                timeZone: "Asia/Bangkok",
                weekday: "short",
            }
        ).format(weekStart);

        if (bangkokDayName !== "Sun") throw createHttpError(400, "startDate must be Sunday");


        // ========================================
        // WEEK END
        // Sunday 00:00 → Saturday 23:59:59
        // ========================================

        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

        // ========================================
        // GET DATABASE DATA
        // ========================================

        const [personalRecords, teamRecords] = await Promise.all([getPersonalExpenseRecords({
            userId,
            startDate: weekStart,
            endDate: weekEnd,
        }),

        getTeamExpenseRecords({
            userId,
            startDate: weekStart,
            endDate: weekEnd,
        }),
        ]);

        // ========================================
        // TODAY
        // ========================================

        const todayKey = getBangkokDateKey(new Date());

        // ========================================
        // CREATE 7 DAYS
        // Sun - Sat
        // ========================================

        const weeklyData = [];

        for (
            let index = 0;
            index < 7;
            index++
        ) {
            const date = new Date(
                weekStart.getTime() +
                index *
                24 *
                60 *
                60 *
                1000
            );

            const dateKey = getBangkokDateKey(date);

            /*
              ถ้ายังไม่ถึงวันนั้น
      
              personal = null
              team = null
      
              เพื่อให้กราฟยังมีช่อง
              Sun Mon Tue Wed Thu Fri Sat
      
              แต่ไม่วาดแท่งในอนาคต
            */

            const isFuture = dateKey > todayKey;
            weeklyData.push({
                date: dateKey,
                personal: isFuture ? null : 0,
                team: isFuture ? null : 0,
            });
        }

        // ========================================
        // MY EXPENSE
        // ========================================

        for (const record of personalRecords) {
            if (!record.Bill) continue;


            const dateKey = getBangkokDateKey(record.Bill.CreatedAt);

            const day = weeklyData.find(
                (item) => item.date === dateKey
            );

            if (!day || day.personal === null) continue;


            day.personal += Number(record.AmountToPay || 0);
        }

        // ========================================
        // TEAM EXPENSE
        //
        // User join Bill ไหน
        // → นับ TotalAmount ของ Bill นั้น
        //
        // ใช้ Set กัน Bill ซ้ำ
        // ========================================

        const countedBillIds = new Set();

        for (const record of teamRecords) {
            const bill = record.Bill;

            if (!bill) continue;


            /*
              กันกรณี User เดียวมี
              BillMember ซ้ำใน Bill เดียว
            */

            if (countedBillIds.has(bill.Id)) continue;
            countedBillIds.add(bill.Id);
            const dateKey = getBangkokDateKey(bill.CreatedAt);
            const day = weeklyData.find(
                (item) => item.date === dateKey
            );

            if (!day || day.team === null) continue;

            day.team += Number(bill.TotalAmount || 0);
        }

        // ========================================
        // TOTAL MY EXPENSE
        // ========================================

        const personalTotal = weeklyData.reduce(
            (sum, day) => {
                return (sum + Number(day.personal || 0));
            },
            0
        );

        // ========================================
        // TOTAL TEAM EXPENSE
        // ========================================

        const teamTotal = weeklyData.reduce(
            (sum, day) => {
                return (sum + Number(day.team || 0)
                );
            },
            0
        );

        // ========================================
        // RESPONSE
        // ========================================

        return res
            .status(200)
            .json({
                message: "Weekly expenses retrieved successfully",

                data: {
                    startDate: getBangkokDateKey(weekStart),
                    endDate: getBangkokDateKey(weekEnd),
                    personalTotal,
                    teamTotal,
                    days: weeklyData,
                },
            });

    } catch (error) {
        next(error);
    }
};