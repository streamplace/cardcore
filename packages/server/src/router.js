import Router from "express/lib/router";
import ssbKeys from "ssb-keys";
import { gameReducer } from "cardcore";
import { hashState } from "@cardcore/util";

const app = Router();

app.post(/^\/(.*\.sha256)$/, (req, res) => {
  const action = req.body;
  const verified = ssbKeys.verifyObj(
    {
      id: req.body._sender,
      curve: "ed25519",
      public: req.body._sender.slice(1)
    },
    action
  );
  if (!verified) {
    return res.sendStatus(403);
  }
  const newState = gameReducer({}, action);
  const newHash = hashState(newState.game);
  if (newHash !== req.params[0] || newHash !== req.body.next) {
    return res.sendStatus(401);
  }
  res.sendStatus(204);
});

export default app;
