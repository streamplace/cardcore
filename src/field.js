import React from "react";
import FieldSide from "./field-side";
import { connect } from "react-redux";
import styled from "styled-components";
import { endTurn } from "./actions";

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
    return (
      <FieldBox>
        <FieldSide playerId={this.props.players[1]} />
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
        <FieldSide playerId={this.props.players[0]} />
      </FieldBox>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    players: state.playerOrder,
    myTurn: state.currentPlayer === state.turn
  };
};

export default connect(mapStateToProps)(Field);
