-- CreateTable
CREATE TABLE "Policy" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "canIssue" BOOLEAN NOT NULL DEFAULT false,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Statement" (
    "id" TEXT NOT NULL,
    "policyId" INTEGER NOT NULL,
    "userIdRestrict" TEXT,
    "groupIdRestrict" TEXT,
    "resource" TEXT NOT NULL,
    "viewMembers" BOOLEAN NOT NULL,
    "editMembers" BOOLEAN NOT NULL,
    "viewGroup" BOOLEAN NOT NULL,
    "editGroupProfile" BOOLEAN NOT NULL,
    "moveGroupOwner" BOOLEAN NOT NULL,
    "viewScores" BOOLEAN NOT NULL,
    "editScores" BOOLEAN NOT NULL,
    "evaluateScores" BOOLEAN NOT NULL,
    "viewBasicProfile" BOOLEAN NOT NULL,
    "viewFullProfile" BOOLEAN NOT NULL,
    "editProfile" BOOLEAN NOT NULL,

    CONSTRAINT "Statement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyAssignment" (
    "userId" TEXT NOT NULL,
    "policyId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,

    CONSTRAINT "PolicyAssignment_pkey" PRIMARY KEY ("userId","policyId")
);

-- CreateIndex
CREATE INDEX "Policy_parentId_idx" ON "Policy"("parentId");

-- CreateIndex
CREATE INDEX "Policy_name_idx" ON "Policy"("name");

-- CreateIndex
CREATE INDEX "PolicyAssignment_userId_idx" ON "PolicyAssignment"("userId");

-- CreateIndex
CREATE INDEX "PolicyAssignment_policyId_idx" ON "PolicyAssignment"("policyId");

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_userIdRestrict_fkey" FOREIGN KEY ("userIdRestrict") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Statement" ADD CONSTRAINT "Statement_groupIdRestrict_fkey" FOREIGN KEY ("groupIdRestrict") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyAssignment" ADD CONSTRAINT "PolicyAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyAssignment" ADD CONSTRAINT "PolicyAssignment_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyAssignment" ADD CONSTRAINT "PolicyAssignment_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
