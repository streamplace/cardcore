import React from "react";
import styled, { injectGlobal } from "styled-components";
import Board from "./board";
import pkg from "../package.json";

injectGlobal`
  body {
    margin: 0;
  }
  html, body, #root {
    height: 100%;
  }
`;

const AppContainer = styled.div`
  font-family: "Open Sans", Helvetica, sans-serif;
  height: 100%;
`;

const VersionOverlay = styled.div`
  position: absolute;
  left: 3px;
  bottom: 3px;
  opacity: rgba(255, 255, 255, 0.5);
`;

class ButtCards extends React.Component {
  render() {
    return (
      <AppContainer>
        <VersionOverlay>v{pkg.version}</VersionOverlay>
        <Board
          dimensions={this.props.dimensions}
          gameId={this.props.match.params.gameId}
        />
      </AppContainer>
    );
  }
}

export default ButtCards;
