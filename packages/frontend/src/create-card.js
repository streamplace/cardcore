import React from "react";
import { TextInput, View, Text } from "@cardcore/elements";
import styled from "styled-components";
import { parseCard } from "@cardcore/cards";

const Container = styled(View)`
  width: 100%;
  height: 100%;
  align-items: stretch;
  justify-content: center;
  padding: 1em;
`;

const Input = styled(TextInput)`
  border: 1px solid #ccc;
  font-family: "Fira Code", Consolas, monospace;
  font-size: 18px;
  flex-grow: 1;
  padding: 1em;
`;

const OutputWrapper = styled(View)`
  flex-grow: 1;
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
        Batlecry: Set all other minions' Attack and Health to 3.
      `
        .split("\n")
        .map(x => x.trim())
        .filter(x => x)
        .join("\n")
    };
  }

  handleChange(text) {
    this.setState({ text });
  }

  render() {
    const { data, errors } = parseCard(this.state.text);
    return (
      <Container>
        <OutputWrapper>
          <Output>{JSON.stringify(data, null, 2)}</Output>
          {errors.map((text, i) => (
            <ParseError key={i}>{text}</ParseError>
          ))}
        </OutputWrapper>
        <Input
          onChangeText={text => this.handleChange(text)}
          multiline={true}
          value={this.state.text}
        />
      </Container>
    );
  }
}
