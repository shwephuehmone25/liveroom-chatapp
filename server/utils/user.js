const users = [];

// save user information
exports.savedUsers = (id, username, room) => {
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
exports.getSameRoomUsers = (room) => {
  return users.filter((user) => user.room === room);
};

// get disconnected user
exports.getDisconnectedUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }

  return null;
};