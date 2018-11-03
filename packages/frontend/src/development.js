/**
 * Easy way to set up a pair of games in dev
 */

import React from "react";
import Board from "./board";
import ssbKeys from "@streamplace/ssb-keys";
import { View } from "@cardcore/elements";
import { createGame } from "@cardcore/game";
import {
  clientGenerateIdentity,
  clientGetGameHash,
  clientFetch
} from "@cardcore/client";
import { connect } from "react-redux";

export class Development extends React.Component {
  constructor() {
    super();
    this.state = {
      gameId: null
    };
  }

  async componentDidMount() {
    const res = await this.props.dispatch(clientFetch("/static/js/bundle.js"));
    const text = await res.text();
    const codeHash = encodeURIComponent(ssbKeys.hash(text));
    await this.props.dispatch(clientGenerateIdentity());
    if (this.props.action === "create") {
      await this.props.dispatch(createGame());
      let gameHash = await this.props.dispatch(clientGetGameHash());
      gameHash = gameHash.replace(".sha256", "");
      await this.props.dispatch(
        clientFetch(`/development/${codeHash}`, {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ gameHash })
        })
      );
      this.setState({ gameId: gameHash });
    } else {
      let data = await new Promise(resolve => {
        const poll = async () => {
          const res = await this.props.dispatch(
            clientFetch(`/development/${codeHash}`)
          );
          if (!res.ok) {
            return setTimeout(poll, 1000);
          }
          resolve(await res.json());
        };
        poll();
      });
      this.setState({ gameId: data.gameHash });
    }
  }

  render() {
    if (!this.state.gameId) {
      return <View />;
    }
    return <Board gameId={this.state.gameId} />;
  }
}

const mapStateToProps = () => {
  return {};
};

export default connect(mapStateToProps)(Development);
