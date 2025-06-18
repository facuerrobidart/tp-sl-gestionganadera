"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMap, useMapEvents, Circle } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useCattle, type Cattle } from "@/lib/cattle-context"

// Icono personalizado para las vacas
const cowIcon = new L.Icon({
  iconUrl: "/cow-icon.jpg",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
})

// Icono para los resultados de búsqueda
const searchResultIcon = new L.Icon({
  iconUrl: "/cow-icon.jpg",
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
  className: "search-result-icon", // We'll add a CSS class for styling
})

// Componente para actualizar la vista del mapa y manejar eventos
function MapUpdater({ 
  cattle, 
  selectedCattleId,
  searchCenter,
  searchRadius,
  mapClickMode,
  onMapClick
}: { 
  cattle: Cattle[]; 
  selectedCattleId: string | null;
  searchCenter?: [number, number] | null;
  searchRadius?: number | null;
  mapClickMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}) {
  const map = useMap()
  const [isDragging, setIsDragging] = useState(false)
  
  // Efecto visual para mostrar que el modo de clic está activo
  useEffect(() => {
    if (mapClickMode) {
      map.getContainer().style.cursor = 'crosshair'
    } else {
      map.getContainer().style.cursor = ''
    }
  }, [map, mapClickMode])

  // Usa useMapEvents para manejar eventos de mapa de manera más precisa
  useMapEvents({
    // Detectar inicio de arrastre
    dragstart: () => {
      setIsDragging(true)
    },
    // Detectar fin de arrastre
    dragend: () => {
      setTimeout(() => {
        setIsDragging(false)
      }, 50) // Pequeño delay para evitar que un final de arrastre se registre como clic
    },
    // Manejar clics solo si no estamos arrastrando
    click: (e) => {
      if (!isDragging && mapClickMode && onMapClick) {
        console.log("Mapa clickeado en:", e.latlng.lat, e.latlng.lng)
        onMapClick(e.latlng.lat, e.latlng.lng)
      }
    }
  })

  useEffect(() => {
    if (selectedCattleId) {
      const selectedCow = cattle.find((cow) => cow.id === selectedCattleId)
      if (selectedCow) {
        map.setView(selectedCow.position, 16)
      }
    }

    // Si hay centro de búsqueda, ajustar el mapa para mostrar el círculo completo
    if (searchCenter && searchRadius) {
      const bounds = L.latLng(searchCenter).toBounds(searchRadius * 2)
      map.fitBounds(bounds)
    }

    setTimeout(() => {
      map.invalidateSize()
    }, 300)
  }, [map, cattle, selectedCattleId, searchCenter, searchRadius])

  return null
}

interface CattleMapProps {
  mapClickMode?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  searchResults?: Cattle[];
  searchCenter?: [number, number] | null;
  searchRadius?: number | null;
}

export default function CattleMap({ 
  mapClickMode = false,
  onMapClick,
  searchResults = [],
  searchCenter = null,
  searchRadius = null
}: CattleMapProps) {
  const { cattle, zones, selectedCattleId, setSelectedCattleId, selectedZoneId } = useCattle()
  const [mapReady, setMapReady] = useState(false)

  // Create a set of search result IDs for efficient lookup
  const searchResultIds = searchResults ? new Set(searchResults.map(cow => cow.id)) : new Set()

  // Asegurarse de que el componente de mapa se cargue solo en el cliente
  useEffect(() => {
    setMapReady(true)
  }, [])

  if (!mapReady) {
    return <div className="h-full flex items-center justify-center">Cargando mapa...</div>
  }

  return (
    <MapContainer
      center={[-34.9450, -57.9720]} // Coordenadas iniciales (from init-mongo.js)
      zoom={14}
      style={{ height: "100%", width: "100%" }}
      className="z-0" // Asegurar que el mapa tenga un z-index bajo
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Renderizar zonas */}
      {zones.map((zone) => (
        <Rectangle
          key={zone.id}
          bounds={zone.bounds as L.LatLngBoundsExpression}
          pathOptions={{
            color: zone.color,
            weight: 2,
            fillOpacity: selectedZoneId === zone.id ? 0.3 : 0.1,
          }}
        >
          <Popup>
            <div>
              <h3 className="font-semibold">{zone.name}</h3>
              <p>{zone.description}</p>
            </div>
          </Popup>
        </Rectangle>
      ))}

      {/* Renderizar vacas */}
      {cattle.map((cow) => {
        // Check if this cow is in the search results
        const isSearchResult = searchResultIds.has(cow.id)
        
        return (
          <Marker
            key={cow.id}
            position={cow.position}
            icon={isSearchResult ? searchResultIcon : cowIcon}
            opacity={cow.connected ? 1 : 0.5}
            eventHandlers={{
              click: () => {
                setSelectedCattleId(cow.id)
              },
            }}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold">{cow.name}</h3>
                <div className="my-2">
                  <img
                    src={cow.imageUrl || "/placeholder.svg"}
                    alt={cow.name}
                    className="w-16 h-16 mx-auto rounded-full object-cover"
                  />
                </div>
                <p className="text-sm">{cow.description}</p>
                <p className="text-xs mt-2">
                  Estado:{" "}
                  {cow.connected ? (
                    <span className="text-green-600 font-semibold">Conectada</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Desconectada</span>
                  )}
                </p>
                {cow.zoneId && (
                  <p className="text-xs">Zona: {zones.find((z) => z.id === cow.zoneId)?.name || "Desconocida"}</p>
                )}
                {isSearchResult && (
                  <p className="text-xs mt-1 bg-yellow-50 text-yellow-700 p-1 rounded">
                    Encontrado en búsqueda
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}

      {/* Render search circle when search is active */}
      {searchCenter && searchRadius && (
        <Circle
          center={searchCenter}
          radius={searchRadius}
          pathOptions={{
            color: '#ff3b30',
            fillColor: '#ff3b3022',
            fillOpacity: 0.3,
            weight: 2,
            dashArray: '5, 5', // Añadimos un patrón de línea discontinua para mejor visibilidad
          }}
        >
          {/* Opcionalmente añadir un marcador en el centro para mejor visibilidad */}
          <Marker 
            position={searchCenter} 
            icon={new L.DivIcon({
              className: 'search-center-marker',
              html: '<div style="width: 10px; height: 10px; border-radius: 50%; background-color: #ff3b30; border: 2px solid white;"></div>',
              iconSize: [10, 10],
              iconAnchor: [5, 5]
            })}
          />
        </Circle>
      )}

      <MapUpdater 
        cattle={cattle} 
        selectedCattleId={selectedCattleId}
        searchCenter={searchCenter}
        searchRadius={searchRadius}
        mapClickMode={mapClickMode}
        onMapClick={onMapClick}
      />
    </MapContainer>
  )
}