const express = require("express");
const proxy = require("http-proxy-middleware");

const app = express();

app.use(
  proxy("/", {
    target: "http://localhost:3002",
    logLevel: "info",
    ws: true,
    router: {
      "/v1": "http://localhost:3001"
    }
  })
);

app.listen(process.env.PORT || 3000);
