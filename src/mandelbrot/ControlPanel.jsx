import React from 'react';
import { MandelbrotCanvas } from './Mandelbrot.canvas'

class MandelbrotControls extends React.Component {
  constructor(props) {
    super(props)
    this.onCenterSelect = this.onCenterSelect.bind(this)
    this.onRenderButtonClick = this.onRenderButtonClick.bind(this)
    this.yAxisWidth = 45
    this.state = {
      centerX: -0.5,
      centerY: 0,
      graphWidth: 4,
      potK:  3,
      iterK: 0.01,
      maxIterations: 1000000,
      potCutoff: 1000,
    }
  }

  onCenterSelect(e) {
    this.setState({
      centerX: e.centerX,
      centerY: e.centerY
    })

    // kick off a zoom on double-click event
    if( e.double == true) {
      this.setState({
        graphWidth: this.state.graphWidth*0.3
      })
      this.modelCanvas.manualDraw()
    }
  }

  onRenderButtonClick(e) {
    this.modelCanvas.manualDraw()
  }

  render() {
    return (
      <div
        style={{
          margin: "25px",
          width: 1000+(this.yAxisWidth*2)+220,
          display: 'inline-block',
        }}
      >
        <MandelbrotCanvas
          width="1000"
          height="600"
          multi={32}
          centerX = {this.state.centerX}
          centerY = {this.state.centerY}
          graphWidth = {this.state.graphWidth}
          potK = {this.state.potK}
          iterK = {this.state.iterK}
          maxIterations = {this.state.maxIterations}
          potCutoff = {this.state.potCutoff}
          yAxisWidth = {this.yAxisWidth}
          onCenterSelectFn = {this.onCenterSelect}
          ref={node => this.modelCanvas = node}
        />
        <div className="com-mandelbrot-control-panel">
          <h1>Interactive Mandelbrot</h1>
          <div className = "control">
            Double click to quick-zoom on a location, or click once to prep the viewport center
            <div className="inputContainer">
              <div className = "column">
                <div className="label xyLabel">X:</div>
                <input className="xyInput" type="number" value={this.state.centerX} onChange={event => this.setState({ centerX: event.target.value })}/>

              </div>
              <div className = "column">
                <div className="label xyLabel">Y:</div>
                <input className="xyInput" type="number" value={this.state.centerY} onChange={event => this.setState({ centerY: event.target.value })}/>
              </div>
            </div>
          </div>

          <div className = "control">
            The zoom level is determined by the width of the real component axis
            <div className="inputContainer">
              <div className="label">Real width:</div>
              <input type="number" value={this.state.graphWidth} onChange={event => this.setState({ graphWidth: event.target.value })}/>
              { this.state.graphWidth < 0.00004 &&
                <span className="warning">Max depth reached</span>
              }
            </div>
          </div>

          <div className = "control">
            Two quasi-periodic functions control the colors, and can be adjusted with these constants
            <div className="inputContainer">
              <div className = "inputContainer">
                <div className="label">Outer color:</div>
                <input type="number" value={this.state.potK} onChange={event => this.setState({ potK: event.target.value })}/>
              </div>
              <div className = "inputContainer">
                <div className="label">Inner color:</div>
                <input type="number" value={this.state.iterK} onChange={event => this.setState({ iterK: event.target.value })}/>
              </div>
              <div className = "inputContainer">
                <div className="label">Boundary:</div>
                <input type="number" value={this.state.potCutoff} onChange={event => this.setState({ potCutoff: event.target.value })}/>
              </div>
            </div>
          </div>

          <div className = "control">
            The image precision is determined by the max number of iterations allowed per pixel
            <div className = "inputContainer">
              <div className="label">Precision:</div>
              <input type="number" value={this.state.maxIterations} onChange={event => this.setState({ maxIterations: event.target.value })}/>
            </div>
          </div>
          <button onClick={this.onRenderButtonClick}>
            Render!
          </button>
        </div>
      </div>
  )}
}

export {MandelbrotControls}
