import dbConnect from '../../../lib/mongodb';
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const mongoose = await dbConnect();
    const db = mongoose.connection.db;
    const chatrooms = await db
      .collection("chatrooms")
      .find({}, { projection: { name: 1 } }) 
      .toArray();

    const roomNames = chatrooms.map(room => room.name);

    res.status(200).json({ roomNames });
  } catch (error) {
    console.error("Error fetching chatrooms:", error);
    res.status(500).json({ message: "Server error" });
  }
}
