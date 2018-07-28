import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { registerDropTarget } from "./client-actions";
import { attack } from "./game";

const FaceVert = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 20px;
  justify-content: space-around;
  align-items: center;
`;

const ManaBox = styled.div`
  font-size: 30px;
  font-weight: bold;
`;

const FaceBox = styled.div`
  width: 100px;
  background-color: #444;
  border: 1px solid #ccc;
  text-align: center;
  align-self: center;
`;

const Emoji = styled.span`
  font-size: 70px;
`;

const Health = styled.div`
  font-size: 30px;
  color: white;
`;

export class Face extends React.Component {
  handleDrop({ card, location }) {
    if (location === "field") {
      this.props.dispatch(attack(card, this.props.unitId));
    }
  }

  render() {
    return (
      <FaceVert innerRef={registerDropTarget(e => this.handleDrop(e))}>
        <FaceBox>
          <Emoji>{this.props.unit.emoji}</Emoji>
          <Health>
            {this.props.unit.health}{" "}
            <span role="img" aria-label="Heart">
              ❤️
            </span>
          </Health>
        </FaceBox>
        <ManaBox>
          <span role="img" aria-label="Diamond">
            💎
          </span>{" "}
          {this.props.player.availableMana}/{this.props.player.mana}
        </ManaBox>
      </FaceVert>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    player: state.game.players[props.playerId],
    unitId: state.game.players[props.playerId].unitId,
    unit: state.game.units[state.game.players[props.playerId].unitId]
  };
};

export default connect(mapStateToProps)(Face);
