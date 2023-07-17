const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const { adminTrainer } = require("../../middleware/adminTrainer.middleware");

const exercise = require("../../controllers/v1/exercise.controllers");

const router = express.Router();

router
  .route("/")
  /**
   * @desc    Get all exercise names
   * @route   GET /api/v1/exercise
   * @access  Private
   */
  .get(protect, exercise.getAllExercise)
  /**
   * @desc    Add new exercise name
   * @route   POST /api/v1/exercise
   * @access  Private (admin, trainer)
   */
  .post(protect, adminTrainer, exercise.addNewExercise)
  /**
   * @desc    Assign exercise to client
   * @route   PUT /api/v1/exercise
   * @access  Private (admin, trainer)
   */
  .put(protect, adminTrainer, exercise.assignExerciseToClient)
  /**
   * @desc    Unassign exercise from client
   * @route   DELETE /api/v1/exercise
   * @access  Private (admin, trainer)
   */
  .delete(protect, adminTrainer, exercise.unassignExerciseFromClient);

router
  .route("/:id")
  /**
   * @desc    Delete exercise name
   * @route   DELETE /api/v1/exercise/:id
   * @access  Private (admin, trainer)
   * @note    id is exercise id
   */
  .delete(protect, adminTrainer, exercise.deleteExercise);

router
  .route("/assignment")
  /**
   * @desc    Get exercise assignment by id from body
   * @route   GET /api/v1/exercise/assignment
   * @access  Private (admin, trainer)
   */
  .get(protect, exercise.getExerciseAssignment);

module.exports = router;
