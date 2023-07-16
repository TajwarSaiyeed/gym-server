/*
  Warnings:

  - You are about to drop the column `dietId` on the `periodwithfoodlist` table. All the data in the column will be lost.
  - Added the required column `dietAssignmentId` to the `PeriodWithFoodList` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `periodwithfoodlist` DROP FOREIGN KEY `PeriodWithFoodList_dietId_fkey`;

-- AlterTable
ALTER TABLE `periodwithfoodlist` DROP COLUMN `dietId`,
    ADD COLUMN `dietAssignmentId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `PeriodWithFoodList` ADD CONSTRAINT `PeriodWithFoodList_dietAssignmentId_fkey` FOREIGN KEY (`dietAssignmentId`) REFERENCES `Diet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
