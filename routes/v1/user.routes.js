const express = require("express");
const router = express.Router();

const userControllers = require("../../controllers/v1/user.controllers");
const { protect } = require("../../middleware/auth.middleware");
const { adminTrainer } = require("../../middleware/adminTrainer.middleware");

router
  .route("/")
  /**
   * @desc    Get all users
   * @route   GET /api/v1/users
   * @access  Private
   * @returns {object} users
   * */
  .get(protect, userControllers.getAllUsers)
  /**
   * @desc    Register a new user
   * @route   POST /api/v1/users
   * @access  Private
   */
  .post(userControllers.registerUser);

router
  .route("/auth")
  /**
   * @desc    Authenticate User /set token
   * @route   POST /api/v1/users/auth
   * @access  Public
   */
  .post(userControllers.authUser);

router
  .route("/logout")
  /**
   * @desc    Logout User
   * @route   POST /api/v1/users/logout
   * @access  Private
   * */
  .post(protect, userControllers.logoutUser);

router
  .route("/profile")
  /**
   * @desc    Get user profile
   * @route   GET /api/v1/users/profile
   * @access  Private
   * @returns {object} user
   */
  .get(protect, userControllers.getUserProfile)
  /**
   * @desc    Update user profile
   * @route   PUT /api/v1/users/profile
   * @access  Private
   * */
  .put(protect, userControllers.updateUserProfile);

router
  .route("/profile/updateUser")
  /**
   * @desc    Update user profile
   * @route   PUT /api/v1/users/profile/updateUser
   * @access  Private Admin/Trainer
   * */
  .put(protect, adminTrainer, userControllers.userUpdateByAdminOrTrainer);

module.exports = router;
