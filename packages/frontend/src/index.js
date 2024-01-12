const { Buffer } = require("buffer");
console.log(Buffer);
window.Buffer = Buffer;
require("./entrypoint");
