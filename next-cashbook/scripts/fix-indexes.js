const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGO_URI environment variable inside .env');
    process.exit(1);
}

async function fixIndexes() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        const db = mongoose.connection.db;
        const collection = db.collection('users');

        console.log('Current indexes:');
        const indexes = await collection.indexes();
        console.log(indexes);

        // Drop phone_1 index if it exists
        if (indexes.find(idx => idx.name === 'phone_1')) {
            console.log('Dropping phone_1 index...');
            await collection.dropIndex('phone_1');
        }

        // Drop email_1 index if it exists
        if (indexes.find(idx => idx.name === 'email_1')) {
            console.log('Dropping email_1 index...');
            await collection.dropIndex('email_1');
        }

        console.log('Creating sparse unique indexes...');

        // Recreate phone index as unique + sparse
        await collection.createIndex({ phone: 1 }, { unique: true, sparse: true });
        console.log('Recreated phone_1 index (sparse: true, unique: true)');

        // Recreate email index as unique + sparse
        await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
        console.log('Recreated email_1 index (sparse: true, unique: true)');

        console.log('Success! Indexes have been updated.');
    } catch (error) {
        console.error('Error fixing indexes:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

fixIndexes();
