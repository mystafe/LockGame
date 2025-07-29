import { useState } from 'react'
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

export default function NonogramGame({ difficulty, onBack }) {
  const cfg = data[difficulty]
  const rowHints = cfg.solution.map(getHints)
  const colHints = cfg.solution[0].map((_, c) =>
    getHints(cfg.solution.map(row => row[c]))
  )
  const emptyBoard = () =>
    Array.from({ length: cfg.size }, () => Array(cfg.size).fill(0))
  const [board, setBoard] = useState(emptyBoard())
  const [finished, setFinished] = useState(false)

  const toggleCell = (r, c) => {
    if (finished) return
    const next = board.map(row => [...row])
    next[r][c] = (next[r][c] + 1) % 3
    setBoard(next)
  }

  const check = () => {
    for (let r = 0; r < cfg.size; r++) {
      for (let c = 0; c < cfg.size; c++) {
        const val = board[r][c] === 1 ? 1 : 0
        if (val !== cfg.solution[r][c]) {
          alert('Yanlis')
          return
        }
      }
    }
    setFinished(true)
  }

  const restart = () => {
    setBoard(emptyBoard())
    setFinished(false)
  }

  return (
    <div className="nonogram">
      <h1>
        Nonogram
        <Tooltip info="Satir ve sutun ipuclarina gore kareleri doldurun." tips={['Parcalar arasinda en az bir bosluk birakir','X ile bos kareleri isaretleyin','Hepsini doldurunca Kontrol butonunu kullanin']} />
      </h1>
      <table className="nonogram-board">
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
              {row.map((val, c) => (
                <td
                  key={c}
                  className={val === 1 ? 'filled' : val === 2 ? 'cross' : ''}
                  onClick={() => toggleCell(r, c)}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="nonogram-controls">
        {!finished && <button onClick={check}>Kontrol</button>}
        {finished && <button className="icon-btn" onClick={restart}>🔄</button>}
        <button className="icon-btn" onClick={onBack}>🏠</button>
      </div>
      {finished && <p className="status">Tebrikler!</p>}
    </div>
  )
}
