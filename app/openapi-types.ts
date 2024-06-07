export interface paths {
    "/api/createAgent": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Creates a new agent. */
        post: operations["createAgent"];
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
            path: {
                agentSlug: string;
            };
            cookie?: never;
        };
        /** Get details for this agent */
        get: operations["renderAgentDetails"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/{agentSlug}/message": {
        parameters: {
            query?: never;
            header?: {
                /** @description Bearer authorization */
                Authorization?: string;
            };
            path: {
                agentSlug: string;
            };
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Run a message in a thread of an assistant */
        post: operations["message"];
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
            /** @description Used for tools for the agent */
            openapiUrl?: string;
            /** @description Used to authenticate to the OpenAPI to use tools */
            openapiAuthToken?: string;
            /** @description OpenAI Secret key. To create one, visit: https://platform.openai.com/api-keys */
            openaiSecretKey: string;
            /** @description Deepgram token for voice capabilities */
            deepgramToken?: string;
            /** @description Token needed for authorizing to the agent openapi. Not required. */
            authToken?: string;
            model?: string;
            top_p?: number;
            temperature?: number;
        };
        /** @description Slug compatible with URLs */
        UrlSlug: string;
        CreateAgentResponse: {
            isSuccessful: boolean;
            message: string;
        };
        MessageContext: {
            message: string;
        };
        MessageResponse: {
            isSuccessful: boolean;
            message: string;
            threadId?: string;
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
            "x-alternatives"?: unknown[];
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
             * @description A declaration of which security mechanisms can be used across the API. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. Individual operations can override this definition. To make security optional, an empty security requirement ({}) can be included in the array.
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
        "openai-assistant.schema": {
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
        /** @description AgentOpenapi item that represents 1 agent that is served as OpenAPI. */
        "agent-openapi.schema": {
            agentSlug?: string;
            openaiSecretKey?: string;
            authToken?: string;
            assistant?: components["schemas"]["openai-assistant.schema"];
            metadata?: {
                [key: string]: unknown;
            };
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
    createAgent: {
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
                    "application/json": components["schemas"]["CreateAgentResponse"];
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
            header: {
                /** @description Bearer authorization */
                Authorization: string;
            };
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
                    } | components["schemas"]["agent-openapi.schema"];
                };
            };
        };
    };
    message: {
        parameters: {
            query?: never;
            header?: {
                /** @description Bearer authorization */
                Authorization?: string;
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
}


export type ToolAgent = components["schemas"]["ToolAgent"]
export type UrlSlug = components["schemas"]["UrlSlug"]
export type CreateAgentResponse = components["schemas"]["CreateAgentResponse"]
export type MessageContext = components["schemas"]["MessageContext"]
export type MessageResponse = components["schemas"]["MessageResponse"]
  
export const operationUrlObject = {
  "createAgent": {
    "method": "post",
    "path": "/api/createAgent"
  },
  "renderAgentOpenapi": {
    "method": "get",
    "path": "/{agentSlug}/openapi.json"
  },
  "renderAgentDetails": {
    "method": "get",
    "path": "/{agentSlug}/details"
  },
  "message": {
    "method": "post",
    "path": "/{agentSlug}/message"
  }
}
export const operationKeys = Object.keys(operationUrlObject);