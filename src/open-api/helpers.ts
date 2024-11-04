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
    required?: boolean;
    default?: object;
    description?: string;
    properties: SchemaObject; // Nested object properties
};

type ArraySchema = {
    type: "array";
    required?: boolean;
    // deno-lint-ignore no-explicit-any
    default?: any[]; // Default can be an empty array or pre-defined list
    description?: string;
    items: SchemaProperty; // Defines structure of array items
};

export type ParameterType = {
    name: string;
    in: "query" | "header" | "path" | "cookie";
    description?: string;
    required?: boolean;
    deprecated?: boolean;
    schema?: SchemaProperty;
};

export function parameter(...parameters: ParameterType[]) {
    return parameters;
}
