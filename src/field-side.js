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
`;

export class FieldSide extends React.Component {
  handleDrop(card) {
    this.props.dispatch(playCreature(card));
  }
  render() {
    return (
      <FieldSideBox
        innerRef={registerDropTarget(card => this.handleDrop(card))}
      >
        {this.props.player.field.map((card, i) => <Card key={i} card={card} />)}
      </FieldSideBox>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    player: state.players[props.playerId],
    myTurn: state.currentPlayer === state.turn
  };
};

export default connect(mapStateToProps)(FieldSide);
