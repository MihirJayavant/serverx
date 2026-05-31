import { z } from "@zod/zod";
import { addUserHandler } from "../../user/add-user.handler.ts";

export const name = "add_user";
export const description = "Create a new user";
export const inputSchema = {
  id: z.number().int().min(1),
  email: z.email(),
  firstname: z.string().min(2).max(100),
  lastname: z.string().min(2).max(100),
  age: z.number().int().min(15).max(100),
};

export function handler(input: {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  age: number;
}) {
  return addUserHandler(input);
}
