import React from "react";
import styled from "styled-components";
import Card from "./card";
import { registerDropTarget, clientPlayCreature } from "./client-actions";
import { playCreature } from "./game/actions";
import { connect } from "react-redux";

const FieldSideBox = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  padding: 5px;
`;

export class FieldSide extends React.Component {
  handleDrop({ unitId, location }) {
    if (location === "hand") {
      this.props.dispatch(clientPlayCreature(unitId));
    }
  }
  render() {
    return (
      <FieldSideBox innerRef={registerDropTarget(e => this.handleDrop(e))}>
        {this.props.player.field.map((unitId, i) => {
          const card = this.props.units[unitId];
          return (
            <Card
              key={i}
              unitId={unitId}
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
    player: state.game.players[props.playerId],
    turn: state.game.turn,
    myTurn: state.game.currentPlayer === state.turn,
    units: state.game.units
  };
};

export default connect(mapStateToProps)(FieldSide);
