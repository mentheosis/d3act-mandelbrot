import React, { useState, useRef, useEffect } from 'react'
import _ from 'lodash'
import {SteadyCanvas} from '../canvas/SteadyCanvas'
import {renderMandelbrot} from './Mandelbrot.model'
import Worker from './Mandelbrot.worker'
import {Axis, Yaxis} from '../graph/Axes'

class MandelbrotCanvas extends React.Component {
  constructor(props) {
    super(props)
    this.saveContext = this.saveContext.bind(this);
    this.onMessageFromWorker = this.onMessageFromWorker.bind(this);
    this.initializeCanvas = _.once(this._initializeCanvas)
    this.drawAxesBefore = _.once(this.drawAxesBefore)
    this.drawAxesAfter = _.debounce(this.drawAxesAfter, 500, {leading:false, trailing:true})
    this.updateAxesDomain = _.debounce(this.updateAxesDomain.bind(this), 500, {leading:true, trailing:false})
    this.calcCenter = this.calcCenter.bind(this)
    this.manualDraw = _.debounce(this.manualDraw.bind(this),1000,{leading:true, trailing:false})
    this.workers = {}
    this.yAxisWidth = props.yAxisWidth

    this.state = {
      axesXmax: 0, // will be calculated by the worker thread
      axesXmin: 0,
      axesYmax: 0,
      axesYmin: 0,
    }

    /*
    this.test = _.once((m) => {
      console.log("got draw col", m.data)
      for (let i in m.data.columnData) {
        let pixel = m.data.columnData[i]
        console.log('drawing column', pixel)
        this.ctx.fillStyle = pixel.color
        this.ctx.fillRect(0, pixel.Py, 10, -10)
      }
    })
    */
  }

  onMessageFromWorker(m) {
    if (m.data.type == 'modelCreated') {
      this.updateAxesDomain(m)
      this.initializeCanvas(this.ctx, m.data)
      this.drawAxesBefore(m)
      this.workers[m.data.id].postMessage({type: "initializedCanvas"})
    }
    else if (m.data.type == 'fillRect') {
      this.ctx.fillStyle = m.data.color
      this.ctx.fillRect.apply(this.ctx, m.data.params)
    }
    else if(m.data.type == 'drawColumn') {
      for (let i in m.data.columnData) {
        let pixel = m.data.columnData[i]
        this.ctx.fillStyle = pixel.color
        this.ctx.fillRect(pixel.Px, pixel.Py, 1, -1)
      }
      //this.drawAxesAfter()
    }
    else {
      console.log("Ignoring message", m.data)
      //this.ctx[m.data.type].apply(this.ctx, m.data.params)
    }
  }

  updateAxesDomain(m) {
    this.setState({
      axesXmax: m.data.graphCenterX + (m.data.graphWidth/2),
      axesXmin: m.data.graphCenterX - (m.data.graphWidth/2),
      axesYmax: m.data.graphCenterY + (m.data.graphHeight/2),
      axesYmin: m.data.graphCenterY - (m.data.graphHeight/2),
    })
  }

  // different debounce params for after and before
  drawAxesAfter() {
    this.drawAxes(this.ctx,this.axesData)
  }

  // different debounce params for after and before
  drawAxesBefore(m) {
    this.drawAxes(this.ctx,m.data)
  }

  drawAxes(ctx, data) {
    // draw the axes of the numerical plane
    ctx.fillStyle = "black"
    ctx.beginPath()
    ctx.moveTo(0, data.canvasTop)
    ctx.lineTo(0, data.canvasBottom);
    ctx.moveTo(data.canvasRight, 0)
    ctx.lineTo(data.canvasLeft, 0);
    ctx.stroke();

    // draw the center crosshair of the viewport
    ctx.strokeStyle = `rgb(150,150,150)`
    ctx.beginPath()
    ctx.moveTo(data.canvasRight - Math.floor(ctx.canvas.width/2), data.canvasTop)
    ctx.lineTo(data.canvasRight - Math.floor(ctx.canvas.width/2), data.canvasBottom);
    ctx.moveTo(data.canvasRight, data.canvasTop - Math.floor(ctx.canvas.height/2))
    ctx.lineTo(data.canvasLeft, data.canvasTop - Math.floor(ctx.canvas.height/2));
    ctx.stroke();
  }

  saveContext(context) {
    this.ctx = context

    if (this.props.multi > 0) {
      console.log("multi mandelbrot")
      const numWorkers = this.props.multi
      for (let i = 0; i < numWorkers; i++) {

        const worker = new Worker()
        worker.id = 'multi'+i
        worker.postMessage({
          type: "createModel",
          id: worker.id,
          canvasWidth: context.canvas.width,
          canvasHeight: context.canvas.height,
          xChunkSize: Math.round(context.canvas.width / numWorkers),
          xChunkIndex: i,
          centerX: this.props.centerX,
          centerY: this.props.centerY,
          graphWidth: this.props.graphWidth,
          potK: this.props.potK,
          iterK: this.props.iterK,
          maxIterations: this.props.maxIterations,
          potCutoff: this.props.potCutoff
        })
        worker.onmessage = this.onMessageFromWorker
        this.workers[worker.id] = worker
      }
    }

    else if ( this.props.fast == true) {
      console.log("fast mandelbrot")
      const worker = new Worker()
      worker.id = 'fastone'
      worker.postMessage({
        type: "createModel",
        id: worker.id,
        canvasWidth: context.canvas.width,
        canvasHeight: context.canvas.height
      })
      worker.onmessage = this.onMessageFromWorker
      this.workers[worker.id] = worker
    }

    else {
      console.log("regular mandelbrot")
      setTimeout( () => {
        return renderMandelbrot(context)
      })
    }

    ////////////////////////
    // single click event
    ////////////////////////
    context.canvas.addEventListener('mouseup', (e) => {
      let center = this.calcCenter(e)
      this.props.onCenterSelectFn({
        centerX: center[0],
        centerY: center[1]
      })
    }, false);

    ////////////////////////
    // double click event
    ////////////////////////
    context.canvas.addEventListener('dblclick', (e) => {
      let center = this.calcCenter(e)
      this.props.onCenterSelectFn({
        centerX: center[0],
        centerY: center[1],
        double: true
      })
    }, false);

  }

  calcCenter(e) {
    let unitsPerPixelX = this.axesData.graphWidth / this.ctx.canvas.width
    let unitsPerPixelY = this.axesData.graphHeight / this.ctx.canvas.height
    let clickedPointNumericX = (e.layerX - this.axesData.translateXpixel) * unitsPerPixelX
    let clickedPointNumericY = (e.layerY - this.axesData.translateYpixel) * -unitsPerPixelY
    return [clickedPointNumericX, clickedPointNumericY]
  }

  _initializeCanvas(ctx, data) {
    // make sure we always reset the canvas before translating again
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(data.translateXpixel, data.translateYpixel)
    ctx.scale(1, -1)
    // save meta data used to navigate the image
    this.axesData = data
  }

  manualDraw() {
    // reset the _once on this method so the new round will work
    this.initializeCanvas = _.once(this._initializeCanvas)

    for (let w in this.workers) {
      this.workers[w].postMessage({
        type: "manualDraw",
        centerX: this.props.centerX,
        centerY: this.props.centerY,
        graphWidth: this.props.graphWidth,
        potK: this.props.potK,
        iterK: this.props.iterK,
        maxIterations: this.props.maxIterations,
        potCutoff: this.props.potCutoff
      })
    }
  }

  componentDidMount() {
    console.log("mounted")
  }

  componentWillUnmount() {
    for (let w in this.workers) {
      this.workers[w].terminate();
    }
  }

  render() {
    return (
      <div
        style={{
          width: parseInt(this.props.width)+(this.yAxisWidth*2)+10,
          display: 'inline-block',
        }}
      >
        <Axis
          width = {parseInt(this.props.width)+4}
          height = "30"
          direction = "X"
          marginLeft = {this.yAxisWidth}
          marginRight = {this.yAxisWidth}
          domainMin = "0"
          domainMax = "1000"
          label = 'Pixels'
          mirror = {true}
        />
        <Axis
          width = {this.yAxisWidth}
          height = {parseInt(this.props.height)+4}
          direction = "Y"
          domainMin = {this.state.axesYmin}
          domainMax = {this.state.axesYmax}
          label = 'Imaginary cmpnt'
        />
        <SteadyCanvas
          contextRef = { this.saveContext }
          width = {this.props.width}
          height = {this.props.height}
          style={{
            border: "2px solid black",
            cursor: "crosshair"
          }}
        />
        <Axis
          width = {this.yAxisWidth}
          height = {parseInt(this.props.height)+4}
          direction = "Y"
          domainMin = {0}
          domainMax = {600}
          label = 'Pixels'
          mirror = {true}
        />
        <Axis
          width = {parseInt(this.props.width)+4}
          height = "35"
          direction = "X"
          marginLeft = {this.yAxisWidth}
          marginRight = {this.yAxisWidth}
          domainMin = {this.state.axesXmin}
          domainMax = {this.state.axesXmax}
          label = 'Real component'
        />
      </div>
  )}
}

export {MandelbrotCanvas};
