/*
  Warnings:

  - Added the required column `contactNumber` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "contactNumber" TEXT NOT NULL,
ADD COLUMN     "userId" UUID NOT NULL;
