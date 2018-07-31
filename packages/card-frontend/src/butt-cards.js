import React from "react";
import styled, { injectGlobal } from "styled-components";
import { Provider } from "react-redux";
import storeGenerator from "./store";
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
  constructor() {
    super();
    this.store = storeGenerator();
  }
  render() {
    return (
      <Provider store={this.store}>
        <AppContainer>
          <VersionOverlay>v{pkg.version}</VersionOverlay>
          <Board />
        </AppContainer>
      </Provider>
    );
  }
}

export default ButtCards;