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

export function openApiParameter(...parameters: ParameterType[]) {
    return parameters;
}

export function openApiResponse(...responses: ResponseType[]) {
    return responses;
}
