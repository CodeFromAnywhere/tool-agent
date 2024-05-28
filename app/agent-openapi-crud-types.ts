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
    schemas: never;
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
                "application/json": {
                    items: {
                        openaiSecretKey?: string;
                        authToken?: string;
                        assistant?: {
                            created_at: number;
                            description: string | null;
                            id: string;
                            instructions: string | null;
                            /** @description Unknown metadata */
                            metadata: unknown;
                            model: string;
                            name: string | null;
                            object: string;
                            response_format?: (string | {
                                type?: string;
                            }) | null;
                            temperature?: number | null;
                            /** @description tools resources */
                            tool_resources?: unknown;
                            tools: unknown[];
                            top_p?: number | null;
                        };
                        metadata?: {
                            [key: string]: unknown;
                        };
                    }[];
                };
            };
        };
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        isSuccessful: boolean;
                        message: string;
                        /** @description The rowIds created */
                        result?: string[];
                    };
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
                "application/json": {
                    search?: string;
                    rowIds?: string[];
                    startFromIndex?: number;
                    maxRows?: number;
                    filter?: {
                        /** @enum {string} */
                        operator: "equal" | "notEqual" | "endsWith" | "startsWith" | "includes" | "includesLetters" | "greaterThan" | "lessThan" | "greaterThanOrEqual" | "lessThanOrEqual" | "isIncludedIn" | "isFalsy" | "isTruthy";
                        value: string;
                        objectParameterKey: string;
                    }[];
                    sort?: {
                        /** @enum {string} */
                        sortDirection: "ascending" | "descending";
                        objectParameterKey: string;
                    }[];
                    objectParameterKeys?: string[];
                    ignoreObjectParameterKeys?: string[];
                };
            };
        };
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        isSuccessful: boolean;
                        message: string;
                        $schema?: string;
                        items?: {
                            [key: string]: {
                                openaiSecretKey?: string;
                                authToken?: string;
                                assistant?: {
                                    created_at: number;
                                    description: string | null;
                                    id: string;
                                    instructions: string | null;
                                    /** @description Unknown metadata */
                                    metadata: unknown;
                                    model: string;
                                    name: string | null;
                                    object: string;
                                    response_format?: (string | {
                                        type?: string;
                                    }) | null;
                                    temperature?: number | null;
                                    /** @description tools resources */
                                    tool_resources?: unknown;
                                    tools: unknown[];
                                    top_p?: number | null;
                                };
                                metadata?: {
                                    [key: string]: unknown;
                                };
                            } | undefined;
                        };
                        schema?: {
                            [key: string]: unknown;
                        };
                        canWrite?: boolean;
                        hasMore?: boolean;
                    };
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
                "application/json": {
                    /** @description The id (indexed key) of the item to update. Update that functions as upsert. If the id didn't exist, it will be created. */
                    id: string;
                    /** @description AgentOpenapi item that represents 1 agent that is served as OpenAPI. */
                    partialItem: {
                        openaiSecretKey?: string;
                        authToken?: string;
                        assistant?: {
                            created_at: number;
                            description: string | null;
                            id: string;
                            instructions: string | null;
                            /** @description Unknown metadata */
                            metadata: unknown;
                            model: string;
                            name: string | null;
                            object: string;
                            response_format?: (string | {
                                type?: string;
                            }) | null;
                            temperature?: number | null;
                            /** @description tools resources */
                            tool_resources?: unknown;
                            tools: unknown[];
                            top_p?: number | null;
                        };
                        metadata?: {
                            [key: string]: unknown;
                        };
                    };
                };
            };
        };
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        isSuccessful: boolean;
                        message: string;
                    };
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
                "application/json": {
                    /** @description Which IDs should be removed */
                    rowIds: string[];
                };
            };
        };
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        isSuccessful: boolean;
                        message: string;
                        /** @description The number of items deleted */
                        deleteCount?: number;
                    };
                };
            };
        };
    };
}


undefined
  
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