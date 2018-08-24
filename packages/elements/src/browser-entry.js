export { BrowserRouter as Router } from "react-router-dom";
export { Route, Switch as RouteSwitch, withRouter } from "react-router-dom";
export * from "react-native-web";
export { default as Svg } from "./browser/browser-svg";
export * from "./shared";
import "./fonts/stylesheet.css";

export async function bootstrap() {}

export function getDimensions() {
  const rects = document.querySelector("#root").getClientRects()[0];
  return {
    width: rects.width,
    height: rects.height
  };
}
