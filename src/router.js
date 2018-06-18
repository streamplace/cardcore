import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import ButtCards from "./butt-cards";
import FrontPage from "./front-page";
import styled from "styled-components";

const Everything = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

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
