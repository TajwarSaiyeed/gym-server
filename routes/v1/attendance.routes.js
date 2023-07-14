const express = require("express");
const router = express.Router();

// middlewares
const { protect } = require("../../middleware/auth.middleware");
const { adminTrainer } = require("../../middleware/adminTrainer.middleware");
const attendanceControllers = require("../../controllers/v1/attendance.controllers");

router
  .route("/")
  /**
   * @desc    Get attendance
   * @route   GET /api/v1/attendance
   * @access  Private (Admin, Trainer, Student)
   */
  .get(protect, attendanceControllers.getAttendance)
  /**
   * @desc    Update attendance
   * @route   PATCH /api/v1/attendance
   * @access  Private (user)
   * @returns {object} attendance
   */
  .patch(protect, attendanceControllers.updateAttendance);

module.exports = router;
