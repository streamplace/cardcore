const azure = require("azure-storage");
const fetch = require("isomorphic-fetch");
const blobService = azure.createBlobService(process.env.AZ_CONNECTION_STRING);

const container = "cardcore-builds";
const filename = "cardcore-error.json";

const slackNotify = async function(text) {
  if (typeof text !== "string") {
    text = JSON.stringify(text);
  }
  await fetch(slack.rootNotifications, {
    method: "POST",
    body: JSON.stringify({ text }),
    headers: { "content-type": "application/json" }
  });
};

blobService.createContainerIfNotExists(container, error => {
  if (error) return console.log(error);
  blobService.createBlockBlobFromLocalFile(
    container,
    filename,
    `${process.env.DRONE_COMMIT}-error.json`,
    (error, result) => {
      if (error) return console.log(error);
      console.log(slackNotify("test"));
      console.dir(result, { depth: null, colors: true });
    }
  );
});
