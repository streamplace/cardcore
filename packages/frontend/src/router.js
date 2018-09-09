import React from "react";
import {
  Router as ReactRouter,
  Route,
  RouteSwitch,
  bootstrap,
  View,
  Events,
  getDimensions
} from "@cardcore/elements";
import ButtCards from "./butt-cards";
import FrontPage from "./front-page";
import { Provider } from "react-redux";
import { createStore } from "cardcore";
import * as frontendActions from "./actions";

export default class Router extends React.Component {
  constructor() {
    super();
    this.store = createStore(frontendActions);
    this.state = {
      ready: false
    };
    this.handleResize = this.handleResize.bind(this);
  }

  handleResize() {
    return this.store.dispatch(frontendActions.frontendResize(getDimensions()));
  }

  async componentDidMount() {
    await this.handleResize();
    await bootstrap();
    this.setState({ ready: true });
    Events.on("resize", this.handleResize);
  }

  componentWillUnmount() {
    Events.off("resize", this.handleResize);
  }

  render() {
    if (!this.state.ready) {
      return <View />;
    }
    return (
      <Provider store={this.store}>
        <ReactRouter>
          <RouteSwitch>
            <Route
              path="/game/:gameId"
              render={props => <ButtCards {...props} />}
            />
            <Route path="/" component={FrontPage} />
          </RouteSwitch>
        </ReactRouter>
      </Provider>
    );
  }
}
