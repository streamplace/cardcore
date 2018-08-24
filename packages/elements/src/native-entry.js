import { Font, Util } from "expo";
import { fonts } from "./shared";
import { Dimensions, Platform, BackHandler } from "react-native";
import EE from "wolfy87-eventemitter";

export { NativeRouter as Router } from "react-router-native";
export { Route, Switch as RouteSwitch, withRouter } from "react-router-native";
export * from "react-native";
export { Svg } from "expo";
export * from "./shared";

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
