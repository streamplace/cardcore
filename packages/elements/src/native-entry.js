import { Font, Util } from "expo";
import { fonts } from "./shared";
import { Dimensions, Platform, BackHandler } from "react-native";

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

if (Platform.OS === "android") {
  BackHandler.addEventListener("hardwareBackPress", function() {
    setTimeout(() => Expo.Util.reload(), 0);
    return true;
  });
}
