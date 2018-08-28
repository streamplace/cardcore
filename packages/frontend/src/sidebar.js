import React from "react";
import styled from "styled-components";
import Card from "./card-svg";
// import Deck from "./deck";
import { connect } from "react-redux";
// import Face from "./face";
import { View } from "@cardcore/elements";

const VERT_PADDING = 10;

const SidebarVert = styled(View)`
  display: flex;
  flex-direction: column;
  height: ${props => props.height}px;
  overflow: hidden;
`;

const SidebarBox = styled(View)`
  background-color: #aaa;
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  padding: ${VERT_PADDING}px 10px;
`;

const HandBox = styled(View)`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  flex-direction: row;
`;

export class Sidebar extends React.Component {
  render() {
    const { height } = this.props;
    return (
      <SidebarVert height={height}>
        <SidebarBox>
          {/* <Face playerId={this.props.playerId} /> */}
          <HandBox />
          {/* <Deck playerId={this.props.playerId} /> */}
        </SidebarBox>
      </SidebarVert>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    player: state.game.players[props.playerId]
  };
};

export default connect(mapStateToProps)(Sidebar);
