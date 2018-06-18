import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import ButtCards from "./butt-cards";
import FrontPage from "./front-page";
import CardDesign from "./card-design";
import styled, { injectGlobal } from "styled-components";
import { buttFonts, buttFontsCss } from "./butt-fonts";

const Everything = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

injectGlobal`
  ${buttFontsCss}
`;

export default class Router extends React.Component {
  constructor() {
    super();
    this.state = {
      fontsLoaded: false
    };
  }
  componentDidMount() {
    const listener = () => {
      this.setState({ fontsLoaded: true });
      window.removeEventListener("load", listener);
    };
    window.addEventListener("load", listener);
  }
  render() {
    // bit of a hack to make sure our fonts are loaded before we render svg files
    if (!this.state.fontsLoaded) {
      return (
        <div>
          {buttFonts.map(fontName => (
            <div key={fontName} style={{ fontFamily: fontName }}>
              Loading...
            </div>
          ))}
        </div>
      );
    }
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/card-design" component={CardDesign} />
          <Route path="/:id" component={ButtCards} />
          <Route path="/" component={FrontPage} />
        </Switch>
      </BrowserRouter>
    );
  }
}
