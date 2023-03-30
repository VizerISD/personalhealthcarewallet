import React from 'react'
import { LinearGradient } from '@vx/gradient'
import { scaleBand, scaleLinear } from '@visx/scale'
import { Bar } from '@visx/shape'
import { Group } from '@visx/group'
import { useAsset } from '@context/Asset'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { accountTruncate } from '@utils/web3'
import Link from 'next/link'

const verticalMargin = 120
const maxBarAmount = 10

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
  fill: 'black'
}

const axisLabelProps = {
  textAnchor: 'middle',
  fontFamily: 'Arial',
  fontSize: 14,
  fontWeight: 'bold',
  fill: 'black'
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
    domain: [...ids.keys()].slice(0, maxBarAmount), // x-coordinate data values
    range: [20, xMax], // svg x-coordinates, increase left to right
    round: true,
    padding: 0.4
  })
  const yScale = scaleLinear({
    domain: [0, Math.max(...ids.values())], // y-coordinate data values
    // svg y-coordinates, increase from top to bottom. We reverse the order
    // so that minY in data space maps to graphHeight in svg y-coordinate space
    range: [yMax, 0],
    round: true
  })

  return (
    <div>
      <svg width={width} height={height}>
        <LinearGradient id="stroke" from="#ffefef" to="#ffffff" />
        <rect
          fill="url('#stroke')"
          strokeWidth={1}
          stroke="#e2e2e2"
          width="100%"
          height="100%"
          rx={4}
        />
        <Group top={verticalMargin / 2}>
          {[...ids.keys()].slice(0, maxBarAmount).map((d) => {
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
                  fill="#e44c4c"
                  onClick={() => {
                    if (events) alert(`Wallet Address: ${address}`)
                  }}
                />
                <text
                  x={xScale(address) + barWidth / 2}
                  y={yMax - barHeight}
                  textAnchor="middle"
                  fill="#000000"
                  fontSize={12}
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
            scale={yScale}
            numTicks={5}
            stroke="#000000"
            tickStroke="#000000"
            tickLabelProps={() => axisLeftTickLabelProps}
            label="# of Transactions"
            labelProps={axisLabelProps} // Ocean Market removes textAnchor from props, but it still works
          />
          <AxisBottom
            top={285}
            scale={xScale}
            tickComponent={(tickRendererProps) => {
              return (
                <Link href={`/profile/${tickRendererProps.formattedValue}`}>
                  <a title="Show profile page.">
                    <text
                      x={tickRendererProps.x}
                      y={tickRendererProps.y}
                      textAnchor="middle"
                      fontSize={10.5}
                      fontWeight={'bold'}
                      fill={'black'}
                    >
                      {accountTruncate(tickRendererProps.formattedValue)}
                    </text>
                  </a>
                </Link>
              )
            }}
            numTicks={maxBarAmount}
            stroke="#000000"
            tickStroke="#000000"
            label="Wallet Addresses"
            labelProps={axisLabelProps} // Ocean Market removes textAnchor from props, but it still works
          />
        </Group>
      </svg>
    </div>
  )
}
