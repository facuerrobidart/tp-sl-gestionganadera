import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://mongodb:27017/gestionganadera"

/**
 * GET /api/dashboard
 * Obtiene los datos para el dashboard
 */
export async function GET() {
  try {
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db()
    const dashboardData = await db.collection("dashboard").findOne({})
    await client.close()
    return NextResponse.json({ success: true, data: dashboardData }, { status: 200 })
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error)
    return NextResponse.json({ success: false, error: "Error al obtener datos del dashboard" }, { status: 500 })
  }
}

/* Mocked data for reference:
const dashboardData = {
  totalCattle: 150,
  connectedCattle: 120,
  totalZones: 3,
  alerts: [
    {
      id: "1",
      type: "health",
      message: "Vaca 003 requiere atención médica",
      severity: "high",
      timestamp: "2024-03-15T09:00:00Z",
    },
    {
      id: "2",
      type: "location",
      message: "Vaca 005 fuera de zona permitida",
      severity: "medium",
      timestamp: "2024-03-15T08:30:00Z",
    },
  ],
  lastUpdated: "2024-03-15T10:30:00Z",
}
*/
