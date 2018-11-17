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
  const p1Prom = (async () => {
    await p1.dispatch(game.createGame());
    console.log("game created, p1 starting autoplay");
    await p1.dispatch(ai.aiAutoplay());
  })();

  const gameId = await p1.dispatch(client.clientGetGameHash());
  console.log(gameId);

  p2 = await createPlayer(serverString);
  await p2.dispatch(client.clientLoadState(gameId));
  // await p2.dispatch(client.clientNext());
  console.log("p2 starting autoplay");
  const p2Prom = p2.dispatch(ai.aiAutoplay());

  await Promise.all([p1Prom, p2Prom]);
  console.log("Simulation completed successfully");
  server.close();

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
    const errorLog = {
      error: { message: error.message, stack: error.stack },
      state: p1.getState()
    };
    console.log(error.message);
    console.log(error.stack);
    // console.log(JSON.stringify(errorLog));

    try {
      fs.writeFileSync(
        "cardcore-error.json",
        JSON.stringify(errorLog, null, 2)
      );
    } catch (e) {}
    process.exit(1);
  };
  process.on("unhandledRejection", handleError);
  const handle = setTimeout(() => {
    handleError(new Error("timeout"));
  }, ms("10 minutes"));
  run(process.argv[2])
    .then(() => {
      clearTimeout(handle);
    })
    .catch(handleError);
}
