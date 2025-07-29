import { useState, useEffect } from 'react'
import './Taboo.css'
import Tooltip from './Tooltip.jsx'

export default function TabooGame({ onBack }) {
  const tricks = [
    'Benzer kelimelerden kacinin',
    'Jest ve mimikleri kullanin',
    'Zamani iyi yonetin',
  ].sort()

  const cards = [
    { word: 'kalem', taboo: ['yazi', 'kitap', 'defter', 'silgi', 'uc'] },
    { word: 'bilgisayar', taboo: ['ekran', 'klavye', 'fare', 'internet', 'program'] },
    { word: 'sinema', taboo: ['film', 'koltuk', 'perde', 'izlemek', 'popcorn'] },
    { word: 'kedi', taboo: ['hayvan', 'miyav', 'tirmik', 'kum', 'evcil'] },
    { word: 'deniz', taboo: ['su', 'mavi', 'plaj', 'kum', 'tatil'] },
    { word: 'muzik', taboo: ['nota', 'ses', 'sarki', 'dinlemek', 'koro'] },
    { word: 'kitap', taboo: ['okumak', 'sayfa', 'cilt', 'yazar', 'roman'] },
    { word: 'araba', taboo: ['teker', 'motor', 'yol', 'surmek', 'direksiyon'] },
    { word: 'ucak', taboo: ['kanat', 'havalimani', 'pilot', 'yolcu', 'hostes'] },
    { word: 'bisiklet', taboo: ['pedal', 'teker', 'yol', 'spor', 'surmek'] },
  ]

  const [screen, setScreen] = useState('start')
  const [turn, setTurn] = useState('A')
  const [round, setRound] = useState(0) // 0: team A, 1: team B
  const [scoreA, setScoreA] = useState(0)
  const [scoreB, setScoreB] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [index, setIndex] = useState(() => Math.floor(Math.random() * cards.length))
  const [used, setUsed] = useState(new Set())

  const nextCard = () => {
    const available = cards.map((_, i) => i).filter(i => !used.has(i))
    if (available.length === 0) {
      setUsed(new Set())
      setIndex(Math.floor(Math.random() * cards.length))
      return
    }
    const idx = available[Math.floor(Math.random() * available.length)]
    setUsed(new Set(used).add(idx))
    setIndex(idx)
  }

  useEffect(() => {
    let id
    if (screen === 'play') {
      id = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(id)
            endTurn()
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(id)
  }, [screen])

  const startTurn = () => {
    setTimeLeft(60)
    nextCard()
    setScreen('play')
  }

  const endTurn = () => {
    if (round === 0) {
      setRound(1)
      setScreen('switch')
    } else {
      setScreen('end')
    }
  }

  const handlePass = () => nextCard()
  const handleCorrect = () => {
    if (turn === 'A') setScoreA(s => s + 1)
    else setScoreB(s => s + 1)
    nextCard()
  }
  const handleTaboo = () => {
    if (turn === 'A') setScoreA(s => (s > 0 ? s - 1 : 0))
    else setScoreB(s => (s > 0 ? s - 1 : 0))
    nextCard()
  }

  const handleStart = () => startTurn()
  const handleNextTeam = () => {
    setTurn('B')
    startTurn()
  }
  const handleRestart = () => {
    setTurn('A')
    setRound(0)
    setScoreA(0)
    setScoreB(0)
    setUsed(new Set())
    setScreen('start')
  }

  const spacedWord = cards[index].word.split('').join(' ')

  return (
    <div className="taboo">
      <h1 onClick={handleRestart}>
        Tabu
        <Tooltip info="Yasakli kelimeleri soylemeden ana kelimeyi takiminiza anlatin." tips={tricks} />
      </h1>
      {screen === 'start' && (
        <>
          <p className="score-board">Takim A: {scoreA} - Takim B: {scoreB}</p>
          <p>Takim A basliyor</p>
          <button onClick={handleStart}>Basla</button>
          <button className="icon-btn" onClick={onBack}>🏠</button>
        </>
      )}
      {screen === 'play' && (
        <>
          <p className="timer">{timeLeft}s</p>
          <p className="score-board">Takim A: {scoreA} - Takim B: {scoreB}</p>
          <h2 className="word">{spacedWord}</h2>
          <ul className="forbidden">
            {cards[index].taboo.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
          <div className="actions">
            <button onClick={handlePass}>Pas</button>
            <button onClick={handleCorrect}>Dogru</button>
            <button onClick={handleTaboo}>Tabu</button>
          </div>
        </>
      )}
      {screen === 'switch' && (
        <>
          <p>Takim A skoru: {scoreA}</p>
          <p>Siradaki Takim: B</p>
          <button onClick={handleNextTeam}>Basla</button>
          <button className="icon-btn" onClick={onBack}>🏠</button>
        </>
      )}
      {screen === 'end' && (
        <>
          <p className="score-board">Son Skor - A: {scoreA} B: {scoreB}</p>
          <button onClick={handleRestart}>Yeniden Oyna</button>
          <button className="icon-btn" onClick={onBack}>🏠</button>
        </>
      )}
    </div>
  )
}
