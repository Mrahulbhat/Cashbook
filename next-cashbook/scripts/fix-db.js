const mongoose = require('mongoose');

// Use the URI directly from the logs/env to avoid dependency issues in the script
const MONGODB_URI = "mongodb+srv://rahulbhat5122_db_user:ZoKnxfZGfb74J4qK@cashbook.abrevhz.mongodb.net/production?appName=Cashbook";

async function fix() {
    try {
        console.log("Connecting...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected.");

        const collection = mongoose.connection.db.collection('users');

        console.log("Dropping old indexes...");
        try { await collection.dropIndex("phone_1"); } catch (e) { console.log("phone_1 not found or already dropped"); }
        try { await collection.dropIndex("email_1"); } catch (e) { console.log("email_1 not found or already dropped"); }

        console.log("Creating sparse unique indexes...");
        await collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
        await collection.createIndex({ email: 1 }, { unique: true, sparse: true });

        console.log("Success! phone: null will no longer conflict.");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

fix();
