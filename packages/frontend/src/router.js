import React from "react";
import {
  Router as ReactRouter,
  Route,
  RouteSwitch,
  bootstrap,
  View,
  Link,
} from "@cardcore/elements";
import Board from "./board";
import FrontPage from "./front-page";
import GameProvider from "./game-provider";
import Development from "./development";
import * as aiModules from "@cardcore/ai";
import styled from "styled-components";
import CreateCard from "./create-card";

const BigContainer = styled(View)`
  height: 100%;
  flex-direction: row;
`;

const MainView = styled(View)`
  flex-grow: 1;
  flex-shrink: 0;
`;

const Sidebar = styled(View)`
  flex-grow: 0;
  flex-shrink: 0;
  border-right: 1px solid #ccc;
`;

const MenuLink = styled(Link)`
  display: block;
  padding: 1em;
  border-bottom: 1px solid #ccc;
  color: #333;
  text-decoration: none;
  font-family: "Open Sans", sans-serif;

  &:last-child {
    border-bottom: none;
  }
`;

export default class Router extends React.Component {
  constructor() {
    super();
    this.state = {
      ready: false,
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
        <BigContainer>
          {/* <Sidebar>
            <MenuLink to="/">Game</MenuLink>
            <MenuLink to="/create-card">Create Card</MenuLink>
          </Sidebar> */}
          <MainView>
            <RouteSwitch>
              <Route
                path="/create-card"
                render={(props) => {
                  return <CreateCard />;
                }}
              />
              <Route
                path="/development/:action"
                render={(props) => {
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
                render={(props) => (
                  <GameProvider key="foo">
                    <Board
                      {...props}
                      gameId={`${props.match.params.gameId}.sha256`}
                    />
                  </GameProvider>
                )}
              />
              <Route
                path="/"
                render={(props) => (
                  <GameProvider key="bar">
                    <FrontPage {...props} />
                  </GameProvider>
                )}
              />
            </RouteSwitch>
          </MainView>
        </BigContainer>
      </ReactRouter>
    );
  }
}
