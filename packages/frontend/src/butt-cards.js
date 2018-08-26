import React from "react";
import styled from "styled-components";
import Board from "./board";
import pkg from "../package.json";
import { View, Text } from "@cardcore/elements";

const AppContainer = styled(View)`
  height: 100%;
`;

class ButtCards extends React.Component {
  render() {
    return (
      <AppContainer>
        <Board
          dimensions={this.props.dimensions}
          gameId={this.props.match.params.gameId}
        />
      </AppContainer>
    );
  }
}

export default ButtCards;
