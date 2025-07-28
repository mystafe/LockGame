import React from 'react'
import './WordPuzzle.css'
import Tooltip from './Tooltip.jsx'

export default function WordPuzzleGame({ onBack }) {
  const tricks = [
    'Harf dagilimini inceleyin',
    'Kelimeleri capraz kontrol edin',
    'Kisa kelimelerle baslayin',
  ].sort()
  return (
    <div className="word-puzzle">
      <h1>
        Kelime Bulmaca
        <Tooltip content="Hafleri kullanarak anlamli kelimeler olusturun.">
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
