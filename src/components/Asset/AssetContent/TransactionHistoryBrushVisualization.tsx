import React, { useRef, useState, useMemo } from 'react'
import { scaleTime, scaleLinear } from '@visx/scale'
import { Brush } from '@visx/brush'
import { Bounds } from '@visx/brush/lib/types'
import BaseBrush, {
  BaseBrushState,
  UpdateBrush
} from '@visx/brush/lib/BaseBrush'
import { PatternLines } from '@visx/pattern'
import { Group } from '@visx/group'
import { LinearGradient } from '@visx/gradient'
import { max, extent } from 'd3-array'
import { BrushHandleRenderProps } from '@visx/brush/src/BrushHandle'
import TransactionHistoryVisualization from './TransactionHistoryVisualization'
import { useAsset } from '@context/Asset'

// Initialize some variables
const brushMargin = { top: 10, bottom: 15, left: 50, right: 20 }
const chartSeparation = 30
const PATTERN_ID = 'brush_pattern'
const GRADIENT_ID = 'brush_gradient'
export const accentColor = '#f6acc8'
export const background = '#584153'
export const background2 = '#af8baf'
const selectedBrushStyle = {
  fill: `url(#${PATTERN_ID})`,
  stroke: 'white'
}

export type BrushProps = {
  width: number
  height: number
  events?: boolean
  margin?: { top: number; right: number; bottom: number; left: number }
  compact?: boolean
}

function BrushChart({
  width,
  height,
  events = false,
  margin = {
    top: 20,
    left: 50,
    bottom: 20,
    right: 50
  },
  compact = false
}: BrushProps) {
  const brushRef = useRef<BaseBrush | null>(null)
  const { asset } = useAsset()
  const txs: TransactionHistory = asset.transactionHistory
  const orders = asset.transactionHistory?.token?.orders
    ?.slice()
    .sort((a, b) => a.createdTimestamp - b.createdTimestamp)

  // const onBrushChange = (domain: Bounds | null) => {
  //   if (!domain) return
  //   const { x0, x1, y0, y1 } = domain
  //   const stockCopy = stock.filter((s) => {
  //     const x = getDate(s).getTime()
  //     const y = getStockValue(s)
  //     return x > x0 && x < x1 && y > y0 && y < y1
  //   })
  //   setFilteredStock(stockCopy)
  // }

  const innerHeight = height - margin.top - margin.bottom
  const topChartBottomMargin = compact
    ? chartSeparation / 2
    : chartSeparation + 10
  const topChartHeight = 0.8 * innerHeight - topChartBottomMargin
  const bottomChartHeight = innerHeight - topChartHeight - chartSeparation

  // bounds
  const xMax = Math.max(width - margin.left - margin.right, 0)
  const yMax = Math.max(topChartHeight, 0)
  const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0)
  const yBrushMax = Math.max(
    bottomChartHeight - brushMargin.top - brushMargin.bottom,
    0
  )

  // accessors
  const getDate = (d: Order) => new Date(d.createdTimestamp * 1000)
  const getY = (d: Order) => parseFloat(d.amount)

  // scales
  const brushDateScale = useMemo(
    () =>
      scaleTime<number>({
        range: [50, xBrushMax - 50],
        domain: [
          new Date(orders?.length && orders[0]?.createdTimestamp * 1000),
          new Date()
        ]
      }),
    [xBrushMax, orders]
  )
  const brushStockScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, 0],
        nice: true
      }),
    [yMax]
  )

  // const initialBrushPosition = useMemo(
  //   () => ({
  //     start: { x: brushDateScale(getDate(txs?.token?.orders[0])) },
  //     end: { x: brushDateScale(getDate(txs?.token?.orders[0])) }
  //     // end: {
  //     //   x: brushDateScale(getDate(orders?.length && orders[orders?.length - 1]))
  //     // }
  //   }),
  //   [brushDateScale, orders]
  // )

  //   // event handlers
  //   const handleClearClick = () => {
  //     if (brushRef?.current) {
  //       setFilteredStock(stock)
  //       brushRef.current.reset()
  //     }
  //   }

  //   const handleResetClick = () => {
  //     if (brushRef?.current) {
  //       const updater: UpdateBrush = (prevBrush) => {
  //         const newExtent = brushRef.current!.getExtent(
  //           initialBrushPosition.start,
  //           initialBrushPosition.end
  //         )

  //         const newState: BaseBrushState = {
  //           ...prevBrush,
  //           start: { y: newExtent.y0, x: newExtent.x0 },
  //           end: { y: newExtent.y1, x: newExtent.x1 },
  //           extent: newExtent
  //         }

  //         return newState
  //       }
  //       brushRef.current.updateBrush(updater)
  //     }
  //   }

  return (
    <Group>
      <svg width={width} height={height}>
        <LinearGradient id="stroke" from="#ff00a5" to="#999999" />
        <rect fill="url('#stroke')" width="100%" height="100%" rx={14} />
        <TransactionHistoryVisualization
          width={width / 2}
          height={height / 2}
          events={true}
        />
      </svg>
      <TransactionHistoryVisualization
        width={width}
        height={height}
        events={true}
      />
    </Group>
  )
}
// // We need to manually offset the handles for them to be rendered at the right position
// const BrushHandle = ({ x, height, isBrushActive }: BrushHandleRenderProps) => {
//   const pathWidth = 8
//   const pathHeight = 15
//   if (!isBrushActive) {
//     return null
//   }
//   return (
//     <Group left={x + pathWidth / 2} top={(height - pathHeight) / 2}>
//       <path
//         fill="#f2f2f2"
//         d="M -4.5 0.5 L 3.5 0.5 L 3.5 15.5 L -4.5 15.5 L -4.5 0.5 M -1.5 4 L -1.5 12 M 0.5 4 L 0.5 12"
//         stroke="#999999"
//         strokeWidth="1"
//         style={{ cursor: 'ew-resize' }}
//       />
//     </Group>
//   )
// }

export default BrushChart
