import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { pickEmote } from "./actions";

const EmoteVert = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 20px;
  justify-content: space-around;
  align-items: center;
`;
const EmoteBox = styled.div`
  width: 100px;
  background-color: #444;
  border: 1px solid #ccc;
  text-align: center;
  align-self: center;
`;
const Emote = styled.div`
  border: 1px solid #ccc;
`;

export class Emotes extends React.Component {
  render() {
    if (this.props.playerId === "me") {
      return (
        <EmoteVert>
          <Emote>{this.props.player.emote}</Emote>
          <EmoteBox>
            {this.props.emotes.map((emote, i) => {
              return (
                <Emote
                  emote={emote}
                  key={i}
                  onClick={() => {
                    this.props.dispatch(pickEmote(this.props.playerId, emote));
                  }}
                >
                  {" "}
                  {emote}
                </Emote>
              );
            })}
          </EmoteBox>
        </EmoteVert>
      );
    }
    if (this.props.playerId === "them") {
      return (
        <EmoteVert>
          <EmoteBox>
            {this.props.emotes.map((emote, i) => {
              return (
                <Emote
                  emote={emote}
                  key={i}
                  onClick={() => {
                    this.props.dispatch(pickEmote(this.props.playerId, emote));
                  }}
                >
                  {" "}
                  {emote}
                </Emote>
              );
            })}
          </EmoteBox>
          <Emote>{this.props.player.emote}</Emote>
        </EmoteVert>
      );
    }
  }
}

const mapStateToProps = (state, props) => {
  return {
    emotes: state.emotes,
    player: state.players[props.playerId]
  };
};

export default connect(mapStateToProps)(Emotes);
