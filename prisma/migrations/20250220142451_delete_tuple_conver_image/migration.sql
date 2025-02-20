/*
  Warnings:

  - You are about to drop the column `coverImageUrl` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `converImageUrl` on the `Restaurant` table. All the data in the column will be lost.
  - Added the required column `coverImageUrl` to the `Restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "coverImageUrl";

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "converImageUrl",
ADD COLUMN     "coverImageUrl" TEXT NOT NULL;
