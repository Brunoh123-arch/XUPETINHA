'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface Step {
  instruction: string
  distance: string
  maneuver: string
  distanceMeters: number
}

interface RouteInfo {
  steps: Step[]
  totalDistance: string
  totalDuration: string
  totalDurationSeconds: number
}

interface DriverTurnByTurnProps {
  origin: { lat: number; lng: number } | null
  destination: { lat: number; lng: number } | null
  destinationLabel: string
  active: boolean
  className?: string
}

// Strip HTML tags from Google Directions instruction
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

// Map Google maneuver strings to arrow directions
function ManeuverIcon({ maneuver }: { maneuver: string }) {
  const iconClass = 'w-8 h-8 text-white'

  if (maneuver.includes('turn-left') || maneuver === 'roundabout-left') {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
      </svg>
    )
  }
  if (maneuver.includes('turn-right') || maneuver === 'roundabout-right') {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
      </svg>
    )
  }
  if (maneuver.includes('uturn')) {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 14l-4-4 4-4" />
        <path d="M5 10h11a4 4 0 010 8h-1" />
      </svg>
    )
  }
  if (maneuver === 'merge' || maneuver.includes('ramp') || maneuver.includes('fork')) {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12l7-7 7 7" />
      </svg>
    )
  }
  if (maneuver === 'arrived') {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    )
  }
  // Default: straight arrow
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}

export function DriverTurnByTurn({
  origin,
  destination,
  destinationLabel,
  active,
  className,
}: DriverTurnByTurnProps) {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const prevOriginRef = useRef<{ lat: number; lng: number } | null>(null)
  const fetchTimerRef = useRef<NodeJS.Timeout | null>(null)

  const fetchRoute = useCallback(async (orig: { lat: number; lng: number }, dest: { lat: number; lng: number }) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return

    setLoading(true)
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${orig.lat},${orig.lng}&destination=${dest.lat},${dest.lng}&mode=driving&language=pt-BR&key=${apiKey}`
      const res = await fetch(url)
      const data = await res.json()

      if (data.status === 'OK' && data.routes?.[0]) {
        const route = data.routes[0]
        const leg = route.legs[0]

        const steps: Step[] = leg.steps.map((s: any) => ({
          instruction: stripHtml(s.html_instructions),
          distance: s.distance.text,
          distanceMeters: s.distance.value,
          maneuver: s.maneuver || 'straight',
        }))

        setRouteInfo({
          steps,
          totalDistance: leg.distance.text,
          totalDuration: leg.duration.text,
          totalDurationSeconds: leg.duration.value,
        })
        setCurrentStepIdx(0)
      }
    } catch (err) {
      // silently fail — mapa ainda funciona
    } finally {
      setLoading(false)
    }
  }, [])

  // Re-fetch route when origin changes significantly (> ~200m) or destination changes
  useEffect(() => {
    if (!active || !origin || !destination) return

    const prev = prevOriginRef.current
    let shouldFetch = !prev || !routeInfo

    if (prev) {
      // Only re-fetch if driver moved > ~200m (avoid spamming API)
      const R = 6371000
      const dLat = ((origin.lat - prev.lat) * Math.PI) / 180
      const dLng = ((origin.lng - prev.lng) * Math.PI) / 180
      const a = Math.sin(dLat / 2) ** 2 + Math.cos((prev.lat * Math.PI) / 180) * Math.cos((origin.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
      const distMoved = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      if (distMoved > 200) shouldFetch = true
    }

    if (!shouldFetch) return

    prevOriginRef.current = origin

    // Debounce
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current)
    fetchTimerRef.current = setTimeout(() => {
      fetchRoute(origin, destination)
    }, 500)

    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current)
    }
  }, [active, origin, destination, fetchRoute, routeInfo])

  // Advance step as driver gets close to next maneuver (< 30m)
  useEffect(() => {
    if (!routeInfo || !origin) return
    const steps = routeInfo.steps
    if (currentStepIdx >= steps.length - 1) return

    const nextStep = steps[currentStepIdx]
    if (nextStep.distanceMeters <= 30) {
      setCurrentStepIdx(i => Math.min(i + 1, steps.length - 1))
    }
  }, [origin, routeInfo, currentStepIdx])

  if (!active || !origin || !destination) return null

  const currentStep = routeInfo?.steps[currentStepIdx]
  const isLastStep = routeInfo && currentStepIdx >= routeInfo.steps.length - 1

  return (
    <div className={cn('pointer-events-none', className)}>
      {/* Turn instruction banner */}
      <div className="pointer-events-auto mx-4 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10">

          {loading && !routeInfo ? (
            // Loading state
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              </div>
              <div className="flex-1">
                <div className="h-3.5 bg-white/20 rounded-full w-32 mb-1.5 animate-pulse" />
                <div className="h-2.5 bg-white/10 rounded-full w-20 animate-pulse" />
              </div>
            </div>
          ) : currentStep ? (
            <div className="flex items-center gap-3 px-4 py-3.5">
              {/* Maneuver icon */}
              <div className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
                isLastStep ? 'bg-orange-500' : 'bg-[#4285F4]'
              )}>
                <ManeuverIcon maneuver={isLastStep ? 'arrived' : currentStep.maneuver} />
              </div>

              {/* Instruction */}
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-white leading-tight line-clamp-2">
                  {isLastStep ? `Chegando em ${destinationLabel}` : currentStep.instruction}
                </p>
                <p className="text-[12px] text-white/60 mt-0.5">
                  {isLastStep ? routeInfo?.totalDistance : `em ${currentStep.distance}`}
                </p>
              </div>

              {/* ETA */}
              {routeInfo && (
                <div className="shrink-0 text-right">
                  <p className="text-[18px] font-extrabold text-white leading-none">{routeInfo.totalDuration}</p>
                  <p className="text-[10px] text-white/50 mt-0.5">{routeInfo.totalDistance}</p>
                </div>
              )}
            </div>
          ) : null}

          {/* Steps mini progress bar */}
          {routeInfo && routeInfo.steps.length > 1 && (
            <div className="px-4 pb-3 flex gap-1">
              {routeInfo.steps.slice(0, Math.min(routeInfo.steps.length, 8)).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1 rounded-full flex-1 transition-all duration-300',
                    i < currentStepIdx
                      ? 'bg-[#4285F4]'
                      : i === currentStepIdx
                      ? 'bg-white'
                      : 'bg-white/20'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
