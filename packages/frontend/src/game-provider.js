import React from "react";
import { View, Events, getDimensions } from "@cardcore/elements";
import { Provider } from "react-redux";
import { createStore } from "cardcore";
import * as gameModules from "@cardcore/game";
import * as clientModules from "@cardcore/client";
import * as frontendModules from "./actions";

export default class GameProvider extends React.Component {
  constructor() {
    super();
    this.state = {
      ready: false
    };
    this.handleResize = this.handleResize.bind(this);
  }

  handleResize() {
    return this.store.dispatch(frontendModules.frontendResize(getDimensions()));
  }

  async componentDidMount() {
    let additionalModules = this.props.modules || {};
    this.store = createStore(gameModules, {
      ...clientModules,
      ...frontendModules,
      ...additionalModules
    });
    await this.handleResize();
    this.setState({ ready: true });
    Events.on("resize", this.handleResize);
  }

  componentWillUnmount() {
    Events.off("resize", this.handleResize);
    this.store.dispatch(clientModules.clientClose());
  }

  render() {
    if (!this.state.ready) {
      return <View />;
    }
    return <Provider store={this.store}>{this.props.children}</Provider>;
  }
}
