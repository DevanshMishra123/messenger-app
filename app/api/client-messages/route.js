import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb"; 

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    const mongoose = await dbConnect(); 
    const db = mongoose.connection.db;

    const user = await db.collection("users").findOne({ email });
    const messages = user?.messages || [];

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("API error in client-messages:", error);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}
