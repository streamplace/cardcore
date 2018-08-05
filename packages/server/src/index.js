import express from "express";
import proxy from "http-proxy-middleware";
import router from "./router";
import bodyParser from "body-parser";
import morgan from "morgan";

const app = express();
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(router);

if (!module.parent) {
  const listener = app.listen(process.env.port || 3000, err => {
    if (err) {
      throw err;
    }
    console.log(`cardcore server listening on ${listener.address().port}`);
  });

  if (process.env.NODE_ENV === "development") {
    app.use(
      proxy("/", {
        target: "http://localhost:3002",
        logLevel: "info",
        ws: true
        // router: req => {
        //   "http://localhost:3003"
        // }
      })
    );
  }
}
