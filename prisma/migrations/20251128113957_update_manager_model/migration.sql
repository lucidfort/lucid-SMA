/*
  Warnings:

  - You are about to drop the column `birthday` on the `Manager` table. All the data in the column will be lost.
  - You are about to drop the column `img` on the `Manager` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Manager" DROP COLUMN "birthday",
DROP COLUMN "img";
