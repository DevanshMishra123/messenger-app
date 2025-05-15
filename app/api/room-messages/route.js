import dbConnect from "../../../lib/mongodb";
import { hash } from "bcryptjs";

export async function POST(req) {
  try {
    const { roomId, email, messages } = await req.json();

    const mongoose = await dbConnect();
    const db = mongoose.connection.db;

    const result = await db
      .collection("messages")
      .updateOne(
        { roomId: roomId, "messages.email": email },
        { $set: { "messages.$.message": messages } }
      );

    console.log("Update result:", result);

    if (result.matchedCount === 0) {
      await db.collection("messages").updateOne(
        { roomId },
        {
          $setOnInsert: { roomId, messages: [] },
          $set: {
            messages: {
              email,
              message: messages,
            },
          },
        },
        { upsert: true }
      );
    }

    return new Response(
      JSON.stringify({ message: "Messages updated successfully." }),
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
    });
  }
}
