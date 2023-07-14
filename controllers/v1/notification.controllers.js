const asyncHandler = require("express-async-handler");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @desc    Add notification
 * @route   POST /api/v1/notification
 * @access  Private
 * @returns {object} notification
 */

const addNotification = asyncHandler(async (req, res) => {
  const { type, notificationText, isRead, pathName, receiver } = req.body;

  const notification = await prisma.notification.create({
    data: {
      type,
      notificationText,
      isRead,
      pathName,
      receiverId: receiver,
      senderId: req.user.id,
    },
  });

  res.status(201).json({
    status: "success",
    data: notification,
    message: "Notification sent successfully",
  });
});

/**
 * @desc    Get notification
 * @route   GET /api/v1/notification
 * @access  Private
 * @returns {object} notifications
 */
const getNotification = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: {
      receiverId: req.user.id,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  res.status(200).json({
    status: "success",
    data: notifications,
  });
});

/**
 * @desc    Mark as read
 * @route   PATCH /api/v1/notification/:id
 * @access  Private
 * @returns {object} notification
 */
const markAsRead = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const notifExists = await prisma.notification.findUnique({
    where: {
      id: id,
      receiverId: req.user.id,
    },
  });

  if (!notifExists) {
    res.status(404);
    throw new Error("Notification not found");
  }

  const notification = await prisma.notification.update({
    where: {
      id: id,
    },
    data: {
      isRead: true,
    },
  });

  res.status(200).json({
    status: "success",
    data: notification,
    message: "Notification marked as read",
  });
});

/**
 * @desc    Delete notification
 * @route   DELETE /api/v1/notification/:id
 * @access  Private
 * @returns Notification deleted
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const notifExists = await prisma.notification.findUnique({
    where: {
      id: id,
      receiverId: req.user.id,
    },
  });

  if (!notifExists) {
    res.status(404);
    throw new Error("Notification not found");
  }

  await prisma.notification.delete({
    where: {
      id: id,
    },
  });

  res.status(200).json({
    status: "success",
    message: "Notification deleted successfully",
  });
});

module.exports = {
  addNotification,
  getNotification,
  markAsRead,
  deleteNotification,
};
