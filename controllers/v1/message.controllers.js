const asyncHandler = require("express-async-handler");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @desc    Get all messages
 * @route   GET /api/v1/message
 * @access  Private
 * @body   {String} chatId
 */

const allMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    res.status(400);
    throw new Error("Chat id is required");
  }

  const chat = await prisma.chat.findUnique({
    where: {
      id: chatId,
      users: {
        some: {
          id: req.user.id,
        },
      },
    },
  });

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  const messages = await prisma.message.findMany({
    where: {
      chatId,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      sender: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!messages || messages.length === 0) {
    res.status(404);
    throw new Error("No messages found");
  }

  res.status(200).json({
    success: true,
    data: messages,
  });
});

/**
 * @desc    Send a message
 * @route   POST /api/v1/message
 * @access  Private
 * @body    {String} message
 * @body    {String} senderId
 * @body    {String} chatId
 */

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    res.status(400);
    throw new Error("Content and chat id are required");
  }

  const chat = await prisma.chat.findUnique({
    where: {
      id: chatId,
      users: {
        some: {
          id: req.user.id,
        },
      },
    },
  });

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  const message = await prisma.message.create({
    data: {
      content,
      chatId,
      senderId: req.user.id,
    },
  });

  if (!message) {
    res.status(400);
    throw new Error("Message not sent");
  }

  const updatedChat = await prisma.chat.update({
    where: {
      id: chatId,
    },
    data: {
      latestMessageId: message.id,
    },
  });

  res.status(201).json({
    success: true,
    message,
    chat: updatedChat,
  });
});

module.exports = {
  allMessages,
  sendMessage,
};
