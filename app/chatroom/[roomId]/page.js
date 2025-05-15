"use client";
import { useEffect, useState, useRef } from "react";
import { initiateSocket, getSocket } from "@/lib/socket";
import { useParams } from "next/navigation";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Chatroom = () => {
  const { roomId } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const userName = session?.user?.name;
  const socketRef = useRef(null);
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

useEffect(() => {
    if (!roomId || !session?.user?.email) return;

    const fetchChatroomData = async () => {
      try {
        const res = await fetch(`/api/roomauth/${roomId}`);
        const data = await res.json();
        if (res.ok) setRoom(data);
        else setError(data.message);
      } catch (err) {
        setError("An error occurred while fetching the chatroom");
      } finally {
        setLoading(false);
      }
    };

    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/get-messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, email: session.user.email }),
        });
        const data = await res.json();
        if (res.ok) setMessages(data.messages || []);
        else setError(data.message);
      } catch (error) {
        console.error("Failed to get messages:", error);
      }
    };

    fetchChatroomData();
    fetchMessages();
  }, [roomId, session]);

  useEffect(() => {
    if (status === "authenticated") {
      initiateSocket();
      const socket = getSocket();

      if (!socket) {
        console.warn("Socket is not connected");
        return;
      }

      socketRef.current = socket;
      const handleReceiveMessage = async (data) => {
        const newMessage = { message: data.message, name: data.name, type: 1 };
        const updatedMessages = [...messages, newMessage];
        setMessages((prev) => [...prev, newMessage]);
        try {
          await fetch("/api/room-messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              roomId: roomId,
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
  }, [status, roomId, session]);

  const saveMessages = async (updatedMessages) => {
    try {
      await fetch("/api/room-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: roomId,
          email: session?.user?.email,
          messages: updatedMessages,
        }),
      });
    } catch (error) {
      console.error("Failed to save messages:", error);
      setError("Failed to save messages");
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !socketRef.current) return;

    const newMessage = { message, type: 0, name: userName };
    setMessages((prev) => {
      const updatedMessages = [...prev, newMessage];
      saveMessages(updatedMessages);
      return updatedMessages;
    });

    socketRef.current.emit("send_message", {
      message,
      name: userName,
    });

    setMessage("");
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div
      className="bg-cover bg-center w-screen h-screen overflow-x-hidden overflow-y-hidden"
      style={{ backgroundImage: `url('/img-${room.imgNum}.jpg')` }}
    >
      <div
        style={{ backgroundColor: room.color }}
        className="h-[30vh] relative flex justify-between items-center text-white py-4 px-8"
      >
        <div>
          <h2>
            <button onClick={() => setView(!view)}>View Members:</button>
          </h2>
          {view && (
            <ul className="absolute p-2 rounded-2xl bg-white text-black">
              {room.members.map((member, idx) => (
                <li key={idx}>{member.email}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 w-40 h-40 rounded-full bg-white text-black flex justify-center items-center">
          {room.name}
        </div>
        <div>
          <button
            onClick={async () => router.push("/")}
            className="bg-emerald-400 hover:bg-indigo-500 text-white p-2 rounded transition-colors duration-200"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
      <div className="flex flex-col px-2 h-[75vh]">
        <div className="flex flex-col overflow-y-scroll">
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
                  <p className="text-[11px] text-blue-200 mb-1">~{msg.name}</p>
                )}
                <p>{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex fixed bottom-0 right-0 w-full items-center gap-3 p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <Input
            placeholder="Enter your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></Input>
          <Button onClick={sendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
};

export default Chatroom;
