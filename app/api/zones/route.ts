import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/gestionganadera"

/**
 * GET /api/zones
 * Obtiene la lista de zonas
 */
export async function GET(request: NextRequest) {
  try {
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db()
    const zones = await db.collection("zones").find({}).toArray()
    await client.close()
    return NextResponse.json({ success: true, data: zones }, { status: 200 })
  } catch (error) {
    console.error("Error al obtener zonas:", error)
    return NextResponse.json({ success: false, error: "Error al obtener zonas" }, { status: 500 })
  }
}

/* Mocked data for reference:
const zones = [
  {
    id: "1",
    name: "Zona Norte",
    description: "Zona de pastoreo norte",
    area: 1500,
    capacity: 100,
    currentCattle: 75,
    status: "active",
  },
  {
    id: "2",
    name: "Zona Sur",
    description: "Zona de pastoreo sur",
    area: 2000,
    capacity: 150,
    currentCattle: 120,
    status: "active",
  },
  {
    id: "3",
    name: "Zona Este",
    description: "Zona de pastoreo este",
    area: 1800,
    capacity: 120,
    currentCattle: 90,
    status: "maintenance",
  },
]
*/
