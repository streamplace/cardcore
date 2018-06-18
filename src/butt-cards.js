import React from "react";
import styled, { injectGlobal } from "styled-components";
import { Provider } from "react-redux";
import storeGenerator from "./store";
import Board from "./board";

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

class ButtCards extends React.Component {
  constructor() {
    super();
    this.store = storeGenerator();
  }
  render() {
    return (
      <Provider store={this.store}>
        <AppContainer>
          <Board />
        </AppContainer>
      </Provider>
    );
  }
}

export default ButtCards;
