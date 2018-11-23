import azure from "azure-storage";
import fetch from "isomorphic-fetch";

// not very general, that's okay
export default async function uploadError(data) {
  const blobService = azure.createBlobService(process.env.AZ_CONNECTION_STRING);

  const container = "cardcore-builds";
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

  return new Promise((resolve, reject) => {
    blobService.createContainerIfNotExists(container, error => {
      if (error) return reject(error);
      blobService.createBlockBlobFromText(
        container,
        remoteName,
        JSON.stringify(data),
        {
          contentSettings: {
            contentType: "application/json"
          }
        },
        async (error, result) => {
          if (error) reject(error);
          resolve(
            slackNotify(
              `simulation error: https://streamplace.blob.core.windows.net/${container}/${remoteName}`
            )
          );
          // console.dir(result, { depth: null, colors: true });
          // resolve();
        }
      );
    });
  });
}
