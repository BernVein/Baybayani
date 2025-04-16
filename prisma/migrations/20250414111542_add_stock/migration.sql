/*
  Warnings:

  - The primary key for the `_FarmerProducts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_FarmerProducts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_FarmerProducts" DROP CONSTRAINT "_FarmerProducts_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_FarmerProducts_AB_unique" ON "_FarmerProducts"("A", "B");
