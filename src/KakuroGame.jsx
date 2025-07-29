import { useState, useEffect, useMemo } from 'react'
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
  const blockSet = useMemo(
    () => new Set(cfg.blocked.map(([r, c]) => `${r}-${c}`)),
    [cfg]
  )
  const createPrefillSet = () =>
    new Set(cfg.prefilled.map(([r, c]) => `${r}-${c}`))
  const [prefillSet, setPrefillSet] = useState(createPrefillSet())

  const createRandomSolution = () => {
    const digits = Array.from({ length: 9 }, (_, i) => i + 1)
    const perm = digits.slice().sort(() => Math.random() - 0.5)
    const map = {}
    digits.forEach((d, i) => {
      map[d] = perm[i]
    })
    return cfg.solution.map(row => row.map(v => map[v]))
  }
  const [solution, setSolution] = useState(createRandomSolution())

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

  const [rowSums, setRowSums] = useState(() => computeSums(solution).row)
  const [colSums, setColSums] = useState(() => computeSums(solution).col)

  const emptyBoard = () =>
    solution.map((row, r) =>
      row.map((val, c) => {
        const pos = `${r}-${c}`
        if (blockSet.has(pos)) return null
        if (prefillSet.has(pos)) return val.toString()
        return ''
      })
    )

  const [board, setBoard] = useState(emptyBoard())
  const [hintsLeft, setHintsLeft] = useState(cfg.hints)
  const [superMode, setSuperMode] = useState(false)
  const [headerClicks, setHeaderClicks] = useState(0)
  const [noteMode, setNoteMode] = useState(false)
  const [notes, setNotes] = useState(
    solution.map(row => row.map(() => []))
  )
  const [startTime, setStartTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [bestTime, setBestTime] = useState(() => {
    const s = localStorage.getItem(`kakuroBest-${difficulty}`)
    return s ? parseInt(s, 10) : null
  })

  const finished = board.every((row, r) =>
    row.every((v, c) =>
      blockSet.has(`${r}-${c}`) || parseInt(v, 10) === solution[r][c]
    )
  )

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

  const handleChange = (r, c, key) => {
    if (finished) return
    if (blockSet.has(`${r}-${c}`) || prefillSet.has(`${r}-${c}`)) return
    if (noteMode) {
      const num = parseInt(key, 10)
      if (!num || num < 1 || num > 9) return
      const newNotes = notes.map(row => row.map(n => [...n]))
      const cell = newNotes[r][c]
      if (cell.includes(num)) {
        newNotes[r][c] = cell.filter(x => x !== num)
      } else {
        newNotes[r][c] = [...cell, num].sort((a, b) => a - b)
      }
      setNotes(newNotes)
      // force re-render to reset input value
      setBoard(prev => prev.map(row => [...row]))
    } else if (key === 'Backspace' || key === 'Delete') {
      const next = board.map(row => [...row])
      next[r][c] = ''
      const newNotes = notes.map(row => row.map(n => [...n]))
      newNotes[r][c] = []
      setNotes(newNotes)
      setBoard(next)
    } else {
      const num = parseInt(key, 10)
      if (!num || num < 1 || num > 9) return
      const next = board.map(row => [...row])
      next[r][c] = num.toString()
      const newNotes = notes.map(row => row.map(n => [...n]))
      newNotes[r][c] = []
      setNotes(newNotes)
      setBoard(next)
    }
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
    if ((!superMode && hintsLeft <= 0) || finished) return
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
    next[r][c] = solution[r][c].toString()
    const newPrefill = new Set(prefillSet)
    newPrefill.add(`${r}-${c}`)
    setPrefillSet(newPrefill)
    const newNotes = notes.map(row => row.map(n => [...n]))
    newNotes[r][c] = []
    setNotes(newNotes)
    setBoard(next)
    if (!superMode) setHintsLeft(hintsLeft - 1)
  }

  const restartGame = () => {
    const newSol = createRandomSolution()
    setSolution(newSol)
    const sums = computeSums(newSol)
    setRowSums(sums.row)
    setColSums(sums.col)
    const pf = createPrefillSet()
    setPrefillSet(pf)
    setBoard(
      newSol.map((row, r) =>
        row.map((val, c) => {
          const pos = `${r}-${c}`
          if (blockSet.has(pos)) return null
          if (pf.has(pos)) return val.toString()
          return ''
        })
      )
    )
    setNotes(newSol.map(row => row.map(() => [])))
    setHintsLeft(superMode ? Infinity : cfg.hints)
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
      <h1 onClick={handleHeaderClick}>
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
                      onKeyDown={e => handleChange(r, c, e.key)}
                    />
                    {val === '' && notes[r][c].length > 0 && (
                      <div className="note-cell readonly">
                        {Array.from({ length: 9 }, (_, i) => i + 1).map(n => (
                          <span
                            key={n}
                            className={notes[r][c].includes(n) ? 'active' : ''}
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    )}
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
            className={`icon-btn note-btn${noteMode ? ' active' : ' inactive'}`}
            onClick={() => setNoteMode(!noteMode)}
          >
            ✏️
          </button>
          <button
            className="icon-btn"
            onClick={giveHint}
            disabled={!superMode && hintsLeft <= 0}
          >
            💡 ({superMode ? '∞' : hintsLeft})
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
