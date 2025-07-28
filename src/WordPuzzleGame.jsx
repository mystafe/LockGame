import { useState } from 'react'
import './WordPuzzle.css'
import Tooltip from './Tooltip.jsx'

export default function WordPuzzleGame({ onBack }) {
  const tricks = [
    'Harf dagilimini inceleyin',
    'Kelimeleri capraz kontrol edin',
    'Kisa kelimelerle baslayin',
  ].sort()

  const words = [
    'akide',
    'bilet',
    'cihan',
    'defne',
    'erdem',
    'fidan',
    'gizem',
    'hayal',
    'islem',
    'kuzey',
    'lamba',
    'mutlu',
    'nehir',
    'orman',
    'petek',
    'radyo',
    'sakin',
    'tatil',
    'vagon',
    'yolcu',
  ]

  const randomWord = () => words[Math.floor(Math.random() * words.length)]

  const [secret, setSecret] = useState(randomWord)
  const [guess, setGuess] = useState('')
  const [attempts, setAttempts] = useState([])
  const [hintsLeft, setHintsLeft] = useState(1)
  const [status, setStatus] = useState('')
  const [bestScore, setBestScore] = useState(() => {
    const s = localStorage.getItem('wordBest')
    return s ? parseInt(s, 10) : null
  })
  const wordLen = secret.length

  const finished = status !== ''

  const evaluateColors = (g) => {
    const res = Array(wordLen).fill('gray')
    const secretArr = secret.split('')
    const copy = secretArr.slice()
    for (let i = 0; i < wordLen; i++) {
      if (g[i] === secretArr[i]) {
        res[i] = 'green'
        copy[i] = null
      }
    }
    for (let i = 0; i < wordLen; i++) {
      if (res[i] === 'green') continue
      const idx = copy.indexOf(g[i])
      if (idx !== -1) {
        res[i] = 'yellow'
        copy[idx] = null
      }
    }
    return res
  }

  const handleSubmit = () => {
    if (finished || guess.length !== wordLen) return
    const colors = evaluateColors(guess)
    const newAttempts = [...attempts, { guess, colors }]
    setAttempts(newAttempts)
    if (guess === secret) {
      setStatus('Tebrikler!')
      if (bestScore === null || newAttempts.length < bestScore) {
        setBestScore(newAttempts.length)
        localStorage.setItem('wordBest', newAttempts.length.toString())
      }
    } else if (newAttempts.length >= 6) {
      setStatus(`Kaybettiniz! Kelime ${secret}`)
    }
    setGuess('')
  }

  const giveHint = () => {
    if (finished || hintsLeft <= 0) return
    const unrevealed = []
    for (let i = 0; i < wordLen; i++) {
      if (!attempts.some(a => a.guess[i] === secret[i])) {
        unrevealed.push(i)
      }
    }
    if (unrevealed.length === 0) return
    const idx = unrevealed[Math.floor(Math.random() * unrevealed.length)]
    const arr = guess.padEnd(wordLen, ' ').split('')
    arr[idx] = secret[idx]
    setGuess(arr.join('').trimEnd())
    setHintsLeft(hintsLeft - 1)
  }

  const restart = () => {
    const w = randomWord()
    setSecret(w)
    setGuess('')
    setAttempts([])
    setHintsLeft(1)
    setStatus('')
  }

  return (
    <div className="word-puzzle">
      <h1>
        Kelime Bulmaca
        <Tooltip info="Harfleri kullanarak anlamli kelimeler olusturun." tips={tricks} />
      </h1>
      <div className="controls">
        {!finished && (
          <>
            <input
              value={guess}
              onChange={e => setGuess(e.target.value.toLowerCase())}
              maxLength={wordLen}
            />
            <button onClick={handleSubmit}>Tahmin</button>
            {hintsLeft > 0 && (
              <button className="icon-btn" onClick={giveHint}>
                💡 ({hintsLeft})
              </button>
            )}
          </>
        )}
        {finished && (
          <button className="icon-btn" onClick={restart}>
            🔄
          </button>
        )}
        <button className="icon-btn" onClick={onBack}>🏠</button>
      </div>
      {bestScore !== null && <p>Best Score: {bestScore}</p>}
      {status && <p className="status">{status}</p>}
      <div className="history">
        {attempts.map((a, idx) => (
          <div key={idx} className="attempt">
            {a.guess.split('').map((ch, i) => (
              <span key={i} className={`letter ${a.colors[i]}`}>{ch}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
