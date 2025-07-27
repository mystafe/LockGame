import { useState } from 'react'
import './App.css'

function generateSecret(length) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10))
}

function DigitWheel({ value, onChange, disabled }) {
  const inc = () => !disabled && onChange((value + 1) % 10)
  const dec = () => !disabled && onChange((value + 9) % 10)
  return (
    <div className="wheel">
      <button onClick={inc} disabled={disabled}>▲</button>
      <div className="digit-display">{value}</div>
      <button onClick={dec} disabled={disabled}>▼</button>
    </div>
  )
}

export default function App() {
  const codeLength = 5
  const maxAttempts = 10
  const [secret, setSecret] = useState(() => generateSecret(codeLength))
  const [guess, setGuess] = useState(Array(codeLength).fill(0))
  const [attempts, setAttempts] = useState([])
  const [status, setStatus] = useState('')

  const finished = status !== ''

  const handleChange = (index, val) => {
    const g = [...guess]
    g[index] = val
    setGuess(g)
  }

  const evaluate = (g) => {
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

  const handleSubmit = () => {
    if (finished) return
    const colors = evaluate(guess)
    const newAttempt = { digits: [...guess], colors }
    const newAttempts = [...attempts, newAttempt]
    setAttempts(newAttempts)
    if (colors.every((c) => c === 'green')) {
      setStatus('Tebrikler! Şifre doğru.')
    } else if (newAttempts.length >= maxAttempts) {
      setStatus('Deneme hakkınız bitti. Şifre: ' + secret.join(''))
    }
  }

  const handleRestart = () => {
    setSecret(generateSecret(codeLength))
    setGuess(Array(codeLength).fill(0))
    setAttempts([])
    setStatus('')
  }

  return (
    <div className="app">
      <h1>Kilit Tahmin Oyunu</h1>
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
            {a.digits.map((d, i) => (
              <span key={i} className={`digit ${a.colors[i]}`}>{d}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
