import React, {useMemo} from 'react';
import * as d3 from 'd3'

class Axis extends React.Component {
  constructor(props) {
    super(props)
    this.generateTicks = this.generateTicks.bind(this);

    /////// For Y-axes
    if (['y','Y'].includes(props.direction)) {
      this.rangeMax = this.props.height
      this.labelTop = -15
      this.dAxis = `M ${this.props.mirror ? 3 : this.props.width-3} 0 V ${this.props.height}`
      this.dTick = `M ${this.props.mirror ? 8 : this.props.width-3} 0 l -5 0`

      this.gTransform = (offset) => {
        return `translate(0, ${offset || 0})`
      }
      this.textAnchor = (value) => {
        return 'end'
      }
      this.labelTransform = (value) => {
        return `translate(${this.props.width-10}px, ${value == this.props.domainMin ? "8px" : value == this.props.domainMax ? "-3px" : "3px"})`
      }

    /////// For X-axes
    } else {
      this.rangeMax = this.props.width
      this.labelTop = this.props.mirror ? -3 : 22
      this.dAxis = `M 0 ${this.props.mirror ? this.props.height : 0.5} h ${this.props.width}`
      this.dTick = `M 0 ${this.props.mirror ? this.props.height-6 : 0} l 0 6`
      this.gTransform = (offset) => {
        return `translate(${offset || 0}, 0)`
      }
      this.textAnchor = (value) => {
        return value == this.props.domainMin ? "start" : value == this.props.domainMax ? "end" : "middle"
      }
      this.labelTransform = (value) => {
        return "translateY(20px)"
      }
    }

    // must initialize state after the above init because generateTicks uses some of those values
    this.state = {
      ticks: this.generateTicks()
    }

  }

  generateTicks() {
    let domain = ['y','Y'].includes(this.props.direction) ? [this.props.domainMax, this.props.domainMin] : [this.props.domainMin, this.props.domainMax]
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
      <div style = {{
        width: this.props.width + (this.props.marginRight || 0) + (this.props.marginLeft || 0),
        height: this.props.height,
        display: 'inline-block',
        position: 'relative',
      }}>
        <svg style={{
          marginLeft: this.props.marginLeft,
          marginRight: this.props.marginRight,
          width: this.props.width,
          height: this.props.height,
          display: 'inline',
          overflow: 'visible',
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
        <div style={{
          position: 'absolute',
          top: this.labelTop,
          left: (this.props.marginLeft || (this.props.mirror ? 0 : -5)),
          width: this.props.width,
          fontSize: '10px',
          textAlign: 'center'
        }}>
          { this.props.label }
        </div>
      </div>
  )}
}

export {Axis}
