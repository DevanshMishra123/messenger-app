import dbConnect from "../../../lib/mongodb";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, password, members } = body;

    if (!name) {
      return NextResponse.json(
        { message: "Room name is required" },
        { status: 400 }
      );
    }

    const mongoose = await dbConnect();
    const db = mongoose.connection.db;

    const existing = await db.collection("chatrooms").findOne({ name });
    if (existing) {
      return NextResponse.json({ message: "Room name taken" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    function getRandomColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      let imgNum = 1 + Math.floor(Math.random() * 6);
      return { color, imgNum };
    }
    const { color, imgNum } = getRandomColor();

    const newRoom = await db.collection("chatrooms").insertOne({
      name,
      password: hashedPassword,
      createdBy: session.user.email,
      color,
      imgNum,
      members: members.map((email) => ({
        email,
        joined: false,
        joinedAt: null,
      })),
      createdAt: new Date(),
    });

    const roomId = newRoom.insertedId.toString();
    await db
      .collection("chatrooms")
      .updateOne({ _id: newRoom.insertedId }, { $set: { roomId } });

    await db.collection("messages").insertOne({
      roomId,
      messages: members.map((email) => ({ email, message: [] })),
    });

    return NextResponse.json(
      { message: "Room created", roomId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
