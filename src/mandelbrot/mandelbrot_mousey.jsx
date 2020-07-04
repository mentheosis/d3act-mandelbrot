import React, { useState, useRef, useEffect } from 'react';
var d3 = require('d3')

var width = 300

function ij_to_xy(ij, xmin, xmax, ymin, ymax, w) {
  return [
    ((xmax - xmin) / (w - 1)) * ij[0] + xmin,
    ((ymin - ymax) / (w - 1)) * ij[1] + ymax
  ];
}

function xy_to_ij(xy, xmin, xmax, ymin, ymax, w) {
  return [
    ((w - 1) * (xy[0] - xmin)) / (xmax - xmin),
    ((1 - w) * (xy[1] - ymax)) / (ymax - ymin)
  ];
}

// A canvas to draw the Mandelbrot set
function mandel_canvas() {
  let xmin = -2;
  let xmax = 0.6;
  let ymin = -1.3;
  let ymax = 1.3;
  let w = 0.5 * width;
  let canvas = d3
    .create('canvas')
    .attr('width', w)
    .attr('height', w);

  draw_mandelbrot_set(canvas.node(), xmin, xmax, ymin, ymax);

  let context = canvas.node().getContext("2d");
  context.fillStyle = "#f30";

  let ij = xy_to_ij([-1, 0], xmin, xmax, ymin, ymax, w);
  context.fillRect(ij[0] + 1, ij[1] - 1, 3, 3);

  const render = function (ij) {
    let xy = ij_to_xy(ij, xmin, xmax, ymin, ymax, w);

    // The lazy programmer's way to cover up the previous clicked point
    draw_mandelbrot_set(canvas.node(), xmin, xmax, ymin, ymax);
    context.fillRect(ij[0] + 1, ij[1] - 1, 3, 3);
  };

  let clicked = false;
  canvas.on('mousedown', function() {
    clicked = true;
    render(d3.mouse(this));
  });
  canvas.on('mousemove', function() {
    if (clicked) render(d3.mouse(this));
  });
  canvas.on('mouseup', function() {
    clicked = false;
  });

  return canvas;
}

// A function to draw the mandelbrot set
function draw_mandelbrot_set(canvas, xmin, xmax, ymin, ymax) {
  let bail = 100;
  let w = width / 2;
  let mandel_context = canvas.getContext("2d");
  let canvasData = mandel_context.createImageData(canvas.width, canvas.height);
  for (let i = 0; i < canvas.width; i++) {
    for (let j = 0; j < canvas.height; j++) {
      var c = ij_to_xy([i, j], xmin, xmax, ymin, ymax, w);
      var it_cnt = mandelbrot_iteration_count(c[0], c[1], bail);
      var scaled_it_cnt = 255 - (255 * it_cnt) / (bail + 1);
      var idx = (i + j * canvas.width) * 4;
      canvasData.data[idx + 0] = scaled_it_cnt;
      canvasData.data[idx + 1] = scaled_it_cnt;
      canvasData.data[idx + 2] = scaled_it_cnt;
      canvasData.data[idx + 3] = 255;
    }
  }
  mandel_context.putImageData(canvasData, 0, 0);
}


// Compute the iteration count from z=0 for a given z^2+c
function mandelbrot_iteration_count(cre, cim, bail = 200) {
  let x = cre;
  let y = cim;
  let xtemp;
  let ytemp;
  let cnt = 0;
  while (x * x + y * y <= 4 && ++cnt < bail) {
    xtemp = x;
    ytemp = y;
    x = xtemp * xtemp - ytemp * ytemp + cre;
    y = 2 * xtemp * ytemp + cim;
  }
  return cnt;
}

function Mandelbrot() {
  //let container = d3
  //  .create('div')
  //  .style('width', width + 'px')
  //  .style('height', 0.54 * width + 'px');
  //container.append(() => mandel_canvas().node()).style('float', 'left');
  // container.append(() => c.node());
  //return container.node();

  var dataset = []
  for (let i=0; i<10; i++) {
    dataset.push([i,i,-i,1])
  }

  return (
    <canvas
      width="96vw"
      height="80vh"
      viewBox="-50 -50 100 100"
      style={{
        margin: "2.5%",
        border: "2px solid black"}}
    >
      {dataset.map( ([id, x, y, r], i) => (
        <circle
          key={id}
          cx={x}
          cy={y}
          r={r}
        />
      ))}
      <circle
        cx="0"
        cy="0"
        r="1"
        fill="red"
      />
  </canvas>
  )

}


export { Mandelbrot };
