import React, { useState, useRef, useEffect } from 'react';

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

const GenerateDataSet = (props) => {
  var set = []
  for(let i = 1; i<=10; i++) {
    set.push([ (Math.random() * props.width) - (props.width/2), (Math.random() * props.height) - (props.height/2) ])
  }
  return set
}

const CirclesSvg = (props) => {
  const [dataset, setDataset] = useState(
    GenerateDataSet(props)
  )
  useInterval(() => {
    const newDataset = GenerateDataSet(props)
    setDataset(newDataset)
  }, 2500)
  return (
    <svg
      width={props.width}
      height={props.height}
      viewBox={`-${props.width/2} -${props.height/2} ${props.width} ${props.height}`}
      style={{
        display: "inline-block",
        border: "1px solid black"
      }}
    >
      {dataset.map(([x, y], i) => (
        <circle
          key={""+x+y+""}
          cx={x}
          cy={y}
          r="1"
        />
      ))}
      <circle
        cx="0"
        cy="0"
        r="1"
        fill="red"
      />
    </svg>
  )
}

export {CirclesSvg};
