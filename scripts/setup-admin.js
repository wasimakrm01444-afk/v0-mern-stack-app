const { getDatabase } = require("../lib/mongodb.js")
const { hashPassword } = require("../lib/auth.js")

async function setupAdmin() {
  try {
    const db = await getDatabase()

    // Check if admin already exists
    const existingAdmin = await db.collection("admins").findOne({ email: "admin@example.com" })

    if (existingAdmin) {
      console.log("Admin already exists")
      return
    }

    // Create default admin
    const hashedPassword = await hashPassword("admin123")

    const admin = {
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
    }

    await db.collection("admins").insertOne(admin)
    console.log("Default admin created successfully")
    console.log("Email: admin@example.com")
    console.log("Password: admin123")
  } catch (error) {
    console.error("Error setting up admin:", error)
  } finally {
    process.exit(0)
  }
}

setupAdmin()
