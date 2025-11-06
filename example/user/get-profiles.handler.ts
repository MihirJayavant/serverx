import { successResult } from "@serverx/utils";
import { baseHandler } from "@serverx/server";
import { User } from "./user.ts";
import { userRepository } from "./user.repository.ts";

type Input = undefined;

type Output = {
  data: User[];
};

function handler(_: Input) {
  const data = userRepository.getAllUsers();
  return successResult<Output>({ data });
}

export const getProfileHandler = baseHandler({
  handler,
});
