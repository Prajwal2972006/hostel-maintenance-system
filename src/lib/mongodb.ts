import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
const globalForMongo = globalThis as unknown as { mongoClient?: MongoClient; mongoPromise?: Promise<MongoClient> };
const client = uri ? (globalForMongo.mongoClient ?? new MongoClient(uri)) : null;
if (client && process.env.NODE_ENV !== 'production') globalForMongo.mongoClient = client;
export async function getLogsCollection() {
  if (!client) throw new Error('MONGODB_URI is not configured');
  globalForMongo.mongoPromise ??= client.connect();
  const connected = await globalForMongo.mongoPromise;
  return connected.db().collection('activity_logs');
}
export async function logActivity(action: string, actorId: string, details: Record<string, unknown> = {}) {
  try { const logs = await getLogsCollection(); await logs.insertOne({ action, actorId, details, createdAt: new Date() }); }
  catch (error) { console.error('MongoDB activity log failed:', error); }
}
