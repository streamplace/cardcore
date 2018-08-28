import React from "react";
import styled from "styled-components";
import { withRouter, View, Button, getDimensions } from "@cardcore/elements";
import { createGame } from "@cardcore/game";
import { clientGenerateIdentity, clientGetGameHash } from "@cardcore/client";
import { connect } from "react-redux";
import CardSVG from "./card-svg";

const FrontPageBox = styled(View)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
`;

const CreateGame = styled(Button)`
  font-size: 3;
  margin: auto;
`;

class FrontPage extends React.Component {
  async handleClick() {
    await this.props.dispatch(createGame());
    const hash = await this.props.dispatch(clientGetGameHash());
    this.props.history.push(`/game/${hash.replace(".sha256", "")}`);
  }

  async componentDidMount() {
    await this.props.dispatch(clientGenerateIdentity());
    // remove this
    this.props.history.push(
      "/game/qeYqG3KlRDTMzW1mAxVpP1nc5Zjp0v~kbJwdSCKlnyc"
    );
  }

  render() {
    return (
      <FrontPageBox>
        <CreateGame onPress={() => this.handleClick()} title="Create Game" />
      </FrontPageBox>
    );
  }
}

const mapStateToProps = () => {
  return {};
};

export default withRouter(connect(mapStateToProps)(FrontPage));
