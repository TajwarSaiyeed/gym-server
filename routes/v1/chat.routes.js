const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const { adminTrainer } = require("../../middleware/adminTrainer.middleware");

const chatControllers = require("../../controllers/v1/chat.controllers");

const router = express.Router();

router
  .route("/")
  // .get(fetchChats)
  .post(protect, chatControllers.accessChat);
// router.route("/group").post(createGroupChat);
// router.route("/rename").patch(renameGroup);
// router.route("/groupadd").patch(addToGroup);
// router.route("/groupremove").put(removeFromGroup);

module.exports = router;
