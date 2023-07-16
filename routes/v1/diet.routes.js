const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const { adminTrainer } = require("../../middleware/adminTrainer.middleware");

const diet = require("../../controllers/v1/diet.controllers");

const router = express.Router();

router
  .route("/")
  /**
   * @desc    Get all diet food names
   * @route   GET /api/v1/diet
   * @access  Private
   */
  .get(protect, diet.getAllFood)
  /**
   * @desc    Add new diet food name
   * @route   POST /api/v1/diet
   * @access  Private (admin, trainer)
   */
  .post(protect, adminTrainer, diet.addNewFood)
  /**
   * @desc    Assign diet food to client
   * @route   PUT /api/v1/diet
   * @access  Private (admin, trainer)
   */
  .put(protect, adminTrainer, diet.assignFoodToClient)
  /**
   * @desc    Unassign diet food from client
   * @route   DELETE /api/v1/diet
   * @access  Private (admin, trainer)
   */
  .delete(protect, adminTrainer, diet.unassignFoodFromClient);

// delete food
router
  .route("/:id")
  /**
   * @desc    Delete diet food name
   * @route   DELETE /api/v1/diet/:id
   * @access  Private (admin, trainer)
   * @note    id is diet food id
   */
  .delete(protect, adminTrainer, diet.deleteFood);

module.exports = router;
