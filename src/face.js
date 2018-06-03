import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";

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

const Health = styled.span`
  font-size: 30px;
  color: white;
`;

export class Face extends React.Component {
  render() {
    return (
      <FaceVert>
        <FaceBox>
          <Emoji>{this.props.player.emoji}</Emoji>
          <Health>{this.props.player.health} ❤️</Health>
        </FaceBox>
        <ManaBox>
          💎 {this.props.player.availableMana}/{this.props.player.mana}
        </ManaBox>
      </FaceVert>
    );
  }
}

const mapStateToProps = (state, props) => {
  return { player: state.players[props.playerId] };
};

export default connect(mapStateToProps)(Face);
