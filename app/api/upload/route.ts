import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { processFile, distributeItems, validateFileType } from "@/lib/fileProcessor"

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

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!validateFileType(file.name)) {
      return NextResponse.json(
        { error: "Invalid file type. Only .csv, .xlsx, and .xls files are allowed." },
        { status: 400 },
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Process file
    const items = processFile(buffer, file.name)

    if (items.length === 0) {
      return NextResponse.json({ error: "No valid data found in the file" }, { status: 400 })
    }

    const db = await getDatabase()

    // Get all agents
    const agents = await db.collection("agents").find({}).toArray()

    if (agents.length === 0) {
      return NextResponse.json({ error: "No agents available. Please add agents first." }, { status: 400 })
    }

    // Distribute items among agents
    const distributions = distributeItems(items, agents)

    // Save distributions to database
    const result = await db.collection("distributions").insertMany(distributions)

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${items.length} items and distributed among ${distributions.length} agents`,
      totalItems: items.length,
      distributions: distributions.map((d) => ({
        agentName: d.agentName,
        itemCount: d.totalItems,
      })),
    })
  } catch (error) {
    console.error("Upload error:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
