import { io } from "socket.io-client";

let socket;

export const initiateSocket = () => {
  if (typeof window === "undefined") return;

  if (!window.__socket) {
    window.__socket = io("https://chat-backend-g9v3.onrender.com", {
      transports: ["websocket"],
    });
    console.log("✅ Socket connected");
  }

  socket = window.__socket;
};

export const getSocket = () => {
  if (typeof window === "undefined") return null;
  return window.__socket || null;
};

export const disconnectSocket = () => {
  if (typeof window !== "undefined" && window.__socket) {
    window.__socket.disconnect();
    window.__socket = null;
    console.log("❌ Socket disconnected");
  }
};
