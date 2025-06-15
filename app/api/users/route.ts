import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/gestionganadera"

/**
 * GET /api/users
 * Obtiene la lista de usuarios
 */
export async function GET(request: NextRequest) {
  try {
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db()
    const users = await db.collection("users").find({}).toArray()
    await client.close()

    // Remove sensitive data before sending
    const sanitizedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }))

    return NextResponse.json({ success: true, data: sanitizedUsers }, { status: 200 })
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
    const { name, email, password } = await request.json()

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Todos los campos son obligatorios" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "El formato del email no es válido" },
        { status: 400 }
      )
    }

    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db()

    // Check if email already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      await client.close()
      return NextResponse.json(
        { success: false, error: "El email ya está registrado" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = await db.collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      role: "Operador", // Default role
      createdAt: new Date().toISOString()
    })

    await client.close()

    return NextResponse.json(
      {
        success: true,
        data: {
          id: result.insertedId.toString(),
          name,
          email,
          role: "Operador",
          createdAt: new Date().toISOString()
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error al crear usuario:", error)
    return NextResponse.json(
      { success: false, error: "Error al crear usuario" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/users/:id
 * Elimina un usuario
 */
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id")
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID de usuario no proporcionado" },
        { status: 400 }
      )
    }

    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db()

    const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) })
    await client.close()

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return NextResponse.json(
      { success: false, error: "Error al eliminar usuario" },
      { status: 500 }
    )
  }
}
