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
import { View, Text, getServer, isWeb } from "@cardcore/elements";
import CardLayer from "./card-layer";

const BoardWrapper = styled(View)`
  height: 100%;
  ${props => props.disableSelect && isWeb() && "user-select: none"};
`;

const DesyncBox = styled(View)`
  ${isWeb() && "user-select: default"};
`;

const BigMessage = styled(Text)`
  font-size: 24px;
`;

const LinkBox = styled(Text)`
  font-size: 24px;
  ${isWeb() && "user-select: all"};
  background-color: #ccc;
  border-radius: 10px;
  padding: 1em;
`;

const LoadingBox = styled(View)`
  padding: 24px;
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
    const { height, width } = this.props.dimensions;
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
      const gameUrl = `${getServer()}/game/${this.props.gameId}`;
      console.log(gameUrl);
      return (
        <LoadingBox>
          <Text>Waiting for another player...</Text>
          <Text>Send your friend this link:</Text>
          <Text>{gameUrl}</Text>
        </LoadingBox>
      );
    }
    let [topPlayerId, bottomPlayerId] = this.props.playerOrder;
    if (this.props.playerOrder.includes(this.props.currentPlayer)) {
      topPlayerId = this.props.playerOrder.find(
        id => id !== this.props.currentPlayer
      );
      bottomPlayerId = this.props.currentPlayer;
    }
    return (
      <BoardWrapper disableSelect={true}>
        <CardLayer height={height} width={width} />
        <Sidebar height={height / 4} playerId={topPlayerId} />
        <Field height={height / 2} />
        <Sidebar height={height / 4} playerId={bottomPlayerId} />
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
