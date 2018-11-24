import { Storage } from "@cardcore/elements";
import { createStore } from "@cardcore/core";
import * as game from "@cardcore/game";
import * as client from "@cardcore/client";
import * as ai from "@cardcore/ai";
import runServer from "@cardcore/server";
import tmp from "tmp-promise";
import { fork } from "child_process";
import ms from "ms";
import uploadError from "./upload-error";

export const mockStorage = () => {
  const storage = {};

  Storage.getItem = key => {
    const item = storage[key] || null;
    return Promise.resolve(item);
  };

  Storage.setItem = (key, value) => {
    storage[key] = value;
    return Promise.resolve();
  };

  Storage.removeItem = key => {
    delete storage[key];
    return Promise.resolve();
  };
};

export const simulateServerMany = async (count, concurrency) => {
  let started = 0;
  let completed = 0;
  let active = [];
  const startTime = Date.now();
  const report = () => {
    let str = `Started ${started}/${count} (${Math.floor(
      (started / count) * 100
    )}%) Completed ${completed}/${count} (${Math.floor(
      (completed / count) * 100
    )}%)`;
    if (completed > 0) {
      const duration = Date.now() - startTime;
      const timeForOne = Math.floor(duration / completed) * (count - completed);
      str += ` ETA: ${ms(timeForOne)}`;
    }
    console.log(str);
  };
  report();
  setInterval(report, ms("1 minute"));
  while (started < count) {
    started += 1;
    const proc = fork(process.argv[1], ["simulate"], { silent: true });
    active.push(proc);
    /* eslint-disable no-loop-func */
    proc.prom = new Promise(resolve => {
      proc.on("close", code => {
        if (code !== 0) {
          process.exit(1);
        }
        active = active.filter(p => p !== proc);
        resolve();
      });
    });

    if (active.length >= concurrency) {
      await Promise.race(active.map(p => p.prom));
    }
    proc.prom.then(() => (completed += 1));
  }
  console.log(`${count} runs completed successfully`);
};

export const simulateServer = async ({ count, concurrency }) => {
  if (count > 1) {
    return simulateServerMany(count, concurrency);
  }
  setTimeout(() => {
    handleError(new Error("timeout"));
  }, ms("10 minutes"));

  const dataDir = (await tmp.dir()).path;
  const server = await runServer({ dataDir, log: false });
  const serverString = `http://localhost:${server.address().port}`;
  const p1 = fork(process.argv[1], [
    "simulate",
    "create",
    "--server",
    serverString
  ]);
  const p1Prom = new Promise((resolve, reject) => {
    p1.on("close", code => {
      if (code !== 0) {
        return reject(new Error(`P1 exited with code ${code}`));
      }
      resolve();
    });
  });

  const gameId = await new Promise((resolve, reject) => {
    p1.once("message", message => {
      resolve(message);
    });
  });

  if (!gameId || typeof gameId !== "string" || gameId.trim() === "") {
    throw new Error("Didn't get gameId from P1");
  }

  const p2 = fork(process.argv[1], [
    "simulate",
    "join",
    "--server",
    serverString,
    `--game-id=${gameId}`
  ]);

  const p2Prom = new Promise((resolve, reject) => {
    p2.on("close", code => {
      if (code !== 0) {
        return reject(new Error(`P2 exited with code ${code}`));
      }
      resolve();
    });
  });

  let states = new Map();

  const stateDumpProm = Promise.all(
    [p1, p2].map(player => {
      return new Promise((resolve, reject) => {
        player.on("message", state => {
          states.set(player, state);
          resolve(state);
        });
      });
    })
  );

  const handleError = async err => {
    process.on("uncaughtException", ex => {
      console.log(ex);
    });
    console.log("handling error ", err);
    p1.on("error", () => {});
    p2.on("error", () => {});
    for (const player of [p1, p2]) {
      if (!states.has(player)) {
        player.send("dumpState");
      }
    }
    await Promise.race([stateDumpProm, new Promise(r => setTimeout(r, 5000))]);
    const bothStates = states.values();
    if (process.env.DRONE_COMMIT) {
      try {
        let stack;
        for (const user of bothStates) {
          if (user.stack) {
            stack = user.stack;
          }
        }
        await uploadError({
          error: err.message,
          stack: stack,
          states: [...states.values()]
        });
      } catch (e) {
        console.log("error uploading", e);
      }
    }
    process.exit(1);
  };

  try {
    await Promise.all([p1Prom, p2Prom]);
    console.log("Simulate ran successfully");
    server.close();
    process.exit(0);
  } catch (err) {
    console.log(err);
    await handleError(err);
  }
  process.exit(1);
};

export const createPlayer = async server => {
  const store = createStore(game, { ...client, ...ai });
  await store.dispatch(client.clientGenerateIdentity({ store: false }));
  await store.dispatch(client.clientSetServer({ server }));
  process.on("message", msg => {
    if (msg === "dumpState") {
      process.send({ state: store.getState() });
    }
  });
  return store;
};

const exitOrDump = async (player, prom) => {
  try {
    await prom;
    process.exit(0);
  } catch (e) {
    process.send({
      error: e.message,
      stack: e.stack,
      state: player.getState()
    });
    await new Promise(r => setTimeout(r, 1000));
    process.exit(1);
  }
};

export const simulateCreate = async server => {
  mockStorage();
  const player = await createPlayer(server);
  const playerProm = (async () => {
    await player.dispatch(game.createGame());
    await player.dispatch(ai.aiAutoplay());
  })();
  await new Promise(r => setTimeout(r, 1000)); // Fixes race where hash runs before game created
  const gameId = await player.dispatch(client.clientGetGameHash());
  process.send(gameId);
  return exitOrDump(player, playerProm);
};

export const simulateJoin = async (server, gameId) => {
  mockStorage();
  const player = await createPlayer(server);
  const playerProm = (async () => {
    await player.dispatch(client.clientLoadState(gameId));
    await player.dispatch(ai.aiAutoplay());
  })();
  return exitOrDump(player, playerProm);
};
