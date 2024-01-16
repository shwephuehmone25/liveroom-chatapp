const Message = require("../models/Message");
const OPEN_ROOMS = ["react", "node", "javascript", "next"];

exports.getOldMessage = (req, res, next) => {
  const { roomName } = req.params;

  if (OPEN_ROOMS.includes(roomName.toLowerCase())) {
    Message.find({ room: roomName })
      .select("username message sent_at")
      .then((messages) => {
        res.status(200).json(messages);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
        res.status(500).json("Internal Server Error");
      });
  } else {
    res.status(403).json("Room is not opened or does not exist.");
  }
};
