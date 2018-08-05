import React from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";
import { createGame } from "@cardcore/game";
import { clientGenerateIdentity, clientGetGameHash } from "@cardcore/client";
import { connect } from "react-redux";

const FrontPageBox = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

const CreateGame = styled.button`
  font-size: 3em;
  display: block;
  margin: auto;
`;

class FrontPage extends React.Component {
  async handleClick() {
    await this.props.dispatch(createGame());
    console.log(await this.props.dispatch(clientGetGameHash()));
  }

  async componentDidMount() {
    await this.props.dispatch(clientGenerateIdentity());
  }

  render() {
    return (
      <FrontPageBox>
        <CreateGame onClick={() => this.handleClick()}>Create Game</CreateGame>
      </FrontPageBox>
    );
  }
}

const mapStateToProps = () => {
  return {};
};

export default withRouter(connect(mapStateToProps)(FrontPage));
