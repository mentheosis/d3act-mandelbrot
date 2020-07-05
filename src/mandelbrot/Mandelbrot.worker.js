//importScripts('./Mandelbrot.fast.model.js')
import {FastMandelbrot} from './Mandelbrot.fast.model'

class MandelbrotContainer {
  constructor() {
  }
}

const mc = new MandelbrotContainer()
mc.postMessage = (m) => {
  m.id = mc.id
  postMessage(m)
}

onmessage = function(m) {
  if ( m.data.type == "createModel") {
    mc.id = m.data.id
    mc.model = new FastMandelbrot(
      m.data.canvasWidth,
      m.data.canvasHeight,
      m.data.xChunkSize,
      m.data.xChunkIndex,
      mc.postMessage,
      mc.id
    )
    // override the models own starting defaults with the control panels.
    mc.model.initializeInputs(
      m.data.centerX,
      m.data.centerY,
      m.data.graphWidth,
      m.data.potK,
      m.data.iterK,
      m.data.maxIterations,
      m.data.potCutoff)
    mc.postMessage({
      type: "modelCreated",
      canvasTop: mc.model.canvasTop,
      canvasRight: mc.model.canvasRight,
      canvasBottom: mc.model.canvasBottom,
      canvasLeft: mc.model.canvasLeft,
      translateXpixel: mc.model.translateXpixel,
      translateYpixel: mc.model.translateYpixel,
      graphWidth: mc.model.graphWidth,
      graphHeight: mc.model.graphHeight,
      graphCenterX: mc.model.viewportCenterX,
      graphCenterY: mc.model.viewportCenterY
    })
  } else if (m.data.type == "initializedCanvas") {
    mc.model.drawMandelbrot()
  } else if (m.data.type == "manualDraw") {
    mc.model.initializeInputs(
      m.data.centerX,
      m.data.centerY,
      m.data.graphWidth,
      m.data.potK,
      m.data.iterK,
      m.data.maxIterations,
      m.data.potCutoff
    )
    mc.postMessage({
      type: "modelCreated",
      canvasTop: mc.model.canvasTop,
      canvasRight: mc.model.canvasRight,
      canvasBottom: mc.model.canvasBottom,
      canvasLeft: mc.model.canvasLeft,
      translateXpixel: mc.model.translateXpixel,
      translateYpixel: mc.model.translateYpixel,
      graphWidth: mc.model.graphWidth,
      graphHeight: mc.model.graphHeight,
      graphCenterX: mc.model.viewportCenterX,
      graphCenterY: mc.model.viewportCenterY
    })
  } else {
    console.log("Dunno what to do with this message", m)
  }
}
