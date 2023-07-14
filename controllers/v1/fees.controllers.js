const asyncHandler = require("express-async-handler");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @desc    Get fees
 * @route   GET /api/v1/fees
 * @access  Private (Admin, Trainer)
 */

const getFees = asyncHandler(async (req, res) => {
  if (req.user.role === "trainer" || req.user.role === "admin") {
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
  }

  const fees = await prisma.fees.findMany({
    where: {
      studentId: req.user.id,
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

/**
 * @desc    Update fees by id (paid)
 * @route   PATCH /api/v1/fees/:id
 * @access  Private
 * @returns {object} fees
 */

const paidFee = asyncHandler(async (req, res) => {
  const { transactionId, paymentDate } = req.body;

  // fees find and check
  const feesExist = await prisma.fees.findFirst({
    where: {
      id: req.params.id,
      studentId: req.user.id,
    },
  });

  if (!feesExist) {
    res.status(400);
    throw new Error("Fees not found");
  }

  if (feesExist.isPaid) {
    res.status(400);
    throw new Error("Fees already paid");
  }

  // fees update
  const fees = await prisma.fees.update({
    where: {
      id: req.params.id,
      studentId: req.user.id,
    },
    data: {
      isPaid: true,
      transactionId,
      paymentDate,
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

module.exports = {
  getFees,
  addFees,
  paidFee,
};
