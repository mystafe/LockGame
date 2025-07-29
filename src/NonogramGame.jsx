import { useState, useEffect, useCallback } from 'react'
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

function generateSolution(size) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => (Math.random() > 0.5 ? 1 : 0))
  )
}

export default function NonogramGame({ difficulty, onBack, superMode }) {
  const cfg = data[difficulty]

  const createPuzzle = useCallback(() => {
    const solution = generateSolution(cfg.size)
    return {
      solution,
      rowHints: solution.map(getHints),
      colHints: solution[0].map((_, c) =>
        getHints(solution.map(row => row[c]))
      ),
    }
  }, [cfg.size])

  const [puzzle, setPuzzle] = useState(createPuzzle)
  const { solution, rowHints, colHints } = puzzle
  const emptyBoard = useCallback(
    () => Array.from({ length: cfg.size }, () => Array(cfg.size).fill(0)),
    [cfg.size]
  )
  const [board, setBoard] = useState(emptyBoard())
  const [finished, setFinished] = useState(false)
  const [hintsLeft, setHintsLeft] = useState(superMode ? Infinity : 3)
  const [errors, setErrors] = useState({})
  const [painting, setPainting] = useState(false)
  const [crossMode, setCrossMode] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [status, setStatus] = useState('')
  const [startTime, setStartTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [bestTime, setBestTime] = useState(() => {
    const s = localStorage.getItem(`nonogramBest-${difficulty}`)
    return s ? parseInt(s, 10) : null
  })
  const maxMistakes = 3

  useEffect(() => {
    if (finished) return
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [startTime, finished])

  useEffect(() => {
    const handleUp = () => setPainting(false)
    window.addEventListener('pointerup', handleUp)
    return () => window.removeEventListener('pointerup', handleUp)
  }, [])

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

  useEffect(() => {
    setPuzzle(createPuzzle())
    setBoard(emptyBoard())
    setFinished(false)
    setHintsLeft(superMode ? Infinity : 3)
    setErrors({})
    setCrossMode(false)
    setMistakes(0)
    setStatus('')
    setStartTime(Date.now())
    setElapsed(0)
  }, [difficulty, createPuzzle, emptyBoard, superMode])

  const applyValue = (r, c, val) => {
    const next = board.map(row => [...row])
    next[r][c] = val
    const e = { ...errors }
    if (
      (val === 1 && solution[r][c] !== 1) ||
      (val !== 1 && solution[r][c] === 1 && val !== 0)
    ) {
      e[`${r}-${c}`] = true
      const m = mistakes + 1
      setMistakes(m)
      if (m >= maxMistakes) {
        setFinished(true)
        setStatus('Kaybettiniz!')
      }
    } else {
      delete e[`${r}-${c}`]
    }
    setErrors(e)
    setBoard(next)
    const solved = next.every((row, rr) =>
      row.every((v, cc) => (v === 1 ? 1 : 0) === solution[rr][cc])
    )
    if (solved) {
      setFinished(true)
      setStatus('Tebrikler!')
    }
  }

  const toggleCell = (r, c) => {
    if (finished) return
    if (crossMode) {
      const val = board[r][c] === 2 ? 0 : 2
      applyValue(r, c, val)
    } else {
      const val = board[r][c] === 1 ? 0 : 1
      applyValue(r, c, val)
    }
  }

  const paintCell = (r, c) => {
    if (finished) return
    if (crossMode) {
      if (board[r][c] !== 2) applyValue(r, c, 2)
    } else {
      if (board[r][c] !== 1) applyValue(r, c, 1)
    }
  }


  const giveHint = () => {
    if (finished || (!superMode && hintsLeft <= 0)) return
    const cells = []
    for (let r = 0; r < cfg.size; r++) {
      for (let c = 0; c < cfg.size; c++) {
        if (solution[r][c] === 1 && board[r][c] !== 1) cells.push([r, c])
      }
    }
    if (cells.length === 0) return
    const [r, c] = cells[Math.floor(Math.random() * cells.length)]
    applyValue(r, c, 1)
    if (!superMode) setHintsLeft(hintsLeft - 1)
  }

  const handlePointerDown = (r, c, e) => {
    e.preventDefault()
    setPainting(true)
    paintCell(r, c)
  }

  const handlePointerMove = e => {
    if (!painting) return
    const cell = e.target.closest('td')
    if (!cell) return
    const r = parseInt(cell.dataset.r, 10)
    const c = parseInt(cell.dataset.c, 10)
    if (!Number.isNaN(r) && !Number.isNaN(c)) paintCell(r, c)
  }

  const handlePointerUp = () => setPainting(false)

  const restart = () => {
    setPuzzle(createPuzzle())
    setBoard(emptyBoard())
    setFinished(false)
    setHintsLeft(superMode ? Infinity : 3)
    setErrors({})
    setCrossMode(false)
    setMistakes(0)
    setStatus('')
    setStartTime(Date.now())
    setElapsed(0)
  }

  return (
    <div className="nonogram">
      <h1>
        Nonogram
        <Tooltip info="Satir ve sutun ipuclarina gore kareleri doldurun." tips={['Parcalar arasinda en az bir bosluk birakir','X ile bos kareleri isaretleyin','T\u00fcm kareler dogruysa otomatik tamamlanir']} />
      </h1>
      <div className="info-bar">
        <span className="errors">Hata: {mistakes}/{maxMistakes}</span>
        <span>{`${Math.floor(elapsed / 60)}`.padStart(2, '0')}:{`${elapsed % 60}`.padStart(2, '0')}</span>
        <span className="best">{bestTime !== null ? `${Math.floor(bestTime / 60)}`.padStart(2, '0') + ':' + `${bestTime % 60}`.padStart(2, '0') : '--:--'}</span>
      </div>
      <table
        className="nonogram-board"
        style={{ '--board-size': cfg.size }}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
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
                      data-r={r}
                      data-c={c}
                      className={cls}
                      onClick={() => toggleCell(r, c)}
                      onPointerDown={e => handlePointerDown(r, c, e)}
                    />
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="nonogram-controls">
        {!finished && (
          <button
            className={`icon-btn${crossMode ? ' active' : ''}`}
            onClick={() => setCrossMode(!crossMode)}
          >
            ❌
          </button>
        )}
        {!finished && (
          <button className="icon-btn hint-btn" onClick={giveHint} disabled={!superMode && hintsLeft <= 0}>
            💡 <span className="hint-count">({superMode ? '∞' : hintsLeft})</span>
          </button>
        )}
        {finished && <button className="icon-btn" onClick={restart}>🔄</button>}
        <button className="icon-btn" onClick={onBack}>🏠</button>
      </div>
      {finished && <p className="status">{status}</p>}
    </div>
  )
}
