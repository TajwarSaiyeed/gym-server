/*
  Warnings:

  - Added the required column `studentId` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `exercise` ADD COLUMN `studentId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Exercise` ADD CONSTRAINT `Exercise_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
