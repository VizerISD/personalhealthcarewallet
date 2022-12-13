import React, { useMemo, useRef, useState } from 'react'
import { LinearGradient } from '@visx/gradient'
import { scaleLinear, scaleTime } from '@visx/scale'
import { Group } from '@visx/group'
import { useAsset } from '@context/Asset'
import {
  withTooltip,
  Tooltip,
  TooltipWithBounds,
  defaultStyles
} from '@visx/tooltip'
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip'
import { AxisBottom } from '@visx/axis'
import { Bounds } from '@visx/brush/lib/types'
import { extent } from 'd3-array'
import { filter } from 'lodash'
import BaseBrush from '@visx/brush/lib/BaseBrush'

// tooltip
const tooltipStyles = {
  ...defaultStyles,
  background: '#3b6978',
  border: '1px solid white',
  color: 'white'
}

const axisBottomTickLabelProps = {
  dx: '-0.25em',
  dy: '0.25em',
  fontFamily: 'Arial',
  fontSize: 10,
  textAnchor: 'end' as const,
  fill: '#ffffff'
}

export type TimelineProps = {
  width: number
  height: number
  events?: boolean
}

export default withTooltip<TimelineProps, Order>(
  ({
    width,
    height,
    events = false,
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0
  }: TimelineProps & WithTooltipProvidedProps<Order>) => {
    const brushRef = useRef<BaseBrush | null>(null)
    const { asset } = useAsset()
    const txs: TransactionHistory = asset.transactionHistory
    const orders = asset.transactionHistory?.token?.orders
      .slice()
      .sort((a, b) => a.createdTimestamp - b.createdTimestamp)

    const [filteredOrders, setFilteredOrders] = useState(orders?.slice())

    // bounds
    const xMax = width - 30
    const yMax = height - 120

    // accessors
    const getDate = (d: Order) => new Date(d?.createdTimestamp * 1000)
    const getY = (d: Order) => parseFloat(d?.amount)

    // const onBrushChange = (domain: Bounds | null) => {
    //   if (!domain) return
    //   const { x0, x1, y0, y1 } = domain
    //   const ordersCopy =
    //     orders?.length &&
    //     orders?.filter((order) => {
    //       const x = getDate(order).getTime()
    //       const y = getY(order)
    //       return x > x0 && x < x1 && y > y0 && y < y1
    //     })
    //   setFilteredOrders(ordersCopy)
    //   setFilteredOrders(orders)
    // }

    // scales
    const xScale = useMemo(
      () =>
        scaleTime<number>({
          range: [50, xMax - 50],
          domain: [
            new Date(orders?.length && orders[0]?.createdTimestamp * 1000),
            new Date()
          ]
        }),
      [xMax, orders]
    )
    // const xScale = useMemo(
    //   () =>
    //     scaleTime<number>({
    //       range: [50, xMax - 50],
    //       domain: [
    //         new Date(
    //           filteredOrders?.length &&
    //             filteredOrders[0]?.createdTimestamp * 1000
    //         ),
    //         new Date()
    //       ]
    //     }),
    //   [xMax, filteredOrders]
    // )
    // const xScale = useMemo(
    //   () =>
    //     scaleTime<number>({
    //       range: [50, xMax - 50],
    //       domain: [new Date(orders?.length && getDate(orders[0])), new Date()]
    //     }),
    //   [xMax, orders]
    // )
    // const xScale = useMemo(
    //   () =>
    //     scaleTime<number>({
    //       range: [50, xMax - 50],
    //       domain: extent(orders, getDate) as [Date, Date]
    //     }),
    //   [xMax, orders]
    // )
    // const xScale = useMemo(
    //   () =>
    //     scaleTime<number>({
    //       range: [50, xMax - 50],
    //       domain: [
    //         new Date(
    //           filteredOrders?.length &&
    //             filteredOrders[0]?.createdTimestamp * 1000
    //         ),
    //         new Date(
    //           filteredOrders?.length &&
    //             filteredOrders[filteredOrders?.length]?.createdTimestamp * 1000
    //         ) || new Date()
    //       ]
    //     }),
    //   [xMax, filteredOrders]
    // )
    const yScale = useMemo(
      () =>
        scaleLinear({
          range: [yMax, 0],
          nice: true
        }),
      [yMax]
    )

    // event handlers
    const handleClearClick = () => {
      if (brushRef?.current) {
        setFilteredOrders(orders)
        brushRef.current.reset()
      }
    }

    return (
      <div>
        <svg width={width} height={height}>
          <LinearGradient id="stroke" from="#ff00a5" to="#999999" />
          <rect fill="url('#stroke')" width="100%" height="100%" rx={14} />
          {orders?.map((order: Order, i) => {
            return (
              <Group top={height / 3} key={`dot-${i}`}>
                {/* {console.log(getDate(order))} */}
                <circle
                  key={`${i}`}
                  r={parseFloat(order.amount) * 5}
                  cx={xScale(getDate(order))}
                  cy={yScale(getY(order))}
                  stroke="rgba(33,33,33,0.5)"
                  fill={tooltipData === order ? 'white' : '#000000'}
                  onMouseOver={() => {
                    const top = height / 2 - yScale(getY(order)) + 10
                    const left = xScale(getDate(order))
                    showTooltip({
                      tooltipData: order,
                      tooltipLeft: left,
                      tooltipTop: top
                    })
                  }}
                  onMouseLeave={() => hideTooltip()}
                />
              </Group>
            )
          })}
          <AxisBottom
            left={0}
            top={height / 3 + 30}
            scale={xScale}
            numTicks={5}
            stroke="#ffffff"
            tickStroke="#ffffff"
            tickLabelProps={() => axisBottomTickLabelProps}
          />
        </svg>
        {tooltipData && (
          <div>
            <TooltipWithBounds
              key={Math.random()}
              top={tooltipTop - 12}
              left={tooltipLeft + 12}
              style={tooltipStyles}
              onMouseOver={() => {
                showTooltip({
                  tooltipData,
                  tooltipLeft: 500,
                  tooltipTop: 200
                })
              }}
            >
              <div>
                <strong>Tx Id:</strong> {`${tooltipData.tx.slice(0, 10)}...`}
              </div>
              <div>
                <strong>Payer Id:</strong>{' '}
                {`${tooltipData.payer.id.slice(0, 8)}...`}
              </div>
              <div>
                <strong>Consumer Id:</strong>{' '}
                {`${tooltipData.consumer.id.slice(0, 8)}...`}
              </div>
              <div>
                <strong>Amount:</strong> {tooltipData.amount}
              </div>
              <div>
                <strong>USD Value:</strong> {tooltipData.estimatedUSDValue}
              </div>
              <div>
                <strong>Time:</strong>
                {new Date(tooltipData.createdTimestamp * 1000).toDateString()}
              </div>
            </TooltipWithBounds>
            <Tooltip
              top={innerHeight - 14}
              left={tooltipLeft}
              style={{
                ...defaultStyles,
                minWidth: 72,
                textAlign: 'center',
                transform: 'translateX(-50%)'
              }}
            ></Tooltip>
          </div>
        )}
      </div>
    )
  }
)
