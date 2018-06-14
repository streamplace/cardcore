import React from "react";
import Sidebar from "./sidebar";
import Field from "./field";
import styled from "styled-components";
import { connect } from "react-redux";
import { clientGenerateIdentity } from "./client-actions";
import { joinGameStart } from "./game/actions";
import { diff } from "deep-diff";

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

const DesyncBox = styled.div`
  user-select: default;
`;

export class Board extends React.Component {
  constructor(props) {
    super();
    props.dispatch(clientGenerateIdentity());
  }

  async joinGame() {
    await this.props.dispatch(joinGameStart());
  }

  render() {
    if (!this.props.sync) {
      const players = Object.keys(this.props.desyncStates);
      let str;
      if (players.length < 2 || players.length > 2) {
        str = JSON.stringify(this.props.desyncStates, null, 2);
      } else {
        const [p1, p2] = Object.values(this.props.desyncStates);
        str = JSON.stringify(diff(p1, p2), null, 2);
      }
      return (
        <BoardWrapper>
          <p>fatal error: desync</p>
          <p>if you wanna help, send someone this blob of data:</p>
          <DesyncBox>
            <pre>{str}</pre>
          </DesyncBox>
        </BoardWrapper>
      );
    }
    if (!this.props.iAmInGame) {
      return (
        <BoardWrapper>
          <HugeButton onClick={() => this.joinGame()}>Join Game</HugeButton>
        </BoardWrapper>
      );
    }
    if (!this.props.ready) {
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
    iAmInGame: !!state.game.players[state.client.keys.id],
    currentPlayer: state.client.keys.id,
    sync: state.client.sync,
    desyncStates: state.client.desyncStates,
    ready:
      state.game.playerOrder.length > 0 &&
      state.game.playerOrder.every(
        playerId => state.game.players[playerId].unitId
      ),
    playerOrder: state.game.playerOrder
  };
};

export default connect(mapStateToProps)(Board);
