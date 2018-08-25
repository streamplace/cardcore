import React from "react";
import FieldSide from "./field-side";
import { connect } from "react-redux";
import styled from "styled-components";
import { endTurn } from "@cardcore/game";

const FieldBox = styled.div`
  height: ${props => props.height}px;
`;

const Middle = styled.div`
  height: 0px;
  border-bottom: 1px solid black;
  position: relative;
  top: ${props => props.top}px;
`;

const EndTurn = styled.button`
  position: absolute;
  font-size: 2em;
  right: 10px;
  top: -20px;
  z-index: 2;

  color: ${props => (props.myTurn ? "black" : "#555")};
`;

const Loading = styled.div``;

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
            onClick={() => {
              this.props.dispatch(endTurn());
            }}
          >
            {this.props.loading ? <Loading>Loading...</Loading> : text}
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
