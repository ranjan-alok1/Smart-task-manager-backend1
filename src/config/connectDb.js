const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Database connected successfully'.bgCyan.white);
    } catch (error) {
        console.log(`Error connecting to database: ${error.message}`.bgRed.white);
        throw error;
    }
};

module.exports = connectDb;
