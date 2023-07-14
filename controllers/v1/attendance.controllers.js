const asyncHandler = require("express-async-handler");
const schedule = require("node-schedule");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const startOfDayRule = new schedule.RecurrenceRule();
startOfDayRule.hour = 0;
startOfDayRule.minute = 0;
startOfDayRule.second = 0;

schedule.scheduleJob(startOfDayRule, async () => {
  const date = new Date().toISOString();

  const students = await prisma.user.findMany({
    where: {
      role: "user",
    },
  });

  students.forEach(
    async (student) =>
      await prisma.attendance.createMany({
        data: {
          date,
          isPresent: false,
          studentId: student.id,
        },
      })
  );
});

/**
 * @desc    Get attendance
 * @route   GET /api/v1/attendance
 * @access  Private (Admin, Trainer)
 * @returns {object} attendance
 */

const getAttendance = asyncHandler(async (req, res) => {
  if (req.user.role === "trainer" || req.user.role === "admin") {
    const attendance = await prisma.attendance.findMany({
      include: {
        student: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (attendance) {
      return res.status(200).json({
        status: "success",
        data: attendance,
      });
    }
    res.status(400);
    throw new Error("Invalid attendance data");
  }

  const attendance = await prisma.attendance.findMany({
    where: {
      studentId: req.user.id,
    },
  });

  if (attendance) {
    return res.status(200).json({
      status: "success",
      data: attendance,
    });
  }
  res.status(400);
  throw new Error("Invalid attendance data");
});

/**
 * @desc    Update attendance
 * @route   PATCH /api/v1/attendance
 * @access  Private (user)
 */

const updateAttendance = asyncHandler(async (req, res) => {
  const id = req.query.id;

  const attendanceExists = await prisma.attendance.findFirst({
    where: {
      id,
      studentId: req.user.id,
    },
  });

  if (!attendanceExists) {
    res.status(404);
    throw new Error("Attendance not found");
  }

  const attendance = await prisma.attendance.update({
    where: {
      id,
      studentId: req.user.id,
    },
    data: {
      isPresent: true,
    },
  });

  if (attendance) {
    return res.status(200).json({
      status: "success",
      data: attendance,
    });
  }

  res.status(400);
  throw new Error("Invalid attendance data");
});

module.exports = {
  getAttendance,
  updateAttendance,
};
