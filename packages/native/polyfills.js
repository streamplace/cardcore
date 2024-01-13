import { Buffer } from "buffer";
import React from "react";
import nacl from "tweetnacl";
import { Platform } from "react-native";

if (Platform.OS === "android") {
  if (typeof Symbol === "undefined") {
    if (Array.prototype["@@iterator"] === undefined) {
      Array.prototype["@@iterator"] = function () {
        let i = 0;
        return {
          next: () => ({
            done: i >= this.length,
            value: this[i++],
          }),
        };
      };
    }
  }
}

// todo: this is hilariously slow and insecure
nacl.setPRNG(function (x, n) {
  for (let i = 0; i < n; i++) {
    x[i] = ((Math.random() * 0x100000000) | 0) % 255;
  }
});

global.React = React;
global.Buffer = Buffer;
global.self = global;
