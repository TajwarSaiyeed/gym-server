const express = require("express");
const router = express.Router();

const notificationControllers = require("../../controllers/v1/notification.controllers");
const { protect } = require("../../middleware/auth.middleware");

router
  .route("/")
  /**
   * @desc    Get notification
   * @route   GET /api/v1/notification
   * @access  Private
   * @returns {object} notifications
   */
  .get(protect, notificationControllers.getNotification)
  /**
   * @desc    Add notification
   * @route   POST /api/v1/notification
   * @access  Private
   * @returns {object} notification
   */
  .post(protect, notificationControllers.addNotification);

router
  .route("/:id")
  /**
   * @desc    Mark as read
   * @route   PATCH /api/v1/notification/:id
   * @access  Private
   * @returns {object} notification
   */
  .patch(protect, notificationControllers.markAsRead)
  /**
   * @desc    Delete notification
   * @route   DELETE /api/v1/notification/:id
   * @access  Private
   * @returns Notification deleted
   */
  .delete(protect, notificationControllers.deleteNotification);

module.exports = router;
