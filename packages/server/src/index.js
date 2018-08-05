import express from "express";
import router from "./router";
import bodyParser from "body-parser";
import morgan from "morgan";

const app = express();
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(router);

if (!module.parent) {
  const listener = app.listen(process.env.port || 3003, err => {
    if (err) {
      throw err;
    }
    console.log(`cardcore server listening on ${listener.address().port}`);
  });
}
