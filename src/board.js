import React from "react";
import Sidebar from "./sidebar";
import Field from "./field";
import styled from "styled-components";
import { connect } from "react-redux";
import { clientGenerateIdentity } from "./client-actions";
import { joinGameStart } from "./game/actions";

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
