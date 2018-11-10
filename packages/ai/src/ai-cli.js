#!/usr/bin/env node

import * as game from "@cardcore/game";
import * as client from "@cardcore/client";
import * as ai from "./index.js";
import path from "path";
import os from "os";
import { createStore } from "cardcore";
import runServer from "@cardcore/server";

const createPlayer = async server => {
  const store = createStore(game, { ...client, ...ai });
  await store.dispatch(client.clientGenerateIdentity({ store: false }));
  await store.dispatch(client.clientSetServer({ server }));
  return store;
};

let server;

const run = async inputUrl => {
  // const { protocol, host } = parse(inputUrl);
  // const serverString = `${protocol}//${host}`;
  server = await runServer({
    dataDir: path.resolve(os.tmpdir(), "cardcore-test-server")
  });
  console.log("asdf");
  const serverString = `http://localhost:${server.address().port}`;
  console.log("hi");
  // process.exit(0);

  const p1 = await createPlayer(serverString);
  await p1.dispatch(game.createGame());
  const gameId = await p1.dispatch(client.clientGetGameHash());
  p1.dispatch(client.clientPoll());

  const p2 = await createPlayer(serverString);
  await p2.dispatch(client.clientLoadState(gameId));
  p2.dispatch(client.clientPoll());

  await p1.dispatch(client.clientLoadState(gameId));
};

if (!module.parent) {
  process.on("unhandledRejection", error => {
    console.log(error);
    process.exit(1);
  });
  run(process.argv[2]).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
