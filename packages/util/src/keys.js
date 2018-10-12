import ssbKeys from "@streamplace/ssb-keys";
import stringify from "json-stable-stringify";
import { REMOTE_ACTION } from "./constants";

// Returns a stringified, signed action
export const signAction = (state, action) => {
  return stringify(ssbKeys.signObj(state.client.keys, action));
};

export const verifyAction = (state, action) => {
  return ssbKeys.verifyObj(
    {
      id: action.agent,
      curve: "ed25519",
      public: action.agent.slice(1)
    },
    {
      ...action,
      [REMOTE_ACTION]: undefined
    }
  );
};
