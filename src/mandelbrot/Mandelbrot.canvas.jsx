import React, { useState, useRef, useEffect } from 'react'
import _ from 'lodash'
import {SteadyCanvas} from '../canvas/SteadyCanvas'
import {renderMandelbrot} from './Mandelbrot.model'
//import {FastMandelbrot} from './Mandelbrot.fast.model'
import Worker from './Mandelbrot.worker'
//import Worker from './Mandelbrot.fast.model'

class MandelbrotCanvas extends React.Component {
  constructor(props) {
    super(props)
    this.saveContext = this.saveContext.bind(this);
    this.onMessageFromWorker = this.onMessageFromWorker.bind(this);
    this.initializeCanvas = _.once(this.initializeCanvas)
    this.drawAxesBefore = _.once(this.drawAxesBefore)
    this.drawAxesAfter = _.debounce(this.drawAxesAfter, 500, {leading:false, trailing:true})
    this.workers = {}

    this.test = _.once((m) => {
      console.log("got draw col", m.data)
      for (let i in m.data.columnData) {
        let pixel = m.data.columnData[i]
        console.log('drawing column', pixel)
        this.ctx.fillStyle = pixel.color
        this.ctx.fillRect(0, pixel.Py, 10, -10)
      }
    })

  }


  onMessageFromWorker(m) {
    if (m.data.type == 'modelCreated') {
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

  // different debounce params for after and before
  drawAxesAfter() {
    this.drawAxes(this.ctx,this.axesData)
  }

  // different debounce params for after and before
  drawAxesBefore(m) {
    this.axesData = m.data
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

  initializeCanvas(ctx, data) {
    console.log("\n\ninitializing canvas translate and scale\n\n", data)
    ctx.translate(data.translateXpixel, data.translateYpixel)
    ctx.scale(1, -1)
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
          xChunkIndex: i
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

    context.canvas.addEventListener('mouseup', (e) => {

      let unitsPerPixelX = this.axesData.graphWidth / this.ctx.canvas.width
      let unitsPerPixelY = this.axesData.graphHeight / this.ctx.canvas.height
      let clickedPointNumericX = (e.layerX - this.axesData.translateXpixel) * unitsPerPixelX
      let clickedPointNumericY = (e.layerY - this.axesData.translateYpixel) * -unitsPerPixelY

      console.log("mouseup event",
        "\nNum X:", clickedPointNumericX,
        "\nNum Y:", clickedPointNumericY,
        "\nPix X:", e.layerX,
        "\nPix Y:", e.layerY)

    }, false);

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
      <SteadyCanvas
        contextRef = { this.saveContext }
        width = {this.props.width}
        height = {this.props.height}
        style={{
          margin: "2.5% 2.5% 0 2.5%",
          border: "2px solid black",
          cursor: "crosshair"
        }}
      />
  )}
}

export {MandelbrotCanvas};
