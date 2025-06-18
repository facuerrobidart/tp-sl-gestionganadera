"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, ChevronLeft, ChevronRight, LogOut, Menu, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useCattle } from "@/lib/cattle-context"
import CattleMap from "@/components/cattle-map"
import CattleList from "@/components/cattle-list"
import ZonesList from "@/components/zones-list"
import { Badge } from "./ui/badge"

interface DashboardProps {
  user: {
    name: string
    email: string
  }
}

export default function Dashboard({ user }: DashboardProps) {
  const { logout } = useAuth()
  const { toast } = useToast()
  const { cattle, zones, loading, connectedCattle, setSelectedCattleId } = useCattle()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCattleListCollapsed, setIsCattleListCollapsed] = useState(false)

  // Estado para la búsqueda geoespacial
  const [mapClickMode, setMapClickMode] = useState(false)
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [searchRadius, setSearchRadius] = useState("")
  const [searchResults, setSearchResults] = useState<typeof cattle>([])
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)

  const isSearchFormValid = 
    (latitude !== "" && !isNaN(Number(latitude))) && 
    (longitude !== "" && !isNaN(Number(longitude))) && 
    (searchRadius !== "" && !isNaN(Number(searchRadius)) && Number(searchRadius) > 0)

  // Función para manejar clics en el mapa con precisión
  const handleMapClick = (lat: number, lng: number) => {
    console.log("Coordenadas exactas recibidas:", lat, lng)
    
    // Guardamos las coordenadas exactas sin redondear para mantener la precisión
    setLatitude(String(lat))
    setLongitude(String(lng))
    
    // Para la UI, podemos mostrar valores redondeados
    toast({
      title: "Ubicación seleccionada",
      description: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
    })
  }

  // Función para realizar la búsqueda
  const performSearch = async () => {
    if (!isSearchFormValid) return
    
    try {
      setSearchLoading(true)
      
      // Convertir valores a números
      const lat = Number(latitude)
      const lng = Number(longitude)
      const radius = Number(searchRadius)
      
      // Realizar solicitud de búsqueda a la API
      const response = await fetch('/api/cattle/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          radius: radius
        }),
      })
      
      if (!response.ok) throw new Error('Error al realizar la búsqueda')
      
      const data = await response.json()
      
      // Transformar resultados si es necesario para que coincidan con el formato de cattle
      const results = data.data.map((cow: any) => ({
        id: cow._id.toString(),
        name: cow.name,
        description: cow.description || "",
        imageUrl: cow.imageUrl || "/placeholder.svg",
        position: [cow.position.coordinates[1], cow.position.coordinates[0]],
        connected: cow.connected,
        zoneId: cow.zoneId || null,
      }))
      
      setSearchResults(results)
      setIsSearchActive(true)
      
      toast({
        title: `${results.length} ${results.length === 1 ? "resultado" : "resultados"} encontrados`,
        description: `Búsqueda en radio de ${radius}km completada`,
      })
      
    } catch (error) {
      console.error('Error en búsqueda:', error)
      toast({
        title: "Error en la búsqueda",
        description: "No se pudo completar la búsqueda. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setSearchLoading(false)
    }
  }

  // Función para limpiar la búsqueda
  const clearSearch = () => {
    setIsSearchActive(false)
    setSearchResults([])
    if (!mapClickMode) {
      setLatitude("")
      setLongitude("")
      setSearchRadius("")
    }
  }

  useEffect(() => {
    // Solicitar permiso para notificaciones
    if ("Notification" in window) {
      Notification.requestPermission()
    }
  }, [])

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar para pantallas grandes */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white border-r p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-green-800">GanaTech</h1>
        </div>

        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start" disabled>
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/users">
              <Users className="mr-2 h-4 w-4" />
              Usuarios
            </Link>
          </Button>
        </div>

        <Separator className="my-4" />

        <div className="flex-1 overflow-auto">
          <h2 className="text-sm font-semibold mb-2 text-gray-500">ZONAS</h2>
          <ZonesList />
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-semibold">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b h-16 flex items-center px-4 justify-between">
          <div className="flex items-center md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4">
                    <h1 className="text-xl font-bold text-green-800">GanaTech</h1>
                  </div>

                  <Separator />

                  <div className="p-4 space-y-1">
                    <Button variant="ghost" className="w-full justify-start" disabled>
                      Dashboard
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/users" onClick={() => setIsMobileMenuOpen(false)}>
                        <Users className="mr-2 h-4 w-4" />
                        Usuarios
                      </Link>
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex-1 overflow-auto p-4">
                    <h2 className="text-sm font-semibold mb-2 text-gray-500">ZONAS</h2>
                    <ZonesList onItemClick={() => setIsMobileMenuOpen(false)} />
                  </div>

                  <div className="p-4 mt-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesión
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-bold text-green-800 ml-2">GanaTech</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notificaciones</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Panel izquierdo con lista de vacas (collapsible) */}
          <div
            className={`bg-white border-r overflow-y-auto transition-all duration-300 ${
              isCattleListCollapsed ? "md:w-0 w-0 opacity-0 invisible" : "md:w-80 w-full opacity-100 visible"
            }`}
          >
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Ganado</h2>
              <CattleList />
            </div>
          </div>

          {/* Botón para colapsar/expandir la lista de vacas */}
          <button
            className="hidden md:flex items-center justify-center w-6 bg-white border-r border-l hover:bg-gray-100 transition-colors"
            onClick={() => setIsCattleListCollapsed(!isCattleListCollapsed)}
            aria-label={isCattleListCollapsed ? "Expandir lista" : "Colapsar lista"}
          >
            {isCattleListCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {/* Panel derecho con mapa y estadísticas */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Botón para mostrar/ocultar lista en móvil */}
            <div className="md:hidden mb-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsCattleListCollapsed(!isCattleListCollapsed)}
              >
                {isCattleListCollapsed ? "Mostrar lista de ganado" : "Ocultar lista de ganado"}
              </Button>
            </div>

            {/* Nueva sección de búsqueda geoespacial */}
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex justify-between items-center">
                  <span>Buscar por ubicación</span>
                  {isSearchActive && (
                    <Button variant="ghost" size="sm" onClick={clearSearch} className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Limpiar búsqueda</span>
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Switch
                      id="map-click-mode"
                      checked={mapClickMode}
                      onCheckedChange={setMapClickMode}
                    />
                    <Label htmlFor="map-click-mode" className="ml-2">
                      Seleccionar punto en el mapa
                    </Label>
                    {mapClickMode && (
                      <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                        Haga clic en el mapa para seleccionar un punto
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="latitude">Latitud</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        placeholder="-34.9450"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        disabled={mapClickMode}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="longitude">Longitud</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        placeholder="-57.9720"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        disabled={mapClickMode}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="radius">Radio (km)</Label>
                      <Input
                        id="radius"
                        type="number"
                        step="any"
                        placeholder="1"
                        value={searchRadius}
                        onChange={(e) => setSearchRadius(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={performSearch}
                    disabled={!isSearchFormValid}
                    className="w-full"
                  >
                    {searchLoading ? <span className="animate-pulse">Buscando...</span> : "Buscar"}
                  </Button>

                  {isSearchActive && searchResults.length > 0 && (
                    <div className="mt-2">
                      <h3 className="text-sm font-medium mb-2">
                        {searchResults.length} {searchResults.length === 1 ? "resultado" : "resultados"} encontrados
                      </h3>
                      <div className="max-h-28 overflow-y-auto border rounded-md p-2">
                        <ul className="space-y-1">
                          {searchResults.map((cow) => (
                            <li key={cow.id} className="text-xs flex justify-between">
                              <span>{cow.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 px-2 py-0"
                                onClick={() => setSelectedCattleId(cow.id)}
                              >
                                Ver
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Ganado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cattle.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Conectados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{connectedCattle}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Zonas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{zones.length}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="overflow-hidden h-[calc(100%-7rem)]">
              <CardHeader className="pb-2">
                <CardTitle>Mapa de Ganado</CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <div className="h-full w-full">
                  <CattleMap 
                    mapClickMode={mapClickMode}
                    onMapClick={handleMapClick}
                    searchResults={isSearchActive ? searchResults : undefined}
                    searchCenter={isSearchActive ? [Number(latitude), Number(longitude)] as [number, number] : null}
                    searchRadius={isSearchActive ? Number(searchRadius) * 1000 : null} // Convertir a metros
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
