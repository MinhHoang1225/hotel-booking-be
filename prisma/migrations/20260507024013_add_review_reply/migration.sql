/*
  Warnings:

  - You are about to drop the column `isActive` on the `Room` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('AVAILABLE', 'CLEANING', 'MAINTENANCE', 'OUT_OF_SERVICE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BookingStatus" ADD VALUE 'CHECKED_IN';
ALTER TYPE "BookingStatus" ADD VALUE 'CHECKED_OUT';
ALTER TYPE "BookingStatus" ADD VALUE 'NO_SHOW';

-- AlterEnum
ALTER TYPE "HotelStatus" ADD VALUE 'SUSPENDED';

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "reply" TEXT;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "isActive",
ADD COLUMN     "status" "RoomStatus" NOT NULL DEFAULT 'AVAILABLE';
