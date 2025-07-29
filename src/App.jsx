import { useState, useEffect } from 'react'
import './App.css'
import SudokuGame from './SudokuGame.jsx'
import KakuroGame from './KakuroGame.jsx'
import TabooGame from './TabooGame.jsx'
import WordPuzzleGame from './WordPuzzleGame.jsx'
import NonogramGame from './NonogramGame.jsx'
import Tooltip from './Tooltip.jsx'
function generateSecret(length) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10))
}

function DigitWheel({ value, onChange, disabled }) {
  const [spin, setSpin] = useState(false)
  const inc = () => !disabled && onChange((value + 1) % 10)
  const dec = () => !disabled && onChange((value + 9) % 10)

  useEffect(() => {
    setSpin(true)
    const t = setTimeout(() => setSpin(false), 300)
    return () => clearTimeout(t)
  }, [value])

  return (
    <div className={`wheel ${spin ? 'spin' : ''}`}>
      <button onClick={inc} disabled={disabled}>▲</button>
      <div className="digit-display">{value}</div>
      <button onClick={dec} disabled={disabled}>▼</button>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('start')
  const [gameType, setGameType] = useState('sudoku') // lock or sudoku
  const [mode, setMode] = useState('easy') // 'easy' or 'challenge'
  const [difficulty, setDifficulty] = useState('easy') // lock difficulty
  const [sudokuDifficulty, setSudokuDifficulty] = useState('hard')
  const [kakuroDifficulty, setKakuroDifficulty] = useState('easy')
  const [nonogramDifficulty, setNonogramDifficulty] = useState('easy')
  const themeOptions = [
    { value: 'broken', label: 'Kırık Cam' },
    { value: 'earth', label: 'Toprak' },
    { value: 'fabric', label: 'Kumaş' },
    { value: 'forest', label: 'Orman' },
    { value: 'glass', label: 'Bulanık Cam' },
    { value: 'lime', label: 'Kireç' },
    { value: 'metal', label: 'Metal' },
    { value: 'ocean', label: 'Okyanus' },
    { value: 'pastel', label: 'Pastel' },
    { value: 'watercolor', label: 'Sulu Boya' },
    { value: 'wood', label: 'Ahşap' },
  ].sort((a, b) => a.label.localeCompare(b.label, 'tr'))
  const randomTheme = () =>
    themeOptions[Math.floor(Math.random() * themeOptions.length)].value

  const [theme, setTheme] = useState(randomTheme())
  const [palette, setPalette] = useState('gs')

  const [codeLength, setCodeLength] = useState(4)
  const [maxAttempts, setMaxAttempts] = useState(10)
  const [secret, setSecret] = useState([])
  const [guess, setGuess] = useState([])
  const [attempts, setAttempts] = useState([])
  const [status, setStatus] = useState('')
  const [bestScore, setBestScore] = useState(null)
  const [hintsLeft, setHintsLeft] = useState(0)
  const [superMode, setSuperMode] = useState(false)
  const [headerClicks, setHeaderClicks] = useState(0)
  const [revealed, setRevealed] = useState([])
  const lockTricks = [
    'Ayni rakamdan birden fazla kullanabilirsiniz',
    'Ilk tahminlerde rastgele deneyin',
    'Sonuclara gore rakamlari yer degistirin',
  ].sort()

  useEffect(() => {
    document.body.className = `theme-${theme} palette-${palette}`
  }, [theme, palette])

  useEffect(() => {
    if (gameType === 'lock') {
      const val = localStorage.getItem(`lockBest-${mode}-${difficulty}`)
      setBestScore(val ? parseInt(val, 10) : null)
    }
  }, [gameType, mode, difficulty])

  const finished = status !== ''

  const startGame = () => {
    if (gameType === 'lock') {
      const lengths = { easy: 4, medium: 5, hard: 6 }
      const attemptsMap = { easy: 10, medium: 8, hard: 6 }
      const len = lengths[difficulty]
      const att = attemptsMap[difficulty]
      setTheme(randomTheme())
      setCodeLength(len)
      setMaxAttempts(att)
      setSecret(generateSecret(len))
      setGuess(Array(len).fill(0))
      setAttempts([])
      setStatus('')
      setHintsLeft(superMode ? Infinity : difficulty === 'hard' ? 0 : 1)
      setRevealed(Array(len).fill(false))
      setScreen('play')
    } else {
      if (gameType === 'sudoku') setScreen('sudoku')
      else if (gameType === 'kakuro') setScreen('kakuro')
      else if (gameType === 'nonogram') setScreen('nonogram')
      else if (gameType === 'taboo') setScreen('taboo')
      else if (gameType === 'word') setScreen('word')
    }
  }

  const handleChange = (index, val) => {
    const g = [...guess]
    g[index] = val
    setGuess(g)
  }

  const evaluateColors = (g) => {
    const colors = Array(codeLength).fill('red')
    const secretCopy = [...secret]
    for (let i = 0; i < codeLength; i++) {
      if (g[i] === secretCopy[i]) {
        colors[i] = 'green'
        secretCopy[i] = null
      }
    }
    for (let i = 0; i < codeLength; i++) {
      if (colors[i] === 'green') continue
      const idx = secretCopy.indexOf(g[i])
      if (idx !== -1) {
        colors[i] = 'yellow'
        secretCopy[idx] = null
      }
    }
    return colors
  }

  const evaluateCounts = (g) => {
    let correct = 0
    let misplaced = 0
    let wrong = 0
    const secretCopy = [...secret]
    for (let i = 0; i < codeLength; i++) {
      if (g[i] === secretCopy[i]) {
        correct++
        secretCopy[i] = null
      }
    }
    for (let i = 0; i < codeLength; i++) {
      if (g[i] === secret[i]) continue
      const idx = secretCopy.indexOf(g[i])
      if (idx !== -1) {
        misplaced++
        secretCopy[idx] = null
      } else {
        wrong++
      }
    }
    return { correct, misplaced, wrong }
  }

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

  const handleSubmit = () => {
    if (finished) return
    if (mode === 'easy') {
      const colors = evaluateColors(guess)
      const newAttempt = { digits: [...guess], colors }
      const newAttempts = [...attempts, newAttempt]
      setAttempts(newAttempts)
      if (colors.every((c) => c === 'green')) {
        setStatus('Tebrikler! Şifre doğru.')
        const score = newAttempts.length
        const key = `lockBest-${mode}-${difficulty}`
        if (bestScore === null || score < bestScore) {
          setBestScore(score)
          localStorage.setItem(key, score.toString())
        }
      } else if (newAttempts.length >= maxAttempts) {
        setStatus('Deneme hakkınız bitti. Şifre: ' + secret.join(''))
      }
    } else {
      const result = evaluateCounts(guess)
      const newAttempt = { digits: [...guess], result }
      const newAttempts = [...attempts, newAttempt]
      setAttempts(newAttempts)
      if (result.correct === codeLength) {
        setStatus('Tebrikler! Şifre doğru.')
        const score = newAttempts.length
        const key = `lockBest-${mode}-${difficulty}`
        if (bestScore === null || score < bestScore) {
          setBestScore(score)
          localStorage.setItem(key, score.toString())
        }
      } else if (newAttempts.length >= maxAttempts) {
        setStatus('Deneme hakkınız bitti. Şifre: ' + secret.join(''))
      }
    }
  }

  const restartLockGame = () => {
    const lengths = { easy: 4, medium: 5, hard: 6 }
    const attemptsMap = { easy: 10, medium: 8, hard: 6 }
    const len = lengths[difficulty]
    const att = attemptsMap[difficulty]
    setTheme(randomTheme())
    setCodeLength(len)
    setMaxAttempts(att)
    setSecret(generateSecret(len))
    setGuess(Array(len).fill(0))
    setAttempts([])
    setStatus('')
    setHintsLeft(superMode ? Infinity : difficulty === 'hard' ? 0 : 1)
    setRevealed(Array(len).fill(false))
  }

  const useHint = () => {
    if (!superMode && hintsLeft <= 0) return
    const choices = revealed
      .map((r, i) => (!r ? i : null))
      .filter(i => i !== null)
    if (choices.length === 0) return
    const idx = choices[Math.floor(Math.random() * choices.length)]
    const g = [...guess]
    g[idx] = secret[idx]
    setGuess(g)
    const rev = [...revealed]
    rev[idx] = true
    setRevealed(rev)
    if (!superMode) setHintsLeft(hintsLeft - 1)
  }

  const handleRestart = () => {
    setScreen('start')
  }

  if (screen === 'start') {
    return (
      <div className="app">
        <h1>MiniGames</h1>
        <div className="options">
          <div>
            <label>Oyun: </label>
            <select value={gameType} onChange={(e) => setGameType(e.target.value)}>
              <option value="sudoku">Sudoku</option>
              <option value="lock">Lock Game</option>
              <option value="kakuro">Kakuro</option>
              <option value="nonogram">Nonogram</option>
              <option value="taboo">Tabu</option>
              <option value="word">Kelime Bulmaca</option>
            </select>
          </div>
          {gameType === 'lock' && (
            <>
              <div>
                <label>Mod: </label>
                <select value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="easy">LockGame Casual</option>
                  <option value="challenge">Lock Game Challenge</option>
                </select>
              </div>
              <div>
                <label>Zorluk: </label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="easy">Kolay (4 hane, 10 hak)</option>
                  <option value="medium">Orta (5 hane, 8 hak)</option>
                  <option value="hard">Zor (6 hane, 6 hak)</option>
                </select>
              </div>
            </>
          )}
          {gameType === 'sudoku' && (
            <div>
              <label>Zorluk: </label>
              <select value={sudokuDifficulty} onChange={(e) => setSudokuDifficulty(e.target.value)}>
                <option value="hard">9x9 Zor</option>
                <option value="medium">9x9 Orta</option>
                <option value="easy">5x5 Kolay</option>
              </select>
            </div>
          )}
          {gameType === 'kakuro' && (
            <div>
              <label>Zorluk: </label>
              <select value={kakuroDifficulty} onChange={(e) => setKakuroDifficulty(e.target.value)}>
                <option value="easy">3x3 Kolay</option>
                <option value="medium">4x4 Orta</option>
                <option value="hard">5x5 Zor</option>
              </select>
            </div>
          )}
          {gameType === 'nonogram' && (
            <div>
              <label>Zorluk: </label>
              <select value={nonogramDifficulty} onChange={(e) => setNonogramDifficulty(e.target.value)}>
                <option value="easy">5x5 Kolay</option>
                <option value="medium">10x10 Orta</option>
                <option value="hard">15x15 Zor</option>
              </select>
            </div>
          )}
          <div>
            <label>Tema: </label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              {themeOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Renk Paleti: </label>
            <select value={palette} onChange={(e) => setPalette(e.target.value)}>
              <option value="bjk">Beşiktaş</option>
              <option value="fb">Fenerbahçe</option>
              <option value="gs">Galatasaray</option>
              <option value="ts">Trabzon</option>
              <option value="tr">Türkiye</option>
            </select>
          </div>
          <button onClick={startGame}>Başla</button>
        </div>
      </div>
    )
  }

  if (screen === 'sudoku') {
    return (
      <div className="app sudoku-app">
        <SudokuGame difficulty={sudokuDifficulty} onBack={handleRestart} />
      </div>
    )
  }

  if (screen === 'kakuro') {
    return (
      <div className="app kakuro-app">
        <KakuroGame difficulty={kakuroDifficulty} onBack={handleRestart} />
      </div>
    )
  }

  if (screen === 'nonogram') {
    return (
      <div className="app kakuro-app">
        <NonogramGame difficulty={nonogramDifficulty} onBack={handleRestart} />
      </div>
    )
  }

  if (screen === 'taboo') {
    return (
      <div className="app kakuro-app">
        <TabooGame onBack={handleRestart} />
      </div>
    )
  }

  if (screen === 'word') {
    return (
      <div className="app kakuro-app">
        <WordPuzzleGame onBack={handleRestart} />
      </div>
    )
  }

    return (
      <div className="app">
        <h1 className="lock-title" onClick={handleHeaderClick}>
          {mode === 'easy' ? 'LockGame Casual' : 'Lock Game Challenge'}
          <Tooltip info="Rakamlari oklarla degistirip dogru sifreyi bulmaya calisin." tips={lockTricks} />
        </h1>
        <div className="wheels">
        {guess.map((d, i) => (
          <DigitWheel
            key={i}
            value={d}
            onChange={(val) => handleChange(i, val)}
            disabled={finished || revealed[i]}
          />
        ))}
      </div>
      <div className="lock-controls">
        {!finished && <button onClick={handleSubmit}>Tahmin Et</button>}
        {!finished && (superMode || hintsLeft > 0) && (
          <button className="icon-btn hint-btn" onClick={useHint}>
            💡 <span className="hint-count">({superMode ? '∞' : hintsLeft})</span>
          </button>
        )}
        {finished && (
          <button className="icon-btn" onClick={restartLockGame}>🔄</button>
        )}
        <button className="icon-btn" onClick={handleRestart}>🏠</button>
      </div>
      <p>Kalan Hak: {maxAttempts - attempts.length}</p>
      {bestScore !== null && (
        <p>Best Score: {bestScore}</p>
      )}
      {status && <p className="status">{status}</p>}
      <div className="history">
        {attempts.map((a, idx) => (
          <div key={idx} className="attempt">
            {mode === 'easy' &&
              a.digits.map((d, i) => (
                <span key={i} className={`digit ${a.colors[i]}`}>{d}</span>
              ))}
            {mode === 'challenge' && (
              <span className="attempt-text">
                {a.digits.join('')} - {a.result.correct} doğru yerde,{' '}
                {a.result.misplaced} farklı yerde, {a.result.wrong} yok
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
    )
  }
