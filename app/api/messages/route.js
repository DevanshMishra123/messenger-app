import dbConnect from '../../../lib/mongodb';
import { hash } from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, message } = await req.json();
    console.log("messages are",message);

    const mongoose = await dbConnect();
    const db = mongoose.connection.db;

    await db.collection("users").updateOne(
      { email },
      { $push: { messages: message } } 
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

