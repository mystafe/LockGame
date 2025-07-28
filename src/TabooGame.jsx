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
        <Tooltip content="Yasakli kelimeleri soylemeden ana kelimeyi takiminiza anlatin.">
          <span> ℹ️</span>
        </Tooltip>
        <Tooltip
          content={(
            <select>
              {tricks.map((t, i) => (
                <option key={i}>{t}</option>
              ))}
            </select>
          )}
        >
          <button className="icon-btn">Devamı</button>
        </Tooltip>
      </h1>
      <p>Yeni oyun yakında burada!</p>
      <button className="icon-btn" onClick={onBack}>🏠</button>
    </div>
  )
}
