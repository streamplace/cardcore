import Router from "express/lib/router";
import ssbKeys from "@streamplace/ssb-keys";
import { gameReducer } from "cardcore";
import { hashState } from "@cardcore/util";
import stringify from "json-stable-stringify";
import EE from "wolfy87-eventemitter";

const app = Router();

const hashRegex = /^\/(.*\.sha256)$/;
const nextRegex = /^\/(.*\.sha256\/next)$/;

app.get(hashRegex, async (req, res) => {
  try {
    const data = await req.store.get(req.params[0]);
    res.header("content-type", "application/json");
    res.send(stringify(data));
  } catch (err) {
    if (err.name === "NotFoundError") {
      return res.sendStatus(204);
    }
    console.error(err);
    res.sendStatus(404);
  }
});

app.head(nextRegex, async (req, res) => {
  try {
    const data = await req.store.get(req.params[0]);
    res.status(204);
    res.end();
  } catch (err) {
    if (err.name === "NotFoundError") {
      return res.sendStatus(404);
    }
    console.error(err);
    res.status(500);
    res.end();
  }
});

const POLL_FREQUENCY = 500;
const TIMEOUT = 14000;

class Poller extends EE {
  constructor(key, store) {
    super();
    this.key = key;
    this.store = store;
    this.done = false;
    this.pollHandle = setTimeout(() => this._poll(), 0);
    this.timeoutHandle = setTimeout(() => this.cancel(), TIMEOUT);
  }

  _poll() {
    this.store
      .get(this.key)
      .then(data => {
        if (this.done) {
          return;
        }
        this.emit("data", data);
        clearTimeout(this.timeoutHandle);
      })
      .catch(err => {
        if (err.name === "NotFoundError") {
          this.pollHandle = setTimeout(() => this._poll(), POLL_FREQUENCY);
        } else {
          this.emit("error", err);
          this.cancel();
        }
      });
  }

  cancel() {
    clearTimeout(this.pollHandle);
    clearTimeout(this.timeoutHandle);
    this.done = true;
    this.emit("nodata");
  }
}

app.get(nextRegex, async (req, res) => {
  const poller = new Poller(req.params[0], req.store);
  poller
    .on("data", data => {
      res.header("content-type", "application/json");
      res.send(stringify(data));
    })
    .on("nodata", () => {
      res.sendStatus(204);
    })
    .on("error", err => {
      res.status(500);
      res.send(err);
    });
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

app.post(hashRegex, async (req, res) => {
  const action = req.body;
  if (req.body.next !== req.params[0]) {
    return res.sendStatus(400);
  }
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
      let nextState;
      try {
        nextState = await req.store.get(`${action.prev}/next`);
      } catch (e) {
        if (e.name !== "NotFoundError") {
          throw e;
        }
      }
      if (nextState) {
        res.sendStatus(410);
        return;
      }
    }
    const newState = gameReducer({ game: prevState }, action);
    const newHash = hashState(newState.game);
    if (newHash !== req.params[0] || newHash !== req.body.next) {
      res.status(409);
      res.json({
        state: newState,
        hash: newHash
      });
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
