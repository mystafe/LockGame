import React from 'react'
import './Taboo.css'

export default function TabooGame({ onBack }) {
  return (
    <div className="taboo">
      <h1>Tabu</h1>
      <p>Yeni oyun yakında burada!</p>
      <button className="icon-btn" onClick={onBack}>🏠</button>
    </div>
  )
}
