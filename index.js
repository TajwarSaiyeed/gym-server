const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const app = express();
const port = 5000;

dotenv.config();

// routes imports
const attendanceRoutes = require("./routes/v1/attendance.routes");
const chatRoutes = require("./routes/v1/chat.routes");
const dietRoutes = require("./routes/v1/diet.routes");
const exerciseRoutes = require("./routes/v1/exercise.routes");
const feesRoutes = require("./routes/v1/fees.routes");
const messageRoutes = require("./routes/v1/message.routes");
const notificationRoutes = require("./routes/v1/notification.routes");
const userRoutes = require("./routes/v1/user.routes");

// middlewares imports
const { notFound, errorHandler } = require("./middleware/error.middleware");

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/diet", dietRoutes);
app.use("/api/v1/exercise", exerciseRoutes);
app.use("/api/v1/fees", feesRoutes);
app.use("/api/v1/message", messageRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/users", userRoutes);

// middlewares error handlers (not found, error)
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log("Server is running on port 5000");
});
