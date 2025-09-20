import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { comparePassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if user is admin
    const admin = await db.collection("admins").findOne({ email })

    if (admin) {
      const isValidPassword = await comparePassword(password, admin.password)

      if (isValidPassword) {
        const token = generateToken(admin._id.toString(), admin.email, "admin")

        return NextResponse.json({
          success: true,
          token,
          user: {
            id: admin._id,
            email: admin.email,
            role: "admin",
          },
        })
      }
    }

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
