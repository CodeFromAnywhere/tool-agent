import { JSONSchemaType } from "ajv";
import { resolveResource } from "./resolveResource";
import { OpenapiDocument, ReferenceObject } from "openapi-util";

/**
 * Function that resolves $ref, continues if it's not a ref, or throws an error
 *
 * Where it can resolve:
 *
 * - in-file absolute locations
 * - relative file locations
 * - url locations
 */
export const resolveReferenceOrContinue = async <T extends unknown>(
  maybeReference: T | ReferenceObject | undefined,
  document: OpenapiDocument | JSONSchemaType<any>,
  /** URI (either path or url). Defaults to pwd */
  documentLocation: string = process.cwd(),
): Promise<T | undefined> => {
  if (maybeReference === undefined) {
    return;
  }

  const hasReference =
    typeof maybeReference === "object" &&
    maybeReference !== null &&
    Object.hasOwn(maybeReference, "$ref");

  if (!hasReference) {
    // respond directly if it's not a reference
    const promise = new Promise<T>((resolve) => resolve(maybeReference as T));
    return promise;
  }

  // 1) Get parsed resource incase remote, absolute, or relative. If it's relative, use documentLocation to determine the location
  const reference = (maybeReference as ReferenceObject).$ref;
  const [uri, pointer] = reference.split("#");
  // NB: the first one is an empty string
  const chunks = pointer.split("/").slice(1);

  try {
    const resource = await resolveResource(uri, document, documentLocation);

    // 2) With resource, access the location
    const blob = chunks.reduce(
      (previous, current) => previous?.[current as keyof typeof previous],
      resource,
    ) as T;

    return blob;
  } catch (e: any) {
    console.log(e?.message);
    return;
  }
};
