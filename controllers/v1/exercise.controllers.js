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
 * @desc Get all exercise assignments for a client
 * @route GET /api/v1/exercise/assignment/:id
 * @access Private (admin, trainer)
 */

const getExerciseAssignment = asyncHandler(async (req, res) => {
  const studentId = req.params.id;

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

  const exerciseAssignment = await prisma.exerciseAssignment.findMany({
    where: { studentId },
    include: { exercises: true },
  });

  res.status(200).json({
    status: "success",
    data: exerciseAssignment,
  });
});

/**
 * @desc    Assign exercise to client
 * @route   PUT /api/v1/exercise
 * @access  Private (admin, trainer)
 */
const assignExerciseToClient = asyncHandler(async (req, res) => {
  const { studentId, exercises } = req.body;

  try {
    const client = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }

    const currentDate = new Date().toISOString();

    // Find exercise assignment for the current date
    let exerciseAssignment = await prisma.exerciseAssignment.findFirst({
      where: {
        studentId,
        date: currentDate,
      },
      include: { exercises: true },
    });

    if (exerciseAssignment) {
      // Update existing exercise assignment and its associated exercise details
      exerciseAssignment = await prisma.exerciseAssignment.update({
        where: { id: exerciseAssignment.id },
        data: {
          exercises: {
            deleteMany: {},
            create: exercises.map((exercise) => ({
              exerciseId: exercise.exerciseId,
              sets: exercise.sets,
              steps: exercise.steps,
              kg: exercise.kg,
              rest: exercise.rest,
            })),
          },
        },
        include: { exercises: true },
      });

      res.json({
        message: "Exercise assignment updated successfully",
        exerciseAssignment,
      });
    } else {
      // Create new exercise assignment for the client on the current date
      exerciseAssignment = await prisma.exerciseAssignment.create({
        data: {
          studentId,
          date: currentDate,
          exercises: {
            create: exercises.map((exercise) => ({
              exerciseId: exercise.exerciseId,
              sets: exercise.sets,
              steps: exercise.steps,
              kg: exercise.kg,
              rest: exercise.rest,
            })),
          },
        },
        include: { exercises: true },
      });

      res.json({
        message: "Exercise assignment created successfully",
        exerciseAssignment,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

const updateExerciseAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { exercises } = req.body;

  try {
    const exerciseAssignment = await prisma.exerciseAssignment.update({
      where: { id: assignmentId },
      data: {
        exercises: {
          deleteMany: {},
          create: exercises.map((exercise) => ({
            exerciseId: exercise.exerciseId,
            sets: exercise.sets,
            steps: exercise.steps,
            kg: exercise.kg,
            rest: exercise.rest,
          })),
        },
      },
      include: { exercises: true },
    });

    res.json({
      message: "Exercise assignment updated successfully",
      exerciseAssignment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = {
  getAllExercise,
  addNewExercise,
  deleteExercise,
  getExerciseAssignment,
  assignExerciseToClient,
  updateExerciseAssignment,
};
