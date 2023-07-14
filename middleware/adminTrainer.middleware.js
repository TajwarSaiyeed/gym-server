const asyncHandler = require("express-async-handler");

const adminTrainer = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "admin" && req.user.role !== "trainer") {
    res.status(401);
    throw new Error("Not authorized as an admin or trainer");
  }

  next();
});

module.exports = { adminTrainer };
