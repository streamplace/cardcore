import React from "react";
import {
  Router as ReactRouter,
  Route,
  RouteSwitch,
  bootstrap,
  View
} from "@cardcore/elements";
// import ButtCards from "./butt-cards";
import FrontPage from "./front-page";
import { Provider } from "react-redux";
import { createStore } from "redux";
// import { createStore } from "cardcore";

export default class Router extends React.Component {
  constructor() {
    super();
    this.store = createStore((state = {}, action) => state);
    this.state = {
      ready: false
    };
  }

  async componentDidMount() {
    await bootstrap();
    this.setState({ ready: true });
  }

  render() {
    if (!this.state.ready) {
      return <View />;
    }
    return (
      <Provider store={this.store}>
        <ReactRouter>
          <RouteSwitch>
            {/* <Route path="/game/:gameId" component={ButtCards} /> */}
            <Route path="/" component={FrontPage} />
          </RouteSwitch>
        </ReactRouter>
      </Provider>
    );
  }
}
