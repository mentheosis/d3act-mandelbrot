
class FastMandelbrot {

  constructor(ctx) {
    /*
    this.ctx = ctx
    this.canvas = canvas
    this.max_iteration = max_iteration
    this.eps = eps
    this.graphWidth = graphWidth
    this.graphHeight = graphHeight
    this.canvasTop = canvasTop
    this.canvasRight = canvasRight
    this.canvasBottom = canvasBottom
    this.canvasLeft = canvasLeft
    */

    this.ctx = ctx
    this.canvas = ctx.canvas

    // we want our canvas to represent a virtual graph of the complex number space
    // these parameters are the size of that graph
    this.max_iteration = 160 // escape threshold
    this.eps = 0.1 // eps for minimum derivative threshold
    this.graphWidth = 3 //0.02
    this.graphHeight = 2 //0.012
    this.viewportCenterX = 0.75 //0.75
    this.viewportCenterY = 0.15 //0.15

    // these allow you to set the center of the viewport to a specific numerical coordinate
    this.originTranslateXnumerical = this.viewportCenterX + ((this.canvas.width / 2) * (this.graphWidth / this.canvas.width))
    this.originTranslateYnumerical = this.viewportCenterY + ((this.canvas.height / 2) * (this.graphHeight / this.canvas.height))

    // move the origion to the right-middleish of the screen
    this.translateXpixel = (this.canvas.width/this.graphWidth) * this.originTranslateXnumerical // this constant lets the drawing space match the visible canvas around the origin
    this.translateYpixel = (this.canvas.height/this.graphHeight) * this.originTranslateYnumerical // this constant lets the drawing space match the visible canvas around the origin

    this.canvasTop = this.translateYpixel
    this.canvasBottom = 0 - this.canvas.height - this.translateYpixel
    this.canvasRight = this.canvas.width - this.translateXpixel
    this.canvasLeft = this.canvasRight - this.canvas.width

    //make the canvas more like a mathmatical plane, y-axis increases upwards
    ctx.scale(1, -1)
    ctx.translate(this.translateXpixel, this.translateYpixel);

  }

  scaleX(Px, canvas, graphWidth) {
    // canvas width / graph width tells you how many pixes per graph unit
    // 1 divided by that is how many graph units a pixel represents
    return (1 / (canvas.width/graphWidth)) * Px
  }

  scaleY(Py, canvas, graphHeight) {
    return (1 / (canvas.height/graphHeight)) * Py
  }

  colorByIterations(iterations, max_iteration) {
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

  // params represent two complex numbers, real1+imaginary1, real2+imaginary2
  c_mult(r1, i1, r2, i2) {
    let real = r1*r2 - i1*i2
    let img = r1*i2 + i1+r2
    return [real,img]
  }
  c_add(r1,i1,r2,i2) {
    let real = r1+r2
    let img = i1+i2
    return [real,img]
  }
  c_modulus(r,i) {
    return (r*r)+(i*i)
  }

  /*
  drawMandelbrot(ctx, canvas, max_iteration, eps, graphWidth, graphHeight, canvasTop, canvasRight, canvasBottom, canvasLeft) {
    for (let Px = canvasLeft; Px <= canvasRight; Px++) {
      for (let Py = canvasTop; Py >= canvasBottom; Py--) {
            if( Px%100 == 0 && Py%100 ==0) {
              console.log("looping..")
            }

            let c_r = scaleX(Px, canvas, graphWidth)
            let c_i = scaleY(Py, canvas, graphHeight)

            // note that we start with c instead of 0, to avoid multiplying the derivative by 0
            let z_r = c_r
            let z_i = c_i

            let dz_r = 1
            let dz_i = 0

            // just square eps once instead of in the loop..
            let eps_sq = eps*eps
            let iteration = 0

            while ( iteration < max_iteration) {
                if (c_modulus(dz_r, dz_i) <= eps_sq) {
                  ctx.fillStyle = colorByIterations(iteration, max_iteration)
                  break
                }
                if (c_modulus(z_r, z_i) > 4) {
                  ctx.fillStyle = colorByIterations(iteration, max_iteration)
                  break
                }

                let new_z = c_mult(z_r, z_i, z_r, z_i)
                new_z = c_add(new_z[0], new_z[1], c_r, c_i)
                let new_dz = c_mult(2*dz_r, 2*dz_i, z_r, z_i)

                z_r = new_z[0]
                z_i = new_z[1]
                dz_r = new_dz[0]
                dz_i = new_dz[1]
                iteration++
            }

            ctx.fillRect(Px,Py,1,1)
    }}
    console.log("fast pixel space loops done")
    return true
  }
  */

  drawMandelbrotRecursive(Px, Py) {
    if (Px == this.canvasLeft && Py == this.canvasTop) {
      console.log("strting recurse")
    }
    console.log("allrecurse", Px, Py)
    if (Px % 100 == 0 && Py % 100 == 0) {
      console.log("recursing")
    }

    let c_r = this.scaleX(Px, this.canvas, this.graphWidth)
    let c_i = this.scaleY(Py, this.canvas, this.graphHeight)

    // note that we start with c instead of 0, to avoid multiplying the derivative by 0
    let z_r = c_r
    let z_i = c_i

    let dz_r = 1
    let dz_i = 0

    // just square eps once instead of in the loop..
    let eps_sq = this.eps*this.eps
    let iteration = 0

    while ( iteration < this.max_iteration) {
        if (this.c_modulus(dz_r, dz_i) <= eps_sq) {
          break
        }
        if (this.c_modulus(z_r, z_i) > 4) {
          break
        }

        let new_z = this.c_mult(z_r, z_i, z_r, z_i)
        new_z = this.c_add(new_z[0], new_z[1], c_r, c_i)
        let new_dz = this.c_mult(2*dz_r, 2*dz_i, z_r, z_i)

        z_r = new_z[0]
        z_i = new_z[1]
        dz_r = new_dz[0]
        dz_i = new_dz[1]
        iteration++
    }

    if (Px == this.canvasLeft && Py == this.canvasTop) {
      console.log("first recurse done")
    }

    this.ctx.fillStyle = this.colorByIterations(iteration, this.max_iteration)
    this.ctx.fillRect(Px,Py,1,1)

    if (Px < this.canvasRight) {
      requestAnimationFrame(() => {
        this.drawMandelbrotRecursive(Px+1, Py)
      })
    } else if (Py > this.canvasBottom) {
      requestAnimationFrame(() => {
        this.drawMandelbrotRecursive(this.canvasLeft, Py-1)
      })
    }
    else {
      return console.log("Recursing done")
    }

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

  draw() {
      //drawMandelbrot(this.ctx, this.canvas, this.max_iteration, this.eps, this.graphWidth, this.graphHeight, this.canvasTop, this.canvasRight, this.canvasBottom, this.canvasLeft)
      this.drawMandelbrotRecursive(this.canvasLeft, this.canvasTop)
      this.drawAxes(this.ctx, this.canvas, this.canvasTop, this.canvasBottom, this.canvasLeft, this.canvasRight)
  }

}

export { FastMandelbrot }
