import React from "react";
import styled from "styled-components";
import Card from "./card";
import Deck from "./deck";
import { connect } from "react-redux";

const SidebarBox = styled.div`
  background-color: #aaa;
  flex-grow: 2;
  display: flex;
  padding: 10px;
`;

const HandBox = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: center;
`;

export class Sidebar extends React.Component {
  render() {
    return (
      <SidebarBox>
        <HandBox>
          {this.props.side.hand.map((card, i) => <Card card={card} key={i} />)}
        </HandBox>
        <Deck player={this.props.player} />
      </SidebarBox>
    );
  }
}

const mapStateToProps = (state, props) => {
  console.log(state);
  return { side: state.sides[props.player] };
};

export default connect(mapStateToProps)(Sidebar);
