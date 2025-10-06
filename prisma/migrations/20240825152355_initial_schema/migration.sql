-- CreateEnum
CREATE TYPE "Dormitory" AS ENUM ('KARMAN', 'TETENY', 'SCH', 'BAROSS', 'BERCSENYI', 'VASARHELYI', 'EXTERNAL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'GRADUATED', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ExternalAccountProtocol" AS ENUM ('twitter', 'skype', 'call_sign', 'irc', 'gtalk', 'jabber', 'facebook', 'Telegram', 'sch_mail', 'Hímzek', 'gmail', '🍆');

-- CreateEnum
CREATE TYPE "SensitiveInfoAttribute" AS ENUM ('CELL_PHONE', 'EMAIL', 'WEBPAGE', 'ROOM_NUMBER', 'GENDER', 'HOME_ADDRESS', 'DATE_OF_BIRTH');

-- CreateEnum
CREATE TYPE "GroupPurpose" AS ENUM ('UNKNOWN', 'OLD', 'COMMITTEE', 'PARTY', 'CIRCLE', 'D', 'ELLIPSE', 'YEAR_CLASS', 'GROUP', 'CULTURE', 'PROJECT', 'EVENT', 'RESORT', 'SPORT', 'PROFESSIONAL', 'FLOOR', 'SERVICE');

-- CreateEnum
CREATE TYPE "PostCategory" AS ENUM ('WORK', 'RESPONSIBILITY');

-- CreateEnum
CREATE TYPE "MembershipKind" AS ENUM ('NEWBIE', 'ACTIVE', 'FORMER', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EntryAwardType" AS ENUM ('KDO', 'KB', 'AB');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('NOT_SUBMITTED', 'NOT_YET_EVALUATED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RoleCategory" AS ENUM ('GLOBAL', 'PROFILE', 'SYSTEM_DERIVED', 'GROUP_DERIVED', 'STATEMENT_AUTHORIZED', 'USER_GENERATED', 'OTHER');

-- CreateEnum
CREATE TYPE "SystemAttributeKey" AS ENUM ('SEMESTER', 'NEWBIE_PERIOD', 'LAST_LOG_SENT', 'MAX_POINT_FOR_SEMESTER', 'EVALUATION_PERIOD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "authSchId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL,
    "cellPhone" TEXT NOT NULL,
    "homeAddress" TEXT NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "room" TEXT NOT NULL,
    "dormitory" "Dormitory" NOT NULL DEFAULT 'UNKNOWN',
    "gender" "Gender" NOT NULL DEFAULT 'UNKNOWN',
    "studentStatus" "StudentStatus" NOT NULL DEFAULT 'UNKNOWN',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Username" (
    "humanId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Username_pkey" PRIMARY KEY ("humanId")
);

-- CreateTable
CREATE TABLE "ExternalAccountLink" (
    "id" TEXT NOT NULL,
    "protocol" "ExternalAccountProtocol" NOT NULL,
    "accountName" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "ExternalAccountLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensitiveInfoPrivacy" (
    "id" TEXT NOT NULL,
    "attributeName" "SensitiveInfoAttribute" NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "SensitiveInfoPrivacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "parentId" TEXT,
    "purpose" "GroupPurpose" NOT NULL,
    "isCommunity" BOOLEAN NOT NULL,
    "isResort" BOOLEAN NOT NULL,
    "isTaskForce" BOOLEAN NOT NULL,
    "hasTransitiveMembership" BOOLEAN NOT NULL,
    "isArchived" BOOLEAN NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "flairs" TEXT[],

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuidelineCollection" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,

    CONSTRAINT "GuidelineCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guideline" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "postCategory" "PostCategory" NOT NULL,
    "maxPerMember" INTEGER NOT NULL,
    "maxPerGuideline" INTEGER NOT NULL,
    "collectionId" TEXT NOT NULL,

    CONSTRAINT "Guideline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scoreboard" (
    "id" TEXT NOT NULL,
    "guidelinesId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submitedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "discussion" JSONB[],
    "previousVersionId" TEXT,

    CONSTRAINT "Scoreboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointRequest" (
    "id" TEXT NOT NULL,
    "scoreboardId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "guidelineId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "discussion" JSONB[],

    CONSTRAINT "PointRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "scoreboardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluatorId" TEXT NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("scoreboardId")
);

-- CreateTable
CREATE TABLE "MembershipStatus" (
    "membershipId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "until" TIMESTAMP(3),
    "type" "MembershipKind" NOT NULL,

    CONSTRAINT "MembershipStatus_pkey" PRIMARY KEY ("membershipId","start","type")
);

-- CreateTable
CREATE TABLE "EntryAwardRequest" (
    "id" TEXT NOT NULL,
    "type" "EntryAwardType" NOT NULL DEFAULT 'KDO',
    "justification" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "awardeeId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "requesterId" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL,

    CONSTRAINT "EntryAwardRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointHistory" (
    "awardeeId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "PointHistory_pkey" PRIMARY KEY ("awardeeId","semesterId")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "RoleCategory" NOT NULL,
    "permissions" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiration" TIMESTAMP(3),

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semester" (
    "name" TEXT NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "SystemAttributes" (
    "name" "SystemAttributeKey" NOT NULL,
    "value" VARCHAR(255) NOT NULL,

    CONSTRAINT "SystemAttributes_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "senderId" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_authSchId_key" ON "User"("authSchId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_groupId_key" ON "Membership"("userId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "Scoreboard_previousVersionId_key" ON "Scoreboard"("previousVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "Scoreboard_groupId_semesterId_version_key" ON "Scoreboard"("groupId", "semesterId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "PointRequest_scoreboardId_membershipId_guidelineId_key" ON "PointRequest"("scoreboardId", "membershipId", "guidelineId");

-- CreateIndex
CREATE UNIQUE INDEX "EntryAwardRequest_membershipId_semesterId_key" ON "EntryAwardRequest"("membershipId", "semesterId");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "_RoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- AddForeignKey
ALTER TABLE "Username" ADD CONSTRAINT "Username_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalAccountLink" ADD CONSTRAINT "ExternalAccountLink_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensitiveInfoPrivacy" ADD CONSTRAINT "SensitiveInfoPrivacy_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidelineCollection" ADD CONSTRAINT "GuidelineCollection_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuidelineCollection" ADD CONSTRAINT "GuidelineCollection_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guideline" ADD CONSTRAINT "Guideline_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "GuidelineCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scoreboard" ADD CONSTRAINT "Scoreboard_guidelinesId_fkey" FOREIGN KEY ("guidelinesId") REFERENCES "GuidelineCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scoreboard" ADD CONSTRAINT "Scoreboard_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scoreboard" ADD CONSTRAINT "Scoreboard_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scoreboard" ADD CONSTRAINT "Scoreboard_previousVersionId_fkey" FOREIGN KEY ("previousVersionId") REFERENCES "Scoreboard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointRequest" ADD CONSTRAINT "PointRequest_scoreboardId_fkey" FOREIGN KEY ("scoreboardId") REFERENCES "Scoreboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointRequest" ADD CONSTRAINT "PointRequest_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointRequest" ADD CONSTRAINT "PointRequest_guidelineId_fkey" FOREIGN KEY ("guidelineId") REFERENCES "Guideline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_scoreboardId_fkey" FOREIGN KEY ("scoreboardId") REFERENCES "Scoreboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipStatus" ADD CONSTRAINT "MembershipStatus_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryAwardRequest" ADD CONSTRAINT "EntryAwardRequest_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryAwardRequest" ADD CONSTRAINT "EntryAwardRequest_awardeeId_fkey" FOREIGN KEY ("awardeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryAwardRequest" ADD CONSTRAINT "EntryAwardRequest_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryAwardRequest" ADD CONSTRAINT "EntryAwardRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntryAwardRequest" ADD CONSTRAINT "EntryAwardRequest_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointHistory" ADD CONSTRAINT "PointHistory_awardeeId_fkey" FOREIGN KEY ("awardeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointHistory" ADD CONSTRAINT "PointHistory_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
