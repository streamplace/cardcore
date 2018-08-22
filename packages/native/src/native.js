import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { shuffle } from "@cardcore/util";

export default class App extends React.Component {
  render() {
    let elems = ["one", "two", "three", "four", "five"];
    elems = shuffle(elems);
    return (
      <View style={styles.container}>
        {elems.map(elem => (
          <View key={elem}>
            <Text>{elem}</Text>
          </View>
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
