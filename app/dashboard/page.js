"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSession, signOut } from "next-auth/react";

let socket;

export default function ChatClient() {
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (status === "authenticated") {
      socket = io("https://chat-backend-g9v3.onrender.com");

      const handleReceiveMessage = (data) => {
        setMessages((prev) => [...prev, { message: data, type: 1 }]);
      };

      socket.on("receive_message", handleReceiveMessage);

      return () => {
        socket.off("receive_message", handleReceiveMessage);
      };
    }
  }, [status]);

  const sendMessage = () => {
    if (!message || status !== "authenticated") return;
    socket.emit("send_message", message);
    setMessages((prev) => [...prev, { message: message, type: 0 }]);
    setMessage("");
  };

  if (status === "loading") {
    return <p className="text-white">Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p className="text-white text-center mt-10">You must be logged in to access the chat.</p>;
  }

  return (
    <div className="bg-[url('/chat-bg.png')] bg-cover bg-center h-screen w-screen flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Sign Out
        </button>
      </div>

      <div className="w-[70vw] h-[80vh] bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`w-full flex ${
                msg.type === 0 ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-2 rounded-md max-w-[80%] text-white ${
                  msg.type === 0 ? "bg-blue-500" : "bg-gray-500"
                }`}
              >
                <p>{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <input
            id="name"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message"
            className="flex-1 text-white bg-white/10 backdrop-blur-md placeholder-white/50 p-2 rounded"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
