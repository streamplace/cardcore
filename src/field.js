import React from "react";
import FieldSide from "./field-side";
import { connect } from "react-redux";
import styled from "styled-components";
import { endTurn } from "./game/actions";

const FieldBox = styled.div`
  flex-grow: 2;
  flex-basis: 0;
  display: flex;
  flex-direction: column;
`;

const Middle = styled.div`
  height: 0px;
  border-bottom: 1px solid black;
  position: relative;
`;

const EndTurn = styled.button`
  position: absolute;
  font-size: 2em;
  right: 10px;
  top: -20px;

  color: ${props => (props.myTurn ? "black" : "#555")};
`;

export class Field extends React.Component {
  render() {
    const text = this.props.myTurn ? "End Turn" : "Their Turn";
    const notMe = this.props.playerOrder.filter(
      x => x !== this.props.currentPlayer
    )[0];
    return (
      <FieldBox>
        <FieldSide playerId={notMe} />
        <Middle>
          <EndTurn
            myTurn={this.props.myTurn}
            onClick={() => {
              this.props.dispatch(endTurn());
            }}
          >
            {text}
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
    currentPlayer: state.client.keys.id
  };
};

export default connect(mapStateToProps)(Field);
