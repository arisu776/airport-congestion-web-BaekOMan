import { readFileSync } from 'node:fs'

const env = readFileSync('.env', 'utf8')
const key = env.match(/VITE_API_KEY="?([^"\n]+)"?/)?.[1]
if (!key) throw new Error('Missing VITE_API_KEY')

const url = `http://localhost:5174/api/getPassgrAnncmt?serviceKey=${encodeURIComponent(key)}&type=json&numOfRows=2&pageNo=1`
const res = await fetch(url)
const data = await res.json()
const items = data?.response?.body?.items
const item = Array.isArray(items) ? items[0] : items
console.log('keys:', item ? Object.keys(item).sort().join(', ') : 'no item')
if (item) {
  const zoneKeys = Object.keys(item).filter((k) => /^(t1|t2)(eg|dg)\d+$/.test(k))
  console.log('zone values:', Object.fromEntries(zoneKeys.map((k) => [k, item[k]])))
}
