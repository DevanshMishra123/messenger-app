import { getServerSession } from "next-auth";
import dbConnect from "../../../lib/mongodb";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { roomId, email } = await req.json();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const mongoose = await dbConnect();
    const db = mongoose.connection.db;

    const roomDoc = await db.collection("messages").findOne({ roomId: roomId });

    if (!roomDoc) {
      return NextResponse.json({ messages: [] }, { status: 200 });
    }

    const userMessageEntry = roomDoc.messages.find(
      (entry) => entry.email === email
    );

    if (!userMessageEntry) {
      return NextResponse.json({ messages: [] }, { status: 200 });
    }

    return NextResponse.json(
      { messages: userMessageEntry.message || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
