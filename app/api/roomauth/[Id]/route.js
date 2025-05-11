import { getSession } from "next-auth/react";
import { connectDB } from "@/lib/mongodb";

export default async function handler(req, res) {
  const { Id } = req.query;
  const session = await getSession({ req });

  if (!session) return res.status(401).json({ message: "Login required" });

  const db = await connectDB();
  const room = await db.collection("chatrooms").findOne({ _id: new ObjectId(Id) });

  if (!room) return res.status(404).json({ message: "Room not found" });

  const member = room.members.find(m => m.email === session.user.email);
  if (!member) return res.status(403).json({ message: "You are not a member of this room" });

  res.status(200).json({
    roomId: room._id,
    name: room.name,
    members: room.members,
  });
}
