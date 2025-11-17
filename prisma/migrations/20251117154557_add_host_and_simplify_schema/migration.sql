/*
  Warnings:

  - You are about to drop the column `capacity` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `organizerId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `inviteCode` on the `Guest` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Guest` table. All the data in the column will be lost.
  - You are about to drop the column `organizerId` on the `Guest` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Guest` table. All the data in the column will be lost.
  - You are about to drop the column `dietaryReqs` on the `Response` table. All the data in the column will be lost.
  - You are about to drop the column `message` on the `Response` table. All the data in the column will be lost.
  - You are about to drop the `EventOrganizer` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[lineupId,slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lineupId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lineupId` to the `Guest` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Create new tables first
-- CreateTable
CREATE TABLE "Host" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLineup" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "eventCategory" TEXT NOT NULL,
    "organizerName" TEXT NOT NULL,
    "organizerEmail" TEXT NOT NULL,
    "groomName" TEXT,
    "brideName" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventLineup_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create indexes for new tables
CREATE UNIQUE INDEX "Host_email_key" ON "Host"("email");
CREATE INDEX "Host_email_idx" ON "Host"("email");

CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");
CREATE INDEX "Session_hostId_idx" ON "Session"("hostId");
CREATE INDEX "Session_token_idx" ON "Session"("token");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

CREATE UNIQUE INDEX "EventLineup_slug_key" ON "EventLineup"("slug");
CREATE INDEX "EventLineup_hostId_idx" ON "EventLineup"("hostId");
CREATE INDEX "EventLineup_slug_idx" ON "EventLineup"("slug");
CREATE INDEX "EventLineup_isActive_idx" ON "EventLineup"("isActive");
CREATE INDEX "EventLineup_eventCategory_idx" ON "EventLineup"("eventCategory");

-- Step 3: Create a default Host for existing data
INSERT INTO "Host" ("id", "name", "email", "passwordHash", "createdAt", "updatedAt")
VALUES (
  'default-host-migration',
  'Default Host',
  'admin@events.local',
  '$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', -- Placeholder hash
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Step 4: Migrate EventOrganizer to EventLineup
INSERT INTO "EventLineup" (
  "id",
  "hostId",
  "title",
  "slug",
  "eventCategory",
  "organizerName",
  "organizerEmail",
  "groomName",
  "brideName",
  "description",
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT 
  "id",
  'default-host-migration',
  "title",
  "slug",
  "eventCategory",
  "organizerName",
  "organizerEmail",
  "groomName",
  "brideName",
  "description",
  "isActive",
  "createdAt",
  "updatedAt"
FROM "EventOrganizer";

-- Step 5: Add lineupId columns to Event and Guest (nullable first)
ALTER TABLE "Event" ADD COLUMN "lineupId" TEXT;
ALTER TABLE "Guest" ADD COLUMN "lineupId" TEXT;

-- Step 6: Populate lineupId from organizerId
UPDATE "Event" SET "lineupId" = "organizerId";
UPDATE "Guest" SET "lineupId" = "organizerId";

-- Step 7: Make lineupId NOT NULL
ALTER TABLE "Event" ALTER COLUMN "lineupId" SET NOT NULL;
ALTER TABLE "Guest" ALTER COLUMN "lineupId" SET NOT NULL;

-- Step 8: Drop old foreign keys
ALTER TABLE "Event" DROP CONSTRAINT "Event_organizerId_fkey";
ALTER TABLE "Guest" DROP CONSTRAINT "Guest_organizerId_fkey";

-- Step 9: Drop old indexes
DROP INDEX "Event_organizerId_idx";
DROP INDEX "Event_organizerId_slug_key";
DROP INDEX "Guest_inviteCode_idx";
DROP INDEX IF EXISTS "Guest_inviteCode_key";
DROP INDEX IF EXISTS "Guest_organizerId_email_key";
DROP INDEX "Guest_organizerId_idx";

-- Step 10: Drop old columns
ALTER TABLE "Event" DROP COLUMN "capacity";
ALTER TABLE "Event" DROP COLUMN "organizerId";
ALTER TABLE "Guest" DROP COLUMN "inviteCode";
ALTER TABLE "Guest" DROP COLUMN "notes";
ALTER TABLE "Guest" DROP COLUMN "organizerId";
ALTER TABLE "Guest" DROP COLUMN "phone";
ALTER TABLE "Guest" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "Response" DROP COLUMN "dietaryReqs";
ALTER TABLE "Response" DROP COLUMN "message";

-- Step 11: Drop old table
DROP TABLE "EventOrganizer";

-- Step 11: Drop old table
DROP TABLE "EventOrganizer";

-- Step 12: Create new indexes for Event and Guest
CREATE INDEX "Event_lineupId_idx" ON "Event"("lineupId");
CREATE UNIQUE INDEX "Event_lineupId_slug_key" ON "Event"("lineupId", "slug");
CREATE INDEX "Guest_lineupId_idx" ON "Guest"("lineupId");

-- Step 13: Add new foreign keys
ALTER TABLE "Session" ADD CONSTRAINT "Session_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventLineup" ADD CONSTRAINT "EventLineup_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Host"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_lineupId_fkey" FOREIGN KEY ("lineupId") REFERENCES "EventLineup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_lineupId_fkey" FOREIGN KEY ("lineupId") REFERENCES "EventLineup"("id") ON DELETE CASCADE ON UPDATE CASCADE;