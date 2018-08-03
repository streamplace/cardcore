import express from "express";
import proxy from "http-proxy-middleware";

const app = express();

app.get("/asdf", (req, res) => {
  res.send("got it");
})

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
        ws: true,
        // router: req => {
        //   "http://localhost:3003"
        // }
      })
    );

  }
}
