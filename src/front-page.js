import React from "react";
import styled from "styled-components";
import { withRouter } from "react-router-dom";
import { v4 } from "uuid";

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
  handleClick() {
    this.props.history.push(`/${v4()}`);
  }

  render() {
    return (
      <FrontPageBox>
        <CreateGame onClick={() => this.handleClick()}>Create Game</CreateGame>
      </FrontPageBox>
    );
  }
}

export default withRouter(FrontPage);
