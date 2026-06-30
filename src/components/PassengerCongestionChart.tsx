import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PassengerAnncmtItem } from '../types/passenger'
import {
  T1_DEPARTURE_ZONES,
  T1_ENTRY_ZONES,
  T2_DEPARTURE_ZONES,
  T2_ENTRY_ZONES,
} from '../types/passenger'
import {
  formatTimeRange,
  getCongestionLevel,
  parseCount,
} from '../utils/passenger'
import './PassengerCongestionChart.css'

const SERIES = [
  { key: 't1Entry', name: 'T1 입국', color: 'var(--chart-t1-entry)' },
  { key: 't1Departure', name: 'T1 출국', color: 'var(--chart-t1-departure)' },
  { key: 't2Entry', name: 'T2 입국', color: 'var(--chart-t2-entry)' },
  { key: 't2Departure', name: 'T2 출국', color: 'var(--chart-t2-departure)' },
] as const

const LEVEL_COLORS: Record<ReturnType<typeof getCongestionLevel>, string> = {
  low: 'var(--level-low)',
  medium: 'var(--level-medium)',
  high: 'var(--level-high)',
  'very-high': 'var(--level-very-high)',
}

interface TrendDataPoint {
  atime: string
  timeLabel: string
  t1Entry: number
  t1Departure: number
  t2Entry: number
  t2Departure: number
  total: number
}

interface ZoneBarPoint {
  label: string
  count: number
  level: ReturnType<typeof getCongestionLevel>
}

function toTrendData(items: PassengerAnncmtItem[]): TrendDataPoint[] {
  return items.map((item) => {
    const t1Entry = parseCount(item.t1egsum1)
    const t1Departure = parseCount(item.t1dgsum1)
    const t2Entry = parseCount(item.t2egsum1)
    const t2Departure = parseCount(item.t2dgsum2)

    return {
      atime: item.atime,
      timeLabel: formatTimeRange(item.atime),
      t1Entry,
      t1Departure,
      t2Entry,
      t2Departure,
      total: t1Entry + t1Departure + t2Entry + t2Departure,
    }
  })
}

function toZoneBarData(item: PassengerAnncmtItem): ZoneBarPoint[] {
  const zones = [
    ...T1_ENTRY_ZONES,
    ...T1_DEPARTURE_ZONES,
    ...T2_ENTRY_ZONES,
    ...T2_DEPARTURE_ZONES,
  ]

  return zones
    .map((zone) => {
      const count = parseCount(item[zone.key])
      return {
        label: zone.label,
        count,
        level: getCongestionLevel(count),
      }
    })
    .filter((zone) => zone.count > 0)
    .sort((a, b) => b.count - a.count)
}

function formatCount(value: number): string {
  return `${Math.round(value).toLocaleString()}명`
}

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function TrendTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__title">{label}</p>
      <ul className="chart-tooltip__list">
        {payload.map((entry) => (
          <li key={entry.name} style={{ color: entry.color }}>
            <span>{entry.name}</span>
            <strong>{formatCount(entry.value)}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface ZoneTooltipProps {
  active?: boolean
  payload?: Array<{ payload: ZoneBarPoint }>
}

function ZoneTooltip({ active, payload }: ZoneTooltipProps) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__title">{data.label}</p>
      <p className="chart-tooltip__value">{formatCount(data.count)}</p>
    </div>
  )
}

interface PassengerCongestionChartProps {
  items: PassengerAnncmtItem[]
}

export function PassengerCongestionChart({ items }: PassengerCongestionChartProps) {
  const trendData = useMemo(() => toTrendData(items), [items])

  const defaultTime = useMemo(() => {
    if (trendData.length === 0) return ''
    const peak = trendData.reduce((max, point) => (point.total > max.total ? point : max))
    return peak.atime
  }, [trendData])

  const [selectedTime, setSelectedTime] = useState('')

  const activeTime = selectedTime || defaultTime

  const selectedItem = useMemo(
    () => items.find((item) => item.atime === activeTime) ?? items[0],
    [items, activeTime],
  )

  const zoneData = useMemo(
    () => (selectedItem ? toZoneBarData(selectedItem) : []),
    [selectedItem],
  )

  if (trendData.length === 0) return null

  return (
    <div className="congestion-charts">
      <section className="chart-panel" aria-label="시간대별 승객 추이">
        <div className="chart-panel__header">
          <h2>시간대별 승객 추이</h2>
          <p>터미널·출입국장별 예상 승객 수 변화를 확인하세요. 차트를 클릭하면 해당 시간대 상세가 표시됩니다.</p>
        </div>

        <div className="chart-panel__body">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={trendData}
              margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
              onClick={(state) => {
                const point = (
                  state as { activePayload?: Array<{ payload: TrendDataPoint }> }
                )?.activePayload?.[0]?.payload
                if (point) setSelectedTime(point.atime)
              }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="timeLabel"
                tick={{ fill: 'var(--text)', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tick={{ fill: 'var(--text)', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => value.toLocaleString()}
                width={52}
              />
              <Tooltip content={<TrendTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: 13, color: 'var(--text-h)' }}
              />
              {SERIES.map((series) => (
                <Line
                  key={series.key}
                  type="monotone"
                  dataKey={series.key}
                  name={series.name}
                  stroke={series.color}
                  strokeWidth={2.5}
                  dot={{ r: 3, strokeWidth: 0 }}
                  activeDot={{
                    r: 6,
                    strokeWidth: 2,
                    stroke: 'var(--card-bg)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="chart-panel" aria-label="구역별 승객 상세">
        <div className="chart-panel__header">
          <h2>구역별 상세</h2>
          <p>
            선택 시간대:{' '}
            <strong>{selectedItem ? formatTimeRange(selectedItem.atime) : '-'}</strong>
          </p>
        </div>

        <div className="chart-panel__body chart-panel__body--zone">
          {zoneData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(280, zoneData.length * 36)}>
              <BarChart
                data={zoneData}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: 'var(--text)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickFormatter={(value: number) => value.toLocaleString()}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={140}
                  tick={{ fill: 'var(--text-h)', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ZoneTooltip />} cursor={{ fill: 'var(--chip-bg)' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {zoneData.map((entry) => (
                    <Cell key={entry.label} fill={LEVEL_COLORS[entry.level]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="chart-panel__empty">해당 시간대에 표시할 구역 데이터가 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  )
}
