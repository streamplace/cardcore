import React from "react";
import styled from "styled-components";
import Card from "./card";
import {
  registerDropTarget,
  clientPlayCreature,
  clientTargetCancel
} from "./client-actions";
import { playCreature } from "./game/actions";
import { connect } from "react-redux";

const FieldSideBox = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  padding: 5px;
  perspective: 1000px;
  z-index: 1;
`;

export class FieldSide extends React.Component {
  handleDrop({ card, location }) {
    if (location === "hand") {
      this.props.dispatch(clientPlayCreature(card));
    }
  }

  handleClick(e) {
    // only act if they clicked the field itself, not a card
    if (e.target !== e.currentTarget) {
      return;
    }
    this.props.dispatch(clientTargetCancel());
  }

  render() {
    return (
      <FieldSideBox
        onClick={e => this.handleClick(e)}
        innerRef={registerDropTarget(e => this.handleDrop(e))}
      >
        {this.props.player.field.map((card, i) => {
          return (
            <Card
              key={i}
              card={card}
              playerId={this.props.playerId}
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
    units: state.game.units
  };
};

export default connect(mapStateToProps)(FieldSide);
