import mongoose from 'mongoose';

/**
 * Enterprise Initializer Node for MongoDB Engine Abstractions
 */
export const connectDatabase = async () => {
  const connectionURI = process.env.MONGO_URI;
  
  if (!connectionURI) {
    console.error('[DATABASE_FATAL] process.env.MONGO_URI is undefined. Aborting startup sequence.');
    process.exit(1);
  }

  try {
    const poolOptions = {
      maxPoolSize: 10,                 // Mitigates socket exhaustion vectors
      minPoolSize: 2,                  // Preserves standby hot connection routes
      serverSelectionTimeoutMS: 5000,  // Fast-fail window under platform crashes
      socketTimeoutMS: 45000,          // Terminates hanging thread execution loops
    };

    mongoose.connection.on('connected', () => console.log('[DATABASE] Primary ledger connection pipeline active.'));
    mongoose.connection.on('error', (err) => console.error('[DATABASE_ERROR] Runtime driver exception:', err));
    mongoose.connection.on('disconnected', () => console.warn('[DATABASE_WARN] Connection pipe severed. Reconnecting...'));

    await mongoose.connect(connectionURI, poolOptions);
  } catch (error) {
    console.error('[DATABASE_FATAL] Server initial handshake failed:', error);
    throw error;
  }
};
