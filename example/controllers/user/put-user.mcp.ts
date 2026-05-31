import { z } from "@zod/zod";
import { updateUserHandler } from "../../user/update-user.handler.ts";

export const name = "update_user";
export const description = "Update an existing user";
export const inputSchema = {
  id: z.number().int().min(1),
  email: z.email(),
  firstname: z.string().min(2).max(100),
  lastname: z.string().min(2).max(100),
  age: z.number().int().min(15).max(100),
};
export const annotations = { idempotentHint: true };

export function handler(input: {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  age: number;
}) {
  return updateUserHandler(input);
}
