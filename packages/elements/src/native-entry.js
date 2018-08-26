import { Font, Util } from "expo";
import { fonts } from "./shared";
import { Dimensions, Platform, BackHandler, AsyncStorage } from "react-native";
import EE from "wolfy87-eventemitter";

export { NativeRouter as Router } from "react-router-native";
export { Route, Switch as RouteSwitch, withRouter } from "react-router-native";
export * from "react-native";
export { Svg } from "expo";
export * from "./shared";
import Expo from "expo";
import URL from "url-parse";

if (Platform.OS === "android") {
  fonts.title = "Roboto";
}

export async function bootstrap() {
  await Font.loadAsync({
    [fonts.title]: require("./fonts/OpenSansCondensed-Bold.ttf")
  });
}

export function getDimensions() {
  return Dimensions.get("window");
}

export const isWeb = () => false;
export const isNative = () => true;

export const getServer = () => {
  if (Expo.Constants.manifest.packagerOpts.dev !== true) {
    return "https://cardco.re";
  }
  // TODO: is Expo.Constants.linkingUrl most correct here? idk.
  const httpUrl = Expo.Constants.linkingUrl.replace(/^exp/, "http");
  const parsed = new URL(httpUrl);
  return `http://${parsed.hostname}:3000`;
};

if (Platform.OS === "android") {
  BackHandler.addEventListener("hardwareBackPress", function() {
    setTimeout(() => Expo.Util.reload(), 0);
    return true;
  });
}

class NativeEvents extends EE {
  constructor() {
    super();
    Dimensions.addEventListener("change", () => {
      this.emit("resize", getDimensions());
    });
  }
}

export const Events = new NativeEvents();

export const Storage = {
  getItem: async key => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },

  setItem: async (key, value) => {
    return await AsyncStorage.setItem(key, value);
  },

  removeItem: async key => {
    return await AsyncStorage.removeItem(key);
  }
};
