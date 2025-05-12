import dbConnect from '../../../lib/mongodb'; 
import { getServerSession } from "next-auth";  
import { authOptions } from '../auth/[...nextauth]/route'; 

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions, req);

    if (!session) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const mongoose = await dbConnect();
    const db = mongoose.connection.db;

    const chatrooms = await db
      .collection("chatrooms")
      .find({}, { projection: { name: 1 } }) 
      .toArray();

    const roomNames = chatrooms.map(room => room.name);

    return new Response(JSON.stringify({ roomNames }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching chatrooms:", error);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
