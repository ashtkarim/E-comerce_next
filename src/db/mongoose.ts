import mongoose from 'mongoose';

export const connectMongo = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/DigiMarket';
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    await mongoose.connect(mongoUri, {
      dbName: 'DigiMarket', // Optional: specify your DB name here or inside URI
      // useNewUrlParser and useUnifiedTopology are now default in mongoose 6+
    });

    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};
