import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://mongodb:27017/gestionganadera"

/**
 * GET /api/users
 * Obtiene la lista de usuarios
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de búsqueda de la URL
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db()
    let query = {}
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { role: { $regex: search, $options: "i" } }
        ]
      }
    }
    const users = await db.collection("users").find(query).skip((page - 1) * limit).limit(limit).toArray()
    const total = await db.collection("users").countDocuments(query)
    await client.close()

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 })
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return NextResponse.json({ success: false, error: "Error al obtener usuarios" }, { status: 500 })
  }
}

/* Mocked data for reference:
const users = [
  {
    id: "1",
    name: "Administrador",
    email: "admin@ejemplo.com",
    role: "Administrador",
    createdAt: "2023-01-15",
  },
  {
    id: "2",
    name: "Juan Pérez",
    email: "juan@ejemplo.com",
    role: "Supervisor",
    createdAt: "2023-02-20",
  },
  {
    id: "3",
    name: "María López",
    email: "maria@ejemplo.com",
    role: "Operador",
    createdAt: "2023-03-10",
  },
]
*/

/**
 * POST /api/users
 * Crea un nuevo usuario
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener datos del cuerpo de la solicitud
    const body = await request.json()
    const { name, email, password } = body

    // Validar campos requeridos
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Todos los campos son obligatorios",
        },
        { status: 400 },
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "El formato del email no es válido",
        },
        { status: 400 },
      )
    }

    // Simulación de creación de usuario
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      role: "Operador", // Rol por defecto
      createdAt: new Date().toISOString().split("T")[0],
    }

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: "Usuario creado correctamente",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error al crear usuario:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear usuario",
      },
      { status: 500 },
    )
  }
}
