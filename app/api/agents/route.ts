import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword, verifyToken } from "@/lib/auth"
import type { Agent } from "@/lib/types"

// GET all agents
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const db = await getDatabase()
    const agents = await db
      .collection("agents")
      .find(
        {},
        {
          projection: { password: 0 },
        },
      )
      .toArray()

    return NextResponse.json({ agents })
  } catch (error) {
    console.error("Get agents error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create new agent
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { name, email, mobile, countryCode, password } = await request.json()

    if (!name || !email || !mobile || !countryCode || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if agent already exists
    const existingAgent = await db.collection("agents").findOne({ email })
    if (existingAgent) {
      return NextResponse.json({ error: "Agent with this email already exists" }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    const newAgent: Agent = {
      name,
      email,
      mobile,
      countryCode,
      password: hashedPassword,
      role: "agent",
      createdAt: new Date(),
    }

    const result = await db.collection("agents").insertOne(newAgent)

    return NextResponse.json({
      success: true,
      agent: {
        _id: result.insertedId,
        name,
        email,
        mobile,
        countryCode,
        role: "agent",
        createdAt: newAgent.createdAt,
      },
    })
  } catch (error) {
    console.error("Create agent error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
