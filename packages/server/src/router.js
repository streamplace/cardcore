import Router from "express/lib/router";
import ssbKeys from "@streamplace/ssb-keys";
import { createReducer } from "cardcore/dist/reducer";
import { hashState } from "@cardcore/util";
import stringify from "json-stable-stringify";
import EE from "wolfy87-eventemitter";
import * as gameModules from "@cardcore/game";

const gameReducer = createReducer(gameModules);

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
    res.status(500);
    res.json({
      error: err.message,
      stack: err.stack
    });
  }
});

const POLL_FREQUENCY = 500;
const TIMEOUT = 14000;

const allPollers = {};

class Poller extends EE {
  constructor(key, store) {
    super();
    this.key = key;
    allPollers[this.key] = this;
    this.store = store;
    this.done = false;
    this.pollHandle = setTimeout(() => this._poll(), 0);
    this.timeoutHandle = setTimeout(() => this.cancel(), TIMEOUT);
  }

  _poll() {
    this.store
      .get(this.key)
      .then(data => {
        this.data(data);
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

  data(data) {
    if (this.done) {
      return;
    }
    this.emit("data", data);
    this.cleanup();
  }

  cancel() {
    if (this.done) {
      return;
    }
    this.emit("nodata");
  }

  cleanup() {
    this.done = true;
    delete allPollers[this.key];
    clearTimeout(this.pollHandle);
    clearTimeout(this.timeoutHandle);
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
      res.json({
        error: err.message,
        stack: err.stack
      });
    });
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

app.post(hashRegex, async (req, res) => {
  const action = req.body;
  if (req.body.next !== req.params[0]) {
    res.status(400);
    return res.json({
      error: "body.next and url don't match",
      body: req.body,
      params: req.params
    });
  }
  const verified = ssbKeys.verifyObj(
    {
      id: req.body.agent,
      curve: "ed25519",
      public: req.body.agent.slice(1)
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
        res.status(410);
        res.send({ error: "key already exists" });
        return;
      }
    }
    const newState = gameReducer({ game: prevState }, action);
    const newHash = hashState(newState.game);
    if (newHash !== req.params[0] || newHash !== req.body.next) {
      res.status(409);
      return res.json({
        state: newState,
        hash: newHash
      });
    }
    const nextKey = `${action.prev}/next`;
    const putPromises = [req.store.put(newHash, stringify(newState.game))];
    if (action.prev) {
      putPromises.push(req.store.put(nextKey, stringify(action)));
    }
    await Promise.all(putPromises);
    if (allPollers[nextKey]) {
      allPollers[nextKey].data(action);
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(500);
    res.send({ error: err.message, stack: err.stack });
  }
});

export default app;
