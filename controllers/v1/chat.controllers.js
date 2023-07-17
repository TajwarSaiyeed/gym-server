const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @route POST /api/v1/chat
 * @description Create a chat or group chat || access a chat
 * @access Private
 */
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error("User id is required");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  let message = "Chat accessed successfully";

  let chat = await prisma.chat.findFirst({
    where: {
      users: {
        some: {
          id: userId,
        },
      },
    },
    include: {
      users: {
        select: {
          name: true,
          email: true,
        },
      },
      latestMessage: true,
    },
  });

  if (!chat) {
    const createdChat = await prisma.chat.create({
      data: {
        name: user.name,
        users: {
          connect: [{ id: req.user.id }, { id: userId }],
        },
      },
      include: {
        users: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    chat = createdChat;
    message = "Chat created successfully";
  }

  return res.status(200).json({
    status: "success",
    message,
    data: chat,
  });
});

/**
 * @route GET /api/v1/chat
 * @description Get all chats
 * @access Private
 */
const fetchChats = asyncHandler(async (req, res) => {
  const chats = await prisma.chat.findMany({
    where: {
      users: {
        some: {
          id: req.user.id,
        },
      },
    },
    include: {
      users: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!chats) {
    res.status(404);
    throw new Error("No chats found");
  }

  return res.status(200).json({
    status: "success",
    message: "Chats fetched successfully",
    data: chats,
  });
});

module.exports = {
  accessChat,
  fetchChats,
};
