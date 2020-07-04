
function scaleX(Px, canvas, graphWidth) {
  // canvas width / graph width tells you how many pixes per graph unit
  // 1 divided by that is how many graph units a pixel represents
  return (1 / (canvas.width/graphWidth)) * Px
}

function scaleY(Py, canvas, graphHeight) {
  return (1 / (canvas.height/graphHeight)) * Py
}

function colorByIterations(iterations, max_iteration) {
  if (iterations == max_iteration)
    return 'black'
  else {
    let blue = (1-(iterations/max_iteration)) * 255
    let red = (iterations*iterations)/(max_iteration)*255
    let green = blue * 0.75
    if (blue < 75 ) { green = 255 }
    return `rgb(${red},${green},${blue})`
  }
}

function drawMandelbrot(ctx, canvas, max_iteration, graphWidth, graphHeight, canvasTop, canvasRight, canvasBottom, canvasLeft) {
  for (let Px = canvasLeft; Px <= canvasRight; Px++) {
    for (let Py = canvasTop; Py >= canvasBottom; Py--) {
          let x0 = scaleX(Px, canvas, graphWidth)
          let y0 = scaleY(Py, canvas, graphHeight)
          let x = 0.0
          let y = 0.0
          let iteration = 0
          while ( x*x + y*y <= 4 && iteration < max_iteration) {
              let xtemp = x*x - y*y + x0
              y = 2*x*y + y0
              x = xtemp
              iteration++
          }
          ctx.fillStyle = colorByIterations(iteration, max_iteration)
          ctx.fillRect(Px,Py,1,1)
  }}
  console.log("pixel spaces loops done")
}

// Draw coordinate plane
function drawAxes(ctx, canvas, canvasTop, canvasBottom, canvasLeft, canvasRight) {
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

function renderMandelbrot(ctx) {
    let canvas = ctx.canvas

    // we want our canvas to represent a virtual graph of the complex number space
    // these parameters are the size of that graph
    let max_iteration = 160
    let graphWidth = 0.02 //0.02
    let graphHeight = 0.012 //0.012
    let viewportCenterX = 0.74 //0.74
    let viewportCenterY = 0.15 //0.15

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

    drawMandelbrot(ctx, canvas, max_iteration, graphWidth, graphHeight, canvasTop, canvasRight, canvasBottom, canvasLeft)
    drawAxes(ctx, canvas, canvasTop, canvasBottom, canvasLeft, canvasRight)
}

export { renderMandelbrot }
