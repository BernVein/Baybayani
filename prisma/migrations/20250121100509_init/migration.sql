/*
  Warnings:

  - You are about to alter the column `quantity` on the `CartItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "CartItem" ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;
