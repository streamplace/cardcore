import React from "react";
import Sidebar from "./sidebar";
import Field from "./field";
import styled from "styled-components";
import { connect } from "react-redux";
import {
  clientGenerateIdentity,
  clientPoll,
  clientLoadState
} from "@cardcore/client";
import { joinGameStart } from "@cardcore/game";
import { diff } from "deep-diff";
import { View, Text, getDimensions } from "@cardcore/elements";

const BoardWrapper = styled(View)`
  height: 100%;
  ${props => props.disableSelect && "user-select: none"};
`;

const DesyncBox = styled(View)`
  user-select: default;
`;

const BigMessage = styled(Text)`
  font-size: 2em;
`;

const LinkBox = styled(Text)`
  font-size: 2em;
  user-select: all;
  background-color: #ccc;
  border-radius: 10px;
  padding: 1em;
`;

const LoadingBox = styled(View)`
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
    if (this.props.loading) {
      await this.props.dispatch(clientLoadState(this.props.gameId));
    }
    await this.props.dispatch(clientPoll());
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { height } = this.props.dimensions;
    if (this.props.loading) {
      return <View />;
    }
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
          <Text>Waiting for another player...</Text>
          <Text>Send your friend this link:</Text>
          <Text>{document.location.href}</Text>
        </LoadingBox>
      );
    }
    const notMe = this.props.playerOrder.filter(
      x => x !== this.props.currentPlayer
    )[0];
    return (
      <BoardWrapper disableSelect={true}>
        <Sidebar height={height / 4} playerId={notMe} />
        <Field height={height / 2} />
        <Sidebar height={height / 4} playerId={this.props.currentPlayer} />
      </BoardWrapper>
    );
  }
}

const mapStateToProps = (state, props) => {
  if (!state.game || !state.game.players) {
    return {
      loading: true
    };
  }
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
