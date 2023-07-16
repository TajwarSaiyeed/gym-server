/*
  Warnings:

  - You are about to drop the column `assignedById` on the `exercise` table. All the data in the column will be lost.
  - You are about to drop the column `exerciseName` on the `workout` table. All the data in the column will be lost.
  - You are about to drop the column `restTime` on the `workout` table. All the data in the column will be lost.
  - You are about to drop the `exerciseassignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exerciseassignmentdetail` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `exerciseAssignmentId` to the `WorkOut` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rest` to the `WorkOut` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `exercise` DROP FOREIGN KEY `Exercise_assignedById_fkey`;

-- DropForeignKey
ALTER TABLE `exercise` DROP FOREIGN KEY `Exercise_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `exerciseassignmentdetail` DROP FOREIGN KEY `ExerciseAssignmentDetail_exerciseAssignmentId_fkey`;

-- DropForeignKey
ALTER TABLE `workout` DROP FOREIGN KEY `Workout_exerciseId_fkey`;

-- AlterTable
ALTER TABLE `exercise` DROP COLUMN `assignedById`;

-- AlterTable
ALTER TABLE `workout` DROP COLUMN `exerciseName`,
    DROP COLUMN `restTime`,
    ADD COLUMN `exerciseAssignmentId` VARCHAR(191) NOT NULL,
    ADD COLUMN `rest` INTEGER NOT NULL;

-- DropTable
DROP TABLE `exerciseassignment`;

-- DropTable
DROP TABLE `exerciseassignmentdetail`;

-- AddForeignKey
ALTER TABLE `WorkOut` ADD CONSTRAINT `WorkOut_exerciseAssignmentId_fkey` FOREIGN KEY (`exerciseAssignmentId`) REFERENCES `Exercise`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
