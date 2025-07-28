import React from 'react'
import './WordPuzzle.css'

export default function WordPuzzleGame({ onBack }) {
  return (
    <div className="word-puzzle">
      <h1>Kelime Bulmaca</h1>
      <p>Yeni oyun yakında burada!</p>
      <button className="icon-btn" onClick={onBack}>🏠</button>
    </div>
  )
}
