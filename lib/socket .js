import { io } from "socket.io-client";

let socket = null;

export const initiateSocket = () => {
  if (!socket) {
    socket = io("https://chat-backend-g9v3.onrender.com");
    console.log("✅ Socket connected");
  }
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("❌ Socket disconnected");
  }
};
