import { SchemaProperty } from "@serverx/utils";

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
};

export const userSchema: SchemaProperty = {
  type: "object",
  properties: {
    id: { type: "number" },
    firstName: { type: "string" },
    lastName: { type: "string" },
    email: { type: "string" },
    age: { type: "number" },
  },
  required: ["id", "firstName", "lastName", "email", "age"],
};
