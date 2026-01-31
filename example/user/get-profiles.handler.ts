import { OffsetPaginationParams, successResult } from "@serverx/utils";
import { baseHandler } from "@serverx/server";
import { User } from "./user.ts";
import { userRepository } from "./user.repository.ts";

type Input = OffsetPaginationParams;

type Output = {
  data: User[];
};

function handler(input: Input) {
  console.log(input);
  const data = userRepository.getAllUsers({
    limit: input.pageSize ?? 10,
    offset: ((input.page ?? 1) - 1) * (input.pageSize ?? 10),
  });
  return successResult<Output>({ data });
}

export const getProfilesHandler = baseHandler({
  handler,
});
