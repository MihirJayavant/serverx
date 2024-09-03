import type { JsonType } from "./core/utility.types.ts";
import type { Result } from "./http/result.ts";

export type RequestHandler<Input, Output extends JsonType> = (
  payload: Input,
) => Promise<Result<Output>>;
