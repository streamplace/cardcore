import express from "express";
import router from "./router";
import bodyParser from "body-parser";
import morgan from "morgan";
import Store from "./store";

const app = express();
app.use(bodyParser.json());
app.use(morgan("dev"));
let store;
app.use((req, res, next) => {
  req.store = store;
  next();
});
app.use(router);

if (!module.parent) {
  store = new Store();
  const listener = app.listen(process.env.port || 3003, err => {
    if (err) {
      throw err;
    }
    console.log(`cardcore server listening on ${listener.address().port}`);
  });
}
