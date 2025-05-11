import dbConnect from '../../../lib/mongodb';
import { hash } from 'bcryptjs';

export async function GET() {
  try {
    const mongoose = await dbConnect();
    const db = mongoose.connection.db;

    const users = await db.collection("users").find({}, { projection: { name: 1, _id: 0 } }).toArray();
    const usernames = users.map(user => user.name);
    const emailObjArray = await db.collection("users").find({}, { projection: { name: 1, _id: 0 } }).toArray();
    const emails = emailObjArray.map(obj=>obj.email);

    return new Response(JSON.stringify({
      message: "Messages updated successfully.",
      usernames,
      emails,
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Server error' }), {
      status: 500,
    });
  }
}

