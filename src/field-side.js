import React from "react";
import FieldSide from "./field-side";
import styled from "styled-components";

const FieldSideBox = styled.div`
  flex-grow: 1;
`;

export default class Field extends React.Component {
  render() {
    return <FieldSideBox />;
  }
}
