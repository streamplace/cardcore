import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import ButtCards from "./butt-cards";
import FrontPage from "./front-page";

export default class Router extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/:id" component={ButtCards} />
          <Route path="/" component={FrontPage} />
        </Switch>
      </BrowserRouter>
    );
  }
}
