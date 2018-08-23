import React from "react";
import ReactDOM from "react-dom";
import Router from "./router";
import { injectGlobal } from "styled-components";

injectGlobal`
  html, body, #root {
    height: 100%;
  }
`;

ReactDOM.render(<Router />, document.getElementById("root"));
