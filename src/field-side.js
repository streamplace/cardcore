import React from "react";
import styled from "styled-components";
import Card from "./card";
import { connect } from "react-redux";

const FieldSideBox = styled.div`
  flex-grow: 1;
`;

export class FieldSide extends React.Component {
  render() {
    return (
      <FieldSideBox>
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
