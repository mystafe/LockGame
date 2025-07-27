import { useState } from 'react'
import './Sudoku.css'

const data = {
  easy: {
    size: 5,
    hints: 3,
    puzzle: [
      [1,2,0,4,5],
      [4,0,1,0,3],
      [0,3,4,5,1],
      [5,1,0,3,0],
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
    hints: 3,
    puzzle: [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9]
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
    hints: 1,
    puzzle: [
      [0,3,0,0,7,0,0,0,0],
      [6,0,0,0,0,0,0,4,0],
      [0,0,0,3,0,0,5,0,0],
      [8,0,0,0,6,1,0,2,0],
      [0,0,6,8,0,3,7,0,0],
      [0,1,0,0,2,0,0,0,6],
      [0,0,1,5,0,0,0,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9]
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
  const cfg = data[difficulty]
  const [board, setBoard] = useState(cfg.puzzle.map(r => [...r]))
  const [hintsLeft, setHintsLeft] = useState(cfg.hints)
  const [mistakes, setMistakes] = useState(0)
  const [noteMode, setNoteMode] = useState(false)
  const [notes, setNotes] = useState(
    cfg.puzzle.map(row => row.map(() => []))
  )
  const maxMistakes = difficulty === 'hard' ? 3 : Infinity
  const finished = board.every((row, r) =>
    row.every((val, c) => val === cfg.solution[r][c])
  )

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

  const handleChange = (r, c, val) => {
    if (cfg.puzzle[r][c] !== 0 || finished) return
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
      return
    }
    const num = parseInt(val, 10)
    if (!num || num < 1 || num > cfg.size) return
    const newBoard = board.map(row => [...row])
    newBoard[r][c] = num
    if (num !== cfg.solution[r][c]) {
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
    const newNotes = notes.map(row => row.map(n => [...n]))
    newNotes[r][c] = []
    setNotes(newNotes)
    setBoard(newBoard)
  }

  const giveHint = () => {
    if (hintsLeft <= 0 || finished) return
    const empties = []
    for (let r = 0; r < cfg.size; r++) {
      for (let c = 0; c < cfg.size; c++) {
        if (board[r][c] === 0) empties.push([r, c])
      }
    }
    if (empties.length === 0) return
    const [r, c] = empties[Math.floor(Math.random() * empties.length)]
    const newBoard = board.map(row => [...row])
    newBoard[r][c] = cfg.solution[r][c]
    setBoard(newBoard)
    setHintsLeft(hintsLeft - 1)
  }

  const getAllowedDigits = (r, c) => {
    if (board[r][c] !== 0 || cfg.puzzle[r][c] !== 0) return []
    const digits = Array.from({ length: cfg.size }, (_, i) => i + 1)
    const used = new Set()
    for (let i = 0; i < cfg.size; i++) {
      used.add(board[r][i] || cfg.puzzle[r][i])
      used.add(board[i][c] || cfg.puzzle[i][c])
    }
    const block = cfg.size === 9 ? 3 : Math.floor(Math.sqrt(cfg.size))
    const br = Math.floor(r / block) * block
    const bc = Math.floor(c / block) * block
    for (let rr = br; rr < br + block; rr++) {
      for (let cc = bc; cc < bc + block; cc++) {
        used.add(board[rr][cc] || cfg.puzzle[rr][cc])
      }
    }
    return digits.filter(d => !used.has(d))
  }

  const autoCalculate = () => {
    const newNotes = notes.map((row, r) =>
      row.map((cellNotes, c) => {
        const allowed = getAllowedDigits(r, c)
        return cellNotes.filter(n => allowed.includes(n))
      })
    )
    setNotes(newNotes)
  }

  return (
    <div className="sudoku">
      <h1>Sudoku</h1>
      <table className={`board size${cfg.size}`}>
        <tbody>
          {board.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className={cfg.puzzle[r][c] !== 0 ? 'prefilled' : ''}>
                  {cfg.puzzle[r][c] !== 0 ? (
                    cfg.puzzle[r][c]
                  ) : noteMode ? (
                    <div className="note-cell">
                      {Array.from({ length: cfg.size }, (_, i) => i + 1).map(n => (
                        <span
                          key={n}
                          className={notes[r][c].includes(n) ? 'active' : ''}
                          onClick={() => toggleNote(r, c, n)}
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <>
                      <input
                        value={cell === 0 ? '' : cell}
                        onChange={e => handleChange(r, c, e.target.value)}
                      />
                      {cell === 0 && notes[r][c].length > 0 && (
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
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="controls">
        <button
          className="note-btn"
          onClick={() => setNoteMode(!noteMode)}
        >
          ✏️
        </button>
        <button onClick={autoCalculate}>Otomatik</button>
        <button onClick={giveHint} disabled={hintsLeft <= 0}>
          Ipucu ({hintsLeft})
        </button>
        <button onClick={onBack}>Ana Sayfa</button>
      </div>
      {difficulty === 'hard' && <p>Hata: {mistakes}/{maxMistakes}</p>}
      {finished && <p className="status">Tebrikler!</p>}
    </div>
  )
}
