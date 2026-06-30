import type { PassengerAnncmtItem, ZoneInfo } from '../types/passenger'
import {
  T1_DEPARTURE_ZONES,
  T1_ENTRY_ZONES,
  T2_DEPARTURE_ZONES,
  T2_ENTRY_ZONES,
} from '../types/passenger'
import {
  formatDate,
  formatTimeRange,
  getCongestionLabel,
  getCongestionLevel,
  parseCount,
} from '../utils/passenger'
import './TimeSlotCard.css'

interface ZoneBarProps {
  label: string
  count: number
  maxCount: number
}

function ZoneBar({ label, count, maxCount }: ZoneBarProps) {
  const level = getCongestionLevel(count)
  const widthPercent = maxCount > 0 ? Math.min((count / maxCount) * 100, 100) : 0

  return (
    <div className="zone-bar">
      <div className="zone-bar__header">
        <span className="zone-bar__label">{label}</span>
        <span className="zone-bar__count">{Math.round(count).toLocaleString()}명</span>
      </div>
      <div className="zone-bar__track">
        <div
          className={`zone-bar__fill zone-bar__fill--${level}`}
          style={{ width: `${widthPercent}%` }}
        />
      </div>
    </div>
  )
}

interface ZoneGroupProps {
  title: string
  zones: ZoneInfo[]
  item: PassengerAnncmtItem
  maxCount: number
}

function ZoneGroup({ title, zones, item, maxCount }: ZoneGroupProps) {
  const activeZones = zones.filter((zone) => parseCount(item[zone.key]) > 0)
  if (activeZones.length === 0) return null

  return (
    <div className="zone-group">
      <h4 className="zone-group__title">{title}</h4>
      {activeZones.map((zone) => (
        <ZoneBar
          key={zone.key}
          label={zone.label}
          count={parseCount(item[zone.key])}
          maxCount={maxCount}
        />
      ))}
    </div>
  )
}

interface TimeSlotCardProps {
  item: PassengerAnncmtItem
  maxCount: number
}

export function TimeSlotCard({ item, maxCount }: TimeSlotCardProps) {
  const t1EntryTotal = parseCount(item.t1egsum1)
  const t1DepartureTotal = parseCount(item.t1dgsum1)
  const t2EntryTotal = parseCount(item.t2egsum1)
  const t2DepartureTotal = parseCount(item.t2dgsum2)
  const peakTotal = Math.max(t1EntryTotal, t1DepartureTotal, t2EntryTotal, t2DepartureTotal)
  const peakLevel = getCongestionLevel(peakTotal)

  return (
    <article className={`time-slot-card time-slot-card--${peakLevel}`}>
      <header className="time-slot-card__header">
        <div>
          <p className="time-slot-card__date">{formatDate(item.adate)}</p>
          <h3 className="time-slot-card__time">{formatTimeRange(item.atime)}</h3>
        </div>
        <span className={`time-slot-card__badge time-slot-card__badge--${peakLevel}`}>
          {getCongestionLabel(peakLevel)}
        </span>
      </header>

      <div className="time-slot-card__summary">
        <div className="summary-chip">
          <span className="summary-chip__label">T1 입국</span>
          <strong>{Math.round(t1EntryTotal).toLocaleString()}</strong>
        </div>
        <div className="summary-chip">
          <span className="summary-chip__label">T1 출국</span>
          <strong>{Math.round(t1DepartureTotal).toLocaleString()}</strong>
        </div>
        <div className="summary-chip">
          <span className="summary-chip__label">T2 입국</span>
          <strong>{Math.round(t2EntryTotal).toLocaleString()}</strong>
        </div>
        <div className="summary-chip">
          <span className="summary-chip__label">T2 출국</span>
          <strong>{Math.round(t2DepartureTotal).toLocaleString()}</strong>
        </div>
      </div>

      <div className="time-slot-card__zones">
        <ZoneGroup title="제1터미널 · 입국" zones={T1_ENTRY_ZONES} item={item} maxCount={maxCount} />
        <ZoneGroup
          title="제1터미널 · 출국"
          zones={T1_DEPARTURE_ZONES}
          item={item}
          maxCount={maxCount}
        />
        <ZoneGroup title="제2터미널 · 입국" zones={T2_ENTRY_ZONES} item={item} maxCount={maxCount} />
        <ZoneGroup
          title="제2터미널 · 출국"
          zones={T2_DEPARTURE_ZONES}
          item={item}
          maxCount={maxCount}
        />
      </div>
    </article>
  )
}
