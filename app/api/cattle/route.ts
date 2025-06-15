import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://mongodb:27017/gestionganadera"

/**
 * GET /api/cattle
 * Obtiene la lista de ganado con opciones de filtrado
 */
export async function GET(request: NextRequest) {
  try {
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db()
    const cattle = await db.collection("cattle").find({}).toArray()
    await client.close()
    return NextResponse.json({ success: true, data: cattle }, { status: 200 })
  } catch (error) {
    console.error("Error al obtener ganado:", error)
    return NextResponse.json({ success: false, error: "Error al obtener ganado" }, { status: 500 })
  }
}

/* Mocked data for reference:
const cattle = [
  {
    id: "1",
    name: "Vaca 001",
    breed: "Holstein",
    age: 4,
    weight: 650,
    zoneId: "1",
    status: "active",
    lastLocation: {
      lat: -34.6037,
      lng: -58.3816,
      timestamp: "2024-03-15T10:30:00Z",
    },
    health: {
      status: "healthy",
      lastCheck: "2024-03-01",
      vaccinations: ["fiebre aftosa", "brucelosis"],
    },
  },
  {
    id: "2",
    name: "Vaca 002",
    breed: "Jersey",
    age: 3,
    weight: 500,
    zoneId: "1",
    status: "active",
    lastLocation: {
      lat: -34.6038,
      lng: -58.3817,
      timestamp: "2024-03-15T10:30:00Z",
    },
    health: {
      status: "healthy",
      lastCheck: "2024-03-01",
      vaccinations: ["fiebre aftosa", "brucelosis"],
    },
  },
  {
    id: "3",
    name: "Vaca 003",
    breed: "Holstein",
    age: 5,
    weight: 700,
    zoneId: "2",
    status: "active",
    lastLocation: {
      lat: -34.6039,
      lng: -58.3818,
      timestamp: "2024-03-15T10:30:00Z",
    },
    health: {
      status: "sick",
      lastCheck: "2024-03-10",
      vaccinations: ["fiebre aftosa"],
    },
  },
]
*/
