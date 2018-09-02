import React from "react";
import {
  View,
  Text,
  Svg,
  fonts,
  isWeb,
  Animated,
  Easing,
  PanResponder
} from "@cardcore/elements";
import { Box } from "@cardcore/util";
import mouseSquare from "./mouse_square.png";
import styled from "styled-components";
import { connect } from "react-redux";
import { desaturate } from "polished";
import { frontendCardDrop } from "./frontend-actions";

const WIDTH = 1024;
const HEIGHT = (1024 * 3) / 2;

const IMAGE_BOTTOM = (WIDTH * 5) / 6;

const BOX_SIZE = 225;
const MANA_BOX_SIZE = 250;

const OVERHANG_RATIO = 10 / 10;
const OVERHANG_WIDTH = OVERHANG_RATIO * WIDTH;
const OVERHANG_HEIGHT = OVERHANG_RATIO * HEIGHT;
const OVERHANG_TRANSLATE_X = (WIDTH - OVERHANG_WIDTH) / 2;
const OVERHANG_TRANSLATE_Y = (HEIGHT - OVERHANG_HEIGHT) / 2;

const MANA_COLOR = "rgb(15, 143, 255)";
const MANA_COLOR_INACTIVE = desaturate(1, MANA_COLOR);

const PLAYABLE_BAR_HEIGHT = 50;

const TITLE_SIZE = 100;

const TEXT_BOX_START = IMAGE_BOTTOM + TITLE_SIZE + 50;
const TEXT_SIZE = 60;
const TEXT_MIDDLE = HEIGHT - (HEIGHT - IMAGE_BOTTOM) / 2;
const TEXT_MARGIN = 30;

const TEMP_DEFAULT_CARD = {
  name: "Stinky Mouse",
  cost: 1,
  attack: 2,
  health: 3,
  text: ["Sneaky", "ON ENTER: Deal 1 damage to all other creatures."]
};

const NumberBox = props => (
  <Svg.G
    transform={`translate(${props.x} ${props.y}) scale(${props.size / 1000}) `}
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

const ViewWrapper = styled(Animated.View)`
  ${isWeb() && "user-select: none"};
  margin: 0 10px;
  z-index: ${props => (props.dragging ? 101 : 100)};
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
`;

const CardTitle = styled(Text)`
  width: ${props => OVERHANG_WIDTH * props.scale}px;
  font-size: ${props => props.fontSize * props.scale}px;
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
    (HEIGHT - TEXT_BOX_START - OVERHANG_TRANSLATE_Y - TEXT_MARGIN - 175) *
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

const CardSide = styled(Animated.View)`
  backface-visibility: hidden;
  position: absolute;
  top: 0px;
  left: 0px;
`;

export class CardSVG extends React.Component {
  constructor() {
    super();
    this.spinValue = new Animated.Value(1);
    this.pan = new Animated.ValueXY();
    this.state = { dragging: false };
    // Initialize PanResponder with move handling
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => this.props.draggable,
      onPanResponderGrant: () => this.setState({ dragging: true }),
      onPanResponderMove: Animated.event([
        null,
        { dx: this.pan.x, dy: this.pan.y }
      ]),
      onPanResponderRelease: (e, { moveX, moveY }) => {
        this.props.dispatch(
          frontendCardDrop({ boxId: this.props.boxId, x: moveX, y: moveY })
        );
        this.setState({ dragging: false });
        this.pan.setValue({ x: 0, y: 0 });
      }
    });
    this.pan.setValue({ x: 0, y: 0 });
  }

  componentDidMount() {
    this.spinValue.setValue(1);
    if (this.props.cardId) {
      this.flipFront();
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.cardId && !!this.props.cardId) {
      this.flipFront();
    }
  }

  flipFront() {
    Animated.timing(this.spinValue, {
      toValue: 0,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true
    }).start(() => {});
  }

  render() {
    let { width, height, card } = this.props;
    const manaColor = this.props.active ? MANA_COLOR : MANA_COLOR_INACTIVE;
    if (!card) {
      card = TEMP_DEFAULT_CARD;
    }
    if (!width && !height) {
      throw new Error("need width or height for a card");
    }
    if (!width) {
      width = (height * 2) / 3;
    }
    if (!height) {
      height = (width * 3) / 2;
    }
    const spin = this.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"]
    });
    const backSpin = this.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["180deg", "0deg"]
    });
    return (
      // can't use custom fonts in SVG yet, so we're forced to overlay <Text>
      // https://github.com/expo/expo/issues/1450
      // <ViewWrapper> is a bit of a shame, I'd love for this to be pure SVG
      <ViewWrapper
        {...this.panResponder.panHandlers}
        dragging={this.state.dragging}
        style={{
          width: width,
          height: height,
          transform: this.pan.getTranslateTransform()
        }}
        x={this.props.x}
        y={this.props.y}
      >
        <CardSide
          style={{
            width: width,
            height: height,
            transform: [{ rotateY: spin }]
          }}
        >
          {/* name */}
          <CardTitle
            x={OVERHANG_TRANSLATE_X}
            y={IMAGE_BOTTOM}
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
          <CardTextWrapper scale={width / WIDTH}>
            {(card.text || []).map((line, i) => (
              <CardText
                key={i}
                x="500"
                y={TEXT_MIDDLE}
                textAnchor="middle"
                fontFamily={fonts.title}
                fontWeight="600"
                fontSize={TEXT_SIZE}
                fill="white"
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
                draggable={false}
                style={{ userDrag: "none" }}
                // needed to avoid image ghost dragging in firefox:
                onDragStart={e => e.preventDefault()}
              />
              <Svg.Rect
                width="1024"
                height={PLAYABLE_BAR_HEIGHT}
                fill={manaColor}
              />
            </Svg.G>

            {/* mana box */}
            <NumberBox
              size={MANA_BOX_SIZE}
              value={card.cost}
              x={0}
              y={PLAYABLE_BAR_HEIGHT - 10}
              bg={manaColor}
            />

            {/* attack box */}
            <NumberBox
              value={card.attack}
              x={0}
              y={HEIGHT - BOX_SIZE}
              bg="rgb(216, 163, 24)"
              size={BOX_SIZE}
            />

            {/* health box */}
            <NumberBox
              value={card.health}
              x={WIDTH - BOX_SIZE}
              y={HEIGHT - BOX_SIZE}
              bg="#f91717"
              size={BOX_SIZE}
            />
          </Svg>
        </CardSide>
        <CardSide
          style={{
            width: width,
            height: height,
            backgroundColor: "rgb(32, 32, 32)",
            transform: [{ rotateY: backSpin }]
          }}
        />
      </ViewWrapper>
    );
  }
}

const mapStateToProps = (state, props) => {
  const cardId = Box.traverse(props.boxId, state.game.boxes, state.client.keys);
  let card;
  if (cardId) {
    card = state.game.units[cardId];
  }
  return {
    card: card,
    cardId: cardId,
    targetingUnit: state.client.targetingUnit,
    targets: state.client.targets,
    secret: state.secret,
    player: state.game.players[props.playerId],
    myTurn: state.client.keys.id === state.game.turn,
    myUnit: state.client.keys.id === props.playerId,
    availableTargets: state.client.availableTargets
  };
};

export default connect(mapStateToProps)(CardSVG);
