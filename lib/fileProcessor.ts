import * as XLSX from "xlsx"

export interface UploadedItem {
  firstName: string
  phone: string
  notes: string
}

export function validateFileType(fileName: string): boolean {
  const allowedExtensions = [".csv", ".xlsx", ".xls"]
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf("."))
  return allowedExtensions.includes(extension)
}

export function processFile(buffer: Buffer, fileName: string): UploadedItem[] {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]

    if (jsonData.length < 2) {
      throw new Error("File must contain at least a header row and one data row")
    }

    const headers = jsonData[0].map((h) => h?.toLowerCase().trim())
    const requiredHeaders = ["firstname", "phone", "notes"]

    // Check if all required headers exist
    const missingHeaders = requiredHeaders.filter((header) => !headers.some((h) => h.includes(header)))

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(", ")}. Required: FirstName, Phone, Notes`)
    }

    // Find column indices
    const firstNameIndex = headers.findIndex((h) => h.includes("firstname"))
    const phoneIndex = headers.findIndex((h) => h.includes("phone"))
    const notesIndex = headers.findIndex((h) => h.includes("notes"))

    // Process data rows
    const items: UploadedItem[] = []

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i]

      if (row && row.length > 0) {
        const firstName = row[firstNameIndex]?.toString().trim() || ""
        const phone = row[phoneIndex]?.toString().trim() || ""
        const notes = row[notesIndex]?.toString().trim() || ""

        if (firstName && phone) {
          items.push({
            firstName,
            phone,
            notes,
          })
        }
      }
    }

    if (items.length === 0) {
      throw new Error("No valid data rows found in the file")
    }

    return items
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Failed to process file. Please check the file format.")
  }
}

export function distributeItems(items: UploadedItem[], agents: any[]): any[] {
  if (agents.length === 0) {
    throw new Error("No agents available for distribution")
  }

  // Use exactly 5 agents or all available agents if less than 5
  const availableAgents = agents.slice(0, Math.min(5, agents.length))
  const itemsPerAgent = Math.floor(items.length / availableAgents.length)
  const remainingItems = items.length % availableAgents.length

  const distributions = []
  let currentIndex = 0

  for (let i = 0; i < availableAgents.length; i++) {
    const agent = availableAgents[i]
    const itemCount = itemsPerAgent + (i < remainingItems ? 1 : 0)
    const agentItems = items.slice(currentIndex, currentIndex + itemCount)

    distributions.push({
      agentId: agent._id.toString(),
      agentName: agent.name,
      agentEmail: agent.email,
      items: agentItems,
      totalItems: agentItems.length,
      uploadDate: new Date(),
    })

    currentIndex += itemCount
  }

  return distributions
}
