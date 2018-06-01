import React from "react";
import styled from "styled-components";
import Card from "./card";
import { connect } from "react-redux";

const SidebarBox = styled.div`
  background-color: #aaa;
  flex-grow: 2;
  display: flex;
  justify-content: center;
  padding: 10px;
`;

export class Sidebar extends React.Component {
  render() {
    return (
      <SidebarBox>
        {this.props.side.hand.map((card, i) => <Card card={card} key={i} />)}
      </SidebarBox>
    );
  }
}

const mapStateToProps = (state, props) => {
  console.log(state);
  return { side: state.sides[props.player] };
};

export default connect(mapStateToProps)(Sidebar);
