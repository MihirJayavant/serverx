import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  openApiParameter,
  openApiRequestBody,
  openApiResponse,
  type ParameterType,
  type RequestType,
  type ResponseType,
} from "./helpers.ts";

const openApiParameterTest = describe(openApiParameter.name);

it(openApiParameterTest, "should return parameters", () => {
  const data: ParameterType = {
    name: "userId",
    in: "path",
    description: "ID of User",
    required: true,
    schema: {
      type: "string",
    },
  };
  const parameters = openApiParameter(data);
  assertEquals(parameters, [data]);
});

it(openApiParameterTest, "should return multiple parameters", () => {
  const data: ParameterType[] = [
    {
      name: "userId",
      in: "path",
      description: "ID of User",
      required: true,
      schema: {
        type: "string",
      },
    },
    {
      name: "userId",
      in: "path",
      description: "ID of User",
      required: true,
      schema: {
        type: "string",
      },
    },
  ];
  const parameters = openApiParameter(...data);
  assertEquals(parameters, data);
});

const openApiResponseTest = describe(openApiResponse.name);

it(openApiResponseTest, "should return responses", () => {
  const data = {
    status: 200,
    description: "User Profile",
    schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
      },
      required: ["name"],
    },
  } satisfies ResponseType;
  const responses = openApiResponse(data);
  assertEquals(responses, {
    [data.status]: {
      description: data.description,
      content: {
        "application/json": {
          schema: data.schema,
        },
      },
    },
  });
});

it(openApiResponseTest, "should return multiple responses", () => {
  const data: ResponseType[] = [
    {
      status: 200,
      description: "User Profile",
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
        },
        required: ["name"],
      },
    },
    {
      status: 404,
      description: "User Not Found",
      schema: {
        type: "object",
        properties: {
          message: {
            type: "string",
          },
        },
        required: ["message"],
      },
    },
  ];

  const responses = openApiResponse(...data);
  assertEquals(responses, {
    "200": {
      description: data[0].description,
      content: {
        "application/json": {
          schema: data[0].schema,
        },
      },
    },
    "404": {
      description: data[1].description,
      content: {
        "application/json": {
          schema: data[1].schema,
        },
      },
    },
  });
});

const openApiRequestBodyTest = describe(openApiRequestBody.name);

it(openApiRequestBodyTest, "should return request body", () => {
  const data = {
    description: "User Profile",
    required: true,
    schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
      },
      required: ["name"],
    },
  } satisfies RequestType;
  const requestBody = openApiRequestBody(data);
  assertEquals(requestBody, {
    description: data.description,
    content: {
      "application/json": {
        schema: data.schema,
      },
    },
    required: data.required,
  });
});
