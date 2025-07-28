import { useState } from 'react'
import './Kakuro.css'
import Tooltip from './Tooltip.jsx'

export default function KakuroGame({ onBack }) {
  const tricks = [
    'Ayni satirda tekrar etmeyin',
    'Kombinasyonlari ogrenin',
    'Min ve max degerleri hesaplayin',
  ].sort()
  const size = 3
  const rowSums = [6, 15, 24]
  const colSums = [12, 15, 18]
  const solution = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ]
  const emptyBoard = () => Array.from({ length: size }, () => Array(size).fill(''))
  const [board, setBoard] = useState(emptyBoard())

  const finished = board.every((row, r) =>
    row.every((v, c) => parseInt(v, 10) === solution[r][c])
  )

  const handleChange = (r, c, val) => {
    if (finished) return
    const n = val.replace(/\D/g, '')
    const next = board.map(row => [...row])
    next[r][c] = n
    setBoard(next)
  }

  const restartGame = () => {
    setBoard(emptyBoard())
  }

  return (
    <div className="kakuro">
      <h1>
        Kakuro
        <Tooltip content="Satir ve sutun toplamina gore kareleri doldurun.">
          <span> ℹ️</span>
        </Tooltip>
        <Tooltip
          content={(
            <select>
              {tricks.map((t, i) => (
                <option key={i}>{t}</option>
              ))}
            </select>
          )}
        >
          <button className="icon-btn">Devamı</button>
        </Tooltip>
      </h1>
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
              {row.map((val, c) => (
                <td key={c}>
                  <input
                    value={val}
                    onChange={e => handleChange(r, c, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {finished && <p className="status">Tebrikler!</p>}
      <div className="end-controls">
        <button className="icon-btn" onClick={restartGame}>🔄</button>
        <button className="icon-btn" onClick={onBack}>🏠</button>
      </div>
    </div>
  )
}
