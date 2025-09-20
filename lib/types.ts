export interface UploadedItem {
  firstName: string
  phone: string
  notes: string
}

export interface DistributedList {
  _id?: string
  agentId: string
  agentName: string
  items: UploadedItem[]
  uploadDate: Date
  totalItems: number
}

export interface Agent {
  _id?: string
  name: string
  email: string
  mobile: string
  countryCode: string
  password: string
  role: "agent"
  createdAt: Date
}

export interface Admin {
  _id?: string
  email: string
  password: string
  role: "admin"
  createdAt: Date
}
