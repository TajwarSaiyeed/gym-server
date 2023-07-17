const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const { adminTrainer } = require("../../middleware/adminTrainer.middleware");

const chatControllers = require("../../controllers/v1/chat.controllers");

const router = express.Router();

router
  .route("/")
  /**
   * @route GET /api/v1/chat
   * @description Get all chats
   * @access Private
   */
  .get(protect, chatControllers.fetchChats)
  /**
   * @route POST /api/v1/chat
   * @description Create a chat or group chat || access a chat
   * @access Private
   */
  .post(protect, chatControllers.accessChat);
// router.route("/group").post(createGroupChat);
// router.route("/rename").patch(renameGroup);
// router.route("/groupadd").patch(addToGroup);
// router.route("/groupremove").put(removeFromGroup);

module.exports = router;
