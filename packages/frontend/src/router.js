import React from "react";
import { Router as ReactRouter, Route, RouteSwitch } from "@cardcore/elements";
// import ButtCards from "./butt-cards";
import FrontPage from "./front-page";
import { Provider } from "react-redux";
import { createStore } from "redux";
// import { createStore } from "cardcore";

export default class Router extends React.Component {
  constructor() {
    super();
    this.store = createStore((state = {}, action) => state);
  }

  render() {
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
