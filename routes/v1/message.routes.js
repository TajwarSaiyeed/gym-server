const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const messageControllers = require("../../controllers/v1/message.controllers");
const router = express.Router();

router
  .route("/")
  /**
   * @desc    Get all messages
   * @route   GET /api/v1/message
   * @access  Private
   * @body   {String} chatId
   */
  .get(protect, messageControllers.allMessages)
  /**
   * @desc    Send a message
   * @route   POST /api/v1/message
   * @access  Private
   * @body    {String} message
   * @body    {String} senderId
   * @body    {String} chatId
   */
  .post(protect, messageControllers.sendMessage);

module.exports = router;
