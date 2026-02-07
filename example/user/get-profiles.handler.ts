import { OffsetPaginationParams, successResult } from "@serverx/utils";
import { baseHandler } from "@serverx/server";
import { z } from "@zod/zod";
import { User } from "./user.ts";
import { userRepository } from "./user.repository.ts";

type Input = OffsetPaginationParams;

type Output = {
  data: User[];
};

const schema = z.object({
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
  filters: z.record(z.string(), z.any()).optional(),
  sort: z.record(z.string(), z.any()).optional(),
});

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
  validationSchema: schema,
});
