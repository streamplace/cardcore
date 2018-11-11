const azure = require("azure-storage");
const fetch = require("isomorphic-fetch");
const blobService = azure.createBlobService(process.env.AZ_CONNECTION_STRING);

const container = "cardcore-builds";
const filename = "cardcore-error.json";
const remoteName = `${process.env.DRONE_COMMIT}-error.json`;

const slackNotify = async function(text) {
  if (typeof text !== "string") {
    text = JSON.stringify(text);
  }
  await fetch(process.env.SLACK_NOTIFICATION, {
    method: "POST",
    body: JSON.stringify({ text }),
    headers: { "content-type": "application/json" }
  });
};

blobService.createContainerIfNotExists(container, error => {
  if (error) return console.log(error);
  blobService.createBlockBlobFromLocalFile(
    container,
    `${process.env.DRONE_COMMIT}-error.json`,
    filename,
    (error, result) => {
      if (error) console.log(error);
      slackNotify(
        `simulation error: https://streamplace.blob.core.windows.net/${container}/${remoteName}`
      );
      console.dir(result, { depth: null, colors: true });
      process.exit(1);
    }
  );
});
