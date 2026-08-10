/*
  Warnings:

  - Made the column `name` on table `Food` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Food" ALTER COLUMN "name" SET NOT NULL;
