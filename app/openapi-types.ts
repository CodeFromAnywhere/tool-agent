export interface paths {
    "/openapi.json": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get openapi */
        get: operations["getOpenapi"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/listAgents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Lists your agents */
        post: operations["listAgents"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/removeAgent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Removes an agent */
        post: operations["removeAgent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/upsertToolAgent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Creates a new agent */
        post: operations["upsertToolAgent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/readAgentUser": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Read Agent User
         * @description Retrieves the agent user information based on the provided authorization token.
         */
        post: operations["readAgentUser"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/readAgentUserThread": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Read Agent User Thread
         * @description Retrieves the thread information based on the provided authorization token and thread ID.
         */
        post: operations["readAgentUserThread"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/{agentSlug}/message": {
        parameters: {
            query?: never;
            header: {
                /** @description Agent-wide authorization token to prevent runaway token usage. */
                X_AGENT_AUTH_TOKEN: string;
                /** @description User-level authorization that can be retreived via the signup endpoint */
                Authorization: string;
            };
            path: {
                agentSlug: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Message an agent
         * @description Run a message in a thread of an assistant
         */
        post: operations["message"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/oauth/{service}/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Login to service
         * @description Login for oauth2 by redirecting to the resource
         */
        get: operations["oauth2Login"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/oauth/{service}/callback": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Callback for oauth
         * @description Callback for oauth2
         */
        get: operations["oauth2Callback"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/{agentSlug}/openapi.json": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                agentSlug: string;
            };
            cookie?: never;
        };
        /** Get openapi for this agent alone */
        get: operations["renderAgentOpenapi"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/{agentSlug}/details": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Get details for this agent */
        post: operations["renderAgentDetails"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/{agentSlug}/userSignup": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                agentSlug: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * User signup
         * @description Signup as a user to this agent. Generates an authToken to which login credentials can be stored.
         */
        post: operations["userSignup"];
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
        ToolAgent: {
            /** Unique name */
            agentSlug: components["schemas"]["UrlSlug"];
            instructions: string;
            /** @description OpenAI Secret key. To create one, visit: https://platform.openai.com/api-keys */
            openaiSecretKey: string;
            /** @description Agent-wide token needed for authorizing to the agent openapi. */
            agentAuthToken: string;
            /** @enum {string} */
            model?: "gpt-4o" | "gpt-3.5-turbo" | "gpt-3.5-turbo-16k";
            /** @description Used for tools for the agent */
            openapiUrl?: string;
            /** @description Used to authenticate to the OpenAPI to use tools */
            openapiAuthToken?: string;
        };
        /** @description Slug compatible with URLs */
        UrlSlug: string;
        UpsertToolAgentResponse: {
            isSuccessful: boolean;
            message: string;
            result?: components["schemas"]["ToolAgent"];
        };
        MessageContext: {
            message: string;
            /** @description Can be specified to open a specific thread without history, and continue on that thread upon consequent messages. If no threadId is specified, will take the history of the first thread */
            threadId?: string;
            /** @description If given, will not use thread history messages regardless of the threadId. */
            disableHistory?: boolean;
            /** @description Urls to files. Not all models support all file types. */
            attachmentUrls?: string[];
        };
        MessagesArray: {
            content?: string;
            role?: string;
            function_call?: Record<string, never>;
            tool_calls?: unknown[];
        }[];
        MessageResponse: {
            isSuccessful: boolean;
            messages?: components["schemas"]["MessagesArray"];
            /** @description threadId to keep talking in the same thread */
            threadId?: string;
            /** @description In case you didn't sign up before, this is now your Authorization token. Can be used in conjunction with the threadId */
            newAuthToken?: string;
        };
        Contact: {
            name?: string;
            /** Format: uri-reference */
            url?: string;
            /** Format: email */
            email?: string;
            /** Format: phone */
            "x-phoneNumber"?: string;
            "x-description"?: string;
        };
        License: {
            name: string;
            /** Format: uri-reference */
            url?: string;
        };
        /** @description Ratelimiting extension by ActionSchema. Can be applied globally, per plan, per tag, or per operation */
        RateLimit: {
            limit?: number;
            /** @enum {string} */
            interval?: "second" | "minute";
        };
        Info: {
            title: string;
            description?: string;
            /** Format: uri-reference */
            termsOfService?: string;
            /** @description Contact information for the exposed API. */
            contact?: components["schemas"]["Contact"];
            /** @description The license information for the exposed API. */
            license?: components["schemas"]["License"];
            /** @description The version of the OpenAPI document (which is distinct from the OpenAPI Specification version or the API implementation version). */
            version: string;
            /** @description Different people in the company and their capabilities and communication channels */
            "x-people"?: components["schemas"]["Contact"][];
            /** @description Product info. */
            "x-product"?: unknown;
            /** @description Important links needed for agents to make using the API easier. */
            "x-links"?: {
                signupUrl?: string;
                loginUrl?: string;
                forgotPasswordUrl?: string;
                pricingUrl?: string;
                /** @description Page from where logged-in user can make purchases, cancel subscription, etc. */
                billingUrl?: string;
                /** @description URL of a page where the user can see their usage and its cost. */
                usageUrl?: string;
                docsUrl?: string;
                supportUrl?: string;
                /** @description Url of the page where the user can find the required information for authorizing on the API. Usually this is a page where the user can create and see their API tokens. */
                apiAuthorizationSettingsUrl?: string;
            };
            /** @description Pricing info including monthly fees. */
            "x-pricing"?: {
                /** @description General summary of all plans */
                description?: string;
                plans?: {
                    price: number;
                    currency: string;
                    title: string;
                    /** @description How much credit do you get for this. Credit matches the credit spent with 'priceCredit' extension for operations */
                    credit: number;
                    /**
                     * @description How long will you retain the credit you receive?
                     * @enum {string}
                     */
                    persistence?: "forever" | "interval" | "capped";
                    /** @description Required when filling in persistence 'capped' */
                    persistenceCappedDays?: number;
                    /**
                     * @description If the plan is a subscription based plan, fill in the interval on which every time the price is paid, and credit is given.
                     *
                     *     If there is a pay-as-you-go price, fill in the minimum purchase size for each step. It will be assumed the price to credit ratio is linear.
                     * @enum {string}
                     */
                    interval?: "week" | "month" | "quarter" | "year";
                    /** @description Plan-based RateLimit info that overwrites the general rateLimit. */
                    rateLimit?: components["schemas"]["RateLimit"];
                }[];
            };
            /** @description Global ratelimit info. Can be overwritten either by plans or by operations. */
            "x-rateLimit"?: components["schemas"]["RateLimit"];
            /** @description General product reviews, collected. */
            "x-reviews"?: unknown;
            /** @description General latency info. */
            "x-latency"?: unknown;
            /** @description Link to other openapis that could be good alternatives. */
            "x-alternatives"?: string[];
            /** @description Logo metadata. Standard taken from https://apis.guru */
            "x-logo"?: {
                /**
                 * Format: uri
                 * @description URL to a logo image
                 */
                url?: string;
                backgroundColor?: string;
                secondaryColor?: string;
            };
        };
        ExternalDocumentation: {
            description?: string;
            /** Format: uri-reference */
            url: string;
            /** @description Scraped markdown from the url */
            markdown?: unknown;
        };
        ServerVariable: {
            enum?: string[];
            default: string;
            description?: string;
        };
        Server: {
            url: string;
            description?: string;
            variables?: {
                [key: string]: components["schemas"]["ServerVariable"] | undefined;
            };
        };
        SecurityRequirement: {
            [key: string]: string[] | undefined;
        };
        Tag: {
            name: string;
            description?: string;
            externalDocs?: components["schemas"]["ExternalDocumentation"];
            /** @description Tag-based ratelimit info. */
            "x-rateLimit"?: components["schemas"]["RateLimit"];
        };
        Paths: Record<string, never>;
        Components: {
            schemas?: Record<string, never>;
            responses?: Record<string, never>;
            parameters?: Record<string, never>;
            examples?: Record<string, never>;
            requestBodies?: Record<string, never>;
            headers?: Record<string, never>;
            securitySchemes?: Record<string, never>;
            links?: Record<string, never>;
            callbacks?: Record<string, never>;
        };
        /**
         * OpenAPI Document
         * @description The description of OpenAPI v3.0.x documents, as defined by https://spec.openapis.org/oas/v3.0.3 and extended by ActionSchema.
         */
        "openapi.schema": {
            /** Format: uri-reference */
            $schema: string;
            /** Format: uri-reference */
            $id?: string;
            /**
             * Format: uri-reference
             * @description If given, should be a url linking to the original file, the starting point, if this is not already the one. Used to determine if anything has changed.
             */
            $source?: string;
            /** @description Version */
            openapi: string;
            /**
             * @description Version of actionschema.
             * @default 0.0.1
             */
            "x-actionschema": string;
            /** @description Provides metadata about the API. The metadata MAY be used by tooling as required. */
            info: components["schemas"]["Info"];
            /** @description Additional external documentation. */
            externalDocs?: components["schemas"]["ExternalDocumentation"];
            /** @description An array of Server Objects, which provide connectivity information to a target server. If the servers property is not provided, or is an empty array, the default value would be a Server Object with a url value of /. */
            servers?: components["schemas"]["Server"][];
            /** @description An array of Server Objects, indicating the original servers. Useful when defining a proxy. */
            "x-origin-servers"?: components["schemas"]["Server"][];
            /**
             * @description Security Requirement Object (https://spec.openapis.org/oas/latest.html#security-requirement-object)
             *
             *     Lists the required security schemes to execute this operation. The name used for each property MUST correspond to a security scheme declared in the Security Schemes under the Components Object.
             *
             *     Security Requirement Objects that contain multiple schemes require that all schemes MUST be satisfied for a request to be authorized. This enables support for scenarios where multiple query parameters or HTTP headers are required to convey security information.
             *
             *     When a list of Security Requirement Objects is defined on the OpenAPI Object or Operation Object, only one of the Security Requirement Objects in the list needs to be satisfied to authorize the request.
             *
             *     A declaration of which security mechanisms can be used across the API. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. Individual operations can override this definition. To make security optional, an empty security requirement ({}) can be included in the array.
             *
             *     Please note: Every item in this array is an object with keys being the scheme names (can be anything). These names should then also be defined in components.securitySchemes.
             * @default [
             *       {
             *         "apiKey": []
             *       }
             *     ]
             */
            security: components["schemas"]["SecurityRequirement"][];
            /** @description Used for grouping endpoints together.
             *
             *     A list of tags used by the specification with additional metadata. The order of the tags can be used to reflect on their order by the parsing tools. Not all tags that are used by the Operation Object must be declared. The tags that are not declared MAY be organized randomly or based on the tools' logic. Each tag name in the list MUST be unique. */
            tags?: components["schemas"]["Tag"][];
            /** @description The available paths and operations for the API. */
            paths: components["schemas"]["Paths"];
            /** @description An element to hold various schemas for the specification. */
            components?: components["schemas"]["Components"];
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
    getOpenapi: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["openapi.schema"];
                };
            };
        };
    };
    listAgents: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Signup response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        items?: {
                            [key: string]: components["schemas"]["ToolAgent"] | undefined;
                        };
                    };
                };
            };
        };
    };
    removeAgent: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    rowIds?: string[];
                };
            };
        };
        responses: {
            /** @description Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        isSuccessful?: boolean;
                    };
                };
            };
        };
    };
    upsertToolAgent: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ToolAgent"];
            };
        };
        responses: {
            /** @description Signup response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UpsertToolAgentResponse"];
                };
            };
        };
    };
    readAgentUser: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        keys?: {
                            appId?: string;
                            openapiUrl: string;
                            secret: string;
                        }[];
                        threadIds?: string[];
                    };
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": string;
                };
            };
        };
    };
    readAgentUserThread: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    threadId?: string;
                };
            };
        };
        responses: {
            /** @description Successful response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        messages?: components["schemas"]["MessagesArray"];
                    };
                };
            };
            /** @description Forbidden */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": string;
                };
            };
            /** @description Not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": string;
                };
            };
            /** @description Invalid parameters */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/plain": string;
                };
            };
        };
    };
    message: {
        parameters: {
            query?: never;
            header: {
                /** @description Agent-wide authorization token to prevent runaway token usage. */
                X_AGENT_AUTH_TOKEN: string;
                /** @description User-level authorization that can be retreived via the signup endpoint */
                Authorization: string;
            };
            path: {
                agentSlug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MessageContext"];
            };
        };
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageResponse"];
                };
            };
        };
    };
    oauth2Login: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Which service oauth is calling back */
                service: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Redirect */
            302: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Service not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    oauth2Callback: {
        parameters: {
            query: {
                /** @description The code that can be used to call the access token url */
                code: string;
                /** @description State that can be given in the initial login url so we can match it. */
                state?: string;
            };
            header?: never;
            path: {
                /** @description Which service oauth is calling back */
                service: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OAuth2 Callback Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        access_token?: string;
                        token_type?: string;
                        scope?: string;
                        error?: string;
                    };
                };
            };
        };
    };
    renderAgentOpenapi: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                agentSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["openapi.schema"] | {
                        isSuccessful: boolean;
                        message?: string;
                    };
                };
            };
        };
    };
    renderAgentDetails: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                agentSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Details */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        isSuccessful?: boolean;
                        message?: string;
                    };
                };
            };
        };
    };
    userSignup: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                agentSlug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Authorization Token */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        authToken?: string;
                    };
                };
            };
        };
    };
}


export type ToolAgent = components["schemas"]["ToolAgent"]
export type UrlSlug = components["schemas"]["UrlSlug"]
export type UpsertToolAgentResponse = components["schemas"]["UpsertToolAgentResponse"]
export type MessageContext = components["schemas"]["MessageContext"]
export type MessagesArray = components["schemas"]["MessagesArray"]
export type MessageResponse = components["schemas"]["MessageResponse"]
  
export const operationUrlObject = {
  "getOpenapi": {
    "method": "get",
    "path": "/openapi.json"
  },
  "listAgents": {
    "method": "post",
    "path": "/api/listAgents"
  },
  "removeAgent": {
    "method": "post",
    "path": "/api/removeAgent"
  },
  "upsertToolAgent": {
    "method": "post",
    "path": "/api/upsertToolAgent"
  },
  "readAgentUser": {
    "method": "post",
    "path": "/api/readAgentUser"
  },
  "readAgentUserThread": {
    "method": "post",
    "path": "/api/readAgentUserThread"
  },
  "message": {
    "method": "post",
    "path": "/{agentSlug}/message"
  },
  "oauth2Login": {
    "method": "get",
    "path": "/oauth/{service}/login"
  },
  "oauth2Callback": {
    "method": "get",
    "path": "/oauth/{service}/callback"
  },
  "renderAgentOpenapi": {
    "method": "get",
    "path": "/{agentSlug}/openapi.json"
  },
  "renderAgentDetails": {
    "method": "post",
    "path": "/{agentSlug}/details"
  },
  "userSignup": {
    "method": "post",
    "path": "/{agentSlug}/userSignup"
  }
}
export const operationKeys = Object.keys(operationUrlObject);