/*
  Warnings:

  - You are about to drop the column `quantity` on the `Food` table. All the data in the column will be lost.
  - Added the required column `grams` to the `Food` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Food" DROP COLUMN "quantity",
ADD COLUMN     "grams" DOUBLE PRECISION NOT NULL;
