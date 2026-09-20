import { prisma } from '../../lib/prisma.js'

// ========================================
// MY EXPENSE
// AmountToPay ของ user ปัจจุบัน
// ========================================

export const getPersonalExpenseRecords = async ({
  userId,
  startDate,
  endDate,
}) => {
  return prisma.billMember.findMany({
    where: {
      UserId: userId,

      StatusMember: "JOINED",

      Bill: {
        CreatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    },

    select: {
      Id: true,
      BillId: true,
      AmountToPay: true,

      Bill: {
        select: {
          Id: true,
          CreatedAt: true,
        },
      },
    },
  });
};


// ========================================
// TEAM EXPENSE
// TotalAmount ของทุก Bill
// ที่ user ปัจจุบัน JOIN อยู่
// ========================================

export const getTeamExpenseRecords = async ({
  userId,
  startDate,
  endDate,
}) => {
  return prisma.billMember.findMany({
    where: {
      UserId: userId,

      StatusMember: "JOINED",

      Bill: {
        CreatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    },

    select: {
      BillId: true,

      Bill: {
        select: {
          Id: true,
          TotalAmount: true,
          CreatedAt: true,
        },
      },
    },
  });
};