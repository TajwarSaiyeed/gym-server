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

  return res.status(200).json({
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

/**
 * @desc    Get diet assignment by id from body
 * @route   GET /api/v1/diet/assignment
 * @access  Private (admin, trainer, user)
 */
const getDietAssignment = asyncHandler(async (req, res) => {
  if (req.user.role === "trainer" || req.user.role === "admin") {
    const studentId = req.body.id;

    if (!studentId) {
      res.status(400);
      throw new Error("Invalid student id");
    }

    const client = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!client) {
      res.status(404);
      throw new Error("Client not found");
    }

    const dietAssignment = await prisma.diet.findMany({
      where: { studentId },
      include: {
        periodWithFoodList: {
          include: {
            dietFoodName: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!dietAssignment || dietAssignment.length === 0) {
      return res.status(200).json({
        status: "success",
        data: [],
        message: "No diet assignment found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: dietAssignment,
    });
  }

  const dietAssignment = await prisma.diet.findMany({
    where: { studentId: req.user.id },
    include: {
      periodWithFoodList: {
        include: {
          dietFoodName: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!dietAssignment || dietAssignment.length === 0) {
    return res.status(200).json({
      status: "success",
      data: [],
      message: "No diet assignment found",
    });
  }

  return res.status(200).json({
    status: "success",
    data: dietAssignment,
  });
});

/**
 * @desc    Assign diet food to client
 * @route   PUT /api/v1/diet
 * @access  Private (admin, trainer)
 */
const assignFoodToClient = asyncHandler(async (req, res) => {
  const { studentId, foods } = req.body;

  const client = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!client) {
    return res.status(404).json({
      status: "error",
      message: "Client not found",
    });
  }

  const currentDate = new Date().toDateString();

  const dietAssignments = await prisma.diet.findMany({
    where: {
      studentId,
    },
  });

  let updatedAssignment = null;

  const updatePromises = dietAssignments.map(async (assignment) => {
    if (assignment.date.toDateString() === currentDate) {
      const updated = await prisma.diet.update({
        where: { id: assignment.id },
        data: {
          periodWithFoodList: {
            deleteMany: {},
            create: foods.map((food) => ({
              dietFoodId: food.dietFoodId,
              breakfast: food.breakfast,
              morningMeal: food.morningMeal,
              lunch: food.lunch,
              eveningSnack: food.eveningSnack,
              dinner: food.dinner,
            })),
          },
        },
        include: {
          periodWithFoodList: {
            include: {
              dietFoodName: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
      updatedAssignment = updated;
    }
  });

  await Promise.all(updatePromises);

  if (updatedAssignment) {
    return res.status(200).json({
      status: "success",
      message: "Diet assignment updated successfully",
      data: updatedAssignment,
    });
  }
  // Create new assignment
  const create = await prisma.diet.create({
    data: {
      studentId,
      date: new Date(),
      periodWithFoodList: {
        create: foods.map((food) => ({
          dietFoodId: food.dietFoodId,
          breakfast: food.breakfast,
          morningMeal: food.morningMeal,
          lunch: food.lunch,
          eveningSnack: food.eveningSnack,
          dinner: food.dinner,
        })),
      },
    },
    include: {
      periodWithFoodList: {
        include: {
          dietFoodName: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!create) {
    return res.status(500).json({
      status: "error",
      message: "Failed to create diet assignment",
    });
  }

  return res.json({
    status: "success",
    message: "Diet assignment created successfully",
    data: create,
  });
});

/**
 * @desc    Unassign diet food from client
 * @route   DELETE /api/v1/diet
 * @access  Private (admin, trainer)
 */
const unassignFoodFromClient = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Invalid exercise id" });
  }

  const dietExists = await prisma.diet.findUnique({
    where: { id },
    include: { periodWithFoodList: true },
  });

  if (!dietExists) {
    return res.status(400).json({ error: "Diet not found" });
  }

  await prisma.periodWithFoodList.deleteMany({
    where: { dietAssignmentId: id },
  });

  await prisma.diet.delete({
    where: { id },
  });

  res.status(200).json({
    status: "success",
    message: "Diet deleted successfully",
  });
});

module.exports = {
  getAllFood,
  addNewFood,
  deleteFood,
  getDietAssignment,
  assignFoodToClient,
  unassignFoodFromClient,
};
