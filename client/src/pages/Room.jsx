/* eslint-disable react/prop-types */
import React, { useEffect, useState, useRef } from "react";
import {
  ArrowRightEndOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const Room = ({ username, room, socket }) => {
  const navigate = useNavigate();
  const [roomUsers, setRoomUsers] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [message, setMessage] = useState("");

  const boxDivRef = useRef(null);

  const getOldMessages = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER}/chat/${room}`);
      if (response.status === 403) {
        console.error("Room is not opened.");
        return navigate("/");
      }
      const data = await response.json();
      console.log("Received old messages:", data);
      setReceivedMessages((prev) => [...prev, ...data]);
    } catch (error) {
      console.error("Error fetching old messages:", error);
    }
  };  

  useEffect((_) => {
    getOldMessages();
  }, []);

  useEffect(() => {
    const handleReceivedMessage = (data) => {
      setReceivedMessages((prev) => [...prev, data]);
    };

    const handleRoomUsers = (data) => {
      setRoomUsers((prev) => {
        const updatedUsers = [...prev];
        data.forEach((user) => {
          const index = updatedUsers.findIndex(
            (prevUser) => prevUser.id === user.id
          );

          if (index !== -1) {
            updatedUsers[index] = { ...updatedUsers[index], ...user };
          } else {
            updatedUsers.push(user);
          }
        });
        return updatedUsers;
      });
    };

    if (socket) {
      socket.emit("joined_room", { username, room });

      socket.on("message", handleReceivedMessage);
      socket.on("room_users", handleRoomUsers);

      return () => {
        socket.off("message", handleReceivedMessage);
        socket.off("room_users", handleRoomUsers);
        socket.disconnect();
      };
    }
  }, [socket, username, room]);

  const sendMessage = () => {
    if (message.trim().length > 0) {
      socket.emit("send_message", message);
      setMessage("");
    }
  };

  const leaveRoom = () => {
    navigate("/");
  };

  //auto scroll for messages
  useEffect(
    (_) => {
      if (boxDivRef.current) {
        boxDivRef.current.scrollTop = boxDivRef.current.scrollHeight;
      }
    },
    [receivedMessages]
  );

  return (
    <section className="flex gap-4 h-screen">
      {/**left side*/}
      <div className="w-1/3 bg-blue-600 text-white font-medium p-4">
        <p className="text-3xl font-bold text-center mt-5">Room.io</p>
        <div className="mt-10 ps-2">
          <p className="text-lg flex items-end gap-1">
            <ChatBubbleLeftRightIcon width={30} />
            Room Name
          </p>
          <p className="bg-white text-blue-500 ps-5 py-2 rounded-tl-full rounded-bl-full my-2">
            {room}
          </p>
        </div>
        <div className="mt-5 ps-2">
          <p className="text-lg flex items-end gap-1 mb-3">
            <UserGroupIcon width={30} />
            Users
          </p>
          {roomUsers.map((user, i) => (
            <p className="flex items-end gap-1 text-lg mb-3" key={i}>
              <UserIcon width={24} />
              {user.username === username ? "You" : user.username}
            </p>
          ))}
        </div>
        <button
          type="submit"
          className="bottom-0 my-2 py-2.5 flex items-end px-2 text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm text-center me-2 mb-2 absolute lg:relative lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:mt-2"
          onClick={leaveRoom}
        >
          <ArrowRightEndOnRectangleIcon width={20} />
          Leave Room
        </button>
      </div>
      {/**right side*/}
      <div className="w-full pt-5 relative">
        <div className="h-[30-rem] overflow-y-auto" ref={boxDivRef}>
          {receivedMessages.map((msg, i) => (
            <div
              className="text-white bg-blue-500 px-3 py-2 w-3/4 rounded-br-3xl rounded-tl-3xl mb-3"
              key={i}
            >
              <p className="text-sm font-mono font-medium">
                From {msg.username}
              </p>
              <p className="text-lg font-medium">{msg.message}</p>
              <p className="text-sm font-medium font-mono text-right">
                {formatDistanceToNow(new Date(msg.sent_at))} ago
              </p>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 my-2 py-2.5 flex items-end w-full px-2">
          <input
            type="text"
            placeholder="Message...."
            className="w-full outline-none border-b text-lg me-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></input>
          <button
            type="button"
            className="hover:text-blue-500 hover:-rotate-45 duration-200"
            onClick={sendMessage}
          >
            <PaperAirplaneIcon />
            Send
          </button>
        </div>
      </div>
    </section>
  );
};

export default Room;
