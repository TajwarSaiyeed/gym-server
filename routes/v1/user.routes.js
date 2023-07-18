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
   * @query   page
   * @query   limit
   * @returns {object} users
   * @returns {object} count
   * @returns {object} pages
   * @returns {object} page
   * @returns {object} limit
   * @returns {object} next
   * @returns {object} previous
   * @returns {object} first
   * @returns {object} last
   * @returns {object} pagination
   */
  .get(protect, userControllers.getAllUsers)
  /**
   * @desc    Register a new user
   * @route   POST /api/v1/users
   * @access  Private
   * @body    {String} name
   * @body    {String} email
   * @body    {String} password
   * @body    {String} image
   * @body    {Boolean} isActive
   */
  .post(userControllers.registerUser);

router
  .route("/search")
  /**
   * @desc    Search users
   * @route   GET /api/v1/users/search
   * @access  Private
   * @returns {object} users - users that match the search query string name or email
   * @query   {string} name - name of the user
   * @query   {string} email - email of the user
   */
  .get(protect, userControllers.searchUsers);

router
  .route("/auth")
  /**
   * @description Authenticate User /set token
   * @route   POST /api/v1/users/auth
   * @access  Public
   * @returns {object} message
   * @returns {object} user
   * @returns {object} token
   * @returns {object} error
   * @method  POST
   */
  .post(userControllers.authUser);

router
  .route("/logout")
  /**
   * @desc    Logout user and clear cookie
   * @route   POST /api/v1/users/logout
   * @access  Public
   * @returns {object} message
   * @returns {object} error
   * @cookie  {string} token
   * @clears  {string} token
   */
  .post(protect, userControllers.logoutUser);

router
  .route("/profile")
  /**
   * @desc    Get user profile`
   * @route   GET /api/v1/users/profile
   * @access  Private
   * @returns {object} user
   * @returns {object} admin
   * @returns {object} trainer
   */
  .get(protect, userControllers.getUserProfile)
  /**
   * @desc    Update user profile
   * @route   PUT /api/v1/users/profile
   * @access  Private
   * @returns {object} user
   * @body {String} name - user name
   * @body {String} password - user password
   * @body {String} image - user image
   * @body {String} gender
   * @body {Number} age
   * @body {Number} height
   * @body {Number} weight
   * @body {String} goal
   * @body {String} level
   */
  .put(protect, userControllers.updateUserProfile);

router
  .route("/profile/updateUser")
  /**
   * @desc    Update user profile by admin or trainer
   * @route   PUT /api/v1/users/profile/updateUser
   * @access  Private
   * @returns {object} user
   * @body    {string} email - user email
   * @body    {string} trainerId - trainer id
   * @body    {boolean} approved - user approved
   */
  .put(protect, adminTrainer, userControllers.userUpdateByAdminOrTrainer);

module.exports = router;
