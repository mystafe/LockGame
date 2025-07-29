import { useState, useEffect } from 'react'
import './Sudoku.css'
import Tooltip from './Tooltip.jsx'

const data = {
  easy: {
    size: 5,
    hints: 5,
    puzzle: [
      [1,2,0,4,5],
      [4,5,1,0,3],
      [2,3,4,5,1],
      [5,1,0,3,4],
      [3,0,5,1,2]
    ],
    solution: [
      [1,2,3,4,5],
      [4,5,1,2,3],
      [2,3,4,5,1],
      [5,1,2,3,4],
      [3,4,5,1,2]
    ]
  },
  medium: {
    size: 9,
    hints: 5,
    puzzle: [
      [5,3,4,6,7,0,0,0,2],
      [6,7,2,1,9,5,3,0,0],
      [1,0,0,3,0,0,5,0,0],
      [8,0,9,0,6,1,4,2,0],
      [4,0,6,8,0,3,7,0,1],
      [0,1,3,9,2,0,0,0,6],
      [9,0,1,5,0,0,0,8,0],
      [2,0,0,4,1,9,6,0,5],
      [3,0,0,2,8,0,0,7,9]
    ],
    solution: [
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [3,4,5,2,8,6,1,7,9]
    ]
  },
  hard: {
    size: 9,
    hints: 3,
    puzzle: [
      [5,3,0,6,7,0,0,0,0],
      [6,7,2,0,0,0,0,4,0],
      [1,0,0,3,0,0,5,0,0],
      [8,0,9,0,6,1,4,2,0],
      [4,0,6,8,0,3,7,0,1],
      [0,1,3,9,2,0,0,0,6],
      [9,0,1,5,0,0,0,8,0],
      [2,0,0,4,1,9,6,0,5],
      [3,0,0,2,8,0,0,7,9]
    ],
    solution: [
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [3,4,5,2,8,6,1,7,9]
    ]
  }
}

export default function SudokuGame({ difficulty, onBack }) {
  const tricks = [
    'Bos hucrelerde olasi rakamlari not alin',
    'Satir ve sutunlari tarayarak eksik rakamlari bulun',
    'Tek ihtimali olan hucrelere odaklanin',
  ].sort()
  const cfg = data[difficulty]
  const createRandomData = () => {
    const digits = Array.from({ length: cfg.size }, (_, i) => i + 1)
    const perm = digits.slice().sort(() => Math.random() - 0.5)
    const map = {}
    digits.forEach((d, i) => {
      map[d] = perm[i]
    })
    return {
      puzzle: cfg.puzzle.map(row => row.map(v => (v === 0 ? 0 : map[v]))),
      solution: cfg.solution.map(row => row.map(v => map[v])),
    }
  }
  const [rand, setRand] = useState(() => createRandomData())
  const [board, setBoard] = useState(rand.puzzle.map(r => [...r]))
  const [hintsLeft, setHintsLeft] = useState(cfg.hints)
  const [superMode, setSuperMode] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [noteMode, setNoteMode] = useState(false)
  const [notes, setNotes] = useState(
    rand.puzzle.map(row => row.map(() => []))
  )
  const [activeCell, setActiveCell] = useState(null)
  const [errors, setErrors] = useState({})
  const [headerClicks, setHeaderClicks] = useState(0)
  const [startTime, setStartTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const [bestTime, setBestTime] = useState(() => {
    const s = localStorage.getItem(`sudokuBestTime-${difficulty}`)
    return s ? parseInt(s, 10) : null
  })
  const maxMistakes = difficulty === 'hard' ? 3 : Infinity
  const finished = board.every((row, r) =>
    row.every((val, c) => val === rand.solution[r][c])
  )

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
        localStorage.setItem(`sudokuBestTime-${difficulty}`, total.toString())
      }
    }
  }, [finished, bestTime, difficulty, startTime])



  const toggleNote = (r, c, num) => {
    const newNotes = notes.map(row => row.map(n => [...n]))
    const cell = newNotes[r][c]
    if (cell.includes(num)) {
      newNotes[r][c] = cell.filter(n => n !== num)
    } else {
      newNotes[r][c] = [...cell, num].sort((a, b) => a - b)
    }
    setNotes(newNotes)
  }

  const removeNotesForNumber = (r, c, num, baseNotes) => {
    const updated = baseNotes.map(row => row.map(n => [...n]))
    for (let i = 0; i < cfg.size; i++) {
      if (i !== c) updated[r][i] = updated[r][i].filter(n => n !== num)
      if (i !== r) updated[i][c] = updated[i][c].filter(n => n !== num)
    }
    const block = cfg.size === 9 ? 3 : Math.floor(Math.sqrt(cfg.size))
    const br = Math.floor(r / block) * block
    const bc = Math.floor(c / block) * block
    for (let rr = br; rr < br + block; rr++) {
      for (let cc = bc; cc < bc + block; cc++) {
        if (rr !== r || cc !== c) {
          updated[rr][cc] = updated[rr][cc].filter(n => n !== num)
        }
      }
    }
    return updated
  }

  const focusNextCell = (r, c, b) => {
    let rr = r
    let cc = c
    for (let step = 0; step < cfg.size * cfg.size; step++) {
      cc++
      if (cc >= cfg.size) {
        cc = 0
        rr = (rr + 1) % cfg.size
      }
      if (rand.puzzle[rr][cc] === 0 && b[rr][cc] === 0) {
        const el = document.querySelector(`input[data-pos='${rr}-${cc}']`)
        if (el) el.focus()
        setActiveCell({ r: rr, c: cc })
        return
      }
    }
    setActiveCell(null)
  }

  const handleChange = (r, c, val) => {
    if (rand.puzzle[r][c] !== 0 || finished) return
    if (noteMode) {
      const num = parseInt(val, 10)
      if (!num || num < 1 || num > cfg.size) return
      toggleNote(r, c, num)
      return
    }
    if (val === '') {
      const newBoard = board.map(row => [...row])
      newBoard[r][c] = 0
      setBoard(newBoard)
      setErrors(prev => {
        const e = { ...prev }
        delete e[`${r}-${c}`]
        return e
      })
      focusNextCell(r, c, newBoard)
      return
    }
    const num = parseInt(val, 10)
    if (!num || num < 1 || num > cfg.size) return
    const newBoard = board.map(row => [...row])
    newBoard[r][c] = num
    setErrors(prev => {
      const e = { ...prev }
      if (num !== rand.solution[r][c]) {
        e[`${r}-${c}`] = true
      } else {
        delete e[`${r}-${c}`]
      }
      return e
    })
    if (num !== rand.solution[r][c]) {
      if (difficulty === 'hard') {
        const m = mistakes + 1
        setMistakes(m)
        if (m >= maxMistakes) {
          alert('Kaybettiniz!')
          onBack()
          return
        }
      }
    }
    let newNotes = notes.map(row => row.map(n => [...n]))
    newNotes[r][c] = []
    newNotes = removeNotesForNumber(r, c, num, newNotes)
    setNotes(newNotes)
    setBoard(newBoard)
    if (num === rand.solution[r][c]) {
      focusNextCell(r, c, newBoard)
    } else {
      const el = document.querySelector(`input[data-pos='${r}-${c}']`)
      if (el) el.focus()
      setActiveCell({ r, c })
    }
  }

  const giveHint = () => {
    if ((!superMode && hintsLeft <= 0) || finished) return
    const empties = []
    for (let r = 0; r < cfg.size; r++) {
      for (let c = 0; c < cfg.size; c++) {
        if (board[r][c] === 0) empties.push([r, c])
      }
    }
    if (empties.length === 0) return
    const [r, c] = empties[Math.floor(Math.random() * empties.length)]
    const newBoard = board.map(row => [...row])
    newBoard[r][c] = rand.solution[r][c]
    const newPuzzle = rand.puzzle.map(row => [...row])
    newPuzzle[r][c] = rand.solution[r][c]
    setRand({ ...rand, puzzle: newPuzzle })
    let newNotes = notes.map(row => row.map(n => [...n]))
    newNotes[r][c] = []
    newNotes = removeNotesForNumber(r, c, rand.solution[r][c], newNotes)
    setNotes(newNotes)
    setBoard(newBoard)
    setErrors(prev => {
      const e = { ...prev }
      delete e[`${r}-${c}`]
      return e
    })
    if (!superMode) setHintsLeft(hintsLeft - 1)
  }

  const giveFreeHint = () => {
    if (finished) return
    const empties = []
    for (let r = 0; r < cfg.size; r++) {
      for (let c = 0; c < cfg.size; c++) {
        if (board[r][c] === 0) empties.push([r, c])
      }
    }
    if (empties.length === 0) return
    const [r, c] = empties[Math.floor(Math.random() * empties.length)]
    const newBoard = board.map(row => [...row])
    newBoard[r][c] = rand.solution[r][c]
    const newPuzzle = rand.puzzle.map(row => [...row])
    newPuzzle[r][c] = rand.solution[r][c]
    setRand({ ...rand, puzzle: newPuzzle })
    let newNotes = notes.map(row => row.map(n => [...n]))
    newNotes[r][c] = []
    newNotes = removeNotesForNumber(r, c, rand.solution[r][c], newNotes)
    setNotes(newNotes)
    setBoard(newBoard)
    setErrors(prev => {
      const e = { ...prev }
      delete e[`${r}-${c}`]
      return e
    })
  }

  const getAllowedDigits = (r, c) => {
    if (board[r][c] !== 0 || rand.puzzle[r][c] !== 0) return []
    const digits = Array.from({ length: cfg.size }, (_, i) => i + 1)
    const used = new Set()
    for (let i = 0; i < cfg.size; i++) {
      used.add(board[r][i] || rand.puzzle[r][i])
      used.add(board[i][c] || rand.puzzle[i][c])
    }
    const block = cfg.size === 9 ? 3 : Math.floor(Math.sqrt(cfg.size))
    const br = Math.floor(r / block) * block
    const bc = Math.floor(c / block) * block
    for (let rr = br; rr < br + block; rr++) {
      for (let cc = bc; cc < bc + block; cc++) {
        used.add(board[rr][cc] || rand.puzzle[rr][cc])
      }
    }
    return digits.filter(d => !used.has(d))
  }

  const fixAllNotes = () => {
    const newNotes = notes.map((row, r) =>
      row.map((_, c) => getAllowedDigits(r, c))
    )
    setNotes(newNotes)
  }


  const handleHeaderClick = () => {
    const count = headerClicks + 1
    if (count >= 5) {
      if (!superMode) {
        setSuperMode(true)
        setHintsLeft(Infinity)
      }
      giveFreeHint()
      setHeaderClicks(0)
    } else {
      setHeaderClicks(count)
    }
  }

  const restartGame = () => {
    const newData = createRandomData()
    setRand(newData)
    setBoard(newData.puzzle.map(r => [...r]))
    setNotes(newData.puzzle.map(row => row.map(() => [])))
    setHintsLeft(superMode ? Infinity : cfg.hints)
    setMistakes(0)
    setErrors({})
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
    <div className={`sudoku${finished ? ' finished' : ''}`}>
      <h1 onClick={handleHeaderClick}>
        Sudoku
        <Tooltip info="Her satir, sutun ve blokta 1-9 arasi rakamlar tekrarsiz olmali." tips={tricks} />
      </h1>
      <div className="info-bar">
        <span className="errors">Hata: {mistakes}{
          difficulty === 'hard' ? `/${maxMistakes}` : ''
        }</span>
        <span>{formatTime(elapsed)}</span>
        <span className="best">
          {bestTime !== null ? formatTime(bestTime) : '--:--'}
        </span>
      </div>
      <table className={`board size${cfg.size}`}>
        <tbody>
          {board.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => {
                const block = cfg.size === 9
                  ? `block${Math.floor(r / 3) * 3 + Math.floor(c / 3)}`
                  : ''
                const wrong = errors[`${r}-${c}`]
                const cellClass = [
                  rand.puzzle[r][c] !== 0 ? 'prefilled' : '',
                  block,
                  activeCell && activeCell.r === r && activeCell.c === c ? 'active-cell' : '',
                  wrong ? 'wrong' : ''
                ].join(' ').trim()
                return (
                  <td key={c} className={cellClass}>
                    <input
                      data-pos={`${r}-${c}`}
                      value={cell === 0 ? '' : cell}
                      readOnly
                      disabled={rand.puzzle[r][c] !== 0}
                      inputMode="none"
                      onFocus={() => setActiveCell({ r, c })}
                      onBlur={e => {
                        const next = e.relatedTarget
                        if (!next || !next.closest('.digit-pad')) {
                          setActiveCell(null)
                        }
                      }}
                      onKeyDown={e => {
                        const n = parseInt(e.key, 10)
                        if (!isNaN(n)) {
                          handleChange(r, c, n)
                        } else if (e.key === 'Backspace' || e.key === 'Delete') {
                          handleChange(r, c, '')
                        }
                      }}
                    />
                    {notes[r][c].length > 0 && (
                      <div className="note-cell readonly">
                        {Array.from({ length: cfg.size }, (_, i) => i + 1).map(n => (
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
            className="icon-btn"
            onClick={giveHint}
            disabled={!superMode && hintsLeft <= 0}
          >
            💡 <span className="hint-count">({superMode ? '∞' : hintsLeft})</span>
          </button>
          <button className="icon-btn" onClick={onBack}>🏠</button>
        </div>
      )}
      {!finished && (
        <div className="digit-pad">
          {(() => {
            const allowed = activeCell ? getAllowedDigits(activeCell.r, activeCell.c) : []
            return Array.from({ length: cfg.size }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onPointerDown={e => e.preventDefault()}
                disabled={!activeCell || !allowed.includes(n)}
                onClick={() =>
                  activeCell && handleChange(activeCell.r, activeCell.c, n)
                }
              >
                {n}
              </button>
            ))
          })()}
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
