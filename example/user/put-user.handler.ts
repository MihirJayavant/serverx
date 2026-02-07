import { errorResult, statusCodes, successResult } from "@serverx/utils";
import { baseHandler } from "@serverx/server";
import { User, userValidationSchema } from "./user.ts";
import { userRepository } from "./user.repository.ts";

type Input = User;

type Output = User;

const schema = userValidationSchema;

function handler(input: Input) {
  const existingUser = userRepository.getUserById(input.id);
  if (!existingUser) {
    return errorResult("User not found", statusCodes.NotFound);
  }
  userRepository.updateUser(input);
  return successResult<Output>(input);
}

export const putUserHandler = baseHandler({
  handler,
  validationSchema: schema,
});
