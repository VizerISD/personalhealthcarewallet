import React from 'react'
import { LinearGradient } from '@vx/gradient'
import { scaleBand, scaleLinear } from '@visx/scale'
import { Bar } from '@visx/shape'
import { Group } from '@visx/group'
import { useAsset } from '@context/Asset'
import { AxisBottom, AxisLeft, AxisTop } from '@visx/axis'

const verticalMargin = 120

function payerIDMap(txs: TransactionHistory) {
  const ids = new Map<string, number>()
  const orders = txs?.token?.orders
  for (let i = 0; i < orders?.length; i++) {
    if (ids.has(orders[i].payer?.id)) {
      ids.set(orders[i].payer?.id, ids.get(orders[i].payer?.id) + 1)
    } else {
      ids.set(orders[i].payer?.id, 1)
    }
  }
  return new Map<string, number>([...ids.entries()].sort((a, b) => b[1] - a[1]))
}

export type BarsProps = {
  width: number
  height: number
  events?: boolean
}

const axisLeftTickLabelProps = {
  dx: '-0.25em',
  dy: '0.25em',
  fontFamily: 'Arial',
  fontSize: 10,
  textAnchor: 'end' as const,
  fill: '#02346d'
}

export default function IndividualUseVisualization({
  width,
  height,
  events = false
}: BarsProps) {
  const { asset } = useAsset()
  const txs: TransactionHistory = asset.transactionHistory

  // Parse the wallet addresses and store in a dictionary
  const ids = payerIDMap(txs)
  console.log(`ID Map Entries: ${[...ids.entries()]}`)
  console.log(`ID Map Keys: ${[...ids.keys()][0]}`)

  // bounds
  const xMax = width - 30
  const yMax = height - 120

  const xScale = scaleBand<string>({
    domain: [...ids.keys()], // x-coordinate data values
    range: [20, xMax], // svg x-coordinates, svg x-coordinates increase left to right
    round: true,
    padding: 0.4
  })
  const yScale = scaleLinear({
    domain: [0, Math.max(...ids.values())], // y-coordinate data values
    // svg y-coordinates, these increase from top to bottom so we reverse the order
    // so that minY in data space maps to graphHeight in svg y-coordinate space
    range: [yMax, 0],
    round: true
  })

  return (
    <div>
      <svg width={width} height={height}>
        <LinearGradient id="stroke" from="#58dfff" to="#ffffff" />
        <rect fill="url('#stroke')" width="100%" height="100%" rx={14} />
        <Group top={verticalMargin / 2}>
          {[...ids.keys()].map((d) => {
            const address = d
            const barWidth = xScale.bandwidth()
            const barHeight = yMax - (yScale(ids.get(address)) ?? 0)
            const barX = xScale(address)
            const barY = yMax - barHeight
            return (
              <Group key={`bar-${address}`}>
                <Bar
                  key={`bar-${address}`}
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill="#3499d3"
                  onClick={() => {
                    if (events) alert(`Wallet Address: ${address}`)
                  }}
                />
                <text
                  x={xScale(address) + barWidth / 2}
                  y={yMax - barHeight}
                  fill="#3499d3"
                  fontSize={12}
                  dx={'-2'}
                  dy={'-.33em'}
                  style={{ fontFamily: 'arial' }}
                >
                  {`${ids.get(address)}`}
                </text>
              </Group>
            )
          })}
          <AxisLeft
            left={60}
            top={-10}
            scale={yScale}
            numTicks={5}
            stroke="#02346d"
            tickStroke="#02346d"
            tickLabelProps={() => axisLeftTickLabelProps}
            label="# of Transactions"
          />
          <AxisBottom
            top={285}
            scale={xScale}
            numTicks={20}
            stroke="#02346d"
            tickStroke="#02346d"
            label="Wallet Addresses"
          />
        </Group>
      </svg>
    </div>
  )
}
