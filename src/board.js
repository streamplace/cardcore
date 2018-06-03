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
    if (!this.props.playerOrder) {
      return <div />;
    }
    return (
      <BoardWrapper>
        <Sidebar playerId={this.props.playerOrder[1]} />
        <Field />
        <Sidebar playerId={this.props.playerOrder[0]} />
      </BoardWrapper>
    );
  }
}

const mapStateToProps = (state, props) => {
  return { playerOrder: state.playerOrder };
};

export default connect(mapStateToProps)(Board);
