import { useState, useEffect } from 'react'
import './Nonogram.css'
import Tooltip from './Tooltip.jsx'

const data = {
  easy: {
    size: 5,
    solution: [
      [0,1,1,0,0],
      [1,0,1,0,1],
      [1,1,1,1,1],
      [0,1,0,1,0],
      [1,0,0,0,1],
    ],
  },
  medium: {
    size: 10,
    solution: [
      [0,0,1,1,0,0,1,1,0,0],
      [1,0,0,0,1,1,0,0,0,1],
      [1,0,1,0,0,0,0,1,0,1],
      [1,0,1,0,0,0,0,1,0,1],
      [1,0,0,0,1,1,0,0,0,1],
      [0,0,1,1,0,0,1,1,0,0],
      [1,1,0,0,1,1,0,0,1,1],
      [0,0,1,1,0,0,1,1,0,0],
      [1,1,0,0,1,1,0,0,1,1],
      [0,0,1,1,0,0,1,1,0,0],
    ],
  },
  hard: {
    size: 15,
    solution: [
      [1,0,0,0,0,0,1,1,1,0,0,0,0,0,1],
      [0,1,0,0,0,0,1,1,1,0,0,0,0,1,0],
      [0,0,1,0,0,0,1,1,1,0,0,0,1,0,0],
      [0,0,0,1,0,0,1,1,1,0,0,1,0,0,0],
      [0,0,0,0,1,0,1,1,1,0,1,0,0,0,0],
      [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0],
      [0,0,0,0,1,0,1,1,1,0,1,0,0,0,0],
      [0,0,0,1,0,0,1,1,1,0,0,1,0,0,0],
      [0,0,1,0,0,0,1,1,1,0,0,0,1,0,0],
      [0,1,0,0,0,0,1,1,1,0,0,0,0,1,0],
      [1,0,0,0,0,0,1,1,1,0,0,0,0,0,1],
    ],
  },
}

function getHints(line) {
  const res = []
  let count = 0
  for (const v of line) {
    if (v) count++
    else if (count) {
      res.push(count)
      count = 0
    }
  }
  if (count) res.push(count)
  if (res.length === 0) res.push(0)
  return res
}

export default function NonogramGame({ difficulty, onBack, superMode }) {
  const cfg = data[difficulty]
  const rowHints = cfg.solution.map(getHints)
  const colHints = cfg.solution[0].map((_, c) =>
    getHints(cfg.solution.map(row => row[c]))
  )
  const emptyBoard = () =>
    Array.from({ length: cfg.size }, () => Array(cfg.size).fill(0))
  const [board, setBoard] = useState(emptyBoard())
  const [finished, setFinished] = useState(false)
  const [hintsLeft, setHintsLeft] = useState(superMode ? Infinity : 3)
  const [errors, setErrors] = useState({})
  const [painting, setPainting] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [bestTime, setBestTime] = useState(() => {
    const s = localStorage.getItem(`nonogramBest-${difficulty}`)
    return s ? parseInt(s, 10) : null
  })
  const required = cfg.solution.flat().filter(v => v === 1).length

  useEffect(() => {
    if (finished) return
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [startTime, finished])

  useEffect(() => {
    if (finished) {
      const total = Math.floor((Date.now() - startTime) / 1000)
      setElapsed(total)
      if (bestTime === null || total < bestTime) {
        setBestTime(total)
        localStorage.setItem(`nonogramBest-${difficulty}`, total.toString())
      }
    }
  }, [finished, bestTime, difficulty, startTime])

  const applyValue = (r, c, val) => {
    const next = board.map(row => [...row])
    next[r][c] = val
    const e = { ...errors }
    if ((val === 1 && cfg.solution[r][c] !== 1) || (val !== 1 && cfg.solution[r][c] === 1 && val !== 0)) {
      e[`${r}-${c}`] = true
    } else {
      delete e[`${r}-${c}`]
    }
    setErrors(e)
    setBoard(next)
    const filled = next.flat().filter(v => v === 1).length
    if (filled === required && Object.keys(e).length === 0 && next.every((row, rr) => row.every((v, cc) => (v === 1 ? 1 : 0) === cfg.solution[rr][cc]))) {
      setFinished(true)
    }
  }

  const toggleCell = (r, c) => {
    if (finished) return
    const val = (board[r][c] + 1) % 3
    applyValue(r, c, val)
  }

  const paintCell = (r, c) => {
    if (finished) return
    applyValue(r, c, 1)
  }

  const check = () => {
    const errs = {}
    for (let r = 0; r < cfg.size; r++) {
      for (let c = 0; c < cfg.size; c++) {
        const val = board[r][c] === 1 ? 1 : 0
        if (val !== cfg.solution[r][c]) {
          errs[`${r}-${c}`] = true
        }
      }
    }
    setErrors(errs)
    if (Object.keys(errs).length === 0) setFinished(true)
  }

  const giveHint = () => {
    if (finished || (!superMode && hintsLeft <= 0)) return
    const cells = []
    for (let r = 0; r < cfg.size; r++) {
      for (let c = 0; c < cfg.size; c++) {
        if (cfg.solution[r][c] === 1 && board[r][c] !== 1) cells.push([r, c])
      }
    }
    if (cells.length === 0) return
    const [r, c] = cells[Math.floor(Math.random() * cells.length)]
    applyValue(r, c, 1)
    if (!superMode) setHintsLeft(hintsLeft - 1)
  }

  const handlePointerDown = (r, c) => {
    setPainting(true)
    paintCell(r, c)
  }

  const handlePointerEnter = (r, c) => {
    if (painting) paintCell(r, c)
  }

  const handlePointerUp = () => setPainting(false)

  const restart = () => {
    setBoard(emptyBoard())
    setFinished(false)
    setHintsLeft(superMode ? Infinity : 3)
    setErrors({})
    setStartTime(Date.now())
    setElapsed(0)
  }

  return (
    <div className="nonogram">
      <h1>
        Nonogram
        <Tooltip info="Satir ve sutun ipuclarina gore kareleri doldurun." tips={['Parcalar arasinda en az bir bosluk birakir','X ile bos kareleri isaretleyin','Hepsini doldurunca Kontrol butonunu kullanin']} />
      </h1>
      <div className="info-bar">
        <span>{`${Math.floor(elapsed / 60)}`.padStart(2, '0')}:{`${elapsed % 60}`.padStart(2, '0')}</span>
        <span className="best">{bestTime !== null ? `${Math.floor(bestTime / 60)}`.padStart(2, '0') + ':' + `${bestTime % 60}`.padStart(2, '0') : '--:--'}</span>
      </div>
      <table className="nonogram-board" onPointerUp={handlePointerUp}>
        <thead>
          <tr>
            <th></th>
            {colHints.map((col, i) => (
              <th key={i} className="col-hints">
                {col.map((n, j) => (
                  <div key={j}>{n}</div>
                ))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {board.map((row, r) => (
            <tr key={r}>
              <th className="row-hints">
                {rowHints[r].join(' ')}
              </th>
              {row.map((val, c) => {
                const cls = [
                  val === 1 ? 'filled' : val === 2 ? 'cross' : '',
                  errors[`${r}-${c}`] ? 'error' : ''
                ].join(' ').trim()
                return (
                  <td
                    key={c}
                    className={cls}
                    onClick={() => toggleCell(r, c)}
                    onPointerDown={() => handlePointerDown(r, c)}
                    onPointerEnter={() => handlePointerEnter(r, c)}
                  />
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="nonogram-controls">
        {!finished && (
          <button className="icon-btn hint-btn" onClick={giveHint} disabled={!superMode && hintsLeft <= 0}>
            💡 <span className="hint-count">({superMode ? '∞' : hintsLeft})</span>
          </button>
        )}
        {!finished && <button onClick={check}>Kontrol</button>}
        {finished && <button className="icon-btn" onClick={restart}>🔄</button>}
        <button className="icon-btn" onClick={onBack}>🏠</button>
      </div>
      {finished && <p className="status">Tebrikler!</p>}
    </div>
  )
}
