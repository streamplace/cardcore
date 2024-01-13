import React from "react";
import ReactDOM from "react-dom";
import Router from "./router";
import styled, { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  html, body, #root {
    height: 100%;
    overflow: hidden;
    font-family: "Open Sans", "Helvetica Neue", Helvetica, sans-serif;
  }
`;

const GlobalWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

ReactDOM.render(
  <GlobalWrapper>
    <GlobalStyle />
    <Router />
  </GlobalWrapper>,
  document.getElementById("root"),
);
