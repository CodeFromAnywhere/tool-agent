import { JSONSchemaType } from "ajv";

import path from "path";
import fs from "fs";
import { tryParseJson } from "from-anywhere";
import { OpenapiDocument } from "openapi-util";

/**
 * Reads and parses JSON file
 *
 * make sure to specify what type the file contains as a generic!
 */
export const readJsonFile = async <T extends unknown>(
  filePath: string | undefined,
): Promise<T | null> => {
  if (!filePath) return null;
  // TODO: is this needed?
  if (!fs.existsSync(filePath)) return null;

  try {
    await fs.promises.access(filePath, fs.constants.R_OK);

    const fileString = await fs.promises.readFile(filePath, "utf8");
    if (!fileString) return null;
    const parsed = tryParseJson<T>(fileString);
    return parsed;
  } catch (e) {
    return null;
  }
};

/**
 * Simple low-level way of resolving a $ref either from a URL or the (absolute or relative) file system.
 *
 * This serves as a more simple alternative of `resolveSchemaRecursive`, and adds the functionality of finding it in the file system to it.
 *
 * Other libraries have similar solutions but they all have shown different problems so far.
 */
export const resolveResource = async (
  uri: string,
  document: OpenapiDocument | JSONSchemaType<any>,
  documentLocation: string,
): Promise<OpenapiDocument | JSONSchemaType<any> | undefined> => {
  if (uri === "") {
    // we're already there
    return document;
  }

  if (uri.startsWith("https://") || uri.startsWith("http://")) {
    // absolute url
    try {
      const json = await fetch(uri).then(
        (res) => res.json() as Promise<OpenapiDocument | JSONSchemaType<any>>,
      );
      return json;
    } catch (e) {
      return;
    }
  }

  if (uri.startsWith("/")) {
    // absolute path
    const json = await readJsonFile<OpenapiDocument | JSONSchemaType<any>>(uri);

    if (json === null) {
      throw new Error("JSON Not found at " + uri);
    }
    return json;
  }

  // relative path
  const absolutePath = path.resolve(documentLocation, uri);
  const json = await readJsonFile<OpenapiDocument | JSONSchemaType<any>>(
    absolutePath,
  );
  if (json === null) {
    throw new Error("JSON Not found at " + uri);
  }

  return json;
};
