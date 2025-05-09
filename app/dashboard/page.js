"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

let socket;

export default function ChatClient() {
  const { data: session, status } = useSession();
  console.log(session?.user?.messages);
  const userName = session?.user?.name;
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(session?.user?.messages || []);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (status === "authenticated") {
      socket = io("https://chat-backend-g9v3.onrender.com");

      const handleReceiveMessage = async (data) => {
        const newMessage = { message: data.message, name: data.name, type: 1 };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        try {
          await fetch("/api/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: session?.user?.email,
              messages: updatedMessages,
            }),
          });
        } catch (error) {
          console.error("Failed to save messages:", error);
          setError("Failed to save messages");
        }
      };

      socket.on("receive_message", handleReceiveMessage);

      return () => {
        socket.off("receive_message", handleReceiveMessage);
      };
    }
  }, [status]);

  useEffect(() => {
    if (session?.user?.messages?.length) {
      setMessages(session.user.messages);
    }
    const getUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        const usernames = data.usernames;
        setUsers(usernames);
      } catch (error) {
        console.error("Failed to save messages:", error);
      }
    };
    getUsers();
  }, [session]);

  const sendMessage = async () => {
    if (!message || status !== "authenticated") return;
    const newMessage = { message: message, type: 0, name: userName };
    const updatedMessages = [...messages, newMessage];
    socket.emit("send_message", { message, name: userName });
    setMessages(updatedMessages);
    setMessage("");
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session?.user?.email,
          messages: updatedMessages,
        }),
      });
    } catch (error) {
      console.error("Failed to save messages:", error);
      setError("Failed to save messages");
    }
  };

  if (status === "loading") {
    return <p className="text-white">Loading...</p>;
  }

  if (status === "unauthenticated") {
    return (
      <p className="text-white text-center mt-10">
        You must be logged in to access the chat.
      </p>
    );
  }

  return (
    <div className="flex justify-between">
      <div className="bg-black w-[150px]">{users.map((user,idx)=><div className="bg-black text-white py-4 px-4">{user}</div>)}</div>
      <div className="flex flex-col items-center justify-center pt-8 px-16">
        {error && (
          <div className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded shadow-md animate-pulse z-50">
            {error}
          </div>
        )}
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
                  {msg.name && msg.type === 1 && (
                    <p className="text-[11px] text-blue-200 mb-1">
                      ~{msg.name}
                    </p>
                  )}
                  <p>{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <Input
              id="name"
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              className="flex-1 text-white bg-white/10 backdrop-blur-md placeholder-white/50 p-2 rounded"
            />
            <Button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
