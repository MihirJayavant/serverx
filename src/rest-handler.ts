import type { Context } from "@hono/hono";
import type { RequestHandler } from "./request-handler.ts";
import { isSuccess } from "./http/result.ts";
import type { JsonType } from "./core/utility.types.ts";
import type { TypedResponse } from "@hono/hono";

type RestHandler<Input, Output extends JsonType> = {
  handler: RequestHandler<Input, Output>;
  input: Input;
  context: Context;
};

export async function restHandler<Input, Output extends JsonType>(
  { handler, input, context }: RestHandler<Input, Output>,
): Promise<TypedResponse> {
  try {
    const result = await handler(input);
    if (isSuccess(result)) {
      return context.json(result.data, result.status);
    } else {
      return context.json({ error: result.error }, result.status);
    }
  } catch (error: unknown) {
    return context.json({ error }, 500);
  }
}
