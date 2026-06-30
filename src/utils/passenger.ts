import type { PassengerAnncmtItem, PassengerAnncmtResponse } from '../types/passenger'

export function parsePassengerItems(
  data: PassengerAnncmtResponse,
): PassengerAnncmtItem[] {
  const { header, body } = data.response

  if (header.resultCode !== '00') {
    throw new Error(header.resultMsg || 'API 응답 오류')
  }

  const { items } = body
  if (!items) return []

  return Array.isArray(items) ? items : [items]
}

export function parseCount(value: string | undefined): number {
  const parsed = Number.parseFloat(value ?? '0')
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatDate(adate: string): string {
  if (adate.length !== 8) return adate
  const year = adate.slice(0, 4)
  const month = adate.slice(4, 6)
  const day = adate.slice(6, 8)
  return `${year}.${month}.${day}`
}

export function formatTimeRange(atime: string): string {
  const [start, end] = atime.split('_')
  if (!start || !end) return atime
  return `${start}:00 – ${end}:00`
}

export type CongestionLevel = 'low' | 'medium' | 'high' | 'very-high'

export function getCongestionLevel(count: number): CongestionLevel {
  if (count >= 3000) return 'very-high'
  if (count >= 1500) return 'high'
  if (count >= 500) return 'medium'
  return 'low'
}

export function getCongestionLabel(level: CongestionLevel): string {
  switch (level) {
    case 'very-high':
      return '매우 혼잡'
    case 'high':
      return '혼잡'
    case 'medium':
      return '보통'
    case 'low':
      return '여유'
  }
}
