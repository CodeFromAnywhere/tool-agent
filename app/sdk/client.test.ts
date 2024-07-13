import * as client from "./client.js";

//client.migrateAgentAdmin("read", {}).then((result) => console.log(result));
client.migrateAgentOpenapi("read", {}).then((result) => console.log(result));
