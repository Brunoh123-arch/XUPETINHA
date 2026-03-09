import { createClient } from '@/lib/supabase/client'
import type { PricingRule, VehicleType } from '@/lib/types/database'
import { estimateTraffic } from '@/lib/google-maps/route-optimizer'

export interface PriceEstimate {
  suggestedPrice: number
  minPrice: number
  maxPrice: number
  breakdown: {
    basePrice: number
    distancePrice: number
    timePrice: number
    multiplier: number
    trafficLabel: string
  }
}

export interface VehiclePriceMap {
  moto: PriceEstimate
  economy: PriceEstimate
  electric: PriceEstimate
  premium: PriceEstimate
}

/** Regras de fallback por tipo de veículo caso o banco não esteja configurado */
const FALLBACK_RULES: Record<VehicleType, Omit<PricingRule, 'id' | 'name' | 'rule_type' | 'conditions' | 'active' | 'priority' | 'valid_from' | 'valid_until' | 'created_at' | 'updated_at'>> = {
  moto:     { base_price: 4.00,  price_per_km: 1.40, price_per_minute: 0.25, min_price: 6.00,  multiplier: 1.0 },
  economy:  { base_price: 5.00,  price_per_km: 1.80, price_per_minute: 0.30, min_price: 8.00,  multiplier: 1.0 },
  electric: { base_price: 6.00,  price_per_km: 2.00, price_per_minute: 0.35, min_price: 10.00, multiplier: 1.0 },
  premium:  { base_price: 10.00, price_per_km: 3.50, price_per_minute: 0.60, min_price: 18.00, multiplier: 1.0 },
  suv:      { base_price: 8.00,  price_per_km: 2.80, price_per_minute: 0.50, min_price: 14.00, multiplier: 1.0 },
}

/** Cache de regras em memória por até 5 minutos para evitar excesso de queries */
let rulesCache: { rules: PricingRule[]; fetchedAt: number } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000

async function fetchPricingRules(): Promise<PricingRule[]> {
  if (rulesCache && Date.now() - rulesCache.fetchedAt < CACHE_TTL_MS) {
    return rulesCache.rules
  }

  try {
    const supabase = createClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .eq('active', true)
      .or(`valid_until.is.null,valid_until.gte.${now}`)
      .order('priority', { ascending: false })

    if (error || !data || data.length === 0) {
      return []
    }

    rulesCache = { rules: data, fetchedAt: Date.now() }
    return data
  } catch {
    return []
  }
}

/**
 * Encontra a regra de pricing mais relevante para um tipo de veículo.
 * Verifica `conditions.vehicle_type` ou `rule_type` que começa com o tipo.
 */
function findRuleForVehicle(rules: PricingRule[], vehicleType: VehicleType): PricingRule | null {
  const match = rules.find((r) => {
    if (r.conditions && typeof r.conditions === 'object') {
      return r.conditions.vehicle_type === vehicleType
    }
    return r.rule_type?.toLowerCase().includes(vehicleType.toLowerCase())
  })

  if (match) return match

  // Fallback: primeira regra do tipo 'base' ou 'standard'
  const base = rules.find((r) => ['base', 'standard', 'default'].includes(r.rule_type?.toLowerCase() ?? ''))
  return base ?? null
}

/**
 * Calcula o preço estimado para um tipo de veículo com base em distância e duração.
 * Aplica multiplicador de tráfego.
 */
export function calculatePrice(
  distanceKm: number,
  durationMinutes: number,
  vehicleType: VehicleType,
  rule?: PricingRule | null
): PriceEstimate {
  const traffic = estimateTraffic(new Date())
  const trafficMultiplierMap = { low: 1.0, medium: 1.15, high: 1.35 }
  const trafficLabelMap = { low: 'Trânsito leve', medium: 'Trânsito moderado', high: 'Trânsito intenso' }
  const trafficMultiplier = trafficMultiplierMap[traffic]

  const fallback = FALLBACK_RULES[vehicleType] ?? FALLBACK_RULES.economy
  const basePrice   = rule?.base_price       ?? fallback.base_price       ?? 5.00
  const perKm       = rule?.price_per_km     ?? fallback.price_per_km     ?? 1.80
  const perMin      = rule?.price_per_minute ?? fallback.price_per_minute ?? 0.30
  const minPrice    = rule?.min_price        ?? fallback.min_price        ?? 8.00
  const ruleMulti   = rule?.multiplier       ?? fallback.multiplier       ?? 1.0

  const distancePrice = perKm * distanceKm
  const timePrice     = perMin * durationMinutes
  const multiplier    = ruleMulti * trafficMultiplier

  const raw = (basePrice + distancePrice + timePrice) * multiplier
  const suggested = Math.max(minPrice, Math.round(raw * 100) / 100)

  return {
    suggestedPrice: suggested,
    minPrice: Math.max(minPrice, Math.round(suggested * 0.8 * 100) / 100),
    maxPrice: Math.round(suggested * 1.3 * 100) / 100,
    breakdown: {
      basePrice,
      distancePrice: Math.round(distancePrice * 100) / 100,
      timePrice:     Math.round(timePrice * 100) / 100,
      multiplier:    Math.round(multiplier * 100) / 100,
      trafficLabel:  trafficLabelMap[traffic],
    },
  }
}

/**
 * Calcula o preço para todos os tipos de veículo de uma vez.
 * Carrega as regras do banco e aplica o cálculo.
 */
export async function calculateAllVehiclePrices(
  distanceKm: number,
  durationMinutes: number
): Promise<VehiclePriceMap> {
  const rules = await fetchPricingRules()

  const vehicles: VehicleType[] = ['moto', 'economy', 'electric', 'premium']

  const result = {} as VehiclePriceMap
  for (const vt of vehicles) {
    const rule = findRuleForVehicle(rules, vt)
    result[vt] = calculatePrice(distanceKm, durationMinutes, vt, rule)
  }

  return result
}

/**
 * Formata um valor em BRL.
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
