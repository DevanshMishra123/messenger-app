"use client"
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const Chatroom = () => {
  const { roomId } = useParams();
  console.log(roomId);
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    const fetchChatroomData = async () => {
      try {
        const res = await fetch(`/api/roomauth/${roomId}`);
        const data = await res.json();
        
        if (res.ok) {
          setRoom(data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("An error occurred while fetching the chatroom");
      } finally {
        setLoading(false);
      }
    };

    fetchChatroomData();
  }, [roomId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>{room.name}</h1>
      <h2>Members:</h2>
      <ul>
        {room.members.map((member,idx) => (
          <li key={idx}>{member.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default Chatroom;
