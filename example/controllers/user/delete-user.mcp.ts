import { z } from "@zod/zod";
import { deleteUserHandler } from "../../user/delete-user.handler.ts";

export const name = "delete_user";
export const description = "Delete a user by id";
export const inputSchema = {
  userId: z.number().int().min(1).describe("Numeric user id"),
};
export const annotations = { destructiveHint: true, idempotentHint: true };

export function handler(input: { userId: number }) {
  return deleteUserHandler({ id: input.userId });
}
