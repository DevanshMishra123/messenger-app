import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import dbConnect from '../../../../lib/mongodb';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req, { params }) {
  const { Id } = params;  

  const session = await getServerSession(authOptions); 

  if (!session) {
    return new Response(JSON.stringify({ message: "Login required" }), { status: 401 });
  }

  const db = await dbConnect();
  const room = await db.collection("chatrooms").findOne({ _id: new ObjectId(Id) });

  if (!room) {
    return new Response(JSON.stringify({ message: "Room not found" }), { status: 404 });
  }

  const member = room.members.find(m => m.email === session.user.email);
  if (!member) {
    return new Response(JSON.stringify({ message: "You are not a member of this room" }), { status: 403 });
  }

  return new Response(JSON.stringify({
    roomId: room._id,
    name: room.name,
    members: room.members,
  }), { status: 200 });
}

