const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const { adminTrainer } = require("../../middleware/adminTrainer.middleware");

const chatControllers = require("../../controllers/v1/chat.controllers");
const { admin } = require("../../middleware/admin.middleware");

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

router
  .route("/group")
  /**
   * @route POST /api/v1/chat/group
   * @description Create a group chat
   * @access Private (admin only)
   */
  .post(protect, admin, chatControllers.createGroupChat);

router
  .route("/rename")
  /**
   * @route PATCH /api/v1/chat/rename
   * @description Rename a group chat
   * @access Private (admin only)
   * @body { name: String }
   * @body { chatId: String }
   * @body { newName: String }
   */
  .patch(protect, admin, chatControllers.renameGroup);

router
  .route("/groupadd")
  /**
   * @route PATCH /api/v1/chat/groupadd
   * @description Add a user to a group chat
   * @access Private (admin only)
   * @body { chatId: String }
   * @body { userId: String }
   */
  .patch(protect, admin, chatControllers.addToGroup);
// router.route("/groupremove").put(removeFromGroup);

module.exports = router;
