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
  }

  render() {
    const { width } = getDimensions();
    const cards = [
      {
        name: "Stinky Mouse",
        mana: 1,
        attack: 2,
        health: 3,
        text: ["Sneaky", "ON ENTER: Deal 1 damage to all other creatures."]
      },
      {
        name: "Stinkier Mouse",
        mana: 4,
        attack: 5,
        health: 6,
        text: ["Charge, Sneaky"]
      },
      {
        name: "Stinkiest Mouse",
        mana: 10,
        attack: 10,
        health: 10,
        text: ["Sneaky", "WHEN DAMAGED: Deal 1 damage to all other creatures."]
      }
    ];
    return (
      <FrontPageBox>
        {/* <CreateGame onPress={() => this.handleClick()} title="Create Game" /> */}
        {cards.map((card, i) => (
          <CardSVG width={width / 4} key={i} card={card} />
        ))}
      </FrontPageBox>
    );
  }
}

const mapStateToProps = () => {
  return {};
};

export default withRouter(connect(mapStateToProps)(FrontPage));
