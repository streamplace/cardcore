import React from "react";
import FieldSide from "./field-side";
import { connect } from "react-redux";
import styled from "styled-components";
import { endTurn } from "@cardcore/game";
import { View, TouchableOpacity, Text } from "@cardcore/elements";

const FieldBox = styled(View)`
  height: ${props => props.height}px;
`;

const Middle = styled(View)`
  height: 1px;
  width: 100%;
  border-bottom-width: 1px;
  border-bottom-color: black;
  position: absolute;
  top: ${props => props.top}px;
  z-index: 2;
`;

const EndTurn = styled(TouchableOpacity)`
  position: absolute;
  right: 10px;
  background-color: white;
  top: -15px;
  z-index: 2;
  height: 30px;
`;

const EndTurnText = styled(Text)`
  color: ${props => (props.myTurn ? "black" : "#555")};
  font-size: 24px;
`;

const Loading = styled(View)``;

export class Field extends React.Component {
  render() {
    const { height } = this.props;
    const text = this.props.myTurn ? "End Turn" : "Their Turn";
    let [topPlayerId, bottomPlayerId] = this.props.playerOrder;
    if (this.props.playerOrder.includes(this.props.currentPlayer)) {
      topPlayerId = this.props.playerOrder.find(
        id => id !== this.props.currentPlayer
      );
      bottomPlayerId = this.props.currentPlayer;
    }
    return (
      <FieldBox height={height}>
        <FieldSide playerId={topPlayerId} />
        <Middle top={height / 2}>
          <EndTurn
            myTurn={this.props.myTurn}
            onPress={() => {
              this.props.dispatch(endTurn());
            }}
          >
            <EndTurnText>
              {this.props.loading ? "Loading..." : text}
            </EndTurnText>
          </EndTurn>
        </Middle>
        <FieldSide playerId={bottomPlayerId} />
      </FieldBox>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    players: state.game.playerOrder,
    myTurn: state.client.keys.id === state.game.turn,
    playerOrder: state.game.playerOrder,
    currentPlayer: state.client.keys.id,
    loading: state.game.nextActions.length !== 0
  };
};

export default connect(mapStateToProps)(Field);
