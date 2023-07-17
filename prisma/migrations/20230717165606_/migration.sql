/*
  Warnings:

  - A unique constraint covering the columns `[latestMessageId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `chat` ADD COLUMN `latestMessageId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Chat_latestMessageId_key` ON `Chat`(`latestMessageId`);

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_latestMessageId_fkey` FOREIGN KEY (`latestMessageId`) REFERENCES `Message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
