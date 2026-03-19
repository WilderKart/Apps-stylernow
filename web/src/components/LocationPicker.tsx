'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'

// Dynamically import Leaflet to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-zinc-100 rounded-2xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-6 h-6 text-zinc-400 opacity-70 animate-spin" />
        <p className="text-xs text-zinc-500">Cargando mapa...</p>
      </div>
    </div>
  ),
})

interface AddressDetails {
  city?: string
  town?: string
  village?: string
  state?: string
  country?: string
  street?: string
  house_number?: string
}

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string, details?: AddressDetails) => void
  initialLat?: number
  initialLng?: number
  currentCity?: string
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] }
  properties: {
    name?: string
    street?: string
    housenumber?: string
    city?: string
    state?: string
    country?: string
    type?: string
  }
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng, currentCity }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [position, setPosition] = useState<[number, number]>(
    initialLat && initialLng ? [initialLat, initialLng] : [4.7109886, -74.0721372] // Bogotá default
  )

  // Autocentrar mapa cuando cambian las coordenadas iniciales (ej. al seleccionar ciudad)
  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng])
    }
  }, [initialLat, initialLng])

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debounce para Photon API
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSuggestions([])
      setIsOpen(false)
      setActiveIndex(-1)
      return
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true)
      try {
        let query = searchQuery.trim()
        
        // Remover símbolos que confunden a Photon (#, -)
        query = query.replace(/[#-]/g, ' ')
        
        // Expandir abreviaciones comunes en Colombia
        query = query
          .replace(/\bcra\b/i, 'Carrera')
          .replace(/\bcl\b/i, 'Calle')
          .replace(/\bav\b/i, 'Avenida')
          .replace(/\bautop\b/i, 'Autopista')
          .replace(/\bdg\b/i, 'Diagonal')
          .replace(/\btv\b/i, 'Transversal')

        // Colapsar espacios múltiples
        query = query.replace(/\s+/g, ' ').trim()

        const fullQuery = currentCity ? `${query}, ${currentCity}` : query

        // Crear búsquedas en paralelo: la query completa y solo la calle
        const queriesToFetch = [fullQuery]
        const tokens = query.split(' ')
        if (tokens.length > 3 && currentCity) {
          const fallbackQuery = `${tokens.slice(0, 3).join(' ')}, ${currentCity}`
          queriesToFetch.push(fallbackQuery)
        }

        const fetchPromises = queriesToFetch.map(q => 
          fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5`)
            .then(r => r.json())
            .catch(() => ({ features: [] }))
        )
        const results = await Promise.all(fetchPromises)

        // Combinar resultados y deduplicar
        let allFeatures: any[] = []
        results.forEach(res => {
          if (res && res.features) {
            allFeatures = [...allFeatures, ...res.features]
          }
        })

        if (allFeatures.length > 0) {
          // Deduplicar: mantener el primer elemento por osm_id o nombre
          const uniqueFeatures = Array.from(
            new Map(allFeatures.map(f => [f.properties.osm_id || f.properties.name, f])).values()
          )
          setSuggestions(uniqueFeatures.slice(0, 5))
          setIsOpen(true)
        } else {
          setSuggestions([])
          setIsOpen(true)
        }
      } catch (e) {
        console.error('Photon search error:', e)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Formatear dirección limpia sin comas raras
  const formatAddressString = (p: PhotonFeature['properties']) => {
    const parts = [
      p.name || p.street,
      p.housenumber ? `#${p.housenumber}` : null,
      p.city,
      p.state,
    ].filter(Boolean)
    return parts.join(', ')
  }

  const handleSelect = (s: PhotonFeature) => {
    const [lng, lat] = s.geometry.coordinates
    const cleanAddress = formatAddressString(s.properties)
    setSearchQuery(cleanAddress)
    setSuggestions([])
    setIsOpen(false)
    setActiveIndex(-1)
    setPosition([lat, lng])
    onLocationSelect(lat, lng, cleanAddress, {
      city: s.properties.city,
      state: s.properties.state,
      country: s.properties.country,
      street: s.properties.street,
      house_number: s.properties.housenumber
    })
  }

  const handleMapChange = async (lat: number, lng: number) => {
    setPosition([lat, lng])
    try {
      // Usar Nominatim reversa para extraer detalles correctos al mover el PIN
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      )
      const data = await res.json()
      const display_name = data.display_name?.replace(/,\s*,/g, ',') || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      onLocationSelect(lat, lng, display_name, data.address)
      setSearchQuery(data.address?.road ? `${data.address.road}${data.address.house_number ? ' ' + data.address.house_number : ''}` : display_name)
    } catch (e) {
      onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelect(suggestions[activeIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div className="flex flex-col gap-3 relative" ref={dropdownRef}>
      <div className="relative flex items-center">
        <div className="absolute left-4 text-zinc-400">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-black" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value)
            if (e.target.value.trim().length === 0) setIsOpen(false)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ej: Calle 127 #13-60, Bogotá"
          className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black placeholder-zinc-400 font-medium transition-all"
        />
        
        {/* Dropdown de Sugerencias Photon */}
        {isOpen && (
          <div className="absolute top-14 left-0 right-0 bg-white border border-zinc-100 shadow-xl rounded-xl overflow-hidden z-[9999] max-h-60 overflow-y-auto animate-in fade-in duration-200">
            {suggestions.length > 0 ? (
              suggestions.map((s, index) => {
                const mainText = s.properties.name || s.properties.street || 'Result'
                const subText = [s.properties.city, s.properties.state, s.properties.country].filter(Boolean).join(', ')
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelect(s)}
                    className={`w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-none ${
                      index === activeIndex ? 'bg-zinc-50 border-l-2 border-l-black' : ''
                    }`}
                  >
                    <div className="mt-0.5 text-zinc-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-sm font-semibold text-black truncate">
                        {mainText}
                      </p>
                      {subText && (
                        <p className="text-xs text-zinc-400 truncate">
                          {subText}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="px-4 py-8 text-center text-zinc-500 flex flex-col items-center gap-1">
                <p className="text-sm font-semibold">No se encontraron lugares</p>
                <p className="text-xs text-zinc-400">Intenta escribir una dirección más precisa.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative group">
        <MapComponent position={position} onMapClick={handleMapChange} />
        <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-black/5" />
      </div>
      
      <p className="text-xs text-zinc-400 text-center flex items-center justify-center gap-1">
        <MapPin className="w-3 h-3" /> Arrastra el pin para mayor precisión
      </p>
    </div>
  )
}
