import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import dbConnect from "../../../../lib/mongodb";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req, { params }) {
  try {
    const { Id } = await params;
    console.log("Params:", params);
    console.log("id is", Id);
    if (!Id) {
      console.error("No Id provided in params");
      return new Response(JSON.stringify({ message: "Room ID is required" }), {
        status: 400,
      });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      console.error("No session found");
      return new Response(JSON.stringify({ message: "Login required" }), {
        status: 401,
      });
    }

    const mongoose = await dbConnect();
    const db = mongoose.connection.db;

    if (!db) {
      console.error("Failed to connect to the database");
      return new Response(
        JSON.stringify({ message: "Database connection failed" }),
        { status: 500 }
      );
    }

    console.log("Database connected");

    const room = await db.collection("chatrooms").findOne({ roomId: Id });
    if (!room) {
      console.error(`Room with ID ${Id} not found`);
      return new Response(JSON.stringify({ message: "Room not found" }), {
        status: 404,
      });
    }

    if (room.createdBy === session.user.email) {
      return new Response(
        JSON.stringify({
          roomId: room.roomId,
          name: room.name,
          members: room.members,
        }),
        { status: 200 }
      );
    }

    const member = room.members.find((m) => m.email === session.user.email);
    if (!member) {
      console.error(`User ${session.user.email} is not a member of the room`);
      return new Response(
        JSON.stringify({ message: "You are not a member of this room" }),
        { status: 403 }
      );
    }

    console.log("Room found:", room);

    return new Response(
      JSON.stringify({
        roomId: room.roomId,
        name: room.name,
        members: room.members,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
