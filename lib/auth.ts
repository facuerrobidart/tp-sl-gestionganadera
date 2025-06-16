"use server"

import { cookies } from "next/headers"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/gestionganadera"

interface Session {
  user: {
    email: string
    name: string
    role: string
  }
  expires: string
}

interface UserDocument {
  email: string
  name: string
  role: string
  password: string
}

// Simulación de autenticación
const VALID_EMAIL = "admin@ejemplo.com"
const VALID_PASSWORD = "password"

export async function login(email: string, password: string): Promise<Session> {
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    const db = client.db()
    
    // Find user by email
    const user = await db.collection<UserDocument>("users").findOne({ email })
    
    if (!user) {
      throw new Error("Credenciales inválidas")
    }
    
    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      throw new Error("Credenciales inválidas")
    }
    
    // Create session
    const session: Session = {
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
    }

    // Guardar en cookies
    await (await cookies()).set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 día
      path: "/",
    });

    return session
  } catch (error) {
    throw error
  } finally {
    await client.close()
  }
}

export async function logout() {
  (await cookies()).delete("session")
}

export async function getSession() {
  const sessionCookie = (await cookies()).get("session")

  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value) as Session

    // Verificar si la sesión ha expirado
    if (new Date(session.expires) < new Date()) {
      (await cookies()).delete("session")
      return null
    }

    return session
  } catch (error) {
    return null
  }
}
