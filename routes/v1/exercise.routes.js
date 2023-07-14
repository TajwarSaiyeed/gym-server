const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const { adminTrainer } = require("../../middleware/adminTrainer.middleware");

const exercise = require("../../controllers/v1/exercise.controllers");

const router = express.Router();

router
  .route("/")
  .get(protect, exercise.getAllExercise)
  .post(protect, adminTrainer, exercise.addNewExercise);

// delete food
router.route("/:id").delete(protect, adminTrainer, exercise.deleteExercise);

module.exports = router;
