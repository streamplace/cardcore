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
          <Emoji>{this.props.side.emoji}</Emoji>
          <Health>{this.props.side.health} ❤️</Health>
        </FaceBox>
        <ManaBox>
          💎 {this.props.side.availableMana}/{this.props.side.mana}
        </ManaBox>
      </FaceVert>
    );
  }
}

const mapStateToProps = (state, props) => {
  return { side: state.sides[props.player] };
};

export default connect(mapStateToProps)(Face);
