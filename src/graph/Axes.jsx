import React, {useMemo} from 'react';
import * as d3 from 'd3'

class Axis extends React.Component {
  constructor(props) {
    super(props)
    this.generateTicks = this.generateTicks.bind(this);
    this.state = {
      ticks: this.generateTicks()
    }

    /////// For Y-axes
    if (['y','Y'].includes(props.direction)) {
      this.rangeMax = this.props.height
      this.dAxis = `M ${this.props.width-3} 0 V ${this.props.height}`
      this.dTick = `M ${this.props.width-3} 0 l -5 0`
      this.gTransform = (offset) => {
        return `translate(0, ${offset || 0})`
      }
      this.textAnchor = (value) => {
        return 'end'
      }
      this.labelTransform = (value) => {
        return `translate(${this.props.width-10}px, ${value == 0 ? "8px" : value == 100 ? "-3px" : "3px"})`
      }

    /////// For X-axes
    } else {
      this.rangeMax = this.props.width
      this.dAxis = `M 0 0.5 h ${this.props.width}`
      this.dTick = `M 0 0 l 0 6`
      this.gTransform = (offset) => {
        return `translate(${offset || 0}, 0)`
      }
      this.textAnchor = (value) => {
        return value == 0 ? "start" : value == 100 ? "end" : "middle"
      }
      this.labelTransform = (value) => {
        return "translateY(20px)"
      }
    }

  }

  generateTicks() {
    let scale = d3.scaleLinear()
      .domain([this.props.domainMin, this.props.domainMax])
      .range([0, this.rangeMax])
    return scale.ticks()
      .map(value => ({
        value,
        offset: scale(value)
      }))
  }

  componentDidUpdate(e) {
    if ( this.props.domainMin != e.domainMin
      || this.props.domainMax != e.domainMax)
    {
      this.setState({
        ticks: this.generateTicks()
      })
    }
  }

  render() {
    return (
      <svg style={{
        width: this.props.width,
        height: this.props.height,
        marginLeft: this.props.margin
      }}>
        <path
          d={this.dAxis}
          stroke="currentColor"
        />
          {this.state.ticks.map(({ value, offset }) => (
            <g
              key={value}
              transform={this.gTransform(offset)}
            >
              <path
                d={this.dTick}
                stroke="currentColor"
              />
              <text
                key={value}
                style={{
                  fontSize: "10px",
                  textAnchor: this.textAnchor(value),
                  transform: this.labelTransform(value)
                }}>
                { value }
              </text>
            </g>
          ))}
      </svg>
  )}
}

export {Axis}
