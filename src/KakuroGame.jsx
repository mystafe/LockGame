import { useState, useEffect } from 'react'
import './Kakuro.css'
import Tooltip from './Tooltip.jsx'

export default function KakuroGame({ difficulty, onBack }) {
  const tricks = [
    'Ayni satirda tekrar etmeyin',
    'Kombinasyonlari ogrenin',
    'Min ve max degerleri hesaplayin',
  ].sort()

  const data = {
    easy: {
      size: 3,
      hints: 3,
      blocked: [[1, 1]],
      prefilled: [[0, 0], [2, 2]],
      solution: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
    },
    medium: {
      size: 4,
      hints: 3,
      blocked: [[1, 1], [2, 2]],
      prefilled: [[0, 0], [3, 3]],
      solution: [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 1, 2, 3],
        [4, 5, 6, 7],
      ],
    },
    hard: {
      size: 5,
      hints: 1,
      blocked: [
        [1, 1],
        [2, 3],
        [3, 2],
      ],
      prefilled: [[0, 0]],
      solution: [
        [1, 2, 3, 4, 5],
        [6, 7, 8, 9, 1],
        [2, 3, 4, 5, 6],
        [7, 8, 9, 1, 2],
        [3, 4, 5, 6, 7],
      ],
    },
  }

  const cfg = data[difficulty]
  const blockSet = new Set(cfg.blocked.map(([r, c]) => `${r}-${c}`))
  const prefillSet = new Set(cfg.prefilled.map(([r, c]) => `${r}-${c}`))

  const computeSums = (sol) => {
    const row = sol.map((row, r) =>
      row.reduce((acc, val, c) =>
        blockSet.has(`${r}-${c}`) ? acc : acc + val, 0)
    )
    const col = []
    for (let c = 0; c < cfg.size; c++) {
      let s = 0
      for (let r = 0; r < cfg.size; r++) {
        if (!blockSet.has(`${r}-${c}`)) s += sol[r][c]
      }
      col.push(s)
    }
    return { row, col }
  }

  const { row: rowSums, col: colSums } = computeSums(cfg.solution)

  const emptyBoard = () =>
    cfg.solution.map((row, r) =>
      row.map((val, c) => {
        const pos = `${r}-${c}`
        if (blockSet.has(pos)) return null
        if (prefillSet.has(pos)) return val.toString()
        return ''
      })
    )

  const [board, setBoard] = useState(emptyBoard())
  const [hintsLeft, setHintsLeft] = useState(cfg.hints)
  const [startTime, setStartTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [bestTime, setBestTime] = useState(() => {
    const s = localStorage.getItem(`kakuroBest-${difficulty}`)
    return s ? parseInt(s, 10) : null
  })

  const finished = board.every((row, r) =>
    row.every((v, c) =>
      blockSet.has(`${r}-${c}`) || parseInt(v, 10) === cfg.solution[r][c]
    )
  )

  const handleChange = (r, c, val) => {
    if (finished) return
    if (blockSet.has(`${r}-${c}`) || prefillSet.has(`${r}-${c}`)) return
    const n = val.replace(/\D/g, '')
    const next = board.map(row => [...row])
    next[r][c] = n
    setBoard(next)
  }

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
        localStorage.setItem(`kakuroBest-${difficulty}`, total.toString())
      }
    }
  }, [finished, bestTime, difficulty, startTime])

  const giveHint = () => {
    if (hintsLeft <= 0 || finished) return
    const cells = []
    for (let r = 0; r < cfg.size; r++) {
      for (let c = 0; c < cfg.size; c++) {
        const pos = `${r}-${c}`
        if (!blockSet.has(pos) && !prefillSet.has(pos) && board[r][c] === '') {
          cells.push([r, c])
        }
      }
    }
    if (cells.length === 0) return
    const [r, c] = cells[Math.floor(Math.random() * cells.length)]
    const next = board.map(row => [...row])
    next[r][c] = cfg.solution[r][c].toString()
    prefillSet.add(`${r}-${c}`)
    setBoard(next)
    setHintsLeft(hintsLeft - 1)
  }

  const restartGame = () => {
    setBoard(emptyBoard())
    setHintsLeft(cfg.hints)
    setStartTime(Date.now())
    setElapsed(0)
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  return (
    <div className="kakuro">
      <h1>
        Kakuro
        <Tooltip info="Satir ve sutun toplamina gore kareleri doldurun." tips={tricks} />
      </h1>
      <div className="info-bar">
        <span>{formatTime(elapsed)}</span>
        <span className="best">
          {bestTime !== null ? formatTime(bestTime) : '--:--'}
        </span>
      </div>
      <table className="kakuro-board">
        <thead>
          <tr>
            <th />
            {colSums.map((s, i) => (
              <th key={i}>{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {board.map((row, r) => (
            <tr key={r}>
              <th>{rowSums[r]}</th>
              {row.map((val, c) => {
                const pos = `${r}-${c}`
                if (blockSet.has(pos)) {
                  return <td key={c} className="block-cell" />
                }
                const pre = prefillSet.has(pos)
                return (
                  <td key={c}>
                    <input
                      value={val}
                      disabled={pre}
                      onChange={e => handleChange(r, c, e.target.value)}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {!finished && (
        <div className="controls">
          <button
            className="icon-btn"
            onClick={giveHint}
            disabled={hintsLeft <= 0}
          >
            💡 ({hintsLeft})
          </button>
          <button className="icon-btn" onClick={onBack}>🏠</button>
        </div>
      )}
      {finished && <p className="status">Tebrikler!</p>}
      {finished && (
        <div className="end-controls">
          <button className="icon-btn" onClick={restartGame}>🔄</button>
          <button className="icon-btn" onClick={onBack}>🏠</button>
        </div>
      )}
    </div>
  )
}
