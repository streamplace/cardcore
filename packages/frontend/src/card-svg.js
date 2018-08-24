import React from "react";
import { View, Text, Svg, fonts, isWeb } from "@cardcore/elements";
import mouseSquare from "./mouse_square.png";
import styled from "styled-components";

const WIDTH = 1024;
const HEIGHT = (1024 * 3) / 2;

const IMAGE_BOTTOM = (WIDTH * 5) / 6;

const BOX_WIDTH = 250;

const OVERHANG_RATIO = 9 / 10;
const OVERHANG_WIDTH = OVERHANG_RATIO * WIDTH;
const OVERHANG_HEIGHT = OVERHANG_RATIO * HEIGHT;
const OVERHANG_TRANSLATE_X = (WIDTH - OVERHANG_WIDTH) / 2;
const OVERHANG_TRANSLATE_Y = (HEIGHT - OVERHANG_HEIGHT) / 2;

const TITLE_SIZE = 100;

const TEXT_BOX_START = IMAGE_BOTTOM + TITLE_SIZE + 50;
const TEXT_SIZE = 50;
const TEXT_MIDDLE = HEIGHT - (HEIGHT - IMAGE_BOTTOM) / 2;
const TEXT_MARGIN = 30;

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

const ViewWrapper = styled(View)`
  height: ${props => props.height}px;
  width: ${props => props.width}px;
  ${isWeb() && "user-select: none"};
`;

const CardTitle = styled(Text)`
  width: ${props => props.myWidth * (props.boxWidth / WIDTH)}px;
  font-size: ${props => props.fontSize * (props.boxWidth / WIDTH)}px;
  color: white;
  position: absolute;
  z-index: 1;
  font-family: ${props => props.fontFamily};
  left: ${props => props.x * props.scale}px;
  top: ${props => props.y * props.scale}px;
  text-align: ${props => (props.textAnchor === "middle" ? "center" : "left")};
`;

const CardTextWrapper = styled(View)`
  position: absolute;
  flex: 1;
  width: ${props => (OVERHANG_WIDTH - TEXT_MARGIN * 2) * props.scale}px;
  top: ${props => TEXT_BOX_START * props.scale}px;
  height: ${props =>
    (HEIGHT - TEXT_BOX_START - OVERHANG_TRANSLATE_Y - TEXT_MARGIN - 75) *
    props.scale}px;
  left: ${props => (OVERHANG_TRANSLATE_X + TEXT_MARGIN) * props.scale}px;
  z-index: 1;
  justify-content: space-around;
`;

const CardText = styled(Text)`
  font-size: ${props => props.fontSize * props.scale}px;
  text-align: center;
  font-family: ${fonts.title};
  color: white;
`;

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

    return (
      // can't use custom fonts in SVG yet, so we're forced to overlay <Text>
      // https://github.com/expo/expo/issues/1450
      // <ViewWrapper> is a bit of a shame, I'd love for this to be pure SVG
      <ViewWrapper width={width} height={height}>
        {/* name */}
        <CardTitle
          boxWidth={width}
          boxHeight={height}
          x={OVERHANG_TRANSLATE_X}
          y={IMAGE_BOTTOM}
          myWidth={OVERHANG_WIDTH}
          textAnchor="middle"
          fontFamily={fonts.title}
          fontWeight="600"
          fontSize={TITLE_SIZE}
          fill="white"
          stroke="black"
          strokeWidth={5}
          scale={width / WIDTH}
        >
          {card.name}
        </CardTitle>
        <CardTextWrapper
          boxWidth={width}
          boxHeight={height}
          scale={width / WIDTH}
        >
          {card.text.map((line, i) => (
            <CardText
              key={i}
              x="500"
              y={TEXT_MIDDLE}
              myWidth={OVERHANG_WIDTH}
              textAnchor="middle"
              fontFamily={fonts.title}
              fontWeight="600"
              fontSize={60}
              fill="white"
              boxWidth={width}
              boxHeight={height}
              scale={width / WIDTH}
            >
              {line}
            </CardText>
          ))}
        </CardTextWrapper>
        <Svg
          width={width}
          height={height}
          viewBox="0 0 1024 1536"
          style={{ zIndex: 0 }}
        >
          {/* inner card group, excluding number boxes */}
          <Svg.G
            transform={`scale(${OVERHANG_RATIO}) translate(${OVERHANG_TRANSLATE_X} ${OVERHANG_TRANSLATE_Y})`}
            width={WIDTH / 5}
            height={1382}
            viewBox="0 0 1024 1536"
          >
            {/* dark grey background */}
            <Svg.Rect width="1024" height="1536" fill="rgb(32, 32, 32)" />

            {/* portrait */}
            <Svg.Image
              href={mouseSquare}
              width="1024"
              height={IMAGE_BOTTOM}
              preserveAspectRatio="xMidYMid slice"
            />
          </Svg.G>

          {/* mana box */}
          <NumberBox value={card.mana} x={0} y={0} bg="rgb(15, 143, 255)" />

          {/* attack box */}
          <NumberBox
            value={card.attack}
            x={0}
            y={HEIGHT - BOX_WIDTH}
            bg="rgb(216, 163, 24)"
          />

          {/* health box */}
          <NumberBox
            value={card.health}
            x={WIDTH - BOX_WIDTH}
            y={HEIGHT - BOX_WIDTH}
            bg="#f91717"
          />
        </Svg>
      </ViewWrapper>
    );
  }
}
