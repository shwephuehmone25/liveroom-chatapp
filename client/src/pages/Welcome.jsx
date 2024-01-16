import React from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const Welcome = ({ username, setUsername, room, setRoom, setSocket }) => {
  const navigate = useNavigate();

  const joinRoom = (e) => {
    e.preventDefault();
    if (
      username.trim().length > 0 &&
      room !== "select-room" &&
      room.trim().length > 0
    ) {
      const socketServer = io.connect("http://localhost:5000");
      setSocket(socketServer);
      navigate("/chat", { replace: true });
    } else {
      alert("Please add required information");
    }
  };

  return (
    <section className="mx-auto max-w-xl mt-16 pt-8 border-t-2 border-blue-700">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl mb-4 font-bold text-blue-700 dark:text-blue-400">
          Room.io
        </h2>
        <form action="" className="p-4" onSubmit={joinRoom}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block mb-2 text-sm outline-none font-medium text-gray-900 dark:text-white"
              id="username"
              name="username"
            >
              Name
            </label>
            <input
              type="text"
              placeholder="Enter username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="rooms"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Select a room
            </label>
            <select
              id="room"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={(e) => setRoom(e.target.value)}
            >
              <option value="select-room">--- Choose a room ---</option>
              <option value="javaScript">JavaScript</option>
              <option value="node">Node</option>
              <option value="react">React</option>
              <option value="next">Next</option>
            </select>
          </div>
          <button
            type="submit"
            className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 text-center me-2 mb-2"
          >
            Join Room
          </button>
        </form>
      </div>
    </section>
  );
};

export default Welcome;