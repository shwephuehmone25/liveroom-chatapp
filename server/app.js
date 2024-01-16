const express = require("express");
const socketIO = require("socket.io");
const cors = require("cors");
const formatMessage = require("./utils/formatMsg");

const app = express();
app.use(cors());

const server = app.listen(5000, () => {
  console.log("Server is running at port 5000!");
});

const io = socketIO(server, {
  cors: "*",
});

const users = [];

// save user information
const savedUsers = (id, username, room) => {
  // Check if username is already in the room
  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );

  if (existingUser) {
    console.error("Username is already taken in this room");
    return null;
  }

  const user = { id, username, room };
  users.push(user);
  return user;
};

// get users in the same room
const getSameRoomUsers = (room) => {
  return users.filter((user) => user.room === room);
};

// get disconnected user
const getDisconnectedUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }

  return null;
};

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
        .emit("message", formatMessage(BOT, `${user.username} joined the room.`));

      // Emit room users to everyone in the room
      io.to(user.room).emit("room_users", getSameRoomUsers(user.room));

      // Handle when a message is sent
      socket.on("send_message", (data) => {
        // Broadcast the message to everyone in the room
        io.to(user.room).emit("message", formatMessage(user.username, data));
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
