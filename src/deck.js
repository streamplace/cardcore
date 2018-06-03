import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import { CardBox, Number } from "./card";

const DeckBox = styled(CardBox)`
  border-style: dashed;
  border-color: #ccc;
  opacity: 0.8;
`;

const DeckCount = styled(Number)`
  display: block;
  width: 100%;
  top: 50%;
  margin-top: -20px;
  text-align: center;
`;

const DeckCountText = styled.span``;

export class Deck extends React.Component {
  render() {
    return (
      <DeckBox>
        <DeckCount>
          <DeckCountText>{this.props.count}</DeckCountText>
        </DeckCount>
      </DeckBox>
    );
  }
}

const mapStateToProps = (state, props) => {
  return { count: state.players[props.playerId].deck.length };
};

export default connect(mapStateToProps)(Deck);
