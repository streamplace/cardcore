const azure = require("azure-storage");
const blobService = azure.createBlobService(process.env.AZ_CONNECTION_STRING);

const container = "cardcore-builds";
const filename = "cardcore-error.json";

blobService.createContainerIfNotExists(container, error => {
  if (error) return console.log(error);
  blobService.createBlockBlobFromLocalFile(
    container,
    filename,
    `${process.env.DRONE_COMMIT}-error.json`,
    (error, result) => {
      if (error) return console.log(error);
      console.dir(result, { depth: null, colors: true });
    }
  );
});
