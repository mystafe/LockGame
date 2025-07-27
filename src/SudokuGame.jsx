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
  const maxMistakes = difficulty === 'hard' ? 3 : Infinity
  const finished = board.every((row, r) =>
    row.every((val, c) => val === cfg.solution[r][c])
  )

  const handleChange = (r, c, val) => {
    if (cfg.puzzle[r][c] !== 0 || finished) return
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

  return (
    <div className="sudoku">
      <h1>Sudoku</h1>
      <table className="board">
        <tbody>
          {board.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c} className={cfg.puzzle[r][c] !== 0 ? 'prefilled' : ''}>
                  {cfg.puzzle[r][c] !== 0 ? (
                    cfg.puzzle[r][c]
                  ) : (
                    <input
                      value={cell === 0 ? '' : cell}
                      onChange={e => handleChange(r, c, e.target.value)}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="controls">
        <button onClick={giveHint} disabled={hintsLeft <= 0}>Ipucu ({hintsLeft})</button>
        <button onClick={onBack}>Ana Sayfa</button>
      </div>
      {difficulty === 'hard' && <p>Hata: {mistakes}/{maxMistakes}</p>}
      {finished && <p className="status">Tebrikler!</p>}
    </div>
  )
}
