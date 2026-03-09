'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BottomNavigation } from '@/components/bottom-navigation'
import { iosToast } from '@/lib/utils/ios-toast'

interface IntercityRide {
  id: string
  origin_city: string
  dest_city: string
  departure_time: string
  available_seats: number
  booked_seats: number
  price_per_seat: number
  status: string
  driver?: { full_name: string; avatar_url: string | null; rating: number } | null
}

export default function CidadeACidadePage() {
  const router = useRouter()
  const supabase = createClient()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [availableRides, setAvailableRides] = useState<IntercityRide[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!origin.trim() || !destination.trim()) {
      iosToast.error('Informe origem e destino')
      return
    }
    setSearching(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/v1/intercity?origin=${encodeURIComponent(origin)}&dest=${encodeURIComponent(destination)}`)
      const data = await res.json()
      setAvailableRides(data.rides || [])
    } catch {
      iosToast.error('Erro ao buscar viagens')
    } finally {
      setSearching(false)
    }
  }

  const handleBook = async (rideId: string) => {
    try {
      const res = await fetch('/api/v1/intercity/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ride_id: rideId, seats: 1 }),
      })
      const data = await res.json()
      if (data.success) {
        iosToast.success(`Reserva confirmada! Total: R$ ${data.total_price.toFixed(2)}`)
        handleSearch() // reload
      } else {
        iosToast.error(data.error || 'Erro ao reservar')
      }
    } catch {
      iosToast.error('Erro ao reservar')
    }
  }

  const popularRoutes = [
    { from: 'Sao Paulo', to: 'Campinas', distance: '99 km', time: '~1h30', price: 'R$ 120-180' },
    { from: 'Sao Paulo', to: 'Santos', distance: '72 km', time: '~1h10', price: 'R$ 90-140' },
    { from: 'Sao Paulo', to: 'Sorocaba', distance: '100 km', time: '~1h30', price: 'R$ 110-170' },
    { from: 'Rio de Janeiro', to: 'Niteroi', distance: '25 km', time: '~40min', price: 'R$ 50-80' },
  ]

  const benefits = [
    { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Preco negociavel', desc: 'Voce define quanto quer pagar' },
    { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', title: 'Porta a porta', desc: 'Buscamos e levamos voce' },
    { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Horario flexivel', desc: 'Escolha quando quer viajar' },
  ]

  return (
    <div className="h-dvh overflow-y-auto bg-neutral-50 pb-24 ios-scroll">
      {/* Header */}
      <header className="bg-white/95 ios-blur border-b border-neutral-200/60 sticky top-0 z-30">
        <div className="px-5 pt-safe-offset-4 pb-3">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full ios-press">
              <svg className="w-[22px] h-[22px] text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-[20px] font-bold text-neutral-900 tracking-tight">Cidade a Cidade</h1>
          </div>
        </div>
      </header>

      <main className="px-5 py-5 max-w-2xl mx-auto space-y-6 animate-ios-fade-up">
        {/* Hero */}
        <div className="ios-card-elevated p-6">
          <h2 className="text-[24px] font-bold text-neutral-900 tracking-tight mb-1">Viaje entre cidades</h2>
          <p className="text-[15px] text-neutral-500 mb-5">Com conforto e preco justo</p>

          {/* Route Inputs */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />
              <input
                type="text"
                placeholder="Cidade de origem"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="flex-1 h-[48px] px-4 bg-neutral-100/80 rounded-[14px] text-[17px] text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-blue-500/30 ios-smooth"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0" />
              <input
                type="text"
                placeholder="Cidade de destino"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="flex-1 h-[48px] px-4 bg-neutral-100/80 rounded-[14px] text-[17px] text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-blue-500/30 ios-smooth"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="w-full h-[52px] rounded-[16px] bg-blue-500 text-white font-semibold text-[17px] mt-5 ios-press shadow-[0_4px_16px_rgba(59,130,246,0.3)] disabled:opacity-50"
          >
            {searching ? 'Buscando...' : 'Buscar motoristas'}
          </button>
        </div>

        {/* Benefits */}
        <div>
          <p className="ios-section-header">Vantagens</p>
          <div className="grid grid-cols-3 gap-3 stagger-children">
            {benefits.map((b, i) => (
              <div key={i} className="ios-card p-4 text-center">
                <div className="w-11 h-11 bg-blue-50 rounded-[14px] flex items-center justify-center mx-auto mb-2.5">
                  <svg className="w-[22px] h-[22px] text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={b.icon} />
                  </svg>
                </div>
                <p className="text-[13px] font-semibold text-neutral-900 mb-0.5">{b.title}</p>
                <p className="text-[11px] text-neutral-500 leading-snug">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {searched && (
          <div>
            <p className="ios-section-header">
              {availableRides.length > 0 ? `${availableRides.length} viagem(ns) encontrada(s)` : 'Nenhuma viagem encontrada'}
            </p>
            {availableRides.length > 0 ? (
              <div className="space-y-3">
                {availableRides.map((ride) => {
                  const seatsLeft = ride.available_seats - ride.booked_seats
                  const departDate = new Date(ride.departure_time)
                  return (
                    <div key={ride.id} className="ios-card-elevated p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-[15px] font-bold text-neutral-900">{ride.origin_city} {'>'} {ride.dest_city}</p>
                          <p className="text-[12px] text-neutral-500">
                            {departDate.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })} as{' '}
                            {departDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[18px] font-bold text-blue-500">R$ {ride.price_per_seat.toFixed(2)}</p>
                          <p className="text-[11px] text-neutral-500">por assento</p>
                        </div>
                      </div>
                      {ride.driver && (
                        <div className="flex items-center gap-2 mb-3 bg-neutral-50 rounded-xl p-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[12px] font-bold text-blue-600">
                            {ride.driver.full_name?.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="text-[13px] font-semibold text-neutral-800">{ride.driver.full_name}</p>
                            <p className="text-[11px] text-neutral-500">{ride.driver.rating?.toFixed(1)} estrelas</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`text-[12px] font-bold ${seatsLeft <= 1 ? 'text-red-500' : 'text-green-600'}`}>
                          {seatsLeft} assento(s) disponivel(is)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleBook(ride.id)}
                          disabled={seatsLeft <= 0}
                          className="px-5 py-2 bg-blue-500 text-white text-[13px] font-bold rounded-xl ios-press disabled:opacity-50"
                        >
                          Reservar
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="ios-card p-8 text-center">
                <p className="text-[15px] font-semibold text-neutral-800">Nenhuma viagem disponivel</p>
                <p className="text-[13px] text-neutral-500 mt-1">Tente outra data ou rota</p>
              </div>
            )}
          </div>
        )}

        {/* Popular Routes */}
        <div>
          <p className="ios-section-header">Rotas Populares</p>
          <div className="ios-list-group">
            {popularRoutes.map((route, i) => (
              <button key={i} type="button" className={`w-full ios-list-item ios-press ${i < popularRoutes.length - 1 ? 'border-b border-neutral-100' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-semibold text-neutral-900">{route.from}</span>
                    <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span className="text-[15px] font-semibold text-neutral-900">{route.to}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-neutral-500">{route.distance}</span>
                    <span className="text-[12px] text-neutral-400">|</span>
                    <span className="text-[12px] text-neutral-500">{route.time}</span>
                  </div>
                </div>
                <span className="text-[15px] font-bold text-blue-500">{route.price}</span>
              </button>
            ))}
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
