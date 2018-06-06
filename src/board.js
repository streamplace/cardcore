import React from "react";
import Sidebar from "./sidebar";
import Field from "./field";
import styled from "styled-components";
import { connect } from "react-redux";
import { startGame } from "./game/actions";
import standard from "./standard";
import { standard, battlecry } from "./standard";

const BoardWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const HugeButton = styled.button`
  font-size: 50px;
  margin: auto;
`;

export class Board extends React.Component {
  startGame() {
    this.props.dispatch(
      startGame({
        currentPlayer: "me",
        players: {
          me: {
            deck: [
              standard(1),
              standard(2),
              standard(3),
              standard(4),
              standard(5),
              standard(6),
              battlecry(3)
            ],
            emoji: "🐒"
          },
          them: {
            deck: [
              standard(1),
              standard(1),
              standard(1),
              standard(1),
              standard(1),
              standard(1),
              battlecry(3)
            ],
            emoji: "🐙"
          }
        }
      })
    );
  }

  render() {
    if (!this.props.playerOrder) {
      return (
        <BoardWrapper>
          <HugeButton onClick={() => this.startGame()}>Start Game</HugeButton>
        </BoardWrapper>
      );
    }
    const notMe = this.props.playerOrder.filter(
      x => x !== this.props.currentPlayer
    )[0];
    return (
      <BoardWrapper>
        <Sidebar playerId={notMe} />
        <Field />
        <Sidebar playerId={this.props.currentPlayer} />
      </BoardWrapper>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    playerOrder: state.game.playerOrder,
    currentPlayer: state.game.currentPlayer
  };
};

export default connect(mapStateToProps)(Board);
