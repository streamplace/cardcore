import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import ButtCards from "./butt-cards";
import FrontPage from "./front-page";
import { Provider } from "react-redux";
import { createStore } from "cardcore";

export default class Router extends React.Component {
  constructor() {
    super();
    this.store = createStore();
  }

  render() {
    return (
      <Provider store={this.store}>
        <BrowserRouter>
          <Switch>
            <Route path="/game/:gameId" component={ButtCards} />
            <Route path="/" component={FrontPage} />
          </Switch>
        </BrowserRouter>
      </Provider>
    );
  }
}
