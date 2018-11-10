import express from "express";
import router from "./router";
import bodyParser from "body-parser";
import morgan from "morgan";
import Store from "./store";

export default async function runServer({ port, dataDir }) {
  const store = new Store(dataDir);
  const app = express();
  app.use(bodyParser.json());
  app.use(morgan("dev"));
  app.use((req, res, next) => {
    req.store = store;
    next();
  });
  app.use(router);

  let listener;
  await new Promise((resolve, reject) => {
    listener = app.listen(port, err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
  console.log(`cardcore server listening on ${listener.address().port}`);
  return listener;
}

if (!module.parent) {
  runServer({ port: process.env.PORT || 3003 }).catch(err => {
    console.log(err);
    process.exit(1);
  });
}
