import dbConnect from '../../../lib/mongodb';
import { hash } from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, messages } = await req.json();
    console.log(messages);

    const mongoose = await dbConnect();
    const db = mongoose.connection.db;

    await db.collection("users").updateOne(
        { email },
        { $set: { messages } }
    );

    return new Response(JSON.stringify({ message: 'Messages updated successfully.' }), {
      status: 201,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Server error' }), {
      status: 500,
    });
  }
}

