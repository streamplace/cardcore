import React from "react";
import { Text, Svg, fonts } from "@cardcore/elements";
import mouseSquare from "./mouse_square.png";

const WIDTH = 1024;
const HEIGHT = (1024 * 3) / 2;

const BOX_WIDTH = 250;

const OVERHANG_RATIO = 9 / 10;
const OVERHANG_WIDTH = OVERHANG_RATIO * WIDTH;
const OVERHANG_HEIGHT = OVERHANG_RATIO * HEIGHT;
const OVERHANG_TRANSLATE_X = (WIDTH - OVERHANG_WIDTH) / 2;
const OVERHANG_TRANSLATE_Y = (HEIGHT - OVERHANG_HEIGHT) / 2;

const NumberBox = props => (
  <Svg.G
    transform={`translate(${props.x} ${props.y}) scale(${BOX_WIDTH / 1000}) `}
    width={1000}
    height={1000}
  >
    <Svg.Rect x={0} y={0} width={1000} height={1000} fill={props.bg} />
    <Svg.Text
      width={1000}
      textAnchor="middle"
      fontFamily={fonts.title}
      fontWeight="600"
      fontSize="800px"
      fill="white"
      stroke="black"
      strokeWidth="35px"
      x={500}
      y={800}
    >
      {props.value}
    </Svg.Text>
  </Svg.G>
);

export default class CardSVG extends React.Component {
  componentDidMount() {
    this.timeout = setInterval(
      () => this.setState({ reload: Date.now() }),
      1000
    );
  }
  componentWillUnmount() {
    clearInterval(this.timeout);
  }
  render() {
    let { width, height, card } = this.props;
    if (!width && !height) {
      throw new Error("need width or height for a card");
    }
    if (!width) {
      width = (height * 2) / 3;
    }
    if (!height) {
      height = (width * 3) / 2;
    }
    const imageBottom = (1024 * 5) / 6;
    return (
      <Svg width={width} height={height} viewBox="0 0 1024 1536">
        <Svg.G
          transform={`scale(${OVERHANG_RATIO}) translate(${OVERHANG_TRANSLATE_X} ${OVERHANG_TRANSLATE_Y})`}
          width={WIDTH / 5}
          height={1382}
          viewBox="0 0 1024 1536"
        >
          <Svg.Rect width="1024" height="1536" fill="rgb(128, 128, 128)" />
          <Svg.Image
            href={mouseSquare}
            width="1024"
            height={imageBottom}
            preserveAspectRatio="xMidYMid slice"
          />
          <Svg.Text
            x="500"
            y={imageBottom + 30}
            width="1024"
            textAnchor="middle"
            fontFamily={fonts.title}
            fontWeight="600"
            fontSize="130px"
            fill="white"
            stroke="black"
            strokeWidth={5}
          >
            Stinky Mouse
          </Svg.Text>
        </Svg.G>
        <NumberBox value={card.mana} x={0} y={0} bg="rgb(15, 143, 255)" />
        <NumberBox
          value={card.attack}
          x={0}
          y={HEIGHT - BOX_WIDTH}
          bg="rgb(216, 163, 24)"
        />
        <NumberBox
          value={card.health}
          x={WIDTH - BOX_WIDTH}
          y={HEIGHT - BOX_WIDTH}
          bg="#f91717"
        />
      </Svg>
    );
  }
}
