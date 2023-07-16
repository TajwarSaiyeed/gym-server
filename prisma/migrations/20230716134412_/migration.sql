-- DropIndex
DROP INDEX `Exercise_studentId_fkey` ON `exercise`;

-- DropIndex
DROP INDEX `Workout_exerciseId_fkey` ON `workout`;

-- AddForeignKey
ALTER TABLE `WorkOut` ADD CONSTRAINT `WorkOut_exerciseId_fkey` FOREIGN KEY (`exerciseId`) REFERENCES `ExerciseList`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
