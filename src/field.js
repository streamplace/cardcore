import React from "react";
import FieldSide from "./field-side";
import { connect } from "react-redux";
import styled from "styled-components";

const FieldBox = styled.div`
  flex-grow: 5;
  display: flex;
  flex-direction: column;
`;

const Middle = styled.div`
  height: 0px;
  border-bottom: 1px solid black;
`;

export class Field extends React.Component {
  render() {
    return (
      <FieldBox>
        <FieldSide player={this.props.players[1]} />
        <Middle />
        <FieldSide player={this.props.players[0]} />
      </FieldBox>
    );
  }
}

const mapStateToProps = (state, props) => {
  return { players: state.players };
};

export default connect(mapStateToProps)(Field);
