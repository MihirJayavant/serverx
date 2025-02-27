# ServerX

- All in one deno server to create REST apis
- In built open api docs generator
- In built validation support

# Server

Work in progress

# ServerX Utils

[![JSR](https://jsr.io/badges/@serverx/utils)](https://jsr.io/@serverx/utils)

A collection of utility functions and helper packages commonly used in API
development.

## Features

- HTTP Response Helpers
- Common Validation Functions
- Offset and Cursor based Pagination Helpers
- Error Handling Utilities
- Open Api helpers

## Installation

```bash
deno add jsr:@serverx/utils
```

## Usage

```typescript
import { httpMethods, openApiParameter, openApiResponse } from "@serverx/utils";

export const method = httpMethods.GET;

export const parameters = openApiParameter(
  {
    name: "userId",
    in: "path",
    description: "ID of User",
    required: true,
    schema: {
      type: "string",
    },
  },
);

export const responses = openApiResponse({
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
});
```

## Documentation

For detailed documentation and examples, please refer to the our
[docs](https://github.com/MihirJayavant/serverx/wiki/Utils).
