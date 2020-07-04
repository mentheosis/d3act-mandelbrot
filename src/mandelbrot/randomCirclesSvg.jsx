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
        margin: "2.5% 2.5% 0 2.5%",
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

const Svg = () => {
  return (
    <svg style={{
      margin: "2.5%",
      width: "95%",
      height: "80%",
      border: "2px solid red"
    }} />
  )
}

/*
const Circle = () => {
  return (
    <svg>
      <circle
        cx="150"
        cy="77"
        r="0.5"
      />
    </svg>
  )
}

const AnimatedCircles = () => {
  //const [visibleCircles, setVisibleCircles] = useState(
    //generateCircles()
  //);
  var visibleCircles;
  var setVisibleCircles;

  useInterval(() => {
    setVisibleCircles(generateCircles())
  }, 2000);

  return (
    <svg viewBox="0 0 100 20">
      {allCircles.map(d => (
        <AnimatedCircle
          key={d}
          index={d}
          isShowing={visibleCircles.includes(d)}
        />
      ))}
    </svg>
  )
}

const AnimatedCircle = ({ index, isShowing }) => {
  const wasShowing = useRef(false)
  useEffect(() => {
    wasShowing.current = isShowing
  }, [isShowing])
  const style = useSpring({
    config: {
      duration: 1200,
    },
    r: isShowing ? 6 : 0,
    opacity: isShowing ? 1 : 0,
  })
  return (
    <animated.circle {...style}
      cx={index * 15 + 10}
      cy="10"
      fill={
        !isShowing          ? "tomato" :
        !wasShowing.current ? "cornflowerblue" :
                              "lightgrey"
      }
    />
  )
}
*/

export {Svg, CirclesSvg};
