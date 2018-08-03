import React from "react";
import styled from "styled-components";
import {
  registerDropTarget,
  clientPickTarget,
  cardDrop
} from "@cardcore/client";
import { attack } from "@streamplace/card-game";
import { connect } from "react-redux";
import { traverseSecret } from "@streamplace/card-util";

const WIDTH = 130;
const HEIGHT = 210;

export const CardBox = styled.div`
  border: 1px solid #555;
  user-select: none;
  border-radius: 10px;
  margin-left: 10px;
  margin-right: 10px;
  position: relative;
  transition: transform 500ms ease;
  transform: rotateY(0deg);
  width: ${props => props.scaleWidth}px;
  transform-style: preserve-3d;
  z-index: 0;

  ${props => props.canPlay && cardGlow("5px", "blue")};
  ${props => props.flipped && "transform: rotateY(180deg)"};
  ${props => props.canPlay && "cursor: pointer"};
`;

export const CardFace = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  position: absolute;
  transform-origin: top left;
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
`;

export const CardBack = styled(CardFace)`
  background: #36c;
  background: linear-gradient(
        115deg,
        transparent 75%,
        rgba(255, 255, 255, 0.8) 75%
      )
      0 0,
    linear-gradient(245deg, transparent 75%, rgba(255, 255, 255, 0.8) 75%) 0 0,
    linear-gradient(115deg, transparent 75%, rgba(255, 255, 255, 0.8) 75%) 7px -15px,
    linear-gradient(245deg, transparent 75%, rgba(255, 255, 255, 0.8) 75%) 7px -15px,
    #36c;
  background-size: 15px 30px;
  backface-visibility: hidden;
  z-index: 1;
  transform: rotateY(180deg) scale(${props => props.ratio}) translateX(-100%);
  border-radius: 10px;
`;

export const CardContents = styled(CardFace)`
  backface-visibility: hidden;
  background-color: white;
  transform: rotateY(0deg) scale(${props => props.ratio});
  z-index: 1;
  border-radius: 10px;
`;

export const cardGlow = (size, color) => `
  box-shadow:
    ${size} ${size} ${size} ${color},
    -${size} -${size} ${size} ${color},
    ${size} -${size} ${size} ${color},
    -${size} ${size} ${size} ${color}
`;

const Name = styled.div`
  position: absolute;
  width: 100%;
  text-align: center;
  top: 35px;
  display: flex;
  flex-direction: column;
`;
const NameText = styled.span`
  font-style: italic;
`;
const CardText = styled.span`
  font-size: 0.7em;
`;
export const Number = styled.span`
  position: absolute;
  font-size: 2em;
  font-weight: bold;
`;
const Attack = styled(Number)`
  bottom: 0;
  left: 5px;
`;
const Health = styled(Number)`
  bottom: 0;
  right: 5px;
`;
const Cost = styled(Number)`
  top: 0;
  right: 5px;
`;
const Type = styled(Number)`
  top: 0;
  left: 5px;
`;
const Emoji = styled.div`
  position: absolute;
  width: 100%;
  text-align: center;
  left: 0;
  top: 56px;
`;
const EmojiText = styled.span`
  font-size: 75px;
`;

export class Card extends React.Component {
  constructor(props) {
    super();
    this.state = {
      forceFlip: props.location === "hand",
      width: 0,
      ratio: 1
    };
  }

  componentDidMount() {
    this.timeout = setTimeout(() => {
      this.setState({ forceFlip: false });
    }, 200);
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
    window.removeEventListener("resize", this.handleResize);
  }

  onDragEnd(e) {
    this.props.dispatch(cardDrop(e, this.props.card, this.props.location));
  }

  handleDrop({ card, location }) {
    if (location !== "field" || this.props.location !== "field") {
      return;
    }
    if (card === this.props.unitId) {
      return;
    }
    this.props.dispatch(attack(card, this.props.unitId));
  }
  handleClick(e) {
    if (this.shouldLightUp()) {
      this.props.dispatch(clientPickTarget(this.props.unitId));
    }
  }
  shouldLightUp() {
    if (!this.props.availableTargets) {
      return false;
    }
    return this.props.availableTargets.includes(this.props.unitId);
  }

  isPlayable() {
    if (!this.props.myTurn) {
      return false;
    }
    if (!this.props.unit) {
      return false;
    }
    if (!this.props.myUnit) {
      return false;
    }
    if (this.props.location === "hand") {
      if (this.props.player.availableMana < this.props.unit.cost) {
        return false;
      }
    } else if (this.props.location === "field") {
      if (!this.props.unit.canAttack) {
        return false;
      }
    }
    return true;
  }

  ref(elem) {
    registerDropTarget(e => this.handleDrop(e))(elem);
    if (!elem) {
      return;
    }
    this.elem = elem;
    this.handleResize();
  }

  handleResize() {
    if (!this.elem) {
      return;
    }
    const { height } = this.elem.getClientRects()[0];
    const scaleWidth = height * (WIDTH / HEIGHT);
    if (scaleWidth !== this.state.width) {
      this.setState({
        width: height * (WIDTH / HEIGHT),
        ratio: height / HEIGHT
      });
    }
  }

  render() {
    let card;
    let draggable = this.isPlayable();
    let shouldLightUp = draggable;
    const flipped = !this.props.unit;
    if (this.props.unit) {
      card = this.props.unit;
      if (this.props.availableTargets) {
        shouldLightUp = this.shouldLightUp();
      }
    } else {
      card = {
        name: "",
        text: "",
        emoji: "",
        attack: "",
        health: "",
        cost: ""
      };
    }

    return (
      <CardBox
        innerRef={elem => this.ref(elem)}
        scaleWidth={this.state.width}
        canPlay={shouldLightUp}
        draggable={draggable}
        onClick={e => this.handleClick(e)}
        onDragEnd={e => this.onDragEnd(e)}
        flipped={this.state.forceFlip || flipped}
      >
        <CardBack ratio={this.state.ratio} />
        <CardContents ratio={this.state.ratio}>
          <Type>
            <span role="img" aria-label="Creature">
              👾
            </span>
          </Type>
          <Name>
            <NameText>
              {card.name} {draggable}
            </NameText>
            <CardText>{card.text}</CardText>
          </Name>
          <Emoji>
            <EmojiText>{card.emoji}</EmojiText>
          </Emoji>
          <Attack>
            {card.attack}
            <span role="img" aria-label="Sword">
              ⚔️
            </span>
          </Attack>
          <Health>
            {card.health}
            <span role="img" aria-label="Heart">
              ♥️
            </span>
          </Health>
          <Cost>
            {card.cost}
            <span role="img" aria-label="Diamond">
              💎
            </span>
          </Cost>
        </CardContents>
      </CardBox>
    );
  }
}

const mapStateToProps = (state, props) => {
  const unitId = traverseSecret(props.card, state.secret);
  let unit;
  if (unitId) {
    unit = state.game.units[unitId];
  }
  return {
    unit: unit,
    unitId: unitId,
    targetingUnit: state.client.targetingUnit,
    targets: state.client.targets,
    secret: state.secret,
    player: state.game.players[props.playerId],
    myTurn: state.client.keys.id === state.game.turn,
    myUnit: state.client.keys.id === props.playerId,
    availableTargets: state.client.availableTargets
  };
};

export default connect(mapStateToProps)(Card);
