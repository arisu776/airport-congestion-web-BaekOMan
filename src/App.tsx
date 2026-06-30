import { useEffect, useMemo, useState } from 'react'
import { PassengerCongestionChart } from './components/PassengerCongestionChart'
import { TimeSlotCard } from './components/TimeSlotCard'
import type { PassengerAnncmtItem, PassengerAnncmtResponse } from './types/passenger'
import {
  T1_DEPARTURE_ZONES,
  T1_ENTRY_ZONES,
  T2_DEPARTURE_ZONES,
  T2_ENTRY_ZONES,
} from './types/passenger'
import { formatDate, parseCount, parsePassengerItems } from './utils/passenger'
import './App.css'

const PASSENGER_ANNCMT_API = import.meta.env.DEV
  ? '/api/getPassgrAnncmt'
  : 'https://apis.data.go.kr/B551177/passgrAnncmt/getPassgrAnncmt'

/** 인천국제공항공사 승객예고-출·입국장별 API에서 시간대별 예상 승객 수를 조회합니다. */
async function fetchIncheonCongestionData(): Promise<PassengerAnncmtItem[]> {
  const apiKey = import.meta.env.VITE_API_KEY

  const url = new URL(PASSENGER_ANNCMT_API, window.location.origin)
  url.searchParams.set('serviceKey', apiKey)
  url.searchParams.set('type', 'json')
  url.searchParams.set('numOfRows', '100')
  url.searchParams.set('pageNo', '1')

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`)
  }

  const data: PassengerAnncmtResponse = await response.json()
  return parsePassengerItems(data)
}

function App() {
  const [items, setItems] = useState<PassengerAnncmtItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')

  useEffect(() => {
    fetchIncheonCongestionData()
      .then((data) => {
        setItems(data)
        if (data.length > 0) {
          setSelectedDate(data[0].adate)
        }
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.'
        setError(message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const availableDates = useMemo(() => {
    return [...new Set(items.map((item) => item.adate))].sort()
  }, [items])

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => !selectedDate || item.adate === selectedDate)
      .sort((a, b) => a.atime.localeCompare(b.atime))
  }, [items, selectedDate])

  const maxZoneCount = useMemo(() => {
    const allZones = [
      ...T1_ENTRY_ZONES,
      ...T1_DEPARTURE_ZONES,
      ...T2_ENTRY_ZONES,
      ...T2_DEPARTURE_ZONES,
    ]
    let max = 0
    for (const item of filteredItems) {
      for (const zone of allZones) {
        max = Math.max(max, parseCount(item[zone.key]))
      }
    }
    return max
  }, [filteredItems])

  return (
    <div className="app">
      <header className="app-header">
        <p className="app-header__eyebrow">Incheon International Airport</p>
        <h1>인천공항 승객 혼잡도</h1>
        <p className="app-header__desc">
          시간대별 예상 승객 수를 터미널·출입국장별로 확인할 수 있습니다.
        </p>
      </header>

      {loading && <p className="status-message">데이터를 불러오는 중...</p>}

      {error && (
        <div className="status-message status-message--error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <div className="toolbar">
            <div className="date-tabs" role="tablist" aria-label="조회 날짜">
              {availableDates.map((date) => (
                <button
                  key={date}
                  type="button"
                  role="tab"
                  aria-selected={selectedDate === date}
                  className={`date-tab${selectedDate === date ? ' date-tab--active' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  {formatDate(date)}
                </button>
              ))}
            </div>
            <p className="result-count">
              총 <strong>{filteredItems.length}</strong>개 시간대
            </p>
          </div>

          <PassengerCongestionChart key={selectedDate} items={filteredItems} />

          <section className="time-slot-section" aria-label="시간대별 상세 목록">
            <h2 className="time-slot-section__title">시간대별 상세</h2>
            <div className="card-grid">
              {filteredItems.map((item) => (
                <TimeSlotCard
                  key={`${item.adate}-${item.atime}`}
                  item={item}
                  maxCount={maxZoneCount}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="status-message">표시할 데이터가 없습니다.</p>
      )}
    </div>
  )
}

export default App
