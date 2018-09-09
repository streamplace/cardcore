import React from "react";
import ReactDOM from "react-dom";
import Router from "./router";
import { injectGlobal } from "styled-components";

injectGlobal`
  * {
    box-sizing: border-box;
  }
  html, body, #root {
    height: 100%;
    overflow: hidden;
  }
`;

ReactDOM.render(<Router />, document.getElementById("root"));
