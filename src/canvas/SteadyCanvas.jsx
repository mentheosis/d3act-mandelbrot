import React from 'react';

// avoid the canvas component itself re-rendering https://philna.sh/blog/2018/09/27/techniques-for-animating-on-the-canvas-in-react/
// this class allows us to pass a callback into the props to access the canvas context
class SteadyCanvas extends React.Component {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <canvas
        style={this.props.style ? this.props.style : {}}
        width={this.props.width}
        height={this.props.height}
        ref={ (node) =>
          node ? this.props.contextRef(node.getContext('2d')) : null
        }
      />
    );
  }
}

export {SteadyCanvas}
