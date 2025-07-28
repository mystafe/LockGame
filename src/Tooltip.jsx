import React from 'react'
import './Tooltip.css'

export default function Tooltip({ content, children }) {
  return (
    <span className="tooltip">
      {children}
      <span className="tooltip-text">{content}</span>
    </span>
  )
}
