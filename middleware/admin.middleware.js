const asyncHandler = require("express-async-handler");

const admin = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "admin") {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }

  next();
});

module.exports = { admin };
