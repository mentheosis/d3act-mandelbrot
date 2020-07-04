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

const GenerateDataSet = () => {
  var set = []
  for(let i = 1; i<=10; i++) {
    set.push([ (Math.random() * i * 2) - 5, (Math.random() * i * 2) -5 ])
  }
  return set
}

const CirclesSvg = () => {
  const [dataset, setDataset] = useState(
    GenerateDataSet()
  )
  useInterval(() => {
    const newDataset = GenerateDataSet()
    setDataset(newDataset)
  }, 2000)
  return (
    <svg
      width="95vw"
      height="40vh"
      viewBox="-50 -20 100 40"
      style={{
        margin: "0 2.5% 0 2.5%",
        border: "2px solid black"}}
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
