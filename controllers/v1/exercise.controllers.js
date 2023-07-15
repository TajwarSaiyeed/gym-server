const asyncHandler = require("express-async-handler");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @desc    Get all exercise names
 * @route   GET /api/v1/exercise
 * @access  Private
 */

const getAllExercise = asyncHandler(async (req, res) => {
  const exercises = await prisma.exerciseList.findMany();

  res.status(200).json({
    status: "success",
    data: exercises,
  });
});

/**
 * @desc    Add new exercise name
 * @route   POST /api/v1/exercise
 * @access  Private (admin, trainer)
 */

const addNewExercise = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Invalid exercise name");
  }

  const exerciseExists = await prisma.exerciseList.findFirst({
    where: { name },
  });

  if (exerciseExists) {
    res.status(400);
    throw new Error("Exercise already exists");
  }

  const exercise = await prisma.exerciseList.create({
    data: {
      name,
    },
  });

  res.status(200).json({
    status: "success",
    data: exercise,
  });
});

/**
 * @desc    Delete exercise name
 * @route   DELETE /api/v1/exercise/:id
 * @access  Private (admin, trainer)
 * @note    id is exercise id
 */

const deleteExercise = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(400);
    throw new Error("Invalid exercise id");
  }

  const exerciseExists = await prisma.exerciseList.findFirst({
    where: { id },
  });

  if (!exerciseExists) {
    res.status(400);
    throw new Error("Exercise does not exist");
  }

  await prisma.exerciseList.delete({
    where: { id },
  });

  res.status(200).json({
    status: "success",
    message: "Exercise deleted successfully",
  });
});

/**
 * @desc    Assign exercise to client
 * @route   PUT /api/v1/exercise
 * @access  Private (admin, trainer)
 */

const assignExerciseToClient = asyncHandler(async (req, res) => {});

module.exports = {
  getAllExercise,
  addNewExercise,
  deleteExercise,
  assignExerciseToClient,
};
