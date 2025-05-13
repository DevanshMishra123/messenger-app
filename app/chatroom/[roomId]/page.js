"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Chatroom = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(false);
  const router = useRouter();

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
    <div className="bg-cover bg-center w-screen h-screen overflow-x-hidden overflow-y-hidden" style={{ backgroundImage: `url('/img-${room.imgNum}.jpg')` }}>
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
            onClick={async () => router.push('/')}
            className="bg-emerald-400 hover:bg-indigo-500 text-white p-2 rounded transition-colors duration-200"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
      <div className="flex flex-col px-2 h-[75vh]">
        <div className="overflow-y-scroll"></div>
        <div className="flex fixed bottom-0 right-0 w-full items-center gap-3 p-4 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <Input></Input>
          <Button>Send</Button>
        </div>
      </div>
    </div>
  );
};

export default Chatroom;
