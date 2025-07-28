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
        <Tooltip info="Hafleri kullanarak anlamli kelimeler olusturun." tips={tricks} />
      </h1>
      <p>Yeni oyun yakında burada!</p>
      <button className="icon-btn" onClick={onBack}>🏠</button>
    </div>
  )
}
