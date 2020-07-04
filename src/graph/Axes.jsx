import React, {useMemo} from 'react';
import * as d3 from 'd3'
import _ from 'lodash'

/////////////////////////////////////
///
/// The X axis
///
/////////////////////////////////////
class Xaxis extends React.Component {
  constructor(props) {
    super(props)
  }

  ticks() {
    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, this.props.width])
    return xScale.ticks()
      .map(value => ({
        value,
        xOffset: xScale(value)
      }))
  }

  render() {
    return (
      <svg style={{
        width: this.props.width,
        height: this.props.height,
        marginLeft: this.props.offset
      }}>
        <path
          d={`M 0 0.5 h ${this.props.width}`}
          stroke="currentColor"
        />
        {this.ticks().map(({ value, xOffset }) => (
          <g
            key={value}
            transform={`translate(${xOffset}, 0)`}
          >
            <line
              y2="6"
              stroke="currentColor"
            />
            <text
              key={value}
              style={{
                fontSize: "10px",
                textAnchor: value == 0 ? "start" : value == 100 ? "end" : "middle",
                transform: "translateY(20px)"
              }}>
              { value }
            </text>
          </g>
        ))}
      </svg>
  )}
}



/////////////////////////////////////
///
/// The Y axis
///
/////////////////////////////////////
class Yaxis extends React.Component {
  constructor(props) {
    super(props)
  }

  ticks() {
    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, this.props.height])
    return yScale.ticks()
      .map(value => ({
        value,
        yOffset: yScale(value)
      }))
  }

  render() {
    return (
      <svg style={{
        width: this.props.width,
        height: this.props.height,
      }}>
        <path
          d={"M 22 0 V "+this.props.height}
          stroke="currentColor"
        />
        {this.ticks().map(({ value, yOffset }) => (
          <g
            key={value}
            transform={`translate(0,${yOffset})`}
          >
            <line
              x1="16"
              x2="22"
              stroke="currentColor"
            />
            <text
              key={value}
              style={{
                fontSize: "10px",
                textAnchor: "middle",
                transform: `translate(8px,${value == 0 ? "8px" : value == 100 ? "-3px" : "4px"})`
              }}>
              { value }
            </text>
          </g>
        ))}
      </svg>
  )}
}

export {Xaxis, Yaxis}
