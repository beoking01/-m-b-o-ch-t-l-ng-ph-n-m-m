// Kết nối với CSDL MongoDB sử dụng MongoDBCompass

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

module.exports.connect = async () => {
    try {
        let mongoUri = process.env.MONGO_URL;

        if (process.env.NODE_ENV === 'test') {
            // Start in-memory MongoDB server for testing
            mongoServer = await MongoMemoryServer.create();
            mongoUri = mongoServer.getUri();
        }

        if (!mongoUri) {
            throw new Error('MONGO_URL is not defined');
        }

        console.log(`Connecting to MongoDB at ${mongoUri}...`);
        await mongoose.connect(mongoUri);

        // Listen for connection events
        mongoose.connection.on('connected', () => {
            console.log(`✅ Connected successfully to MongoDB (${process.env.NODE_ENV === 'test' ? 'In-Memory' : 'Production'})`);
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('❌ MongoDB disconnected');
        });

    } catch (error) {
        console.error("❌ MongoDB Connection Error:");
        console.error("Error message:", error.message);
        console.error("Connection String:", process.env.MONGO_URL ? "Set (hidden for security)" : "NOT SET");
        process.exit(1);
    }
}

module.exports.disconnect = async () => {
    try {
        await mongoose.disconnect();
        if (mongoServer) {
            await mongoServer.stop();
        }
        console.log("Disconnect successfully");
    } catch (error) {
        console.log("Disconnect Error");
    }
}
