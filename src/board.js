import React from "react";
import Sidebar from "./sidebar";
import Field from "./field";
import styled from "styled-components";
import { connect } from "react-redux";
import { startGame } from "./actions";
import standard from "./standard";

const BoardWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export class Board extends React.Component {
  constructor(props) {
    super();
    props.dispatch(
      startGame({
        currentPlayer: "me",
        players: {
          me: {
            deck: [
              standard(1),
              standard(2),
              standard(3),
              standard(4),
              standard(5),
              standard(6)
            ],
            emoji: "🐒"
          },
          them: {
            deck: [
              standard(1),
              standard(1),
              standard(1),
              standard(1),
              standard(1),
              standard(1)
            ],
            emoji: "🐙"
          }
        }
      })
    );
  }
  render() {
    if (!this.props.playerOrder) {
      return <div />;
    }
    const notMe = this.props.playerOrder.filter(
      x => x !== this.props.currentPlayer
    )[0];
    return (
      <BoardWrapper>
        <Sidebar playerId={notMe} />
        <Field />
        <Sidebar playerId={this.props.currentPlayer} />
      </BoardWrapper>
    );
  }
}

const mapStateToProps = (state, props) => {
  return { playerOrder: state.playerOrder, currentPlayer: state.currentPlayer };
};

export default connect(mapStateToProps)(Board);
