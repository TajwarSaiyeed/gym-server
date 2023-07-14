const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const protect = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await prisma.user.findUnique({
        where: { id: decoded.id, email: decoded.email },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isActive: true,
          gender: true,
          role: true,
          age: true,
          height: true,
          weight: true,
          goal: true,
          level: true,
          approved: true,
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              isActive: true,
              gender: true,
            },
          },
          trainer: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              isActive: true,
              gender: true,
            },
          },
        },
      });

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, invalid token");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };
