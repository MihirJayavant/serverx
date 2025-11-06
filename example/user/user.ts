import { SchemaProperty } from "@serverx/utils";
import { z } from "@zod/zod";

export const userValidationSchema = z.strictObject({
  id: z.number().min(1),
  email: z.email(),
  firstname: z.string().min(2).max(100),
  lastname: z.string().min(2).max(100),
  age: z.number().min(15).max(100),
});

export type User = z.infer<typeof userValidationSchema>;

export const userOpenApiSchema: SchemaProperty = {
  type: "object",
  properties: {
    id: { type: "number" },
    firstname: { type: "string" },
    lastname: { type: "string" },
    email: { type: "string" },
    age: { type: "number" },
  },
  required: ["id", "firstname", "lastname", "email", "age"],
};
