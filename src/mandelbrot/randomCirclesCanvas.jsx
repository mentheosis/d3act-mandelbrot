import React, { useState, useRef, useEffect } from 'react';
import {SteadyCanvas} from '../canvas/SteadyCanvas'

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

const GenerateDataSet = () => {
  var set = []
  for(let i = 1; i<=10; i++) {
    set.push([ (Math.random() * i * 2) - 5, (Math.random() * i * 2) -5 ])
  }
  return set
}

class CirclesCanvas extends React.Component {
  constructor(props) {
    super(props)
    this.saveContext = this.saveContext.bind(this);
  }

  // Draw coordinate plane
  drawAxes(ctx, canvas, canvasTop, canvasBottom, canvasLeft, canvasRight) {
      // draw the axes of the numerical plane
      ctx.beginPath()
      ctx.moveTo(0, canvasTop)
      ctx.lineTo(0, canvasBottom);
      ctx.moveTo(canvasRight, 0)
      ctx.lineTo(canvasLeft, 0);
      ctx.stroke();

      // draw the center crosshair of the viewport
      ctx.strokeStyle = `rgb(150,150,150)`
      ctx.beginPath()
      ctx.moveTo(canvasRight - Math.floor(canvas.width/2), canvasTop)
      ctx.lineTo(canvasRight - Math.floor(canvas.width/2), canvasBottom);
      ctx.moveTo(canvasRight, canvasTop - Math.floor(canvas.height/2))
      ctx.lineTo(canvasLeft, canvasTop - Math.floor(canvas.height/2));
      ctx.stroke();

  }

  saveContext(context) {
    //this.setState({
    //  ctx: context
    //})
    // apparently this canvas context is some special edge case where we dont use setState
    this.ctx = context
    let canvas = context.canvas
    let ctx = context

    // we want our canvas to represent a virtual graph of the complex number space
    // these parameters are the size of that graph
    let graphWidth = 3
    let graphHeight = 2
    let viewportCenterX = 0.74
    let viewportCenterY = 0.15

    // these allow you to set the center of the viewport to a specific numerical coordinate
    let originTranslateXnumerical = viewportCenterX + ((canvas.width / 2) * (graphWidth / canvas.width))
    let originTranslateYnumerical = viewportCenterY + ((canvas.height / 2) * (graphHeight / canvas.height))

    // move the origion to the right-middleish of the screen
    let translateXpixel = (canvas.width/graphWidth) * originTranslateXnumerical // this constant lets the drawing space match the visible canvas around the origin
    let translateYpixel = (canvas.height/graphHeight) * originTranslateYnumerical // this constant lets the drawing space match the visible canvas around the origin
    ctx.translate(translateXpixel, translateYpixel);

    let canvasTop = translateYpixel
    let canvasBottom = 0 - canvas.height - translateYpixel
    let canvasRight = canvas.width - translateXpixel
    let canvasLeft = canvasRight - canvas.width

    //make the canvas more like a mathmatical plane, y-axis increases upwards
    ctx.scale(1, -1)
    this.drawAxes(ctx, canvas, canvasTop, canvasBottom, canvasLeft, canvasRight)


    this.timerId = setInterval(
      () => {

        console.log("hey")
        try {
          console.log("inside")
          GenerateDataSet().forEach((item, i) => {
            console.log("map")
            this.ctx.fillRect(item[0],item[1],1,1)
          });
        }
        catch(e) {
          console.log("no ctx")
        }
      }
      , 2000
    )
  }

  componentDidMount() {
    console.log("mounted")
  }

  render() {
    return (
      <SteadyCanvas
        contextRef = { this.saveContext }
        width = {this.props.width}
        height = {this.props.height}
        style={{
          margin: "2.5% 2.5% 0 2.5%",
          border: "2px solid blue",
        }}
      />
  )}
}

const Canvs = () => {
  return (
    <canvas style={{
      margin: "2.5%",
      width: "95%",
      height: "80%",
      border: "2px solid red"
    }} />
  )
}

export {Canvs, CirclesCanvas};
