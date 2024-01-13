#!/usr/bin/env node

import yargs from "yargs";
import { simulateServer, simulateCreate, simulateJoin } from "./simulate";
import runServer from "@cardcore/server";

/* eslint-disable no-unused-expressions */
yargs
  .command(
    "server",
    "start a cardcore server",
    (yargs) => {
      yargs.option("port", {
        describe: `port to bind on`,
        default: 5000,
      });
      yargs.option("data-dir", {
        describe: `data storage directory`,
        type: "string",
        default: null,
      });
    },
    async (argv) => {
      await runServer({
        port: argv.port,
        dataDir: argv.dataDir,
      });
    }
  )

  .command(
    "simulate",
    "run a simulation of a cardcore game",
    (yargs) => {
      yargs.option("server", {
        describe: `server to use (otherwise i run my own)`,
        type: "string",
      });

      yargs.option("count", {
        describe: "how many simulations to run",
        type: "number",
        default: 1,
      });

      yargs.option("concurrency", {
        describe: "when count >= 1, how many simulations should I run at once?",
        type: "number",
        default: 16,
      });

      yargs.command(
        "create",
        "start up a cardcore client creating a game",
        (yargs) => {
          yargs.option("server", {
            describe: `server to which I should connect`,
            type: "string",
            demandOption: true,
          });
        },
        async (argv) => {
          await simulateCreate(argv.server);
        }
      );

      yargs.command(
        "join",
        "start up a cardcore client creating a game",
        (yargs) => {
          yargs.option("server", {
            describe: `server to which I should connect`,
            type: "string",
            demandOption: true,
          });
          yargs.option("game-id", {
            describe: "id of the simulated game",
            type: "string",
            demandOption: true,
          });
        },
        async (argv) => {
          await simulateJoin(argv.server, argv.gameId);
        }
      );
    },
    async (argv) => {
      await simulateServer({
        count: argv.count,
        concurrency: argv.concurrency,
        server: argv.server,
      });
    }
  )

  .demandCommand()
  .option("verbose", {
    alias: "v",
    default: false,
  }).argv;
