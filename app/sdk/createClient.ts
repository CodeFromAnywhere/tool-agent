

export const createClient = <
  operations extends {
    [key: string]: {
      parameters: { [key: string]: any };
      requestBody: { [key: string]: any };
      responses: { [key: string]: any };
    };
  },
>(
  operationUrlObject: {
    [operationId in keyof operations]: { method: string; path: string };
  },
  config: {
    timeoutSeconds?: number;
    /**
     * Server URL without slash at the end
     */
    baseUrl?: string;
    headers: { [key: string]: string };
  },
) => {
  type PromiseOrNot<T> = Promise<T> | T;

  type GetParameters<K extends keyof operations> =
    | operations[K]["parameters"]["cookie"]
    | operations[K]["parameters"]["header"]
    | operations[K]["parameters"]["path"]
    | operations[K]["parameters"]["query"];

  type UnionToIntersection<U> = (
    U extends any ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never;

  // Typescript magic from: https://stackoverflow.com/questions/63542526/merge-discriminated-union-of-object-types-in-typescript
  type MergeIntersection<U> = UnionToIntersection<U> extends infer O
    ? { [K in keyof O]: O[K] }
    : never;

  type MergeParameters<P> = MergeIntersection<Extract<P, {}>>;

  type EndpointBody<T extends keyof operations> =
    (operations[T]["requestBody"] extends {}
      ? operations[T]["requestBody"]["content"]["application/json"]
      : {}) &
      MergeParameters<GetParameters<T>>;

  type Endpoint<T extends keyof operations> = (
    context: EndpointContext<T>,
  ) => PromiseOrNot<ResponseType<T>>;

  type EndpointContext<K extends keyof operations> =
    (operations[K]["requestBody"] extends {}
      ? operations[K]["requestBody"]["content"]["application/json"]
      : {}) &
      MergeParameters<GetParameters<K>>;

  type ResponseType<T extends keyof operations> =
    operations[T]["responses"][200]["content"]["application/json"];

  const client = async <K extends keyof operations>(
    operation: K,
    body?: EndpointContext<K>,

    /** NB: always use getPersonConfig for this! */
    customConfiguration?: {
      baseUrl?: string;
      headers?: { [key: string]: string };
    },
  ): Promise<
    operations[K]["responses"][200]["content"]["application/json"]
  > => {
    const details = operationUrlObject[operation];
    const { headers, baseUrl } = customConfiguration || config;

    if (!details) {
      throw new Error("No details found for operation:" + String(operation));
    }
    if (!baseUrl) {
      throw new Error("No baseUrl found");
    }

    const fullUrl = baseUrl + details.path;

    try {
      const abortController = new AbortController();
      const id = setTimeout(
        () => abortController.abort(),
        (config.timeoutSeconds || 30) * 1000,
      );

      const response = await fetch(fullUrl, {
        method: details.method,
        signal: abortController.signal,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })
        .then(async (response) => {
          if (!response.ok) {
            console.log(
              "Response not ok",
              response.status,
              response.statusText,
            );
          }
          if (!response.headers.get("Content-Type")?.includes("json")) {
            response.headers.forEach((value, key) => {
            console.log({key,value})
            });

            console.log("No JSON?");
          }
          const responseText = await response.text();

          try {
            return JSON.parse(responseText);
          } catch (e) {
            console.log("couldn't parse JSON", {
              responseText,
              operation,
              body,
              customConfiguration,
            });
          }
        })
        .catch((error) => {
          console.log({
            explanation:
              "Your request could not be executed, you may be disconnected or the server may not be available. ",
            error,
            errorStatus: error.status,
            errorString: String(error),
            operation,
            body,
            customConfiguration,
          });

          return {
            isSuccessful: false,
            isNotConnected: true,
            message:
              "Could not connect to any API. Please see your API configuration.",
          };
        });

      clearTimeout(id);
      return response;
    } catch (e) {
      return {
        isSuccessful: false,
        isNotConnected: true,
        message:
          "The API didn't resolve, and the fetch crashed because of it: " +
          String(e),
      } as any;
    }
  };
  return client;
};

//</script>
