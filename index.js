const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const app = express();
const port = 5000;

dotenv.config();

// routes imports
const userRoutes = require("./routes/v1/user.routes");
const dietRoutes = require("./routes/v1/diet.routes");
const exerciseRoutes = require("./routes/v1/exercise.routes");
const notificationRoutes = require("./routes/v1/notification.routes");
const feesRoutes = require("./routes/v1/fees.routes");
const attendanceRoutes = require("./routes/v1/attendance.routes");

// middlewares imports
const { notFound, errorHandler } = require("./middleware/error.middleware");

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/diet", dietRoutes);
app.use("/api/v1/exercise", exerciseRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/fees", feesRoutes);
app.use("/api/v1/attendance", attendanceRoutes);

// middlewares error handlers (not found, error)
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log("Server is running on port 5000");
});
