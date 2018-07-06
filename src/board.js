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
  ${props => props.disableSelect && "user-select: none"};
`;

const DesyncBox = styled.div`
  user-select: default;
`;

const BigMessage = styled.p`
  font-size: 2em;
`;

const LinkBox = styled.pre`
  font-size: 2em;
  user-select: all;
  background-color: #ccc;
  border-radius: 10px;
  padding: 1em;
`;

const LoadingBox = styled.div`
  padding: 2em;
`;

export class Board extends React.Component {
  constructor(props) {
    super();
  }

  async joinGame() {
    await this.props.dispatch(joinGameStart());
  }

  async componentDidMount() {
    await this.props.dispatch(clientGenerateIdentity());
    this.interval = setInterval(() => {
      this.joinGame();
    }, 1500);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    if (this.props.started) {
      clearInterval(this.interval);
    }
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
          <BigMessage>fatal error: desync</BigMessage>
          <BigMessage>
            if you wanna help, send someone this blob of data:
          </BigMessage>
          <DesyncBox>
            <LinkBox>{str}</LinkBox>
          </DesyncBox>
        </BoardWrapper>
      );
    }
    if (!this.props.ready) {
      return (
        <LoadingBox>
          <p>Waiting for another player...</p>
          <p>Send your friend this link:</p>
          <p>{document.location.href}</p>
        </LoadingBox>
      );
    }
    const notMe = this.props.playerOrder.filter(
      x => x !== this.props.currentPlayer
    )[0];
    return (
      <BoardWrapper disableSelect={true}>
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
    started: state.client.started,
    ready:
      state.game.playerOrder.length > 0 &&
      state.game.playerOrder.every(
        playerId => state.game.players[playerId].unitId
      ),
    playerOrder: state.game.playerOrder
  };
};

export default connect(mapStateToProps)(Board);
