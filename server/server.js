import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import colors from "colors";
import path from "path";
import { Server } from "socket.io";
import connectDB from "./db/connectDB.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";
import messageRoutes from "./routes/message.route.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

connectDB();

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// **DEPLOYMENT CODE **
const __dirname1 = path.resolve();

if (process.env.NODE_ENV == "production") {
  console.log(__dirname1);
  app.use(express.static(path.join(__dirname1, "../client/dist")));

  app.get("*",(req,res)=>{
    res.sendFile(path.resolve(__dirname1,"..","client","dist","index.html"))
  })
} else {
  app.get("/", (req, res) => {
    res.send("Welcome to Chat App!");
  });
}

app.use(notFound);
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`.yellow.bold);
});

// ** SOCKET IO **

// Anything related to io will happen to every single socket.
// For eg io.emit() will emit the messages to all conntected users.
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to Socket IO");

  socket.on("setup", (userData) => {
    socket.join(userData._id); //Joining a room named by user's id
    socket.emit("connected");
  });

  socket.on("join-chat", (room) => {
    socket.join(room);
    console.log("User Joined Room " + room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing"); //Emits a typing event to all the clients in specified room except the sender
  });

  socket.on("stop-typing", (room) => {
    socket.in(room).emit("stop-typing");
  });

  socket.on("new-message", (newMesgReceived) => {
    var chat = newMesgReceived.chat;

    if (!chat.users) return console.log("chat.users Not Defined!");

    chat.users.forEach((user) => {
      if (user._id === newMesgReceived.sender._id) return; // Giving message received event to all except the message sender

      socket.in(user._id).emit("message received", newMesgReceived);
    });
  });

  socket.off("setup", (userData) => {
    console.log("User Disconnected!");
    socket.leave(userData._id);
  });
});
