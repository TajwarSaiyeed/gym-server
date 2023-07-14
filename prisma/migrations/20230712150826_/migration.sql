/*
  Warnings:

  - You are about to drop the column `AdminId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `TrainerId` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_AdminId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_TrainerId_fkey`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `AdminId`,
    DROP COLUMN `TrainerId`,
    ADD COLUMN `adminId` VARCHAR(191) NULL,
    ADD COLUMN `trainerId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_trainerId_fkey` FOREIGN KEY (`trainerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
