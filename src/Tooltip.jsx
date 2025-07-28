import { useState } from 'react'
import './Tooltip.css'

export default function Tooltip({ info, tips = [] }) {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen(o => !o)
  const sorted = [...tips].sort()
  return (
    <>
      <span className="info-btn" onClick={toggle}> ℹ️</span>
      {open && (
        <div className="info-overlay" onClick={toggle}>
          <div className="info-content" onClick={e => e.stopPropagation()}>
            <p>{info}</p>
            {sorted.length > 0 && (
              <select>{sorted.map((t, i) => <option key={i}>{t}</option>)}</select>
            )}
            <p className="close-hint">Kapatmak için tıklayın</p>
          </div>
        </div>
      )}
    </>
  )
}
