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
          <div className="info-content">
            <p>{info}</p>
            {sorted.length > 0 && (
              <ul className="info-tips">
                {sorted.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            )}
            <p className="close-hint">Kapatmak için tıklayın</p>
          </div>
        </div>
      )}
    </>
  )
}
