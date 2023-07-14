const asyncHandler = require("express-async-handler");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @desc    Get all food
 * @route   GET /api/v1/diet
 * @access  Private
 */

const getAllFood = asyncHandler(async (req, res) => {
  const food = await prisma.dietFoodList.findMany();

  res.status(200).json({
    status: "success",
    data: food,
  });
});

/**
 * @desc    Add new food
 * @route   POST /api/v1/diet
 * @access  Private (admin, trainer)
 */

const addNewFood = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Invalid food data");
  }

  const foodExists = await prisma.dietFoodList.findFirst({
    where: { name },
  });

  if (foodExists) {
    res.status(400);
    throw new Error("Food already exists");
  }

  const food = await prisma.dietFoodList.create({
    data: {
      name,
    },
  });

  res.status(201).json({
    status: "success",
    data: food,
  });
});

/**
 * @desc    Delete food
 * @route   DELETE /api/v1/diet/:id
 * @access  Private (admin, trainer)
 * @note    id is the food id
 */

const deleteFood = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(400);
    throw new Error("Invalid food id");
  }

  const foodExists = await prisma.dietFoodList.findFirst({
    where: { id },
  });

  if (!foodExists) {
    res.status(400);
    throw new Error("Food not found");
  }

  await prisma.dietFoodList.delete({
    where: { id },
  });

  res.status(200).json({
    status: "success",
    message: "Food deleted successfully",
  });
});

module.exports = { getAllFood, addNewFood, deleteFood };
