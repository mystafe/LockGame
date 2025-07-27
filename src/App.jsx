import { useState, useEffect } from 'react'
import './App.css'
import SudokuGame from './SudokuGame.jsx'
import pkg from '../package.json'

const version = pkg.version
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

  const [codeLength, setCodeLength] = useState(4)
  const [maxAttempts, setMaxAttempts] = useState(10)
  const [secret, setSecret] = useState([])
  const [guess, setGuess] = useState([])
  const [attempts, setAttempts] = useState([])
  const [status, setStatus] = useState('')

  const finished = status !== ''

  const startGame = () => {
    if (gameType === 'lock') {
      const lengths = { easy: 4, medium: 5, hard: 6 }
      const attemptsMap = { easy: 10, medium: 8, hard: 6 }
      const len = lengths[difficulty]
      const att = attemptsMap[difficulty]
      setCodeLength(len)
      setMaxAttempts(att)
      setSecret(generateSecret(len))
      setGuess(Array(len).fill(0))
      setAttempts([])
      setStatus('')
      setScreen('play')
    } else {
      setScreen('sudoku')
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

  const handleSubmit = () => {
    if (finished) return
    if (mode === 'easy') {
      const colors = evaluateColors(guess)
      const newAttempt = { digits: [...guess], colors }
      const newAttempts = [...attempts, newAttempt]
      setAttempts(newAttempts)
      if (colors.every((c) => c === 'green')) {
        setStatus('Tebrikler! Şifre doğru.')
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
      } else if (newAttempts.length >= maxAttempts) {
        setStatus('Deneme hakkınız bitti. Şifre: ' + secret.join(''))
      }
    }
  }

  const handleRestart = () => {
    setScreen('start')
  }

  if (screen === 'start') {
    return (
      <div className="app">
        <h1>Oyun Seçimi</h1>
        <div className="options">
          <div>
            <label>Oyun: </label>
            <select value={gameType} onChange={(e) => setGameType(e.target.value)}>
              <option value="sudoku">Sudoku</option>
              <option value="lock">Lock Game</option>
            </select>
          </div>
          {gameType === 'lock' && (
            <>
              <div>
                <label>Mod: </label>
                <select value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="easy">Lock Game Easy</option>
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
          <button onClick={startGame}>Başla</button>
        </div>
        <footer className="footer">Developed by Mustafa Evleksiz v{version}</footer>
      </div>
    )
  }

  if (screen === 'sudoku') {
    return (
      <div className="app">
        <SudokuGame difficulty={sudokuDifficulty} version={version} onBack={handleRestart} />
      </div>
    )
  }

    return (
      <div className="app">
        <h1>{mode === 'easy' ? 'Lock Game Easy' : 'Lock Game Challenge'}</h1>
        <div className="wheels">
        {guess.map((d, i) => (
          <DigitWheel
            key={i}
            value={d}
            onChange={(val) => handleChange(i, val)}
            disabled={finished}
          />
        ))}
      </div>
      {!finished && <button onClick={handleSubmit}>Tahmin Et</button>}
      {finished && <button onClick={handleRestart}>Yeniden Başlat</button>}
      <p>Kalan Hak: {maxAttempts - attempts.length}</p>
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
      <footer className="footer">Developed by Mustafa Evleksiz v{version}</footer>
    </div>
    )
  }
