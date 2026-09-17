-- CreateEnum
CREATE TYPE "StatusReceiptType" AS ENUM ('PENDING', 'CHECKING', 'VERIFIED', 'COMPLETED', 'CANCLE');

-- CreateEnum
CREATE TYPE "StatusMemberType" AS ENUM ('INVITED', 'JOINED', 'LEFT');

-- CreateEnum
CREATE TYPE "StatusPayType" AS ENUM ('UNPAID', 'PENDING_VERIFY', 'PAID');

-- CreateEnum
CREATE TYPE "SplitMethod" AS ENUM ('EQUAL', 'PROPORTIONAL', 'ROULETTE');

-- CreateTable
CREATE TABLE "User" (
    "Id" TEXT NOT NULL,
    "LineUserId" TEXT NOT NULL,
    "DisplayName" TEXT,
    "ProfileImage" TEXT NOT NULL,
    "Email" TEXT,
    "BirthDay" TIMESTAMP(3),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "QRpayment" TEXT,
    "PromptPay" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "Id" TEXT NOT NULL,
    "MemberId" TEXT NOT NULL,
    "ShopName" TEXT,
    "ReceiptImage" TEXT NOT NULL,
    "TotalAmount" DECIMAL(15,2),
    "MemberAmount" INTEGER,
    "StatusReceipt" "StatusReceiptType" NOT NULL DEFAULT 'PENDING',
    "ServiceChargeType" BOOLEAN NOT NULL DEFAULT false,
    "ServiceChargeAmount" INTEGER,
    "Vat" BOOLEAN NOT NULL DEFAULT true,
    "SplitMethod" "SplitMethod",
    "AcceptedAt" TIMESTAMP(3),
    "CompletedAt" TIMESTAMP(3),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "BillItem" (
    "Id" TEXT NOT NULL,
    "BillId" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Price" DECIMAL(15,2) NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "CostTotal" DECIMAL(15,2) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillItem_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "BillMember" (
    "Id" TEXT NOT NULL,
    "BillId" TEXT NOT NULL,
    "UserId" TEXT NOT NULL,
    "DisplayName" TEXT NOT NULL,
    "IsAction" BOOLEAN NOT NULL DEFAULT true,
    "StatusMember" "StatusMemberType" NOT NULL DEFAULT 'JOINED',
    "StatusPay" "StatusPayType" NOT NULL DEFAULT 'UNPAID',
    "AmountToPay" DECIMAL(15,2),
    "AmountPaid" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "RouletteEligible" BOOLEAN NOT NULL DEFAULT false,
    "PaymentAccepted" BOOLEAN NOT NULL DEFAULT false,
    "JoinAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillMember_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "BillItemMember" (
    "Id" TEXT NOT NULL,
    "BillItemId" TEXT NOT NULL,
    "BillMemberId" TEXT NOT NULL,
    "Eating" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BillItemMember_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "PaymentSlip" (
    "Id" TEXT NOT NULL,
    "BillId" TEXT NOT NULL,
    "BillMemberId" TEXT NOT NULL,
    "Amount" DECIMAL(15,2) NOT NULL,
    "StatusPay" "StatusPayType" NOT NULL DEFAULT 'UNPAID',
    "ProofImage" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentSlip_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_LineUserId_key" ON "User"("LineUserId");

-- CreateIndex
CREATE UNIQUE INDEX "BillItemMember_BillItemId_BillMemberId_key" ON "BillItemMember"("BillItemId", "BillMemberId");

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_MemberId_fkey" FOREIGN KEY ("MemberId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_BillId_fkey" FOREIGN KEY ("BillId") REFERENCES "Bill"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillMember" ADD CONSTRAINT "BillMember_BillId_fkey" FOREIGN KEY ("BillId") REFERENCES "Bill"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillMember" ADD CONSTRAINT "BillMember_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItemMember" ADD CONSTRAINT "BillItemMember_BillItemId_fkey" FOREIGN KEY ("BillItemId") REFERENCES "BillItem"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItemMember" ADD CONSTRAINT "BillItemMember_BillMemberId_fkey" FOREIGN KEY ("BillMemberId") REFERENCES "BillMember"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSlip" ADD CONSTRAINT "PaymentSlip_BillId_fkey" FOREIGN KEY ("BillId") REFERENCES "Bill"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentSlip" ADD CONSTRAINT "PaymentSlip_BillMemberId_fkey" FOREIGN KEY ("BillMemberId") REFERENCES "BillMember"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
