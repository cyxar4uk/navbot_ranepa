import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useEvent } from '../../context/EventContext'
import api from '../../services/api'
import Loading from '../common/Loading'
import ErrorMessage from '../common/ErrorMessage'
import EmptyState from '../common/EmptyState'
import type { MapData, Location } from '../../types'
import { MapPin, ChevronUp, ChevronDown, X } from 'lucide-react'

export default function MapView() {
  const { event } = useEvent()
  const [searchParams] = useSearchParams()
  const locationParam = searchParams.get('location')
  
  const [mapData, setMapData] = useState<MapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<number>(1)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  useEffect(() => {
    if (event) {
      loadMapData()
    }
  }, [event])

  const loadMapData = async () => {
    if (!event) return
    
    try {
      setLoading(true)
      const data = await api.getMapData(event.id)
      setMapData(data)
      
      // Set initial floor
      const floors = [...new Set(data.locations.map(l => l.floor).filter(Boolean))]
      if (floors.length > 0) {
        setSelectedFloor(Math.min(...floors as number[]))
      }

      if (locationParam) {
        const target = data.locations.find(location => location.id === locationParam)
        if (target) {
          if (target.floor) {
            setSelectedFloor(target.floor)
          }
          setSelectedLocation(target)
        }
      }
    } catch (err) {
      console.error('Failed to load map data:', err)
      setError('Не удалось загрузить карту')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading text="Загрузка карты..." fullScreen />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadMapData} />
  }

  if (!mapData || mapData.locations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <EmptyState
          icon={<MapPin className="w-12 h-12" />}
          title="Карта не настроена"
          description="Карта мероприятия пока не добавлена"
        />
      </div>
    )
  }

  const floors = [...new Set(mapData.locations.map(l => l.floor).filter(Boolean))].sort() as number[]
  const currentFloorLocations = mapData.locations.filter(l => l.floor === selectedFloor)

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white px-4 pt-6 pb-8">
        <h1 className="text-xl font-bold">Карта</h1>
        <p className="mt-1 text-primary-200 text-sm">
          Навигация по Академии
        </p>
      </div>

      {/* Map placeholder */}
      <div className="relative px-4 -mt-4">
        <div className="bg-white rounded-xl shadow-lg p-4 min-h-[300px] relative">
          {/* Floor selector */}
          {floors.length > 1 && (
            <div className="absolute right-4 top-4 flex flex-col gap-1 z-10">
              <button
                onClick={() => setSelectedFloor(f => Math.min(f + 1, Math.max(...floors)))}
                disabled={selectedFloor === Math.max(...floors)}
                className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center disabled:opacity-50"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-lg bg-primary-500 text-white flex items-center justify-center font-medium">
                {selectedFloor}
              </div>
              <button
                onClick={() => setSelectedFloor(f => Math.max(f - 1, Math.min(...floors)))}
                disabled={selectedFloor === Math.min(...floors)}
                className="w-10 h-10 rounded-lg bg-white shadow flex items-center justify-center disabled:opacity-50"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Map area - placeholder for actual map */}
          <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto tg-hint mb-2" />
              <p className="tg-hint text-sm">Этаж {selectedFloor}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Locations list */}
      <div className="px-4 mt-6">
        <h2 className="font-medium tg-text mb-3">
          Локации на {selectedFloor} этаже
        </h2>
        <div className="space-y-2">
          {currentFloorLocations.map(location => (
            <button
              key={location.id}
              onClick={() => setSelectedLocation(location)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <div className="min-w-0">
                <div className="font-medium tg-text truncate">{location.name}</div>
                {location.description && (
                  <div className="text-sm tg-hint truncate">{location.description}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Location detail modal */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white rounded-t-2xl p-4 animate-slideUp safe-area-bottom">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-medium tg-text text-lg">{selectedLocation.name}</h3>
                {selectedLocation.floor && (
                  <p className="text-sm tg-hint">Этаж {selectedLocation.floor}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {selectedLocation.description && (
              <p className="tg-hint text-sm mb-4">{selectedLocation.description}</p>
            )}
            <button
              onClick={() => setSelectedLocation(null)}
              className="w-full py-3 rounded-xl tg-button font-medium"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
