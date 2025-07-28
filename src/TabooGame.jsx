import React from 'react'
import './Taboo.css'
import Tooltip from './Tooltip.jsx'

export default function TabooGame({ onBack }) {
  const tricks = [
    'Benzer kelimelerden kacinin',
    'Jest ve mimikleri kullanin',
    'Zamani iyi yonetin',
  ].sort()
  return (
    <div className="taboo">
      <h1>
        Tabu
        <Tooltip info="Yasakli kelimeleri soylemeden ana kelimeyi takiminiza anlatin." tips={tricks} />
      </h1>
      <p>Yeni oyun yakında burada!</p>
      <button className="icon-btn" onClick={onBack}>🏠</button>
    </div>
  )
}
