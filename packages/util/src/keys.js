import ssbKeys from "@streamplace/ssb-keys";
import stringify from "json-stable-stringify";
import { REMOTE_ACTION } from "./constants";

// Returns a stringified, signed action
export const signAction = (state, action) => {
  action;
  if (typeof action.signature !== "undefined") {
    throw new Error(`signAction cannot handle objects with "signature"`);
  }
  const str = stringify(ssbKeys.signObj(state.client.keys, action));
  const valid = verifyAction(state, JSON.parse(str));
  if (!valid) {
    console.log("fatal error");
    throw new Error(
      `fatal error: i can't sign things in a manner that allows me to verify them action=${JSON.stringify(action)} signedAction=${str}`
    );
  }
  return str;
};

export const verifyAction = (state, action) => {
  return ssbKeys.verifyObj(
    {
      id: action.agent,
      curve: "ed25519",
      public: action.agent.slice(1),
    },
    {
      ...action,
      [REMOTE_ACTION]: undefined,
    }
  );
};
