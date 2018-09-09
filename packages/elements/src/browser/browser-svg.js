import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

function createElement(name, type) {
  function CreateElement(props) {
    return React.createElement(type, props, props.children);
  }

  CreateElement.displayName = name;

  CreateElement.propTypes = {
    children: PropTypes.node
  };

  CreateElement.defaultProps = {
    children: undefined
  };

  return CreateElement;
}

let Svg = createElement("Svg", "svg");
Svg = styled.svg`
  user-select: none;
`;

Svg.Circle = createElement("Circle", "circle");
Svg.ClipPath = createElement("ClipPath", "clipPath");
Svg.Defs = createElement("Defs", "defs");
Svg.Ellipse = createElement("Ellipse", "ellipse");
Svg.G = createElement("G", "g");
Svg.Image = createElement("Image", "image");
Svg.Line = createElement("Line", "line");
Svg.LinearGradient = createElement("LinearGradient", "linearGradient");
Svg.Path = createElement("Path", "path");
Svg.Polygon = createElement("Polygon", "polygon");
Svg.Polyline = createElement("Polyline", "polyline");
Svg.RadialGradient = createElement("RadialGradient", "radialGradient");
Svg.Rect = createElement("Rect", "rect");
Svg.Stop = createElement("Stop", "stop");
Svg.Svg = createElement("Svg", "svg");
Svg.Symbol = createElement("Symbol", "symbol");
Svg.Text = createElement("Text", "text");
Svg.TextPath = createElement("TextPath", "textPath");
Svg.TSpan = createElement("TSpan", "tspan");
Svg.Use = createElement("Use", "use");

export default Svg;
