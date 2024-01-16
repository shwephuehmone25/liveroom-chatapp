const express = require("express");
const socketIO = require("socket.io");
const mongoose = require("mongoose")
require("dotenv").config();
const Message = require("./models/Message");
const messageController = require("./controllers/message");

const cors = require("cors");

const formatMessage = require("./utils/formatMsg");
const {
  savedUsers,
  getDisconnectedUser,
  getSameRoomUsers,
} = require("./utils/user");

const app = express();
app.use(cors());

app.get("/chat/:roomName", messageController.getOldMessage);

mongoose.connect(process.env.MONGODB_URL).then( (_) =>
  {
    console.log("Database is connected");
  }
).catch();

const server = app.listen(5000, () => {
  console.log("Server is running at port 5000!");
});

const io = socketIO(server, {
  cors: "*",
});

// Socket connection handling
io.on("connection", (socket) => {
  const BOT = "Elisa";

  // Handle when a user joins a room
  socket.on("joined_room", ({ username, room }) => {
    const user = savedUsers(socket.id, username, room);

    if (user) {
      socket.join(user.room);

      // Send a welcome message to the joined user
      socket.emit("message", formatMessage(BOT, "How are you?"));

      // Broadcast to others in the room that a new user has joined
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          formatMessage(BOT, `${user.username} joined the room.`)
        );

      // Emit room users to everyone in the room
      io.to(user.room).emit("room_users", getSameRoomUsers(user.room));

      // Handle when a message is sent
      socket.on("send_message", (data) => {
        // Broadcast the message to everyone in the room
        io.to(user.room).emit("message", formatMessage(user.username, data));

        //store message in database
        Message.create({
          username: user.username,
          message: data,
          room: user.room
        })
      });
    } else {
      console.error("Invalid data received for 'joined_room' event");
    }
  });

  // Handle when a user disconnects
  socket.on("disconnect", () => {
    const user = getDisconnectedUser(socket.id);

    if (user) {
      // Notify others in the room that the user has left
      io.to(user.room).emit(
        "message",
        formatMessage(BOT, `${user.username} left the room.`)
      );

      // Update room users when a user disconnects
      io.to(user.room).emit("room_users", getSameRoomUsers(user.room));
    }
  });
});
