import "./polyfills";
import Expo from "expo";
import React from "react";
import App from "./dist/native.js";

const AwakeInDevApp = props => [
  <App key="app" {...props} />,
  process.env.NODE_ENV === "development" ? (
    <Expo.KeepAwake key="keep-awake" />
  ) : null
];
Expo.registerRootComponent(AwakeInDevApp);
