import { MongoClient, type Db } from "mongodb"
import { config, validateConfig } from "./config"

let client: MongoClient
let clientPromise: Promise<MongoClient>

export default function getClientPromise() {
  if (!clientPromise) {
    validateConfig()

    if (!config.mongodb.uri) {
      throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
    }

    const uri = config.mongodb.uri
    const options = {}

    if (process.env.NODE_ENV === "development") {
      // In development mode, use a global variable so that the value
      // is preserved across module reloads caused by HMR (Hot Module Replacement).
      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>
      }

      if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options)
        globalWithMongo._mongoClientPromise = client.connect()
      }
      clientPromise = globalWithMongo._mongoClientPromise
    } else {
      // In production mode, it's best to not use a global variable.
      client = new MongoClient(uri, options)
      clientPromise = client.connect()
    }
  }

  return clientPromise
}

export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise()
  return client.db("admin_agent_system")
}
