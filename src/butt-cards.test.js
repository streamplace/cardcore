import React from "react";
import ReactDOM from "react-dom";
import ButtCards from "./butt-cards";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<ButtCards />, div);
  ReactDOM.unmountComponentAtNode(div);
});
