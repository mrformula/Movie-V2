import mongoose from 'mongoose';

declare global {
    var mongoose: {
        conn: any;
        promise: Promise<any> | null;
    };
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://realtechbd3:OMZVjlDOUiR8ODfO@cluster0.cr9m6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB; 