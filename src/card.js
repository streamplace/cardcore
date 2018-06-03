import React from "react";
import styled from "styled-components";
import { connect } from "react-redux";

export const CardBox = styled.div`
  background-color: white;
  border: 1px solid #555;
  user-select: none;
  border-radius: 10px;
  margin-left: 10px;
  margin-right: 10px;
  position: relative;
  overflow: hidden;
  width: 130px;

  ${props => props.canPlay && cardGlow("5px", "blue")};
  ${props => props.canPlay && "cursor: pointer"};
`;

export const cardGlow = (size, color) => `
  box-shadow:
    ${size} ${size} ${size} ${color},
    -${size} -${size} ${size} ${color},
    ${size} -${size} ${size} ${color},
    -${size} ${size} ${size} ${color}
`;

const Name = styled.div`
  position: absolute;
  width: 100%;
  text-align: center;
  top: 35px;
`;
const NameText = styled.span`
  font-style: italic;
`;
export const Number = styled.span`
  position: absolute;
  font-size: 2em;
  font-weight: bold;
`;
const Attack = styled(Number)`
  bottom: 0;
  left: 5px;
`;
const Health = styled(Number)`
  bottom: 0;
  right: 5px;
`;
const Cost = styled(Number)`
  top: 0;
  right: 5px;
`;
const Type = styled(Number)`
  top: 0;
  left: 5px;
`;
const Emoji = styled.div`
  position: absolute;
  width: 100%;
  text-align: center;
  left: 0;
  top: 56px;
`;
const EmojiText = styled.span`
  font-size: 75px;
`;

export class Card extends React.Component {
  render() {
    const { card } = this.props;
    return (
      <CardBox canPlay={this.props.canPlay} onClick={this.props.onClick}>
        <Type>👾</Type>
        <Name>
          <NameText>{card.name}</NameText>
        </Name>
        <Emoji>
          <EmojiText>{card.emoji}</EmojiText>
        </Emoji>
        <Attack>{card.attack}⚔️</Attack>
        <Health>{card.health}♥️</Health>
        <Cost>{card.cost}💎</Cost>
      </CardBox>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {};
};

export default connect(mapStateToProps)(Card);
