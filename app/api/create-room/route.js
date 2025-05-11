import dbConnect from '../../../lib/mongodb';
import bcrypt from "bcryptjs";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ message: "Unauthorized" });

  const { name, password, members } = req.body;
  const mongoose = await dbConnect();
  const db = mongoose.connection.db;

  const existing = await db.collection("chatrooms").findOne({ name });
  if (existing) return res.status(409).json({ message: "Room name taken" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newRoom = await db.collection("chatrooms").insertOne({
    name,
    password: hashedPassword,
    createdBy: session.user.email,
    members: members.map(email => ({
      email,
      joined: false,
      joinedAt: null
    })),
    createdAt: new Date()
  });

  res.status(200).json({ message: "Room created", roomId: newRoom.insertedId });
}
