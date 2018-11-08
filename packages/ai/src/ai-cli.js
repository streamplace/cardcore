#!/usr/bin/env node

import * as gameModules from "@cardcore/game";
import * as client from "@cardcore/client";
import * as ai from "./index.js";
import { parse } from "url";
import { createStore } from "cardcore";

const run = async inputUrl => {
  const { protocol, host, pathname } = parse(inputUrl);
  const store = createStore(gameModules, { ...client, ...ai });
  await store.dispatch(client.clientGenerateIdentity());
  console.log("setServer");
  await store.dispatch(
    client.clientSetServer({ server: `${protocol}//${host}` })
  );
  const gameId = pathname.split("/")[2];
  await store.dispatch(client.clientLoadState(gameId));
};

if (!module.parent) {
  run(process.argv[2]).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
