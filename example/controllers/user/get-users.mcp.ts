import { z } from "@zod/zod";
import { getUsersHandler } from "../../user/get-users.handler.ts";

export const name = "list_users";
export const description = "List users with optional pagination";
export const inputSchema = {
  page: z.number().int().min(1).optional().describe("1-indexed page number"),
  pageSize: z.number().int().min(1).max(100).optional().describe(
    "Items per page (max 100)",
  ),
};
export const annotations = { readOnlyHint: true };

export function handler(
  input: { page?: number; pageSize?: number },
) {
  return getUsersHandler({ page: input.page, pageSize: input.pageSize });
}
