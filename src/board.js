import React from "react";
import Sidebar from "./sidebar";
import Field from "./field";
import styled from "styled-components";
import { connect } from "react-redux";
import { startGame } from "./game/actions";
import {
  standard,
  threeMaster,
  cardDraw,
  damageCreature,
  onDeathCreature,
  onSummonSummon,
  onSummonHandBuff
} from "./standard";

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
              threeMaster(3),
              cardDraw(2),
              damageCreature(4),
              onSummonSummon,
              onSummonHandBuff
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
              threeMaster(3),
              cardDraw(2),
              damageCreature(4),
              onSummonSummon,
              onSummonHandBuff
            ],
            emoji: "🐙"
          }
        }
      })
    );
  }

  render() {
    if (!this.props.sync) {
      return (
        <BoardWrapper>
          <p>fatal error: desync</p>
          <p>if you wanna help, send someone this blob of data:</p>
          <p>
            <pre>{JSON.stringify(this.props.desyncStates, null, 2)}</pre>
          </p>
        </BoardWrapper>
      );
    }
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
    currentPlayer: state.client.currentPlayer,
    sync: state.client.sync,
    desyncStates: state.client.desyncStates
  };
};

export default connect(mapStateToProps)(Board);
