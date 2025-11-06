import { errorResult, statusCodes, successResult } from "@serverx/utils";
import { baseHandler } from "@serverx/server";
import { z } from "@zod/zod";
import { User } from "./user.ts";
import { userRepository } from "./user.repository.ts";

type Input = {
  id: number;
};

type Output = User;

const schema = z.object({
  id: z.number().min(1),
});

function handler(input: Input) {
  const data = userRepository.getUserById(input.id);
  if (!data) {
    return errorResult("User not found", statusCodes.NotFound);
  }
  return successResult<Output>(data);
}

export const getProfileHandler = baseHandler({
  handler,
  validationSchema: schema,
});
