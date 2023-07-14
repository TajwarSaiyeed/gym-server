const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const { adminTrainer } = require("../../middleware/adminTrainer.middleware");

const diet = require("../../controllers/v1/diet.controllers");

const router = express.Router();

router
  .route("/")
  .get(protect, diet.getAllFood)
  .post(protect, adminTrainer, diet.addNewFood);

// delete food
router.route("/:id").delete(protect, adminTrainer, diet.deleteFood);

module.exports = router;
