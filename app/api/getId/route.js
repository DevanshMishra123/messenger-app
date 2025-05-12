import { getServerSession } from "next-auth";
import dbConnect from "../../../lib/mongodb";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { room } = await req.json();
    if (!room) {
      return NextResponse.json({ message: "Room name is required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const mongoose = await dbConnect();
    const db = mongoose.connection.db;

    const roomDoc = await db.collection("chatrooms").findOne({ name: room });

    if (!roomDoc) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ roomId: roomDoc.roomId }, { status: 200 });

  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
