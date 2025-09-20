import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { config } from "./config"

function getJWTSecret(): string {
  if (process.env.NEXT_PHASE === "phase-production-build" || process.env.NODE_ENV === undefined) {
    return config.jwt.secret || "build-time-fallback"
  }

  if (!config.jwt.secret || config.jwt.secret === "fallback-secret-key-for-development") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET environment variable is required in production")
    }
  }
  return config.jwt.secret
}

export interface User {
  _id?: string
  email: string
  password: string
  role: "admin" | "agent"
  name?: string
  mobile?: string
  countryCode?: string
}

export interface Agent extends User {
  role: "agent"
  name: string
  mobile: string
  countryCode: string
}

export function generateToken(userId: string, email: string, role: string): string {
  const JWT_SECRET = getJWTSecret()
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: "24h" })
}

export function verifyToken(token: string): any {
  try {
    const JWT_SECRET = getJWTSecret()
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
