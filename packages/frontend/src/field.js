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
  height: 0px;
  border-bottom-width: 1px;
  border-bottom-color: black;
  position: absolute;
  top: ${props => props.top}px;
`;

const EndTurn = styled(TouchableOpacity)`
  position: absolute;
  font-size: 24px;
  right: 10px;
  top: -20px;
  z-index: 2;
  height: 30px;

  color: ${props => (props.myTurn ? "black" : "#555")};
`;

const Loading = styled(View)``;

export class Field extends React.Component {
  render() {
    const { height } = this.props;
    const text = this.props.myTurn ? "End Turn" : "Their Turn";
    const notMe = this.props.playerOrder.filter(
      x => x !== this.props.currentPlayer
    )[0];
    return (
      <FieldBox height={height}>
        <FieldSide playerId={notMe} />
        <Middle top={height / 2}>
          <EndTurn
            myTurn={this.props.myTurn}
            onPress={() => {
              this.props.dispatch(endTurn());
            }}
          >
            <Text>{this.props.loading ? "Loading..." : text}</Text>
          </EndTurn>
        </Middle>
        <FieldSide playerId={this.props.currentPlayer} />
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
