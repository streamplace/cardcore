#!/usr/bin/env node

import * as game from "@cardcore/game";
import * as client from "@cardcore/client";
import * as ai from "./index.js";
import path from "path";
import os from "os";
import { createStore } from "cardcore";
import { Storage } from "@cardcore/elements";
import runServer from "@cardcore/server";
import fs from "fs-extra";
import ms from "ms";

const mockStorage = {};

Storage.getItem = key => {
  const item = mockStorage[key] || null;
  return Promise.resolve(item);
};

Storage.setItem = (key, value) => {
  mockStorage[key] = value;
  return Promise.resolve();
};

Storage.removeItem = key => {
  delete mockStorage[key];
  return Promise.resolve();
};

const createPlayer = async server => {
  const store = createStore(game, { ...client, ...ai });
  await store.dispatch(client.clientGenerateIdentity({ store: false }));
  await store.dispatch(client.clientSetServer({ server }));
  return store;
};

let server;
let p1;
let p2;

const SERVER_DIR = path.resolve(
  os.tmpdir(),
  `cardcore-test-${Math.round(Math.random() * 10000000000)}`
);

const run = async () => {
  await fs.ensureDir(SERVER_DIR);
  // const { protocol, host } = parse(inputUrl);
  // const serverString = `${protocol}//${host}`;
  server = await runServer({
    dataDir: path.resolve(SERVER_DIR, "server"),
    log: false
  });
  const serverString = `http://localhost:${server.address().port}`;

  p1 = await createPlayer(serverString);
  await p1.dispatch(game.createGame());
  const gameId = await p1.dispatch(client.clientGetGameHash());
  p1.dispatch(client.clientPoll());

  p2 = await createPlayer(serverString);
  await p2.dispatch(client.clientLoadState(gameId));
  p2.dispatch(client.clientPoll());

  // await p1.dispatch(client.clientLoadState(gameId));
};

if (!module.parent) {
  const handleError = async error => {
    try {
      await fs.remove(SERVER_DIR);
    } catch (e) {
      console.log("failed to remove server");
    }
    if (error.message === "done") {
      const state = p1.getState();
      if (
        state.client.actionLog[state.client.actionLog.length - 1].type ===
        "DEFEAT"
      ) {
        console.log("simulation completed normally");
        process.exit(0);
      }
    }
    console.log(error);
    if (p1) {
      console.log(JSON.stringify(p1.getState(), null, 2));
    }
    try {
      fs.writeFileSync(
        "cardcore-error.json",
        JSON.stringify(
          {
            error: { message: error.message, stack: error.stack },
            state: p1.getState()
          },
          null,
          2
        )
      );
    } catch (e) {}
    process.exit(1);
  };
  process.on("unhandledRejection", handleError);
  run(process.argv[2]).catch(handleError);
  setTimeout(() => {
    handleError(new Error("timeout"));
  }, ms("10 minutes"));
}
