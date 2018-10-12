import ssbKeys from "@streamplace/ssb-keys";
import stringify from "json-stable-stringify";

// Returns a stringified, signed action
export const signAction = (state, action) => {
  return stringify(ssbKeys.signObj(state.client.keys, action));
};

export const verifyAction = (state, action) => {
  if (!state.game.players[req.body._sender]) {
    return false;
  }
  return ssbKeys.verifyObj(
    {
      id: req.body._sender,
      curve: "ed25519",
      public: req.body._sender.slice(1)
    },
    action
  );
};
