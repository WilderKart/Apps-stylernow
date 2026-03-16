'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

// Dynamically import Leaflet to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-zinc-100 rounded-2xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-zinc-300 border-t-black rounded-full animate-spin" />
        <p className="text-xs text-zinc-500">Cargando mapa...</p>
      </div>
    </div>
  ),
})

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void
  initialLat?: number
  initialLng?: number
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [position, setPosition] = useState<[number, number]>(
    initialLat && initialLng ? [initialLat, initialLng] : [4.7109886, -74.0721372] // Bogotá default
  )

  const searchAddress = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery + ', Colombia')}&format=json&limit=1&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      )
      const data = await res.json()
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)]
        setPosition(newPos)
        onLocationSelect(newPos[0], newPos[1], display_name)
      }
    } catch (e) {
      console.error('Geocoding error:', e)
    } finally {
      setIsSearching(false)
    }
  }

  const handleMapClick = async (lat: number, lng: number) => {
    setPosition([lat, lng])
    // Reverse geocode
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'es' } }
      )
      const data = await res.json()
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      onLocationSelect(lat, lng, address)
      setSearchQuery(data.address?.road ? `${data.address.road}${data.address.house_number ? ' ' + data.address.house_number : ''}` : address)
    } catch (e) {
      onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && searchAddress()}
          placeholder="Ej: Calle 127 #13-60, Bogotá"
          className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="button"
          onClick={searchAddress}
          disabled={isSearching}
          className="px-4 py-3 bg-black text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-zinc-800 transition-colors whitespace-nowrap"
        >
          {isSearching ? '...' : '📍 Buscar'}
        </button>
      </div>
      <MapComponent position={position} onMapClick={handleMapClick} />
      <p className="text-xs text-zinc-400 text-center">
        📍 Haz clic en el mapa o busca la dirección para ubicar tu barbería con precisión
      </p>
    </div>
  )
}
