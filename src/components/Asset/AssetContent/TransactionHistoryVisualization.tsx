import React from 'react'
import { LinearGradient } from '@vx/gradient'

export default function TransactionHistoryVisualization() {
  return (
    <div>
      <svg width="100%" height={400}>
        <LinearGradient id="stroke" from="#ff00a5" to="#ffc500" />
        <rect fill="#c4c3cb" width="100%" height="100%" rx={14} />
      </svg>
    </div>
  )
}
