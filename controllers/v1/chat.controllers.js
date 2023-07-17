const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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
    console.log("creating new chat");
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
  }

  return res.status(200).json({ status: "success", data: chat });
});

module.exports = {
  accessChat,
};
