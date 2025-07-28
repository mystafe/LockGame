import React from 'react'
import './Kakuro.css'

export default function KakuroGame({ onBack }) {
  return (
    <div className="kakuro">
      <h1>Kakuro</h1>
      <p>Yeni oyun yakında burada!</p>
      <button className="icon-btn" onClick={onBack}>🏠</button>
    </div>
  )
}
