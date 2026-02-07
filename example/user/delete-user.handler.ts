import { errorResult, statusCodes, successResult } from "@serverx/utils";
import { baseHandler } from "@serverx/server";
import { z } from "@zod/zod";
import { userRepository } from "./user.repository.ts";

type Input = {
  id: number;
};

type Output = {
  success: boolean;
  message: string;
};

const schema = z.object({
  id: z.number()
    .int("User ID must be an integer")
    .min(1, "User ID must be a positive integer")
    .positive("User ID must be positive"),
});

function handler(input: Input) {
  const deleted = userRepository.deleteUser(input.id);
  if (!deleted) {
    return errorResult("User not found", statusCodes.NotFound);
  }
  return successResult<Output>({
    success: true,
    message: "User deleted successfully",
  });
}

export const deleteUserHandler = baseHandler({
  handler,
  validationSchema: schema,
});
