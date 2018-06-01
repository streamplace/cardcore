import React from "react";
import Sidebar from "./sidebar";
import Field from "./field";
import styled from "styled-components";
import { connect } from "react-redux";

const BoardWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export class Board extends React.Component {
  render() {
    if (!this.props.players) {
      return <div />;
    }
    return (
      <BoardWrapper>
        <Sidebar player={this.props.players[1]} />
        <Field />
        <Sidebar player={this.props.players[0]} />
      </BoardWrapper>
    );
  }
}

const mapStateToProps = (state, props) => {
  return { players: state.players };
};

export default connect(mapStateToProps)(Board);
