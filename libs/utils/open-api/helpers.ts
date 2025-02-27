/**
 * @file open-api/helpers.ts
 */

import type { StatusCode } from "../result/result.ts";

type PrimitiveType = "string" | "number" | "boolean";

type SchemaObject = {
  [key: string]: SchemaProperty;
};

/**
 * Its a recursive type that can be a primitive, object or array schema.
 */
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

/**
 * @property name - The name of the parameter.
 * @property in - The location of the parameter.
 * @property description - A brief description of the parameter.
 * @property required - Determines whether this parameter is mandatory.
 * @property deprecated - Specifies that a parameter is deprecated and should be transitioned out of usage.
 * @property schema - The schema defining the type used for the parameter.
 */
export type ParameterType = {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: SchemaProperty;
};

/**
 * @property status - The HTTP status code.
 * @property description - A brief description of the response.
 * @property schema - The schema defining the type used for the response.
 */
export type ResponseType = {
  status: StatusCode;
  description?: string;
  schema: SchemaProperty;
};

/**
 * @property description - A brief description of the request.
 * @property schema - The schema defining the type used for the request.
 * @property required - Determines whether this request is mandatory.
 */
export type RequestType = {
  description?: string;
  schema: SchemaProperty;
  required: boolean;
};

/**
 * Its Open api schema for response
 */
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

/**
 * Its Open api schema for request
 * @property {string} [description] - A brief description of the request.
 * @property {{"application/json": { schema: SchemaProperty }}} [content] - The content of the request.
 * @property {boolean} [required] - Determines whether this request is mandatory.
 */
export type OpenApiRequestBody = {
  description?: string;
  content: { "application/json": { schema: SchemaProperty } };
  required: boolean;
};

/**
 * Helper function to create open api parameter
 * @param parameters - List of parameters
 * @returns List of parameters
 */
export function openApiParameter(
  ...parameters: ParameterType[]
): ParameterType[] {
  return parameters;
}

/**
 * Helper function to create open api response
 * @param responses - List of responses
 * @returns - Open api response
 */
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

/**
 * Helper function to create open api request body
 * @param requestBody - Request body
 * @returns - Open api request body
 */
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
