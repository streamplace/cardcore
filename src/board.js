import React from "react";
import Sidebar from "./sidebar";
import Field from "./field";
import styled from "styled-components";
import { connect } from "react-redux";
import { clientGenerateIdentity } from "./client-actions";
import { joinGame } from "./game/actions";
import { shuffled } from "./util";
import {
  standard,
  threeMaster,
  cardDraw,
  damageCreature,
  onDeathCreature,
  onSummonSummon,
  onSummonHandBuff,
  onSummonBounce
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

const CentralText = styled.p`
  text-align: center;
  margin: auto;
`;

const RANDOM_EMOJI = ["🐒", "🐙", "🐷", "😈", "👾", "🐝", "🌞"];

export class Board extends React.Component {
  async joinGame() {
    await this.props.dispatch(clientGenerateIdentity());
    await this.props.dispatch(
      joinGame({
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
          onSummonHandBuff,
          onSummonBounce
        ],
        emoji: shuffled(RANDOM_EMOJI)[0]
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
    if (!this.props.currentPlayer) {
      return (
        <BoardWrapper>
          <HugeButton onClick={() => this.joinGame()}>Join Game</HugeButton>
        </BoardWrapper>
      );
    }
    if (!this.props.playerOrder) {
      return (
        <BoardWrapper>
          <CentralText>waiting for someone to join...</CentralText>
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
    currentPlayer: state.client.keys.id,
    sync: state.client.sync,
    desyncStates: state.client.desyncStates
  };
};

export default connect(mapStateToProps)(Board);
