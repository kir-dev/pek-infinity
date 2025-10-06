/*
  Warnings:

  - You are about to drop the column `submitedAt` on the `Scoreboard` table. All the data in the column will be lost.
  - You are about to drop the column `cellPhone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfBirth` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dormitory` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `homeAddress` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isArchived` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `nickname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `room` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `studentStatus` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SensitiveInfoPrivacy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RoleToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SvieStatus" AS ENUM ('FOREIGN', 'ACTIVE', 'FORMAL');

-- DropForeignKey
ALTER TABLE "public"."ExternalAccountLink" DROP CONSTRAINT "ExternalAccountLink_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SensitiveInfoPrivacy" DROP CONSTRAINT "SensitiveInfoPrivacy_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_RoleToUser" DROP CONSTRAINT "_RoleToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_RoleToUser" DROP CONSTRAINT "_RoleToUser_B_fkey";

-- AlterTable
ALTER TABLE "Scoreboard" DROP COLUMN "submitedAt",
ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "cellPhone",
DROP COLUMN "dateOfBirth",
DROP COLUMN "dormitory",
DROP COLUMN "firstName",
DROP COLUMN "gender",
DROP COLUMN "homeAddress",
DROP COLUMN "isArchived",
DROP COLUMN "lastName",
DROP COLUMN "nickname",
DROP COLUMN "room",
DROP COLUMN "studentStatus",
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."Role";

-- DropTable
DROP TABLE "public"."SensitiveInfoPrivacy";

-- DropTable
DROP TABLE "public"."_RoleToUser";

-- DropEnum
DROP TYPE "public"."RoleCategory";

-- DropEnum
DROP TYPE "public"."SensitiveInfoAttribute";

-- CreateTable
CREATE TABLE "SvieCard" (
    "userId" TEXT NOT NULL,
    "homeAddress" TEXT NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "birthDate" DATE NOT NULL,
    "birthName" TEXT NOT NULL,
    "mothersName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SvieCard_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "SvieStatusHistory" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "status" "SvieStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SvieStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "nickname" TEXT,
    "cellPhone" TEXT,
    "room" TEXT,
    "dormitory" "Dormitory" DEFAULT 'UNKNOWN',
    "gender" "Gender" DEFAULT 'UNKNOWN',
    "studentStatus" "StudentStatus" DEFAULT 'UNKNOWN',

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "SvieCard_userId_key" ON "SvieCard"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "SvieCard" ADD CONSTRAINT "SvieCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SvieStatusHistory" ADD CONSTRAINT "SvieStatusHistory_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "SvieCard"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAccountLink" ADD CONSTRAINT "ExternalAccountLink_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
