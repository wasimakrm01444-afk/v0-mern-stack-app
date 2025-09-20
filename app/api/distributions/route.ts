import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

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

    // Get all distributions, sorted by upload date (newest first)
    const distributions = await db.collection("distributions").find({}).sort({ uploadDate: -1 }).toArray()

    return NextResponse.json({ distributions })
  } catch (error) {
    console.error("Get distributions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
