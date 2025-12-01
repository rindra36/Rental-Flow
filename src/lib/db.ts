import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// A simple check to see if the URI is still a placeholder
const isPlaceholderUri = MONGODB_URI && MONGODB_URI.includes('<');

if (!MONGODB_URI || isPlaceholderUri) {
  if (isPlaceholderUri) {
    throw new Error(
`Please update the MONGODB_URI in your .env file.
It seems to be using placeholder values like <user>, <password>, or <cluster-url>.
Your current URI is: ${MONGODB_URI}`
    );
  }
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
        bufferCommands: false,
        dbName: "rental-flow",
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  
  return cached.conn;
}

export default dbConnect;
