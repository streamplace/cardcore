import React from "react";
import styled from "styled-components";
// // import Deck from "./deck";
import { connect } from "react-redux";
// // import Face from "./face";
import { View } from "@cardcore/elements";
import Card from "./card-svg";
import { Box } from "@cardcore/util";

const CardLayerBox = styled(View)`
  position: absolute;
  height: ${props => props.height}px;
  width: ${props => props.width}px;
  top: 0px;
  left: 0px;
  z-index: 100;
  overflow: hidden;
`;

export class Sidebar extends React.Component {
  render() {
    const { height, width } = this.props;
    return (
      <CardLayerBox pointerEvents="box-none" height={height} width={width}>
        {this.props.cards.map(layout => {
          const cardId = this.props.boxTraverse(layout.boxId);
          const player = this.props.players[layout.playerId];
          let active = false;
          let draggable = false;
          if (cardId) {
            const card = this.props.units[cardId];
            if (layout.location === "hand") {
              if (player.availableMana >= card.cost) {
                active = true;
                if (this.props.turn === this.props.currentPlayer) {
                  draggable = true;
                }
              }
            } else if (layout.location === "field") {
              if (card.canAttack) {
                active = true;
                if (this.props.turn === this.props.currentPlayer) {
                  draggable = true;
                }
              }
            }
          }
          return (
            <Card
              key={layout.boxId}
              active={active}
              draggable={draggable}
              boxId={layout.boxId}
              height={layout.height}
              x={layout.x}
              y={layout.y}
            />
          );
        })}
        {this.props.faces.map(layout => {
          return (
            <Card
              key={layout.boxId}
              active={false}
              draggable={false}
              boxId={layout.boxId}
              height={layout.height}
              x={layout.x}
              y={layout.y}
              cardOverride={{ cost: layout.availableMana }}
            />
          );
        })}
      </CardLayerBox>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    players: state.game.players,
    boxes: state.game.boxes,
    keys: state.client.keys,
    currentPlayer: state.client.keys.id,
    turn: state.game.turn,
    units: state.game.units,
    cards: state.frontend.layout.filter(elem => elem.type === "card"),
    faces: state.frontend.layout.filter(elem => elem.type === "face"),
    boxTraverse: Box.traverse.bind(Box, state),
    state: state
  };
};

export default connect(mapStateToProps)(Sidebar);
