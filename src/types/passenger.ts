export interface PassengerAnncmtItem {
  adate: string
  atime: string
  t1eg1: string
  t1eg2: string
  t1eg3: string
  t1eg4: string
  t1egsum1: string
  t1dg1: string
  t1dg2: string
  t1dg3: string
  t1dg4: string
  t1dg5: string
  t1dg6: string
  t1dgsum1: string
  t2eg1: string
  t2eg2: string
  t2egsum1: string
  t2dg1: string
  t2dg2: string
  t2dgsum2: string
}

export interface PassengerAnncmtResponse {
  response: {
    header: {
      resultCode: string
      resultMsg: string
    }
    body: {
      numOfRows: number
      pageNo: number
      totalCount: number
      items: PassengerAnncmtItem[] | PassengerAnncmtItem
    }
  }
}

export interface ZoneInfo {
  key: keyof PassengerAnncmtItem
  label: string
}

export const T1_ENTRY_ZONES: ZoneInfo[] = [
  { key: 't1eg1', label: '입국장 동편 (A·B)' },
  { key: 't1eg2', label: '입국장 서편 (E·F)' },
  { key: 't1eg3', label: '입국심사 (C)' },
  { key: 't1eg4', label: '입국심사 (D)' },
]

export const T1_DEPARTURE_ZONES: ZoneInfo[] = [
  { key: 't1dg1', label: '출국장 1' },
  { key: 't1dg2', label: '출국장 2' },
  { key: 't1dg3', label: '출국장 3' },
  { key: 't1dg4', label: '출국장 4' },
  { key: 't1dg5', label: '출국장 5' },
  { key: 't1dg6', label: '출국장 6' },
]

export const T2_ENTRY_ZONES: ZoneInfo[] = [
  { key: 't2eg1', label: '입국장 1' },
  { key: 't2eg2', label: '입국장 2' },
]

export const T2_DEPARTURE_ZONES: ZoneInfo[] = [
  { key: 't2dg1', label: '출국장 1' },
  { key: 't2dg2', label: '출국장 2' },
]
