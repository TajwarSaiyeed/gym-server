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
      isGroupChat: false,
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
        name: "sender",
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
        latestMessage: true,
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
      latestMessage: true,
      groupAdmin: {
        select: {
          name: true,
          email: true,
        },
      },
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

/**
 * @route POST /api/v1/chat/group
 * @description Create a group chat
 * @access Private (admin only)
 */
const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({
      message: "Please Fill all the fields",
    });
  }

  let users = JSON.parse(req.body.users);

  if (users.length < 2) {
    res.status(400);
    throw new Error("More than 2 users are required to form a group chat");
  }

  users.push(req.user.id);

  const groupChat = await prisma.chat.create({
    data: {
      name: req.body.name,
      isGroupChat: true,
      groupAdminId: req.user.id,
      users: {
        connect: users.map((user) => ({ id: user })),
      },
    },
    include: {
      groupAdmin: {
        select: {
          name: true,
          email: true,
        },
      },

      users: {
        select: {
          name: true,
          email: true,
        },
      },
      latestMessage: true,
    },
  });

  if (!groupChat) {
    res.status(500);
    throw new Error("Something went wrong");
  }

  return res.status(200).json({
    status: "success",
    message: "Group chat created successfully",
    data: groupChat,
  });
});

/**
 * @route PATCH /api/v1/chat/rename
 * @description Rename a group chat
 * @access Private (admin only)
 * @body { name: String }
 * @body { chatId: String }
 * @body { newName: String }
 */
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    res.status(400);
    throw new Error("Please provide chat id and chat name");
  }

  const chat = await prisma.chat.findUnique({
    where: {
      id: chatId,
      isGroupChat: true,
    },
  });

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  if (chat.groupAdminId !== req.user.id) {
    res.status(401);
    throw new Error("You are not authorized to rename this group");
  }

  const updatedChat = await prisma.chat.update({
    where: {
      id: chatId,
    },
    data: {
      name: chatName,
    },
    include: {
      groupAdmin: {
        select: {
          name: true,
          email: true,
        },
      },

      users: {
        select: {
          name: true,
          email: true,
        },
      },
      latestMessage: true,
    },
  });

  if (!updatedChat) {
    res.status(500);
    throw new Error("Something went wrong");
  }

  return res.status(200).json({
    status: "success",
    message: "Group chat renamed successfully",
    data: updatedChat,
  });
});

/**
 * @route PATCH /api/v1/chat/groupadd
 * @description Add a user to a group chat
 * @access Private (admin only)
 * @body { chatId: String }
 * @body { userId: String }
 */
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
};
