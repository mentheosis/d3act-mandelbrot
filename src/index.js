import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//import * as serviceWorker from './serviceWorker';

import { CirclesSvg } from './mandelbrot/randomCirclesSvg'
import { Canvs, CirclesCanvas } from './mandelbrot/randomCirclesCanvas'
import { MandelbrotCanvas } from './mandelbrot/Mandelbrot.canvas'


ReactDOM.render(
  <React.StrictMode>
    {/*
      <App />
      <Svg />
      <Mandelbrot />
      <CirclesCanvas width="1000" height="600" />
      <MandelbrotCanvas width="1000" height="600" />
      <MandelbrotCanvas width="1000" height="600" fast={true}/>
    */}

    <MandelbrotCanvas
      width="1000"
      height="600"
      multi={32}/>
    <CirclesSvg />
    <div style={{
        marginBottom: "2.5%"
      }}/>

  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();
