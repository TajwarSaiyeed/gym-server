/*
  Warnings:

  - You are about to drop the column `assignedById` on the `diet` table. All the data in the column will be lost.
  - You are about to drop the column `foodName` on the `periodwithfoodlist` table. All the data in the column will be lost.
  - Added the required column `studentId` to the `Diet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dietFoodId` to the `PeriodWithFoodList` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `diet` DROP FOREIGN KEY `Diet_assignedById_fkey`;

-- AlterTable
ALTER TABLE `diet` DROP COLUMN `assignedById`,
    ADD COLUMN `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `periodwithfoodlist` DROP COLUMN `foodName`,
    ADD COLUMN `dietFoodId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `PeriodWithFoodList` ADD CONSTRAINT `PeriodWithFoodList_dietFoodId_fkey` FOREIGN KEY (`dietFoodId`) REFERENCES `DietFoodList`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
