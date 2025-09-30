export type Unit = {
  id: string
  unit?: string
  status?: string
  bedrooms?: number
  parkingSpaces?: string | number
  privateArea?: number
  price?: number
  source?: Record<string, any>
  [key: string]: any
}

export type Address = {
  city?: string
  street?: string
  neighborhood?: string
}

export type Release = {
  id: string
  title?: string
  description?: string
  images?: string[]
  floorPlans?: string[]
  isActive?: boolean
  unitsCount?: number
  createdAt?: number
  minUnitPrice?: number
  address?: Address
  developer?: string
  units?: Unit[]
  [key: string]: any
}
