import { errorResult, successResult } from "@serverx/utils";
import { baseHandler } from "@serverx/server";
import { z } from "@zod/zod";

type Input = {
  id: number;
};

type Output = {
  name: string;
};

const schema = z.object({
  id: z.number().min(1),
});

const database = [{ id: 1, name: "Peter Pan" }, { id: 2, name: "Mac Milan" }];

function handler(input: Input) {
  const data = database.find((d) => d.id === input.id);
  if (!data) {
    return errorResult(404, "User not found");
  }
  return successResult<Output>(data);
}

export const getProfileHandler = baseHandler({
  handler,
  validationSchema: schema,
});
