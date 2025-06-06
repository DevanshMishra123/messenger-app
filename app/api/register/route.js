import dbConnect from '../../../lib/mongodb';
import { hash } from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, password, username } = await req.json();

    if (!email || !password || !username) {
      return new Response(JSON.stringify({ message: 'Email and password are required' }), {
        status: 400,
      });
    }

    const mongoose = await dbConnect();
    const db = mongoose.connection.db;

    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      return new Response(JSON.stringify({ message: 'User already exists' }), {
        status: 400,
      });
    }

    const hashedPassword = await hash(password, 12);

    await db.collection('users').insertOne({
      name: username,
      email,
      password: hashedPassword,
      messages: [],
    });

    return new Response(JSON.stringify({ message: 'User created' }), {
      status: 201,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Server error' }), {
      status: 500,
    });
  }
}

