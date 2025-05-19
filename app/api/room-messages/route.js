import dbConnect from "../../../lib/mongodb";
import { hash } from "bcryptjs";

export async function POST(req) {
  try {
    const { roomId, email: senderEmail, messages } = await req.json();

    const mongoose = await dbConnect();
    const db = mongoose.connection.db;

    const latestMessage = messages[messages.length - 1];

    await db
      .collection("messages")
      .updateOne(
        { roomId, "messages.email": senderEmail },
        { $push: { "messages.$.message": latestMessage } }
      );

    console.log("Update result:", result);

    const room = await db.collection("chatrooms").findOne({ roomId });
    if (!room) {
      return new Response(JSON.stringify({ message: "Room not found" }), {
        status: 404,
      });
    }

    const recipientEmails = room.members
      .map((m) => m.email)
      .filter((e) => e !== senderEmail);

    const receivedMessage = {
      ...latestMessage,
      type: 1,
    };

    for (const email of recipientEmails) {
      await db
        .collection("messages")
        .updateOne(
          { roomId, "messages.email": email },
          { $push: { "messages.$.message": receivedMessage } }
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
/*
if (result.matchedCount === 0) {
      const doc = await db.collection("messages").findOne({ roomId: roomId });

      if (!doc) {
        await db
          .collection("messages")
          .updateOne(
            { roomId: roomId },
            {
              $set: {
                roomId: roomId,
                messages: [{ email, message: messages }],
              },
            },
            { upsert: true }
          );
      } else {
        await db
          .collection("messages")
          .updateOne(
            { roomId: roomId },
            { $push: { messages: { email, message: messages } } }
          );
      }
    }
*/
