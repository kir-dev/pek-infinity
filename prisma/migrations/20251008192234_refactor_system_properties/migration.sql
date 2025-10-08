/*
  Warnings:

  - You are about to drop the `SystemAttributes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."SystemAttributes";

-- DropEnum
DROP TYPE "public"."SystemAttributeKey";

-- CreateTable
CREATE TABLE "CurrentSemester" (
    "semesterName" TEXT NOT NULL,

    CONSTRAINT "CurrentSemester_pkey" PRIMARY KEY ("semesterName")
);
