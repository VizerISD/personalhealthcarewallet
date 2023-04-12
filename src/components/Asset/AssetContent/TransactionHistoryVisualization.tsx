import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import BaseBrush from '@visx/brush/lib/BaseBrush'
import { BrushHandleRenderProps } from '@visx/brush/lib/BrushHandle'
import { PatternLines } from '@visx/pattern'
import { Brush } from '@visx/brush'
import mockedAccessEvents from 'content/static_data/mocked-access-events.json'

// Filter the denied events from the mocked access event data
const deniedEvents: Order[] = mockedAccessEvents.data.accessDenieds.map(
  (obj) => ({
    ...obj,
    createdTimestamp: Number(obj.createdTimestamp),
    amount: '1'
  })
)

// Filter the granted events from the mocked access event data
const grantedEvents: Order[] = mockedAccessEvents.data.accessGranteds.map(
  (obj) => ({
    ...obj,
    createdTimestamp: Number(obj.createdTimestamp),
    amount: '1'
  })
)

// Combine the denied and granted events into one array
const accessEvents: Order[] = [...deniedEvents, ...grantedEvents]

// Tooltip style for hoverable nodes
const tooltipStyles = {
  ...defaultStyles,
  background: 'white',
  border: '1px solid black',
  color: 'black'
}

// Bottom date axis properties
const axisBottomTickLabelProps = {
  dx: '1.5em',
  dy: '0.25em',
  fontFamily: 'Arial',
  fontSize: 15,
  textAnchor: 'end' as const,
  fill: '#000000'
}

// Timeline properties for tx history viz
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
    // const { asset } = useAsset()
    // const { orders } = asset

    const [initialOrders, setInitialOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])

    useEffect(() => {
      accessEvents && setInitialOrders(accessEvents)
    }, [])
    useEffect(() => {
      accessEvents && setFilteredOrders(accessEvents)
    }, [])

    console.log(`initial  orders: ${initialOrders}`)
    console.log(`filtered orders: ${filteredOrders}`)

    // bounds
    const xMax = width - 30
    const yMax = height - 120

    // accessors
    const getDate = (d: Order) => new Date(d?.createdTimestamp * 1000)
    const getY = (d: Order) => parseFloat(d?.amount)

    // brush resize options
    const onBrushChange = (domain: Bounds | null) => {
      if (!domain) return
      const { x0, x1 } = domain
      console.log(x0)
      console.log(x1)
      const accessEventsCopy =
        accessEvents &&
        accessEvents.filter((order) => {
          const x = getDate(order).getTime()
          return x > x0 && x < x1 // && y > y0 && y < y1
        })
      console.log(`accessEventsCopy: ${[...accessEventsCopy]}`)
      setFilteredOrders(accessEventsCopy)
    }

    // Filtered view scales
    const xFilteredViewScale = useMemo(
      () =>
        scaleTime<number>({
          range: [50, xMax - 50],
          domain: extent(filteredOrders, getDate) as [Date, Date]
        }),
      [xMax, filteredOrders]
    )
    const yFilteredViewScale = useMemo(
      () =>
        scaleLinear({
          range: [yMax, 0],
          nice: true
        }),
      [yMax]
    )

    // Brush selection scales
    const xBrushScale = useMemo(
      () =>
        scaleTime<number>({
          range: [50, xMax - 50],
          domain: extent(initialOrders, getDate) as [Date, Date]
        }),
      [xMax, initialOrders]
    )
    const yBrushScale = useMemo(
      () =>
        scaleLinear({
          range: [yMax, 0],
          nice: true
        }),
      [yMax]
    )

    // We need to manually offset the handles for them to be rendered at the right position
    const BrushHandle = ({
      x,
      height,
      isBrushActive
    }: BrushHandleRenderProps) => {
      const pathWidth = 8
      const pathHeight = 15
      if (!isBrushActive) {
        return null
      }
      return (
        <Group left={x + pathWidth / 2} top={(height - pathHeight) / 2}>
          <path
            fill="#f2f2f2"
            d="M -4.5 0.5 L 3.5 0.5 L 3.5 15.5 L -4.5 15.5 L -4.5 0.5 M -1.5 4 L -1.5 12 M 0.5 4 L 0.5 12"
            stroke="#999999"
            strokeWidth="1"
            style={{ cursor: 'ew-resize' }}
          />
        </Group>
      )
    }

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
          {filteredOrders.map((order: Order, i) => {
            return (
              <Group top={height / 4} key={`filtered-dot-${i}`}>
                <circle
                  key={`${i}`}
                  r={parseFloat(order.amount) * 8}
                  cx={xFilteredViewScale(getDate(order))}
                  cy={yFilteredViewScale(getY(order))}
                  stroke={
                    order.estimatedUSDValue === 'Denied' ? '#990000' : '#004516'
                  }
                  fill={
                    tooltipData === order
                      ? order.estimatedUSDValue === 'Denied'
                        ? 'pink'
                        : order.estimatedUSDValue === 'Granted'
                        ? 'lightgreen'
                        : 'darkgreen'
                      : order.estimatedUSDValue === 'Denied'
                      ? '#e44c4c'
                      : order.estimatedUSDValue === 'Granted'
                      ? 'darkgreen'
                      : 'darkgreen'
                  }
                  onMouseOver={() => {
                    const top = height - 110
                    const left = xFilteredViewScale(getDate(order))
                    showTooltip({
                      tooltipData: order,
                      tooltipLeft: left,
                      tooltipTop: top
                    })
                  }}
                  onMouseLeave={() => hideTooltip()}
                />
                <text
                  x={
                    order.estimatedUSDValue === 'Denied'
                      ? xFilteredViewScale(getDate(order)) - 4
                      : xFilteredViewScale(getDate(order)) - 6
                  }
                  y={
                    order.estimatedUSDValue === 'Denied'
                      ? yFilteredViewScale(getY(order)) + 4
                      : yFilteredViewScale(getY(order)) + 5.5
                  }
                  enableBackground={
                    tooltipData === order
                      ? order.estimatedUSDValue === 'Denied'
                        ? 'pink'
                        : order.estimatedUSDValue === 'Granted'
                        ? 'lightgreen'
                        : 'darkgreen'
                      : order.estimatedUSDValue === 'Denied'
                      ? '#e44c4c'
                      : order.estimatedUSDValue === 'Granted'
                      ? 'darkgreen'
                      : 'darkgreen'
                  }
                  onMouseOver={() => {
                    const top = height - 110
                    const left = xFilteredViewScale(getDate(order))
                    showTooltip({
                      tooltipData: order,
                      tooltipLeft: left,
                      tooltipTop: top
                    })
                  }}
                  onMouseLeave={() => hideTooltip()}
                >
                  {order.estimatedUSDValue === 'Denied' ? 'x' : '✓'}
                </text>
              </Group>
            )
          })}
          <AxisBottom
            left={0}
            top={height / 4 + 30}
            scale={xFilteredViewScale}
            numTicks={5}
            stroke="#990000"
            tickStroke="#990000"
            tickLabelProps={() => axisBottomTickLabelProps}
          />
          {initialOrders.map((order: Order, i) => {
            return (
              <Group top={(4 * height) / 6 + 10} key={`regular-dot-${i}`}>
                <circle
                  key={`${i}`}
                  r={parseFloat(order.amount) * 8}
                  cx={xBrushScale(getDate(order))}
                  cy={yBrushScale(getY(order))}
                  stroke={
                    order.estimatedUSDValue === 'Denied' ? '#990000' : '#004516'
                  }
                  fill={
                    order.estimatedUSDValue === 'Denied'
                      ? '#e44c4c'
                      : 'darkgreen'
                  }
                />
                <text
                  x={
                    order.estimatedUSDValue === 'Denied'
                      ? xBrushScale(getDate(order)) - 4
                      : xBrushScale(getDate(order)) - 6
                  }
                  y={
                    order.estimatedUSDValue === 'Denied'
                      ? yBrushScale(getY(order)) + 4
                      : yBrushScale(getY(order)) + 5.5
                  }
                >
                  {order.estimatedUSDValue === 'Denied' ? 'x' : '✓'}
                </text>
              </Group>
            )
          })}
          <AxisBottom
            left={0}
            top={(4 * height) / 6 + 35}
            scale={xBrushScale}
            numTicks={5}
            stroke="#990000"
            strokeWidth={1}
            tickStroke="#990000"
            tickLabelProps={() => axisBottomTickLabelProps}
          />
          <Group top={70}>
            <PatternLines
              id={'brush_pattern'}
              height={(4 * height) / 6 + 10}
              width={width}
              stroke={'f6acc8'}
              strokeWidth={1}
              orientation={['diagonal']}
            />
            <g transform={`translate(${0}, ${(4 * height) / 6 - height / 4})`}>
              <Brush
                xScale={xBrushScale}
                yScale={yBrushScale}
                width={width}
                height={height / 4}
                handleSize={8}
                innerRef={brushRef}
                resizeTriggerAreas={['left', 'right']}
                brushDirection="horizontal"
                onChange={onBrushChange}
                onClick={() => setFilteredOrders(accessEvents)}
                selectedBoxStyle={{
                  fill: `url(#${'brush_pattern'})`,
                  stroke: 'black'
                }}
                useWindowMoveEvents
                renderBrushHandle={(props) => <BrushHandle {...props} />}
              />
            </g>
          </Group>
        </svg>
        {tooltipData && (
          <div>
            <TooltipWithBounds
              key={Math.random()}
              top={25}
              left={tooltipLeft - 10}
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
                <strong>Accessor: </strong> {`${tooltipData.payer.name}`}
              </div>
              <div>
                <strong>Date: </strong>
                {new Date(tooltipData.createdTimestamp * 1000).toLocaleString()}
              </div>
              <div>
                <strong>Type: </strong>
                <strong
                  style={{
                    color:
                      tooltipData.estimatedUSDValue === 'Denied'
                        ? 'red'
                        : 'green'
                  }}
                >{`${tooltipData.estimatedUSDValue}`}</strong>
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
