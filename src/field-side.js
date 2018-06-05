import React from "react";
import styled from "styled-components";
import Card from "./card";
import { registerDropTarget } from "./client-actions";
import { playCreature } from "./actions";
import { connect } from "react-redux";

const FieldSideBox = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  padding: 5px;
`;

export class FieldSide extends React.Component {
  handleDrop({ card, location }) {
    if (location === "hand") {
      this.props.dispatch(playCreature(card));
    }
  }
  render() {
    return (
      <FieldSideBox innerRef={registerDropTarget(e => this.handleDrop(e))}>
        {this.props.player.field.map((card, i) => {
          return (
            <Card
              key={i}
              card={card}
              canPlay={
                this.props.turn === this.props.playerId && card.canAttack
              }
              location="field"
            />
          );
        })}
      </FieldSideBox>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    player: state.players[props.playerId],
    turn: state.turn,
    myTurn: state.currentPlayer === state.turn
  };
};

export default connect(mapStateToProps)(FieldSide);
