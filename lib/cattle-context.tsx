"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { generateMockCattle, generateMockZones } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"

export interface Cattle {
  id: string
  name: string
  description: string
  imageUrl: string
  position: [number, number]
  connected: boolean
  zoneId: string | null
}

export interface Zone {
  id: string
  name: string
  description: string
  bounds: [[number, number], [number, number]] // [[lat1, lng1], [lat2, lng2]]
  color: string
}

interface CattleContextType {
  cattle: Cattle[]
  zones: Zone[]
  loading: boolean
  connectedCattle: number
  selectedCattleId: string | null
  setSelectedCattleId: (id: string | null) => void
  selectedZoneId: string | null
  setSelectedZoneId: (id: string | null) => void
}

const CattleContext = createContext<CattleContextType | undefined>(undefined)

export function CattleProvider({ children }: { children: ReactNode }) {
  const [cattle, setCattle] = useState<Cattle[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCattleId, setSelectedCattleId] = useState<string | null>(null)
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()

  // Fetch data from API when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setCattle([])
      setZones([])
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch cattle data
        const cattleResponse = await fetch('/api/cattle')
        if (!cattleResponse.ok) throw new Error('Error fetching cattle data')
        const cattleData = await cattleResponse.json()
        
        // Fetch zones data
        const zonesResponse = await fetch('/api/zones')
        if (!zonesResponse.ok) throw new Error('Error fetching zones data')
        const zonesData = await zonesResponse.json()

        // Transform API data to match our interface
        const transformedCattle: Cattle[] = cattleData.data.map((cow: any) => ({
          id: cow._id.toString(),
          name: cow.name,
          description: cow.description || '',
          imageUrl: cow.imageUrl || '/placeholder.svg',
          position: cow.position,
          connected: cow.status === 'active',
          zoneId: cow.zoneId || null
        }))

        const transformedZones: Zone[] = zonesData.data.map((zone: any) => ({
          id: zone._id.toString(),
          name: zone.name,
          description: zone.description || '',
          bounds: zone.bounds,
          color: zone.color
        }))

        setCattle(transformedCattle)
        setZones(transformedZones)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos. Por favor, intente nuevamente.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up polling for real-time updates
    const pollInterval = setInterval(fetchData, 30000) // Poll every 30 seconds

    return () => clearInterval(pollInterval)
  }, [isAuthenticated, toast])

  // Simular movimiento de vacas solo si el usuario está autenticado
  useEffect(() => {
    if (loading || !isAuthenticated || zones.length === 0) return

    const movementInterval = setInterval(() => {
      setCattle((prevCattle) => {
        return prevCattle.map((cow) => {
          // Solo mover vacas conectadas
          if (!cow.connected) return cow

          // Obtener los límites de la granja (primera zona)
          const farmZone = zones[0]
          const [[minLat, minLng], [maxLat, maxLng]] = farmZone.bounds

          // Movimiento aleatorio pequeño
          const latChange = (Math.random() - 0.5) * 0.001
          const lngChange = (Math.random() - 0.5) * 0.001

          // Calcular nueva posición
          let newLat = cow.position[0] + latChange
          let newLng = cow.position[1] + lngChange

          // Verificar si la nueva posición estaría fuera de la granja
          const wouldBeOutside = newLat < minLat || newLat > maxLat || newLng < minLng || newLng > maxLng

          // Si estaría fuera, hay una pequeña probabilidad (0.5%) de permitirlo para simular escape
          // De lo contrario, ajustamos la posición para mantenerla dentro de los límites
          if (wouldBeOutside && Math.random() > 0.005) {
            // Ajustar la posición para mantenerla dentro de los límites
            newLat = Math.max(minLat, Math.min(maxLat, newLat))
            newLng = Math.max(minLng, Math.min(maxLng, newLng))
          }

          const newPosition: [number, number] = [newLat, newLng]

          // Determinar en qué zona está
          let newZoneId: string | null = null

          for (const zone of zones) {
            const [[zMinLat, zMinLng], [zMaxLat, zMaxLng]] = zone.bounds

            if (
              newPosition[0] >= zMinLat &&
              newPosition[0] <= zMaxLat &&
              newPosition[1] >= zMinLng &&
              newPosition[1] <= zMaxLng
            ) {
              newZoneId = zone.id
              break
            }
          }

          // Verificar si salió de la zona general (primera zona)
          const isOutside =
            newPosition[0] < minLat || newPosition[0] > maxLat || newPosition[1] < minLng || newPosition[1] > maxLng

          if (isOutside) {
            // Alerta: vaca fuera de la granja
            const audio = new Audio("/alert.mp3")
            audio.play().catch((e) => console.log("Error reproduciendo alerta:", e))

            // Usamos setTimeout para evitar actualizar el estado durante el renderizado
            setTimeout(() => {
              toast({
                title: "¡Alerta de seguridad!",
                description: `${cow.name} ha salido de los límites de la granja`,
                variant: "destructive",
              })
            }, 0)

            // Enviar notificación push si está permitido
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("¡Alerta de seguridad!", {
                body: `${cow.name} ha salido de los límites de la granja`,
                icon: "/cow-icon.png",
              })
            }
          }

          return {
            ...cow,
            position: newPosition,
            zoneId: newZoneId,
          }
        })
      })
    }, 2000)

    return () => clearInterval(movementInterval)
  }, [loading, zones, toast, isAuthenticated])

  // Simular desconexiones aleatorias solo si el usuario está autenticado
  useEffect(() => {
    if (loading || !isAuthenticated) return

    const disconnectionInterval = setInterval(() => {
      setCattle((prevCattle) => {
        return prevCattle.map((cow) => {
          // 10% de probabilidad de cambiar el estado de conexión
          if (Math.random() < 0.1) {
            return {
              ...cow,
              connected: !cow.connected,
            }
          }
          return cow
        })
      })
    }, 30000) // Cada 30 segundos

    return () => clearInterval(disconnectionInterval)
  }, [loading, isAuthenticated])

  // Calculate connected cattle count
  const connectedCattle = cattle.filter((cow) => cow.connected).length

  return (
    <CattleContext.Provider
      value={{
        cattle,
        zones,
        loading,
        connectedCattle,
        selectedCattleId,
        setSelectedCattleId,
        selectedZoneId,
        setSelectedZoneId,
      }}
    >
      {children}
    </CattleContext.Provider>
  )
}

export function useCattle() {
  const context = useContext(CattleContext)
  if (context === undefined) {
    throw new Error("useCattle must be used within a CattleProvider")
  }
  return context
}
