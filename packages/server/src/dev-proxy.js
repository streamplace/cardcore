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
    target: "http://localhost:3002",
    logLevel: "info",
    ws: true,
    router: req => {
      if (req.path && req.path.endsWith(".sha256")) {
        return "http://localhost:3003";
      }
      return "http://localhost:3002";
    }
  })
);

app.listen(process.env.PORT || 3000);
