import type { StatusCode } from "../http/result.ts";

type PrimitiveType = "string" | "number" | "boolean";

type SchemaObject = {
    [key: string]: SchemaProperty;
};

export type SchemaProperty =
    | PrimitiveSchema
    | ObjectSchema
    | ArraySchema;

type PrimitiveSchema = {
    type: PrimitiveType;
    required?: boolean;
    default?: string | number | boolean;
    description?: string;
};

type ObjectSchema = {
    type: "object";
    required?: string[];
    default?: object;
    description?: string;
    properties: SchemaObject;
};

type ArraySchema = {
    type: "array";
    required?: boolean;
    // deno-lint-ignore no-explicit-any
    default?: any[];
    description?: string;
    items: SchemaProperty;
};

export type ParameterType = {
    name: string;
    in: "query" | "header" | "path" | "cookie";
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    schema?: SchemaProperty;
};

export type ResponseType = {
    status: StatusCode;
    description?: string;
    schema: SchemaProperty;
};

export type RequestType = {
    description?: string;
    schema: SchemaProperty;
    required: boolean;
};

export type OpenApiResponse = {
    [key: string]: {
        description?: string;
        content: {
            "application/json": {
                schema: SchemaProperty;
            };
        };
    };
};

export type OpenApiRequestBody = {
    description?: string;
    content: { "application/json": { schema: SchemaProperty } };
    required: boolean;
};

export function openApiParameter(
    ...parameters: ParameterType[]
): ParameterType[] {
    return parameters;
}

export function openApiResponse(...responses: ResponseType[]): OpenApiResponse {
    const data: OpenApiResponse = {};
    responses.forEach((r) =>
        data[r.status] = {
            description: r.description,
            content: {
                "application/json": {
                    schema: r.schema,
                },
            },
        }
    );
    return data;
}

export function openApiRequestBody(
    requestBody: RequestType,
): OpenApiRequestBody {
    return {
        description: requestBody.description,
        content: {
            "application/json": {
                schema: requestBody.schema,
            },
        },
        required: requestBody.required,
    };
}
