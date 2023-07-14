const asyncHandler = require("express-async-handler");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @desc    Get fees
 * @route   GET /api/v1/fees
 * @access  Private (Admin, Trainer)
 */

const getFees = asyncHandler(async (req, res) => {
  const fees = await prisma.fees.findMany({
    include: {
      student: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (fees) {
    return res.status(200).json({
      status: "success",
      data: fees,
    });
  }
  res.status(400);
  throw new Error("Invalid fees data");
});

/**
 * @desc    Add fees
 * @route   POST /api/v1/fees
 * @access  Private (Admin, Trainer)
 *
 */

const addFees = asyncHandler(async (req, res) => {
  const { email, month, year, message, amount, isPaid, studentId } = req.body;

  const feesExists = await prisma.fees.findFirst({
    where: {
      studentId,
      month,
      year,
    },
  });

  if (feesExists) {
    res.status(400);
    throw new Error("Fees already exists");
  }

  const fees = await prisma.fees.create({
    data: {
      email,
      month,
      year,
      message,
      amount,
      isPaid,
      studentId,
    },
  });

  if (fees) {
    return res.status(201).json({
      status: "success",
      data: fees,
    });
  }
  res.status(400);
  throw new Error("Invalid fees data");
});

module.exports = {
  getFees,
  addFees,
};
