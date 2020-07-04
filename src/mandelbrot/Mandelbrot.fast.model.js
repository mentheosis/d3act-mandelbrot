
class FastMandelbrot {

  constructor(canvasWidth, canvasHeight, xChunkSize, xChunkIndex, postMessage) {
    // recreate the ctx api for posting inputs across the thread
    this.ctx = {
      fillRect: (x,y,w,h,c) => {
        postMessage({type:"fillRect", params:[x,y,w,h], color:c })
      },
      sendColumn: (columnData) => {
        postMessage({type:"drawColumn", columnData})
      }
    }
    this.canvas = {
      width: canvasWidth,
      height: canvasHeight
    }

    // model and coloring params
    this.max_iteration = 1000000 // 260 escape threshold
    this.eps = 0.0001 // minimum derivative threshold
    this.p2 = 1000000 // square of threshold for potential coloring (started at 1000^2)
    this.K = 1000 // constant for changing the coloring of potentials method

    // we want our canvas to represent a virtual graph of the complex number space
    // these parameters are the size of that graph
    this.graphWidth = 1 //0.0005
    this.graphHeight = this.graphWidth*0.6
    this.viewportCenterX = -0.7398
    this.viewportCenterY =  0.1488

    // these allow you to set the center of the viewport to a specific numerical coordinate
    this.originTranslateXnumerical = (-1*this.viewportCenterX) + ((this.canvas.width / 2) * (this.graphWidth / this.canvas.width))
    this.originTranslateYnumerical = (this.viewportCenterY) + ((this.canvas.height / 2) * (this.graphHeight / this.canvas.height))

    // move the origion to the right-middleish of the screen
    this.translateXpixel = (this.canvas.width/this.graphWidth) * this.originTranslateXnumerical // this constant lets the drawing space match the visible canvas around the origin
    this.translateYpixel = (this.canvas.height/this.graphHeight) * this.originTranslateYnumerical // this constant lets the drawing space match the visible canvas around the origin

    this.canvasTop = this.translateYpixel
    this.canvasBottom = this.canvasTop - this.canvas.height
    this.canvasRight = this.canvas.width - this.translateXpixel
    this.canvasLeft = this.canvasRight - this.canvas.width

    // allow multiple worker threads to work on different regions
    this.rangeStartX = typeof(xChunkSize) != "undefined" ? this.canvasLeft + (xChunkSize * xChunkIndex) : this.canvasLeft
    this.rangeEndX = typeof(xChunkSize) != "undefined" ? this.rangeStartX + xChunkSize : this.canvasRight

  }

  scaleX(Px, canvas, graphWidth) {
    // canvas width / graph width tells you how many pixes per graph unit
    // 1 divided by that is how many graph units a pixel represents
    return (1 / (canvas.width/graphWidth)) * Px
  }

  scaleY(Py, canvas, graphHeight) {
    return (1 / (canvas.height/graphHeight)) * Py
  }

  // complex arithmetic functions
  // params represent two complex numbers, real1+imaginary1, real2+imaginary2
  c_mult(r1, i1, r2, i2) {
    let real = (r1*r2) - (i1*i2)
    let img = (r1*i2) + (i1*r2)
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

  colorByIterations(iterations, max_iteration) {
    if (iterations == max_iteration)
      return 'white'
    else {
      let blue = (1-(iterations/max_iteration)) * 255
      let red = (iterations*iterations)/(max_iteration)*255
      let green = blue * 0.75
      if (blue < 75 ) { green = 255 }
      return `rgb(${red},${green},${blue})`
    }
  }

  colorByPotential(R2, pow, iteration) {
    let V = R2 < 1 ? 0 : Math.log(R2)/pow
    V = Math.log(V)/(this.K)
    //let g = (1-V) * Math.cos(iteration/5) * 255
    //let b = (1-V) * Math.cos(iteration/10) * 255

    let c1 = 1/Math.log(2)
    let c2 = 0.2345*(c1)
    let c3 = 8.0345*(c1)

    let r = 255*((1 - Math.cos(c1*V))/2)
    let g = 255*((1 - Math.cos(c2*V))/2)
    let b = 255*((1 - Math.cos(c3*V))/2)

    return `rgb(${r},${g},${b})`
  }

  drawMandelbrot(ctx, canvas, max_iteration, eps, graphWidth, graphHeight, canvasTop, canvasRight, canvasBottom, canvasLeft) {
    for (let Px = this.rangeStartX; Px <= this.rangeEndX; Px++) {
      let columnData = []
      for (let Py = canvasTop; Py >= canvasBottom; Py--) {

            let c_r = this.scaleX(Px, canvas, graphWidth)
            let c_i = this.scaleY(Py, canvas, graphHeight)

            // note that we start with c instead of 0, to avoid multiplying the derivative by 0
            let z_r = c_r
            let z_i = c_i

            let dz_r = 1
            let dz_i = 0

            // just square eps once instead of in the loop..
            let eps_sq = eps*eps
            let iteration = 0
            let pow = 1
            let color = ''
            while ( iteration < max_iteration) {
                if (this.c_modulus(dz_r, dz_i) <= eps_sq) {
                  color = 'black'
                  break
                }
                let r2 = this.c_modulus(z_r, z_i)
                if ( r2 > this.p2) {
                  color = this.colorByPotential(r2, pow, iteration)
                  break
                }

                let new_z = this.c_mult(z_r, z_i, z_r, z_i)
                new_z = this.c_add(new_z[0], new_z[1], c_r, c_i)
                let new_dz = this.c_mult(2*dz_r, 2*dz_i, z_r, z_i)

                z_r = new_z[0]
                z_i = new_z[1]
                dz_r = new_dz[0]
                dz_i = new_dz[1]
                pow = pow*2
                iteration++
            }

            if (iteration == max_iteration) {
              color = this.colorByIterations(iteration, max_iteration)
            }

            //ctx.fillRect(Px,Py,1,-1, color)
            columnData.push({Px, Py, color})
      }
      ctx.sendColumn(columnData)
    }
    console.log("fast pixel space loops done", this.rangeStartX, this.rangeEndX)
    return true
  }


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

    let color = this.colorByIterations(iteration, this.max_iteration)
    this.ctx.fillRect(Px,Py,1,-1, color)

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

  draw() {
    //this.drawMandelbrotRecursive(this.canvasLeft, this.canvasTop)
    this.drawMandelbrot(this.ctx, this.canvas, this.max_iteration, this.eps, this.graphWidth, this.graphHeight, this.canvasTop, this.canvasRight, this.canvasBottom, this.canvasLeft)
  }

  testSquare() {
    console.log("\n\ntest square filling rect\n", this.rangeStartX,this.canvasTop)
    this.ctx.fillRect(this.rangeStartX, this.canvasTop, 100, -this.canvas.height, "blue")
  }

}

export { FastMandelbrot }
/*
onmessage = function(e) {
  console.log('Message received from main script', e);
  if (typeof(e.context != "undefined")) {
    console.log("constructing")
    Mandelbrot = new FastMandelbrot(e.context)
  }
  else {
    console.log("no context in the message")
  }
  postMessage("callback");
}*/
