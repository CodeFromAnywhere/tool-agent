export interface paths {
    "/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["read"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/update": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["update"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/remove": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["remove"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @description Slug compatible with URLs */
        UrlSlug: string;
        CreateResponse: {
            isSuccessful: boolean;
            message: string;
            /** @description The rowIds created */
            result?: string[];
        };
        CreateContext: {
            items: components["schemas"]["ModelItem"][];
        };
        Sort: {
            /** @enum {string} */
            sortDirection: "ascending" | "descending";
            objectParameterKey: string;
        };
        Filter: {
            /** @enum {string} */
            operator: "equal" | "notEqual" | "endsWith" | "startsWith" | "includes" | "includesLetters" | "greaterThan" | "lessThan" | "greaterThanOrEqual" | "lessThanOrEqual" | "isIncludedIn" | "isFalsy" | "isTruthy";
            value: string;
            objectParameterKey: string;
        };
        ReadResponse: {
            isSuccessful: boolean;
            message: string;
            $schema?: string;
            items?: {
                [key: string]: components["schemas"]["ModelItem"] | undefined;
            };
            schema?: {
                [key: string]: unknown;
            };
            canWrite?: boolean;
            hasMore?: boolean;
        };
        ReadContext: {
            search?: string;
            vectorSearch?: {
                propertyKey: string;
                input: string;
                topK: number;
                minimumSimilarity: number;
            };
            rowIds?: string[];
            startFromIndex?: number;
            maxRows?: number;
            filter?: components["schemas"]["Filter"][];
            sort?: components["schemas"]["Sort"][];
            objectParameterKeys?: string[];
            ignoreObjectParameterKeys?: string[];
        };
        UpdateContext: {
            /** @description The id (indexed key) of the item to update. Update that functions as upsert. If the id didn't exist, it will be created. */
            id: string;
            /** @description New (partial) value of the item. Will update all keys provided here. Please note that it cannot be set to 'undefined' as this doesn't transfer over JSON, but if you set it to 'null', the value will be removed from the database. */
            partialItem: components["schemas"]["ModelItem"];
        };
        UpdateResponse: {
            isSuccessful: boolean;
            message: string;
        };
        /** @description Login state key value store tying to the userAuthToken and service you logged into */
        ModelItem: {
            userAuthToken?: string;
            adminAuthToken?: string;
            /** @description Can be another redirect url than what the authorization service redirects back to. */
            redirectUrl?: string;
            service?: string;
        };
        RemoveContext: {
            /** @description Which IDs should be removed */
            rowIds: string[];
        };
        RemoveResponse: {
            isSuccessful: boolean;
            message: string;
            /** @description The number of items deleted */
            deleteCount?: number;
        };
        CreateDatabaseResponse: {
            isSuccessful: boolean;
            message?: string;
            authToken?: string;
            adminAuthToken?: string;
            openapiUrl?: string;
        };
        /** @description A list of vector indexes to be created for several columns in your schema */
        VectorIndexColumns: {
            propertyKey: string;
            /** @enum {string} */
            model: "text-embedding-ada-002" | "text-embedding-3-small" | "text-embedding-3-large";
            /** @enum {string} */
            region: "us-east-1" | "eu-west-1" | "us-central1";
            dimension_count: number;
            /** @enum {string} */
            similarity_function: "COSINE" | "EUCLIDIAN" | "DOT_PRODUCT";
        }[];
        StandardResponse: {
            status?: number;
            isSuccessful: boolean;
            message?: string;
            priceCredit?: number;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateContext"];
            };
        };
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateResponse"];
                };
            };
        };
    };
    read: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReadContext"];
            };
        };
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReadResponse"];
                };
            };
        };
    };
    update: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateContext"];
            };
        };
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UpdateResponse"];
                };
            };
        };
    };
    remove: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RemoveContext"];
            };
        };
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RemoveResponse"];
                };
            };
        };
    };
}

  
export type UrlSlug = components["schemas"]["UrlSlug"]
export type CreateResponse = components["schemas"]["CreateResponse"]
export type CreateContext = components["schemas"]["CreateContext"]
export type Sort = components["schemas"]["Sort"]
export type Filter = components["schemas"]["Filter"]
export type ReadResponse = components["schemas"]["ReadResponse"]
export type ReadContext = components["schemas"]["ReadContext"]
export type UpdateContext = components["schemas"]["UpdateContext"]
export type UpdateResponse = components["schemas"]["UpdateResponse"]
export type ModelItem = components["schemas"]["ModelItem"]
export type RemoveContext = components["schemas"]["RemoveContext"]
export type RemoveResponse = components["schemas"]["RemoveResponse"]
export type CreateDatabaseResponse = components["schemas"]["CreateDatabaseResponse"]
export type VectorIndexColumns = components["schemas"]["VectorIndexColumns"]
export type StandardResponse = components["schemas"]["StandardResponse"]

export const operationUrlObject = {
  "create": {
    "method": "post",
    "path": "/create"
  },
  "read": {
    "method": "post",
    "path": "/read"
  },
  "update": {
    "method": "post",
    "path": "/update"
  },
  "remove": {
    "method": "post",
    "path": "/remove"
  }
}
export const operationKeys = Object.keys(operationUrlObject);