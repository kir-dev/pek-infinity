/*
  Warnings:

  - You are about to drop the `SvieCard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SvieStatusHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."SvieCard" DROP CONSTRAINT "SvieCard_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SvieStatusHistory" DROP CONSTRAINT "SvieStatusHistory_cardId_fkey";

-- DropTable
DROP TABLE "public"."SvieCard";

-- DropTable
DROP TABLE "public"."SvieStatusHistory";

-- DropEnum
DROP TYPE "public"."SvieStatus";
