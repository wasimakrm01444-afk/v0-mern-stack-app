export const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || "",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret-key-for-development",
  },
  app: {
    env: process.env.NODE_ENV || "development",
  },
}

export function validateConfig() {
  if (
    typeof window !== "undefined" || // Skip on client side
    process.env.NODE_ENV !== "production" || // Skip in development
    process.env.NEXT_PHASE === "phase-production-build" // Skip during build
  ) {
    return
  }

  const requiredVars = ["MONGODB_URI", "JWT_SECRET"]
  const missing = requiredVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}
