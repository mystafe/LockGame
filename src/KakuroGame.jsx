import { useState, useEffect, useMemo } from 'react'
import './Kakuro.css'
import Tooltip from './Tooltip.jsx'

const isMobile = /Mobi|Android/i.test(navigator.userAgent)

export default function KakuroGame({ difficulty, onBack, superMode }) {
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
  const [hintsLeft, setHintsLeft] = useState(superMode ? Infinity : cfg.hints)
  // superMode prop controls unlimited hints
  const [noteMode, setNoteMode] = useState(false)
  const [notes, setNotes] = useState(
    solution.map(row => row.map(() => []))
  )
  const [activeCell, setActiveCell] = useState(null)
  const [errors, setErrors] = useState({})
  const [mistakes, setMistakes] = useState(0)
  const maxMistakes = 3
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
      setBoard(prev => prev.map(row => [...row]))
      return
    }

    if (key === 'Backspace' || key === 'Delete' || key === '') {
      const next = board.map(row => [...row])
      next[r][c] = ''
      let newNotes = notes.map(row => row.map(n => [...n]))
      newNotes[r][c] = []
      setNotes(newNotes)
      setErrors(prev => {
        const e = { ...prev }
        delete e[`${r}-${c}`]
        return e
      })
      setBoard(next)
      focusNextCell(r, c, next)
      return
    }

    const num = parseInt(key, 10)
    if (!num || num < 1 || num > 9) return
    const next = board.map(row => [...row])
    next[r][c] = num.toString()
    let newNotes = notes.map(row => row.map(n => [...n]))
    newNotes[r][c] = []
    newNotes = removeNotesForNumber(r, c, num, newNotes)
    setNotes(newNotes)
    setBoard(next)
    setErrors(prev => {
      const e = { ...prev }
      if (num !== solution[r][c]) e[`${r}-${c}`] = true
      else delete e[`${r}-${c}`]
      return e
    })
    if (num !== solution[r][c]) {
      const m = mistakes + 1
      setMistakes(m)
      if (m >= maxMistakes) {
        alert('Kaybettiniz!')
        onBack()
        return
      }
    }
    focusNextCell(r, c, next)
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
    setErrors({})
    setMistakes(0)
    setActiveCell(null)
    setStartTime(Date.now())
    setElapsed(0)
  }

  const getAllowedDigits = (r, c, b = board) => {
    if (b[r][c] !== '') return []
    const used = new Set()
    for (let i = 0; i < cfg.size; i++) {
      if (b[r][i] !== '') used.add(parseInt(b[r][i], 10))
      if (b[i][c] !== '') used.add(parseInt(b[i][c], 10))
    }
    return Array.from({ length: 9 }, (_, i) => i + 1).filter(d => !used.has(d))
  }

  const removeNotesForNumber = (r, c, num, baseNotes) => {
    const updated = baseNotes.map(row => row.map(n => [...n]))
    for (let i = 0; i < cfg.size; i++) {
      if (i !== c) updated[r][i] = updated[r][i].filter(n => n !== num)
      if (i !== r) updated[i][c] = updated[i][c].filter(n => n !== num)
    }
    return updated
  }

  const focusNextCell = (r, c, b = board) => {
    let rr = r
    let cc = c
    for (let step = 0; step < cfg.size * cfg.size; step++) {
      cc++
      if (cc >= cfg.size) {
        cc = 0
        rr = (rr + 1) % cfg.size
      }
      const pos = `${rr}-${cc}`
      if (!blockSet.has(pos) && !prefillSet.has(pos) && b[rr][cc] === '') {
        const el = document.querySelector(`input[data-pos='${rr}-${cc}']`)
        if (el) el.focus()
        setActiveCell({ r: rr, c: cc })
        return
      }
    }
    setActiveCell(null)
  }

  const fixAllNotes = () => {
    const newNotes = notes.map((row, r) =>
      row.map((_, c) => getAllowedDigits(r, c))
    )
    setNotes(newNotes)
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
        <span className="errors">Hata: {mistakes}/{maxMistakes}</span>
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
                const wrong = errors[pos]
                const cellClass = [
                  wrong ? 'wrong' : '',
                  activeCell && activeCell.r === r && activeCell.c === c ? 'active-cell' : ''
                ].join(' ').trim()
                return (
                  <td key={c} className={cellClass}>
                    <input
                      data-pos={`${r}-${c}`}
                      value={val}
                      readOnly
                      inputMode={isMobile ? 'none' : undefined}
                      disabled={pre}
                      onFocus={() => setActiveCell({ r, c })}
                      onBlur={e => {
                        const next = e.relatedTarget
                        if (!next || !next.closest('.digit-pad')) {
                          setActiveCell(null)
                        }
                      }}
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
          {superMode && (
            <button className="icon-btn" onClick={fixAllNotes}>📝</button>
          )}
          <button
            className="icon-btn hint-btn"
            onClick={giveHint}
            disabled={!superMode && hintsLeft <= 0}
          >
            💡 <span className="hint-count">({superMode ? '∞' : hintsLeft})</span>
          </button>
          <button className="icon-btn" onClick={onBack}>🏠</button>
        </div>
      )}
      {!finished && isMobile && (
        <div className="digit-pad">
          {Array.from({ length: 9 }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onPointerDown={e => e.preventDefault()}
              disabled={!activeCell}
              onClick={() =>
                activeCell && handleChange(activeCell.r, activeCell.c, n)
              }
            >
              {n}
            </button>
          ))}
          <button
            onPointerDown={e => e.preventDefault()}
            disabled={!activeCell}
            onClick={() => activeCell && handleChange(activeCell.r, activeCell.c, '')}
          >
            {'<'}
          </button>
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
