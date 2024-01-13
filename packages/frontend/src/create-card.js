import React from "react";
import { TextInput, View, Text } from "@cardcore/elements";
import styled from "styled-components";
import { parseCard } from "@cardcore/cards";
import JSONPretty from "react-json-pretty";
import "react-json-pretty/src/JSONPretty.monikai.css";

const Container = styled(View)`
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 1em;
  background-color: #272822;
  flex-direction: row;
`;

const Input = styled(TextInput)`
  border: 1px solid #ccc;
  font-family: "Fira Code", Consolas, monospace;
  font-size: 18px;
  flex-grow: 1;
  padding: 1em;
  color: #eee;
  background-color: black;
  align-self: stretch;

  &::selection {
    background-color: #9a3c05;
  }
  flex-basis: 0;
`;

const OutputWrapper = styled(View)`
  padding: 1em;
  flex-grow: 1;
  font-size: 18px;
  flex-basis: 0;
`;

const Output = styled(Text)`
  font-family: "Fira Code", Consolas, monospace;
  font-size: 18px;
`;

const ParseError = styled(Output)`
  font-family: "Fira Code", Consolas, monospace;
  color: red;
`;

export default class CreateCard extends React.Component {
  constructor() {
    super();
    this.state = {
      text: `
        Three Master
        Cost: 6
        Health: 7
        Attack: 3
        Taunt
        Battlecry: Set all other minions' Attack and Health to 3.
      `
        .split("\n")
        .map((x) => x.trim())
        .filter((x) => x)
        .join("\n"),
    };
  }

  handleChange(text) {
    this.setState({ text });
  }

  render() {
    const { data, errors } = parseCard(this.state.text);
    return (
      <Container>
        <Input
          onChangeText={(text) => this.handleChange(text)}
          multiline={true}
          value={this.state.text}
        />
        <OutputWrapper>
          <JSONPretty json={data} />
          {errors.map((text, i) => (
            <ParseError key={i}>{text}</ParseError>
          ))}
        </OutputWrapper>
      </Container>
    );
  }
}
