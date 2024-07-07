import { createClient } from "./createClient";
  
import { operationUrlObject as agentUserThreadOperationUrlObject, operations as agentUserThreadOperations } from "./agent-user-thread";
import { operationUrlObject as agentAdminOperationUrlObject, operations as agentAdminOperations } from "./agent-admin";
import { operationUrlObject as agentOpenapiOperationUrlObject, operations as agentOpenapiOperations } from "./agent-openapi";
import { operationUrlObject as agentUserOperationUrlObject, operations as agentUserOperations } from "./agent-user";


 
//@ts-ignore
export const agentUserThread = createClient<agentUserThreadOperations>(agentUserThreadOperationUrlObject, {
  baseUrl: "https://data.actionschema.com/migrate-agent-user-thread",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.AGENT_USER_THREAD_CRUD_AUTH_TOKEN
  },
  timeoutSeconds: 60,
});


 
//@ts-ignore
export const agentAdmin = createClient<agentAdminOperations>(agentAdminOperationUrlObject, {
  baseUrl: "https://data.actionschema.com/migrate-agent-admin",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.AGENT_ADMIN_CRUD_AUTH_TOKEN
  },
  timeoutSeconds: 60,
});


 
//@ts-ignore
export const agentOpenapi = createClient<agentOpenapiOperations>(agentOpenapiOperationUrlObject, {
  baseUrl: "https://data.actionschema.com/migrate-agent-openapi",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.AGENT_OPENAPI_CRUD_AUTH_TOKEN
  },
  timeoutSeconds: 60,
});


 
//@ts-ignore
export const agentUser = createClient<agentUserOperations>(agentUserOperationUrlObject, {
  baseUrl: "https://data.actionschema.com/migrate-agent-user",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.AGENT_USER_CRUD_AUTH_TOKEN
  },
  timeoutSeconds: 60,
});
