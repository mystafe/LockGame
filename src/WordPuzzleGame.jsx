import { useState, useEffect } from 'react'
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
    'zengin',
    'balon',
    'eller',
    'gunes',
    'hayvan',
    'iyilik',
    'kalem',
    'limon',
    'mektup',
    'ormanlar',
    'piramit',
    'renk',
    'sarmasik',
    'toprak',
    'uzay',
    'yildiz',
    'zaman',
  ]

  const randomWord = () => words[Math.floor(Math.random() * words.length)]

  const [secret, setSecret] = useState(randomWord)
  const [guess, setGuess] = useState('')
  const [attempts, setAttempts] = useState([])
  const [hintsLeft, setHintsLeft] = useState(1)
  const [superMode, setSuperMode] = useState(false)
  const [headerClicks, setHeaderClicks] = useState(0)
  const [status, setStatus] = useState('')
  const [bestScore, setBestScore] = useState(() => {
    const s = localStorage.getItem('wordBest')
    return s ? parseInt(s, 10) : null
  })
  const wordLen = secret.length

  const finished = status !== ''

  useEffect(() => {
    const handleKey = e => {
      if (finished) return
      const k = e.key.toLowerCase()
      if (/^[a-z]$/.test(k)) {
        handleLetter(k)
      } else if (k === 'backspace') {
        handleDelete()
      } else if (k === 'enter') {
        handleSubmit()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [finished, wordLen])

  const handleHeaderClick = () => {
    const count = headerClicks + 1
    if (count >= 5) {
      if (!superMode) {
        setSuperMode(true)
        setHintsLeft(Infinity)
      }
      setHeaderClicks(0)
    } else {
      setHeaderClicks(count)
    }
  }

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

  const handleLetter = l => {
    if (finished || guess.length >= wordLen) return
    setGuess(g => (g + l).slice(0, wordLen))
  }

  const handleDelete = () => {
    if (finished) return
    setGuess(g => g.slice(0, -1))
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
    if (finished || (!superMode && hintsLeft <= 0)) return
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
    if (!superMode) setHintsLeft(hintsLeft - 1)
  }

  const restart = () => {
    const w = randomWord()
    setSecret(w)
    setGuess('')
    setAttempts([])
    setHintsLeft(superMode ? Infinity : 1)
    setStatus('')
  }

  return (
    <div className="word-puzzle">
      <h1 onClick={handleHeaderClick}>
        Kelime Bulmaca
        <Tooltip info="Harfleri kullanarak anlamli kelimeler olusturun." tips={tricks} />
      </h1>
      <p className="word-length">
        {Array.from({ length: wordLen })
          .map((_, i) => (guess[i] ? guess[i] : '_'))
          .join(' ')}
      </p>
      <div className="controls">
        {!finished && (
          <>
            <button onClick={handleSubmit}>Tahmin</button>
            {(superMode || hintsLeft > 0) && (
              <button className="icon-btn" onClick={giveHint}>
                💡 <span className="hint-count">({superMode ? '∞' : hintsLeft})</span>
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
      <div className="letter-pad">
        {Array.from('abcdefghijklmnopqrstuvwxyz').map(ch => (
          <button
            key={ch}
            onPointerDown={e => e.preventDefault()}
            disabled={finished || guess.length >= wordLen}
            onClick={() => handleLetter(ch)}
          >
            {ch}
          </button>
        ))}
        <button
          onPointerDown={e => e.preventDefault()}
          disabled={finished || guess.length === 0}
          onClick={handleDelete}
        >
          {'<'}
        </button>
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
