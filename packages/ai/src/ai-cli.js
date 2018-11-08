#!/usr/bin/env node

import * as game from "@cardcore/game";
import * as client from "@cardcore/client";
import * as ai from "./index.js";
import { parse } from "url";
import { createStore } from "cardcore";

const createPlayer = async server => {
  const store = createStore(game, { ...client, ...ai });
  await store.dispatch(client.clientGenerateIdentity({ store: false }));
  await store.dispatch(client.clientSetServer({ server }));
  return store;
};

const run = async inputUrl => {
  const { protocol, host } = parse(inputUrl);
  const server = `${protocol}//${host}`;

  const p1 = await createPlayer(server);
  await p1.dispatch(game.createGame());
  const gameId = await p1.dispatch(client.clientGetGameHash());
  p1.dispatch(client.clientPoll());

  const p2 = await createPlayer(server);
  await p2.dispatch(client.clientLoadState(gameId));
  p2.dispatch(client.clientPoll());

  // await p1.dispatch(client.clientLoadState(gameId));
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
