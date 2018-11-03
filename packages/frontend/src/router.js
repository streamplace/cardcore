import React from "react";
import {
  Router as ReactRouter,
  Route,
  RouteSwitch,
  bootstrap,
  View
} from "@cardcore/elements";
import Board from "./board";
import FrontPage from "./front-page";
import GameProvider from "./game-provider";
import Development from "./development";
import * as aiModules from "@cardcore/ai";

export default class Router extends React.Component {
  constructor() {
    super();
    this.state = {
      ready: false
    };
  }

  async componentDidMount() {
    await bootstrap();
    this.setState({ ready: true });
  }

  render() {
    if (!this.state.ready) {
      return <View />;
    }
    return (
      <ReactRouter>
        <RouteSwitch>
          <Route
            path="/development/:action"
            render={props => {
              const { action } = props.match.params;
              return (
                <GameProvider modules={aiModules} key="development">
                  <Development action={action} />
                </GameProvider>
              );
            }}
          />
          <Route
            path="/game/:gameId"
            render={props => (
              <GameProvider key="foo">
                <Board {...props} gameId={props.match.params.gameId} />
              </GameProvider>
            )}
          />
          <Route
            path="/"
            render={props => (
              <GameProvider key="bar">
                <FrontPage {...props} />
              </GameProvider>
            )}
          />
        </RouteSwitch>
      </ReactRouter>
    );
  }
}
