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

// tooltip
const tooltipStyles = {
  ...defaultStyles,
  background: '#3b6978',
  border: '1px solid white',
  color: 'white'
}

const axisBottomTickLabelProps = {
  dx: '1.5em',
  dy: '0.25em',
  fontFamily: 'Arial',
  fontSize: 15,
  textAnchor: 'end' as const,
  fill: '#000000'
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
    const { orders } = asset

    const [initialOrders, setInitialOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])

    useEffect(() => {
      orders && setInitialOrders(orders)
    }, [orders])
    useEffect(() => {
      orders && setFilteredOrders(orders)
    }, [orders])

    // bounds
    const xMax = width - 30
    const yMax = height - 120

    // accessors
    const getDate = (d: Order) => new Date(d?.createdTimestamp * 1000)
    const getY = (d: Order) => parseFloat(d?.amount)

    const onBrushChange = (domain: Bounds | null) => {
      if (!domain) return
      const { x0, x1 } = domain
      console.log(x0)
      console.log(x1)
      const ordersCopy =
        orders &&
        orders.filter((order) => {
          const x = getDate(order).getTime()
          return x > x0 && x < x1 // && y > y0 && y < y1
        })
      console.log([...ordersCopy])
      setFilteredOrders(ordersCopy)
    }

    // scales
    const xScale = useMemo(
      () =>
        scaleTime<number>({
          range: [50, xMax - 50],
          domain: extent(filteredOrders, getDate) as [Date, Date]
        }),
      [xMax, filteredOrders]
    )
    const yScale = useMemo(
      () =>
        scaleLinear({
          range: [yMax, 0],
          nice: true
        }),
      [yMax]
    )
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

    // event handlers
    const handleClearClick = () => {
      if (brushRef?.current) {
        setFilteredOrders(orders)
        brushRef.current.reset()
      }
    }

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
          {initialOrders.map((order: Order, i) => {
            return (
              <Group top={height / 4} key={`filtered-dot-${i}`}>
                <circle
                  key={`${i}`}
                  r={parseFloat(order.amount) * 5}
                  cx={xBrushScale(getDate(order))}
                  cy={yBrushScale(getY(order))}
                  stroke="#990000"
                  fill="#e44c4c"
                />
              </Group>
            )
          })}
          <AxisBottom
            left={0}
            top={height / 4 + 30}
            scale={xBrushScale}
            numTicks={5}
            stroke="#990000"
            tickStroke="#990000"
            tickLabelProps={() => axisBottomTickLabelProps}
          />
          <Group top={70}>
            <PatternLines
              id={'brush_pattern'}
              height={height / 4}
              width={width}
              stroke={'f6acc8'}
              strokeWidth={1}
              orientation={['diagonal']}
            />
            <Brush
              xScale={xBrushScale}
              yScale={yBrushScale}
              width={width}
              height={height / 4}
              margin={{ top: 200 }}
              handleSize={8}
              innerRef={brushRef}
              resizeTriggerAreas={['left', 'right']}
              brushDirection="horizontal"
              onChange={onBrushChange}
              onClick={() => setFilteredOrders(orders)}
              selectedBoxStyle={{
                fill: `url(#${'brush_pattern'})`,
                stroke: 'black'
              }}
              useWindowMoveEvents
              renderBrushHandle={(props) => <BrushHandle {...props} />}
            />
          </Group>
          {filteredOrders.map((order: Order, i) => {
            return (
              <Group top={(4 * height) / 7} key={`regular-dot-${i}`}>
                <circle
                  key={`${i}`}
                  r={parseFloat(order.amount) * 5}
                  cx={xScale(getDate(order))}
                  cy={yScale(getY(order))}
                  stroke="#990000"
                  fill={tooltipData === order ? 'white' : '#e44c4c'}
                  onMouseOver={() => {
                    const top = height - 110
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
            top={(4 * height) / 7 + 30}
            scale={xScale}
            numTicks={5}
            stroke="#990000"
            strokeWidth={1}
            tickStroke="#990000"
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
