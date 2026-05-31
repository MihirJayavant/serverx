import { z } from "@zod/zod";
import { getUserHandler } from "../../user/get-user.handler.ts";

export const name = "get_user";
export const description = "Fetch a single user by id";
export const inputSchema = {
  userId: z.number().int().min(1).describe("Numeric user id"),
};
export const annotations = { readOnlyHint: true };

export function handler(input: { userId: number }) {
  return getUserHandler({ id: input.userId });
}
