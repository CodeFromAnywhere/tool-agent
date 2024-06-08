import { Endpoint, ResponseType } from "@/client";
import { O, removeOptionalKeysFromObjectStrings } from "from-anywhere";
import { OpenapiSchemaObject } from "from-anywhere/types";
import { JSONSchema7 } from "json-schema";
import { SchemaObject } from "openapi-typescript";
import { resolveSchemaRecursive } from "openapi-util/build/resolveSchemaRecursive";
import openapi from "../../../../public/openapi.json";
import { OpenapiDocument } from "openapi-util";

export const withoutProperties = (
  schema: OpenapiSchemaObject,
  properties: string[],
) => {
  if (!schema.properties) {
    return schema as SchemaObject;
  }

  const newProperties = removeOptionalKeysFromObjectStrings(
    schema.properties,
    properties,
  );

  return {
    ...schema,
    properties: newProperties as JSONSchema7["properties"],
  } as SchemaObject;
};

export const replaceRefs = (schema: OpenapiSchemaObject, refs: O) => {
  const string = JSON.stringify(schema);

  const finalString = Object.keys(refs).reduce((newString, refKey) => {
    const json = JSON.stringify(refs[refKey]);
    const jsonWithoutBrackets = json.slice(1, json.length - 1);

    // NB: no spaces!
    return newString.replaceAll(`"$ref":"${refKey}"`, jsonWithoutBrackets);
  }, string);

  // console.log(finalString);
  return JSON.parse(finalString) as any;
};

/** Renames all refs to #/components/schemas/ instead of #/definitions */
export const renameRefs = (schema: SchemaObject | undefined) => {
  if (!schema) {
    return schema;
  }
  const string = JSON.stringify(schema);

  const newString = string.replaceAll(
    `"$ref":"#/definitions/`,
    `"$ref":"#/components/schemas/`,
  );

  return JSON.parse(newString) as any;
};

/**
Should make a CRUD openapi from the schema fetched from database id
*/

export const renderAgentOpenapi: Endpoint<"renderAgentOpenapi"> = async (
  context,
) => {
  const { agentSlug } = context;

  // NB: no auth needed for this endpoint.

  if (!agentSlug) {
    return {
      isSuccessful: false,
      message: "Couldn't find details for agent " + agentSlug,
    };
  }

  const agentPaths = {
    "/message": removeOptionalKeysFromObjectStrings(
      openapi.paths["/{agentSlug}/message"],
      ["parameters"],
    ),
  };

  const origin =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://agent.actionschema.com";

  const improved = {
    ...openapi,
    components: {
      ...openapi.components,
      schemas: {
        ...openapi.components.schemas,
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "Bearer",
          description: "Your authToken should be provided",
        },
      },
    },
    paths: agentPaths,
    info: { title: `${agentSlug}`, version: "1.0", description: "" },
    servers: [{ url: `${origin}/${agentSlug}` }],
    security: [{ bearerAuth: [] }],
  };

  const dereferenced = (await resolveSchemaRecursive({
    document: improved,
    shouldDereference: true,
  })) as typeof improved | undefined;

  if (!dereferenced) {
    return { isSuccessful: false, message: "Dereferencing didn't work out" };
  }

  const componentsWithoutSchemas = removeOptionalKeysFromObjectStrings(
    dereferenced.components,
    ["schemas"],
  ) as OpenapiDocument["components"];

  return {
    ...dereferenced,
    components: componentsWithoutSchemas,
    // bit ugly but couldn't find another way
  } as unknown as ResponseType<"renderAgentOpenapi">;
};
