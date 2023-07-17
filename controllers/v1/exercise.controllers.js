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

  return res.status(200).json({
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
 * @desc    Get exercise assignment by id from body
 * @route   GET /api/v1/exercise/assignment
 * @access  Private (admin, trainer)
 */
const getExerciseAssignment = asyncHandler(async (req, res) => {
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

    const exerciseAssignment = await prisma.exercise.findMany({
      where: { studentId },
      include: {
        exercises: {
          include: {
            exerciseName: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!exerciseAssignment || exerciseAssignment.length === 0) {
      return res.status(200).json({
        status: "success",
        data: [],
        message: "No exercise assignment found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: exerciseAssignment,
    });
  }

  const exerciseAssignment = await prisma.exercise.findMany({
    where: { studentId: req.user.id },
    include: {
      exercises: {
        include: {
          exerciseName: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!exerciseAssignment || exerciseAssignment.length === 0) {
    return res.status(200).json({
      status: "success",
      data: [],
      message: "No exercise assignment found",
    });
  }

  return res.status(200).json({
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

  const exerciseAssignments = await prisma.exercise.findMany({
    where: {
      studentId,
    },
    include: { exercises: true },
  });

  let updatedAssignment = null;

  const updatePromises = exerciseAssignments.map(async (assignment) => {
    if (assignment.date.toDateString() === currentDate) {
      const updated = await prisma.exercise.update({
        where: { id: assignment.id },
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
        include: {
          exercises: {
            include: {
              exerciseName: {
                select: { name: true },
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
      message: "Exercise assignment updated successfully",
      data: updatedAssignment,
    });
  }
  // Create new exercise assignment for the client on the current date
  const create = await prisma.exercise.create({
    data: {
      studentId,
      date: new Date(),
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
    include: {
      exercises: {
        include: {
          exerciseName: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!create) {
    return res.status(500).json({
      status: "error",
      message: "Failed to create exercise assignment",
    });
  }

  return res.json({
    status: "success",
    message: "Exercise assignment created successfully",
    data: create,
  });
});

/**
 * @desc    Unassign exercise from client
 * @route   DELETE /api/v1/exercise
 * @access  Private (admin, trainer)
 */
const unassignExerciseFromClient = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Invalid exercise id" });
  }

  const exerciseExists = await prisma.exercise.findUnique({
    where: { id },
    include: { exercises: true },
  });

  if (!exerciseExists) {
    return res.status(400).json({ error: "Exercise does not exist" });
  }

  await prisma.workOut.deleteMany({
    where: { exerciseAssignmentId: id },
  });

  await prisma.exercise.delete({
    where: { id },
  });

  res.status(200).json({
    status: "success",
    message: "Exercise deleted successfully",
  });
});

module.exports = {
  getAllExercise,
  addNewExercise,
  deleteExercise,
  getExerciseAssignment,
  assignExerciseToClient,
  unassignExerciseFromClient,
};
