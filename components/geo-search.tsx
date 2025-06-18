"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import { useCattle, Cattle } from "@/lib/cattle-context"

interface GeoSearchProps {
  onClose: () => void
  onSearchResults: (results: Cattle[], center: [number, number], radius: number) => void
  mapClickMode: boolean
  setMapClickMode: (mode: boolean) => void
  onPointSelected?: (lat: number, lng: number) => void
}

export default function GeoSearch({
  onClose,
  onSearchResults,
  mapClickMode,
  setMapClickMode,
  onPointSelected
}: GeoSearchProps) {
  const { cattle } = useCattle()
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [radius, setRadius] = useState("500") // Default 500 meters
  const [results, setResults] = useState<Cattle[]>([])
  const [searching, setSearching] = useState(false)

  // Function to calculate distance between two points (haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3 // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }

  // Function to search cattle within radius
  const handleSearch = () => {
    if (!latitude || !longitude || !radius) return
    
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    const rad = parseFloat(radius)
    
    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) return
    
    setSearching(true)
    
    // Find cattle within radius
    const searchResults = cattle.filter(cow => {
      const distance = calculateDistance(
        lat, 
        lng, 
        cow.position[0], // cow latitude
        cow.position[1]  // cow longitude
      )
      return distance <= rad
    })
    
    setResults(searchResults)
    onSearchResults(searchResults, [lat, lng], rad)
  }

  // Reset search
  const clearSearch = () => {
    setResults([])
    setSearching(false)
    onSearchResults([], [0, 0], 0)
  }

  // This function will be called when a point is selected on the map
  useEffect(() => {
    if (onPointSelected) {
      onPointSelected = (lat: number, lng: number) => {
        if (mapClickMode) {
          setLatitude(lat.toFixed(6))
          setLongitude(lng.toFixed(6))
        }
      }
    }
  }, [mapClickMode, onPointSelected])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Buscar ganado por ubicación</h3>
        {searching && (
          <Button variant="outline" size="sm" onClick={clearSearch} className="text-xs">
            <X className="h-3 w-3 mr-1" /> Limpiar búsqueda
          </Button>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="map-click-mode" 
          checked={mapClickMode}
          onCheckedChange={setMapClickMode}
        />
        <Label htmlFor="map-click-mode">Seleccionar punto en el mapa</Label>
        {mapClickMode && (
          <Badge variant="outline" className="ml-2 text-xs">
            Haz clic en el mapa para elegir un punto
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="latitude">Latitud</Label>
          <Input
            id="latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="Ej: -34.9450"
            disabled={mapClickMode}
          />
        </div>
        <div>
          <Label htmlFor="longitude">Longitud</Label>
          <Input
            id="longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="Ej: -57.9720"
            disabled={mapClickMode}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="radius">Radio (metros)</Label>
        <Input
          id="radius"
          type="number"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          placeholder="Ej: 500"
        />
      </div>
      
      <Button 
        className="w-full" 
        onClick={handleSearch}
        disabled={!latitude || !longitude || !radius}
      >
        <Search className="h-4 w-4 mr-2" />
        Buscar ganado cercano
      </Button>
      
      {results.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Se encontraron {results.length} animales</h4>
          <div className="max-h-60 overflow-y-auto border rounded-md">
            {results.map(cow => (
              <div key={cow.id} className="p-2 border-b last:border-b-0 flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full mr-2 flex-shrink-0 overflow-hidden">
                  {cow.imageUrl && (
                    <img 
                      src={cow.imageUrl} 
                      alt={cow.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium">{cow.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {cow.zoneId ? "Zona: " + cow.zoneId : "Sin zona asignada"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}