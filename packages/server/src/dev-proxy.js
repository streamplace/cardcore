/**
 * This exists so that we can have one server that maintains the open websocket connection to
 * create-react-app while we still auto-restart the other server as we make changes. It works p
 * good.
 */
import express from "express";
import proxy from "http-proxy-middleware";

const app = express();

app.use(
  proxy("/", {
    target: "http://127.0.0.1:3002",
    logLevel: "info",
    ws: true,
    router: (req) => {
      if (
        req.path &&
        (req.path.endsWith(".sha256") || req.path.endsWith("next"))
      ) {
        return "http://127.0.0.1:3003";
      }
      return "http://127.0.0.1:3002";
    },
  }),
);

app.listen(process.env.PORT || 3000);
