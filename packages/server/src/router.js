import Router from "express/lib/router";
import ssbKeys from "ssb-keys";
import { gameReducer } from "cardcore";
import { hashState } from "@cardcore/util";
import stringify from "json-stable-stringify";

const app = Router();

const hashRegex = /^\/(.*\.sha256)$/;
const nextRegex = /^\/(.*\.sha256\/next)$/;

const getKey = async (req, res) => {
  try {
    const data = await req.store.get(req.params[0]);
    res.header("content-type", "application/json");
    res.send(stringify(data));
  } catch (err) {
    if (err.code === "ENOENT") {
      return res.sendStatus(204);
    }
    console.error(err);
    res.sendStatus(404);
  }
};
app.get(hashRegex, getKey);
app.get(nextRegex, getKey);

app.post(hashRegex, async (req, res) => {
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
  try {
    let prevState = {};
    if (action.prev) {
      prevState = await req.store.get(action.prev);
    }
    const newState = gameReducer({ game: prevState }, action);
    const newHash = hashState(newState.game);
    if (newHash !== req.params[0] || newHash !== req.body.next) {
      return res.sendStatus(401);
    }
    await req.store.put(newHash, stringify(newState.game));
    await req.store.put(`${action.prev}/next`, stringify(action));
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(400);
  }
});

export default app;
