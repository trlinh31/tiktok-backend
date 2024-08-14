const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { handleSocketConnection } = require("./controllers/commentController");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

// Cấu hình CORS cho cả Express và Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173", // Địa chỉ của client
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api/v1/users", require("./routes/user"));
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/videos", require("./routes/video"));
app.use("/api/v1/comments", require("./routes/comment"));

// Socket.IO connection handler
io.on("connection", (socket) => handleSocketConnection(socket, io));

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
