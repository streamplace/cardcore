import React from "react";
import styled from "styled-components";
// // import Deck from "./deck";
import { connect } from "react-redux";
// // import Face from "./face";
import { View } from "@cardcore/elements";
import Card from "./card-svg";
import { Box } from "@cardcore/util";
import {
  TOP_SIDEBOARD,
  TOP_FIELD,
  BOTTOM_FIELD,
  BOTTOM_SIDEBOARD
} from "./board-regions";

const CardLayerBox = styled(View)`
  position: absolute;
  height: ${props => props.height}px;
  width: ${props => props.width}px;
  top: 0px;
  left: 0px;
  z-index: 100;
`;

const CARD_PADDING = 5;

const getCardLine = props => {
  const player = props.players[props.playerId];
  const cardIds = player[props.location];
  const cardHeight = props.height / 4 - CARD_PADDING * 2;
  const cardWidth = (cardHeight * 3) / 4;
  const allCardsWidth = cardWidth * cardIds.length;
  const leftOffset = (props.width - allCardsWidth) / 2;
  let y =
    props.top !== undefined
      ? props.top
      : props.height - cardHeight - props.bottom;
  return cardIds.map((cardId, i) => {
    const decryptedId = Box.traverse(cardId, props.boxes, props.keys);
    let active = false;
    let draggable = false;
    if (decryptedId) {
      const card = props.units[decryptedId];
      if (props.location === "hand") {
        if (player.availableMana >= card.cost) {
          active = true;
          if (props.turn === props.currentPlayer) {
            draggable = true;
          }
        }
      } else if (props.location === "field") {
        if (props.turn === props.currentPlayer && card.canAttack) {
          active = true;
          draggable = true;
        }
      }
    }
    const x = (
      <Card
        key={cardId}
        active={active}
        draggable={draggable}
        boxId={cardId}
        height={cardHeight}
        x={i * cardWidth + leftOffset}
        y={y + CARD_PADDING}
      />
    );
    return x;
  });
};

export class Sidebar extends React.Component {
  render() {
    const { height, width, players, topPlayerId, bottomPlayerId } = this.props;
    const cards = [
      ...getCardLine({
        ...this.props,
        playerId: topPlayerId,
        location: "hand",
        top: height * TOP_SIDEBOARD.y
      }),
      ...getCardLine({
        ...this.props,
        playerId: topPlayerId,
        location: "field",
        top: height * TOP_FIELD.y
      }),
      ...getCardLine({
        ...this.props,
        playerId: bottomPlayerId,
        location: "field",
        top: height * BOTTOM_FIELD.y
      }),
      ...getCardLine({
        ...this.props,
        playerId: bottomPlayerId,
        location: "hand",
        top: height * BOTTOM_SIDEBOARD.y
      })
    ];
    return (
      <CardLayerBox pointerEvents="box-none" height={height} width={width}>
        {cards}
      </CardLayerBox>
    );
  }
}

const mapStateToProps = (state, props) => {
  let [topPlayerId, bottomPlayerId] = state.game.playerOrder;
  if (state.game.playerOrder.includes(state.client.keys.id)) {
    topPlayerId = state.game.playerOrder.find(
      id => id !== state.client.keys.id
    );
    bottomPlayerId = state.client.keys.id;
  }
  return {
    players: state.game.players,
    boxes: state.game.boxes,
    keys: state.client.keys,
    topPlayerId,
    bottomPlayerId,
    currentPlayer: state.client.keys.id,
    turn: state.game.turn,
    units: state.game.units
  };
};

export default connect(mapStateToProps)(Sidebar);
