import "./fonts/stylesheet.css";
import EE from "wolfy87-eventemitter";
import { throttle } from "underscore";

export { BrowserRouter as Router } from "react-router-dom";
export { Route, Switch as RouteSwitch, withRouter } from "react-router-dom";
export * from "react-native-web";
export { default as Svg } from "./browser/browser-svg";
export * from "./shared";
export async function bootstrap() {}
export function getDimensions() {
  const rects = document.querySelector("#root").getClientRects()[0];
  return {
    width: rects.width,
    height: rects.height
  };
}

export const getServer = () => {
  return `${document.location.protocol}//${document.location.host}`;
};

export const isWeb = () => true;
export const isNative = () => false;

class BrowserEvents extends EE {
  constructor() {
    super();
    const throttledResize = throttle(() => {
      this.emit("resize", getDimensions());
    }, 250);
    window.addEventListener("resize", throttledResize);
  }
}

export const Events = new BrowserEvents();

export const Storage = {
  getItem: key => {
    return Promise.resolve(localStorage.getItem(key));
  },

  setItem: async (key, value) => {
    return Promise.resolve(localStorage.setItem(key, value));
  }
};
