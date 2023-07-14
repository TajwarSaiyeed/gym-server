const express = require("express");
const router = express.Router();

// middlewares
const { protect } = require("../../middleware/auth.middleware");
const { adminTrainer } = require("../../middleware/adminTrainer.middleware");

// controllers
const feesControllers = require("../../controllers/v1/fees.controllers");

router
  .route("/")
  /**
   * @desc    Get fees
   * @route   GET /api/v1/fees
   * @access  Private (Admin, Trainer)
   */
  .get(protect, feesControllers.getFees)
  /**
   * @desc    Add fees
   * @route   POST /api/v1/fees
   * @access  Private (Admin, Trainer)
   *
   */
  .post(protect, adminTrainer, feesControllers.addFees);

router
  .route("/:id")
  /**
   * @desc    Update fees by id (paid)
   * @route   PATCH /api/v1/fees/:id
   * @access  Private
   * @returns {object} fees
   */
  .patch(protect, feesControllers.paidFee);

module.exports = router;
