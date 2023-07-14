const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = require("../../utils/generateToken");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    image,
    isActive,
    gender,
    role,
    age,
    height,
    weight,
    goal,
    level,
    approved,
    admin,
    trainer,
  } = req.body;

  try {
    const userExists = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const findAdmin = await prisma.user.findFirst({
      where: {
        role: "admin",
      },
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        image,
        isActive: isActive === "false" ? false : true,
        gender,
        role,
        age,
        height,
        weight,
        goal,
        level,
        approved,
        adminId: admin ? admin : findAdmin?.id,
        trainerId: trainer,
      },
      include: {
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

    user.hashedPassword = undefined;

    if (user) {
      generateToken(res, user?.id, user?.email);

      return res.status(201).json({
        status: "success",
        data: user,
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

/**
 * @description Authenticate User /set token
 * @route   POST /api/v1/users/auth
 * @access  Public
 *
 *
 */

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.hashedPassword))) {
      generateToken(res, user?.id, user?.email);

      await prisma.user.update({
        where: { id: user?.id },
        data: { isActive: true },
      });

      const userVerified = await prisma.user.findUnique({
        where: { id: user?.id },
        include: {
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

      userVerified.hashedPassword = undefined;

      return res.status(200).json({
        status: "success",
        data: userVerified,
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

/**
 * @desc    Logout user and clear cookie
 * @route   POST /api/v1/users/logout
 * @access  Public
 */

const logoutUser = asyncHandler(async (req, res) => {
  const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);

  await prisma.user.update({
    where: { id: decoded.id },
    data: { isActive: false },
  });

  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    expires: new Date(0),
  });

  res.status(200).json({
    message: "User Logged out",
  });
});

/**
 * @desc    Get user profile`
 * @route   GET /api/v1/users/profile
 * @access  Private
 * @returns {object} user
 */

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id, email: req.user.email },
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isActive: true,
        },
      },
      trainer: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isActive: true,
        },
      },
    },
  });

  if (user) {
    user.hashedPassword = undefined;

    return res.status(200).json({
      status: "success",
      data: user,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/profile
 * @access  Private
 */

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (user) {
    const {
      name,
      password,
      image,
      gender,
      age,
      height,
      weight,
      goal,
      level,
      approved,
    } = req.body;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          name,
          hashedPassword,
          image,
          gender,
          age,
          height,
          weight,
          goal,
          level,
          approved,
        },
      });
      updatedUser.hashedPassword = undefined;

      return res.status(200).json({
        status: "success",
        data: updatedUser,
      });
    }

    if (req.body.email) {
      res.status(400);
      throw new Error("Email cannot be updated");
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...req.body,
      },
    });
    updatedUser.hashedPassword = undefined;

    return res.status(200).json({
      status: "success",
      data: updatedUser,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

/**
 * @desc    Update user profile by admin or trainer
 * @route   GET /api/v1/users/profile
 * @access  Private
 * @returns {object} user
 */

const userUpdateByAdminOrTrainer = asyncHandler(async (req, res) => {
  const { email, trainerId, approved } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const userExists = await prisma.user.findFirst({
    where: { email },
  });

  if (!userExists) {
    res.status(404);
    throw new Error("User not found");
  }

  if (email && req.user.role === "admin") {
    await prisma.user.update({
      where: { email },
      data: {
        trainerId,
        approved,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "User Updated Successfully",
    });
  } else if (email && req.user.role === "trainer") {
    await prisma.user.update({
      where: { email },
      data: {
        approved,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "User Updated Successfully",
    });
  }
});

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private
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

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const users = await prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isActive: true,
        },
      },
      trainer: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          isActive: true,
        },
      },
    },
  });

  users.forEach((user) => {
    user.hashedPassword = undefined;
  });

  const count = await prisma.user.count();

  const pages = Math.ceil(count / limit);

  const pagination = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    next: parseInt(page, 10) + 1,
    previous: parseInt(page, 10) - 1,
    first: 1,
    last: pages,
  };

  if (users) {
    return res.status(200).json({
      status: "success",
      data: users,
      count,
      pages,
      pagination,
    });
  } else {
    res.status(404);
    throw new Error("Users not found");
  }
});

module.exports = {
  registerUser,
  authUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  userUpdateByAdminOrTrainer,
  getAllUsers,
};
