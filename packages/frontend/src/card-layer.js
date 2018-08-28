import React from "react";
import styled from "styled-components";
// import Card from "./card-svg";
// // import Deck from "./deck";
import { connect } from "react-redux";
// // import Face from "./face";
import { View } from "@cardcore/elements";
import Card from "./card-svg";

const CardLayerBox = styled(View)`
  position: absolute;
  height: ${props => props.height}px;
  width: ${props => props.width}px;
  top: 0px;
  left: 0px;
  z-index: 100;
`;

export class Sidebar extends React.Component {
  render() {
    const { height, width, players, topPlayerId, bottomPlayerId } = this.props;
    return (
      <CardLayerBox pointerEvents="box-none" height={height} width={width}>
        {players[topPlayerId].hand.map((cardId, i) => {
          const cardHeight = height / 4 - 10;
          const cardWidth = (cardHeight * 3) / 4;
          return (
            <Card
              key={cardId}
              cardId={cardId}
              height={cardHeight}
              x={i * cardWidth}
              y={5}
            />
          );
        })}
        {players[bottomPlayerId].hand.map((cardId, i) => {
          const cardHeight = height / 4 - 10;
          const cardWidth = (cardHeight * 3) / 4;
          return (
            <Card
              key={cardId}
              cardId={cardId}
              height={cardHeight}
              x={i * cardWidth}
              y={height - cardHeight - 5}
            />
          );
        })}
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
  return { players: state.game.players, topPlayerId, bottomPlayerId };
};

export default connect(mapStateToProps)(Sidebar);
